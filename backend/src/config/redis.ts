import Redis from "ioredis";
import logger from "./logger";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL;

let redisConnection: Redis | null = null;

if (redisUrl) {
  try {
    redisConnection = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: true,
      tls: redisUrl.startsWith("rediss://") ? { rejectUnauthorized: true } : undefined,
      connectTimeout: 10000,
      commandTimeout: 3000,
      keepAlive: 10000,
      retryStrategy(times) {
        if (times > 10) {
          logger.warn("Redis connection failed after 10 retries.");
          return null; // Stop retrying
        }
        return Math.min(times * 100, 3000);
      }
    });
    redisConnection.on("connect", () => {
      logger.info("Connected to Redis successfully with verified TLS.");
    });
    redisConnection.on("ready", () => {
      logger.info("Redis client ready to receive commands.");
    });
    redisConnection.on("error", (err) => {
      logger.error(`Redis connection error: ${err}`);
    });
    redisConnection.on("close", () => {
      logger.warn("Redis connection closed.");
    });
    redisConnection.on("reconnecting", () => {
      logger.info("Reconnecting to Redis...");
    });
  } catch (error) {
    logger.error(`Failed to initialize Redis: ${error}`);
  }
} else {
  logger.warn("Redis URL not provided. Caching will be bypassed.");
}

export const createRedisConnection = () => {
  return new Redis(redisUrl || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: 3,
    enableOfflineQueue: true,
    tls: redisUrl && redisUrl.startsWith("rediss://") ? { rejectUnauthorized: true } : undefined,
    connectTimeout: 10000,
    commandTimeout: 3000,
  });
};

export default redisConnection;
