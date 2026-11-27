import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import redisConnection from "../config/redis";
import logger from "../config/logger";

interface MemoryCacheItem {
  bodyStr: string;
  etag: string;
  expiresAt: number;
}

export interface CacheMiddlewareOptions {
  scope?: "public" | "private";
  maxAge?: number;
  staleWhileRevalidate?: number;
}

interface CacheEnvelope {
  bodyStr: string;
  etag: string;
}

const memoryCache = new Map<string, MemoryCacheItem>();
const inFlightCacheLoads = new Map<string, Promise<CacheEnvelope>>();
const inFlightMiddlewareLoads = new Map<string, Promise<CacheEnvelope | null>>();
const MAX_MEMORY_CACHE_KEYS = 1000;

const isRedisReady = () =>
  Boolean(
    redisConnection &&
      redisConnection.status !== "end" &&
      redisConnection.status !== "close"
  );

export const computeWeakEtag = (bodyStr: string): string => {
  const hash = crypto.createHash("sha1").update(bodyStr).digest("base64url").slice(0, 16);
  return `W/"${Buffer.byteLength(bodyStr)}-${hash}"`;
};

const parseEnvelope = (raw: string): CacheEnvelope => {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.__env === 1 && typeof parsed.bodyStr === "string" && typeof parsed.etag === "string") {
      return { bodyStr: parsed.bodyStr, etag: parsed.etag };
    }
  } catch {
    // Raw plain JSON fallback
  }
  return { bodyStr: raw, etag: computeWeakEtag(raw) };
};

const serializeEnvelope = (envelope: CacheEnvelope): string => {
  return JSON.stringify({ __env: 1, bodyStr: envelope.bodyStr, etag: envelope.etag });
};

const setMemoryCache = (key: string, envelope: CacheEnvelope, ttlSeconds: number) => {
  if (memoryCache.size >= MAX_MEMORY_CACHE_KEYS) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) {
      memoryCache.delete(oldestKey);
    }
  }
  memoryCache.set(key, {
    bodyStr: envelope.bodyStr,
    etag: envelope.etag,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

const readFromCache = async (
  key: string
): Promise<{ envelope: CacheEnvelope; source: "HIT-REDIS" | "HIT-MEMORY" } | null> => {
  const now = Date.now();

  if (isRedisReady()) {
    try {
      const cachedRaw = await redisConnection!.get(key);
      if (cachedRaw) {
        const envelope = parseEnvelope(cachedRaw);
        return { envelope, source: "HIT-REDIS" };
      }
    } catch (err) {
      logger.warn(`Redis get error for ${key}, falling back to memory cache: ${err}`);
    }
  }

  const memHit = memoryCache.get(key);
  if (memHit && memHit.expiresAt > now) {
    return {
      envelope: { bodyStr: memHit.bodyStr, etag: memHit.etag },
      source: "HIT-MEMORY",
    };
  }
  if (memHit) {
    memoryCache.delete(key);
  }

  return null;
};

const writeToCache = (key: string, envelope: CacheEnvelope, ttlSeconds: number) => {
  setMemoryCache(key, envelope, ttlSeconds);
  if (isRedisReady()) {
    redisConnection!
      .setex(key, ttlSeconds, serializeEnvelope(envelope))
      .catch((err) => logger.error(`Redis setex error for ${key}: ${err}`));
  }
};

const ifNoneMatchMatches = (req: Request, etag: string): boolean => {
  const header = req.headers["if-none-match"];
  if (!header || typeof header !== "string") return false;
  if (header.trim() === "*") return true;
  return header.split(",").some((tag) => tag.trim() === etag);
};

const sendEnvelopeResponse = (
  req: Request,
  res: Response,
  envelope: CacheEnvelope,
  source: string
) => {
  res.setHeader("ETag", envelope.etag);
  res.setHeader("X-Cache", source);

  if (ifNoneMatchMatches(req, envelope.etag)) {
    return res.status(304).end();
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(200).send(envelope.bodyStr);
};

/**
 * Single-flight cache-aside helper (Redis L2 -> Memory L1 -> coalesced loader).
 * Concurrent misses for the same key share ONE in-flight loader execution.
 */
export const getOrSetCache = async <T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<{ value: T; etag: string; source: "HIT-REDIS" | "HIT-MEMORY" | "HIT-COALESCED" | "MISS" }> => {
  const hit = await readFromCache(key);
  if (hit) {
    return {
      value: JSON.parse(hit.envelope.bodyStr) as T,
      etag: hit.envelope.etag,
      source: hit.source,
    };
  }

  const existingLoad = inFlightCacheLoads.get(key);
  if (existingLoad) {
    const envelope = await existingLoad;
    return {
      value: JSON.parse(envelope.bodyStr) as T,
      etag: envelope.etag,
      source: "HIT-COALESCED",
    };
  }

  const loadPromise = (async () => {
    try {
      const fresh = await loader();
      const bodyStr = JSON.stringify(fresh);
      const envelope: CacheEnvelope = { bodyStr, etag: computeWeakEtag(bodyStr) };
      writeToCache(key, envelope, ttlSeconds);
      return envelope;
    } finally {
      inFlightCacheLoads.delete(key);
    }
  })();

  inFlightCacheLoads.set(key, loadPromise);
  const envelope = await loadPromise;
  return {
    value: JSON.parse(envelope.bodyStr) as T,
    etag: envelope.etag,
    source: "MISS",
  };
};

/**
 * Sends a cached HTTP JSON or 304 Not Modified response without calling `loader()`
 * when cache hits, using single-flight coalescing on cache misses.
 */
export const respondWithCachedJson = async <T>(
  req: Request,
  res: Response,
  params: {
    key: string;
    ttlSeconds: number;
    cacheControl: string;
    loader: () => Promise<T>;
  }
) => {
  res.setHeader("Cache-Control", params.cacheControl);

  const hit = await readFromCache(params.key);
  if (hit) {
    return sendEnvelopeResponse(req, res, hit.envelope, hit.source);
  }

  const existingLoad = inFlightCacheLoads.get(params.key);
  if (existingLoad) {
    const envelope = await existingLoad;
    return sendEnvelopeResponse(req, res, envelope, "HIT-COALESCED");
  }

  const loadPromise = (async () => {
    try {
      const fresh = await params.loader();
      const bodyStr = JSON.stringify(fresh);
      const envelope: CacheEnvelope = { bodyStr, etag: computeWeakEtag(bodyStr) };
      writeToCache(params.key, envelope, params.ttlSeconds);
      return envelope;
    } finally {
      inFlightCacheLoads.delete(params.key);
    }
  })();

  inFlightCacheLoads.set(params.key, loadPromise);
  const envelope = await loadPromise;
  return sendEnvelopeResponse(req, res, envelope, "MISS");
};

export const invalidateCacheKey = async (key: string) => {
  memoryCache.delete(key);
  if (isRedisReady()) {
    try {
      await redisConnection!.del(key);
    } catch (err) {
      logger.warn(`Redis key invalidation failed for ${key}: ${err}`);
    }
  }
};

export const clearMemoryCacheForTests = () => {
  memoryCache.clear();
  inFlightCacheLoads.clear();
  inFlightMiddlewareLoads.clear();
};

const formatCacheControl = (
  durationInSeconds: number,
  options?: "public" | "private" | CacheMiddlewareOptions
): string => {
  if (!options || typeof options === "string") {
    const scope = options || "public";
    return `${scope}, max-age=${durationInSeconds}`;
  }
  const scope = options.scope || "public";
  const maxAge = options.maxAge ?? durationInSeconds;
  const swr =
    options.staleWhileRevalidate !== undefined
      ? `, stale-while-revalidate=${options.staleWhileRevalidate}`
      : "";
  return `${scope}, max-age=${maxAge}${swr}`;
};

/**
 * Route-level caching middleware with:
 * - L2 Redis + L1 memory cache
 * - ETag / 304 fast-path before DB or JSON.parse
 * - Single-flight coalescing so concurrent cache misses trigger only 1 DB load
 */
export const cache = (
  durationInSeconds: number,
  options?: "public" | "private" | CacheMiddlewareOptions
) => {
  const cacheControlHeader = formatCacheControl(durationInSeconds, options);

  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") {
      return next();
    }

    res.setHeader("Cache-Control", cacheControlHeader);

    const baseUrl = (req.originalUrl || req.url).split("?")[0];
    const queryParams = new URLSearchParams((req.originalUrl || req.url).split("?")[1] || "");
    queryParams.sort();
    const queryString = queryParams.toString();
    const normalizedUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    const key = `cache:${normalizedUrl}`;

    try {
      // 1. Check cache hit (returns 304 or cached JSON without running handler/DB)
      const hit = await readFromCache(key);
      if (hit) {
        return sendEnvelopeResponse(req, res, hit.envelope, hit.source);
      }

      // 2. Single-flight: await in-flight leader if same key is already loading
      const existingFlight = inFlightMiddlewareLoads.get(key);
      if (existingFlight) {
        const coalescedEnvelope = await existingFlight;
        if (coalescedEnvelope) {
          return sendEnvelopeResponse(req, res, coalescedEnvelope, "HIT-COALESCED");
        }
        // Leader failed or returned non-2xx; fall through independently
        return next();
      }

      // 3. Become single-flight leader
      let resolveLeader!: (env: CacheEnvelope | null) => void;
      const leaderPromise = new Promise<CacheEnvelope | null>((resolve) => {
        resolveLeader = resolve;
      });
      inFlightMiddlewareLoads.set(key, leaderPromise);

      let settled = false;
      const settle = (env: CacheEnvelope | null) => {
        if (settled) return;
        settled = true;
        inFlightMiddlewareLoads.delete(key);
        resolveLeader(env);
      };

      res.on("close", () => settle(null));
      res.on("finish", () => settle(null));

      res.setHeader("X-Cache", "MISS");

      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const bodyStr = JSON.stringify(body);
          const envelope: CacheEnvelope = { bodyStr, etag: computeWeakEtag(bodyStr) };
          writeToCache(key, envelope, durationInSeconds);
          res.setHeader("ETag", envelope.etag);
          settle(envelope);
        } else {
          settle(null);
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error(`Cache middleware error: ${error}`);
      inFlightMiddlewareLoads.delete(key);
      next();
    }
  };
};

/**
 * Non-blocking Redis SCAN-based pattern invalidation (replaces O(N) blocking KEYS).
 */
export const invalidateCachePattern = async (pattern: string) => {
  const normalizedPattern = pattern.startsWith("cache:") ? `${pattern}*` : `cache:${pattern}*`;

  if (isRedisReady()) {
    try {
      let cursor = "0";
      const deletedKeys: string[] = [];

      do {
        const [nextCursor, keys] = await redisConnection!.scan(
          cursor,
          "MATCH",
          normalizedPattern,
          "COUNT",
          100
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await redisConnection!.del(...keys);
          deletedKeys.push(...keys);
        }
      } while (cursor !== "0");

      if (deletedKeys.length > 0) {
        logger.info(`Invalidated ${deletedKeys.length} Redis cache keys matching: ${pattern}`);
      }
    } catch (error) {
      logger.error(`Redis cache invalidation error: ${error}`);
    }
  }

  try {
    let removedCount = 0;
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) {
        memoryCache.delete(key);
        removedCount++;
      }
    }
    if (removedCount > 0) {
      logger.info(`Invalidated ${removedCount} memory cache keys matching: ${pattern}`);
    }
  } catch (error) {
    logger.error(`Memory cache invalidation error: ${error}`);
  }
};
