import Redis from "ioredis";
import logger from "./logger";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL;

let redisConnection: Redis | null = null;

if (redisUrl) {
  try {
    redisConnection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      retryStrategy(times) {
        if (times > 3) {
          logger.warn("Redis connection failed after 3 retries. Disabling further retries.");
          return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
      }
    });
    redisConnection.on("connect", () => {
      logger.info("Connected to Redis successfully.");
    });
    redisConnection.on("error", (err) => {
      logger.error(`Redis connection error: ${err}`);
    });
  } catch (error) {
    logger.error(`Failed to initialize Redis: ${error}`);
  }
} else {
  logger.warn("Redis URL not provided. Caching will be bypassed.");
}

export default redisConnection;
