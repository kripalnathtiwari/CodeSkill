/**
 * Backward-compatible wrapper around `src/lib/redis.ts`.
 * Existing HTTP cache and session middleware import default `redisConnection` (cache Redis),
 * while `createRedisConnection()` returns a BullMQ-safe connection (`maxRetriesPerRequest: null`).
 */
import { createBullMQRedisConnection, getCacheRedis } from "../lib/redis";

const redisConnection = getCacheRedis();

export const createRedisConnection = () => {
  return createBullMQRedisConnection("LegacyBullMQ");
};

export default redisConnection;
