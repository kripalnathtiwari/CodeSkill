import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
}

// In-memory rate limiting map
const limitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (options: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
    const key = `${req.originalUrl}:${ip}`;
    const now = Date.now();

    let record = limitMap.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + options.windowSeconds * 1000,
      };
    }

    record.count += 1;
    limitMap.set(key, record);

    const remaining = Math.max(0, options.maxRequests - record.count);
    res.setHeader("X-RateLimit-Limit", options.maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);

    if (record.count > options.maxRequests) {
      logger.warn(`Rate limit exceeded (in-memory) for IP: ${ip} on route ${req.originalUrl}`);
      return res.status(429).json({
        error: "Too many requests. Please try again later.",
      });
    }

    return next();
  };
};
