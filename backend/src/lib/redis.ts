import Redis, { RedisOptions } from "ioredis";
import logger from "./logger";
import dotenv from "dotenv";

dotenv.config();

/**
 * Cache vs Queue Redis separation:
 * - CACHE_REDIS_URL (or REDIS_URL): short commandTimeout, fail-fast maxRetriesPerRequest: 3, cache: key prefix.
 * - QUEUE_REDIS_URL (falls back to REDIS_URL): dedicated connection pool, maxRetriesPerRequest: null
 *   (mandatory for BullMQ blocking commands), no commandTimeout, and BullMQ uses prefix "bullmq" (or QUEUE_PREFIX)
 *   so cache invalidations never collide with queue keys.
 */
const CACHE_REDIS_URL = process.env.REDIS_URL || "";
const QUEUE_REDIS_URL = process.env.QUEUE_REDIS_URL || process.env.REDIS_URL || "";
export const QUEUE_REDIS_PREFIX = process.env.BULLMQ_PREFIX || "codeskill:bull";

const trackedConnections: Redis[] = [];

const buildTlsOptions = (url: string): RedisOptions["tls"] => {
  if (!url.startsWith("rediss://")) {
    return undefined;
  }
  return {
    rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== "false",
  };
};

const baseReconnectStrategy = (label: string) => (times: number): number => {
  // Never return null so a temporary network partition recovers automatically.
  const delay = Math.min(times * 250, 10_000);
  if (times === 1 || times % 10 === 0) {
    logger.warn(`[${label}] Redis reconnect attempt #${times}, waiting ${delay}ms`);
  }
  return delay;
};

let cacheRedisClient: Redis | null = null;
let sharedQueueConnection: Redis | null = null;

/**
 * Cache Redis client (used for HTTP caching, rate limits, sessions).
 * Never pass this client to BullMQ.
 */
export const getCacheRedis = (): Redis | null => {
  if (cacheRedisClient) {
    return cacheRedisClient;
  }
  if (!CACHE_REDIS_URL) {
    return null;
  }

  cacheRedisClient = new Redis(CACHE_REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: true,
    connectTimeout: 10_000,
    commandTimeout: 3_000,
    keepAlive: 30_000,
    tls: buildTlsOptions(CACHE_REDIS_URL),
    retryStrategy: baseReconnectStrategy("CacheRedis"),
  });

  cacheRedisClient.on("ready", () => logger.info("[CacheRedis] Client ready"));
  cacheRedisClient.on("error", (err) => logger.error("[CacheRedis] Error", { error: err.message }));
  trackedConnections.push(cacheRedisClient);

  return cacheRedisClient;
};

/**
 * Factory for BullMQ-compatible ioredis connections.
 * BullMQ requires maxRetriesPerRequest: null and NO commandTimeout on workers
 * because workers execute blocking Redis calls (BZPOPMIN / BRPOPLPUSH).
 */
export const createBullMQRedisConnection = (roleLabel: string): Redis => {
  const url = QUEUE_REDIS_URL || "redis://127.0.0.1:6379";

  const client = new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false, // Prevents Upstash/proxy INFO readiness delays blocking BullMQ startup
    enableOfflineQueue: true,
    connectTimeout: 15_000,
    keepAlive: 30_000,
    tls: buildTlsOptions(url),
    retryStrategy: baseReconnectStrategy(roleLabel),
  });

  client.on("ready", () => logger.info(`[${roleLabel}] Redis connection ready`));
  client.on("error", (err) => logger.error(`[${roleLabel}] Redis error`, { error: err.message }));
  client.on("close", () => logger.warn(`[${roleLabel}] Redis connection closed`));

  trackedConnections.push(client);
  return client;
};

/**
 * One shared ioredis connection reused across all BullMQ Queue producers in this process.
 */
export const getSharedQueueConnection = (): Redis => {
  if (!sharedQueueConnection) {
    sharedQueueConnection = createBullMQRedisConnection("QueueProducer");
  }
  return sharedQueueConnection;
};

/**
 * Dedicated connection per BullMQ Worker (required by BullMQ because each worker uses blocking commands).
 */
export const createWorkerConnection = (queueName: string): Redis => {
  return createBullMQRedisConnection(`Worker:${queueName}`);
};

/**
 * Dedicated pub/sub connections for @socket.io/redis-adapter.
 */
export const createSocketAdapterClients = (): { pubClient: Redis; subClient: Redis } | null => {
  if (!QUEUE_REDIS_URL) {
    return null;
  }
  const pubClient = createBullMQRedisConnection("SocketIO-Pub");
  const subClient = pubClient.duplicate();
  subClient.on("error", (err) => logger.error("[SocketIO-Sub] Redis error", { error: err.message }));
  trackedConnections.push(subClient);
  return { pubClient, subClient };
};

export const isQueueRedisConfigured = (): boolean => Boolean(QUEUE_REDIS_URL);

/**
 * Gracefully quit all tracked Redis connections during SIGTERM/SIGINT shutdown.
 */
export const closeAllRedisConnections = async (): Promise<void> => {
  const unique = Array.from(new Set(trackedConnections));
  await Promise.allSettled(
    unique.map(async (client) => {
      if (client.status !== "end") {
        await client.quit().catch(() => client.disconnect());
      }
    })
  );
  trackedConnections.length = 0;
  sharedQueueConnection = null;
  cacheRedisClient = null;
};
