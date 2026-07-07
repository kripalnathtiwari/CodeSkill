import { Request, Response, NextFunction } from "express";
import redisConnection from "../config/redis";
import logger from "../config/logger";

export const cache = (durationInSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!redisConnection) {
      return next();
    }

    // Create a unique key based on the request URL and query params
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedData = await redisConnection.get(key);
      if (cachedData) {
        logger.info(`Cache hit for key: ${key}`);
        return res.status(200).json(JSON.parse(cachedData));
      }

      logger.info(`Cache miss for key: ${key}`);

      // Overwrite res.json to capture and cache the response
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisConnection.setex(key, durationInSeconds, JSON.stringify(body))
            .catch(err => logger.error(`Redis setex error: ${err}`));
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
  if (!redisConnection) return;
  try {
    const keys = await redisConnection.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redisConnection.del(...keys);
      logger.info(`Invalidated cache keys: ${keys.join(", ")}`);
    }
  } catch (error) {
    logger.error(`Cache invalidation error: ${error}`);
  }
};
