import { Request, Response, NextFunction } from "express";
import redisConnection from "../config/redis";
import logger from "../config/logger";

interface MemoryCacheItem {
  data: string;
  expiresAt: number;
}

const memoryCache = new Map<string, MemoryCacheItem>();
const MAX_MEMORY_CACHE_KEYS = 1000;

export const cache = (durationInSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Set standard HTTP cache headers for browsers and proxies
    res.setHeader("Cache-Control", `public, max-age=${durationInSeconds}`);

    const key = `cache:${req.originalUrl || req.url}`;
    const now = Date.now();

    try {
      // 1. Try Redis cache if connection is active
      if (redisConnection) {
        const cachedData = await redisConnection.get(key).catch((err) => {
          logger.warn(`Redis get error, falling back to memory cache: ${err}`);
          return null;
        });
        if (cachedData) {
          logger.info(`Redis Cache hit for key: ${key}`);
          res.setHeader("X-Cache", "HIT-REDIS");
          return res.status(200).json(JSON.parse(cachedData));
        }
      }

      // 2. Fallback to In-Memory Cache
      const memHit = memoryCache.get(key);
      if (memHit && memHit.expiresAt > now) {
        logger.info(`Memory Cache hit for key: ${key}`);
        res.setHeader("X-Cache", "HIT-MEMORY");
        return res.status(200).json(JSON.parse(memHit.data));
      } else if (memHit) {
        memoryCache.delete(key);
      }

      logger.info(`Cache miss for key: ${key}`);
      res.setHeader("X-Cache", "MISS");

      // Overwrite res.json to capture and cache the response
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const bodyStr = JSON.stringify(body);

          // Save to Redis if available
          if (redisConnection) {
            redisConnection
              .setex(key, durationInSeconds, bodyStr)
              .catch((err) => logger.error(`Redis setex error: ${err}`));
          }

          // Save to Memory Cache
          if (memoryCache.size >= MAX_MEMORY_CACHE_KEYS) {
            const oldestKey = memoryCache.keys().next().value;
            if (oldestKey) {
              memoryCache.delete(oldestKey);
            }
          }
          memoryCache.set(key, {
            data: bodyStr,
            expiresAt: Date.now() + durationInSeconds * 1000,
          });
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error(`Cache middleware error: ${error}`);
      next();
    }
  };
};

export const invalidateCachePattern = async (pattern: string) => {
  // 1. Invalidate Redis
  if (redisConnection) {
    try {
      const keys = await redisConnection.keys(`cache:${pattern}*`);
      if (keys.length > 0) {
        await redisConnection.del(...keys);
        logger.info(`Invalidated Redis cache keys: ${keys.join(", ")}`);
      }
    } catch (error) {
      logger.error(`Redis cache invalidation error: ${error}`);
    }
  }

  // 2. Invalidate Memory Cache
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
