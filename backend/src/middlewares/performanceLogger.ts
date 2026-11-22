import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import logger from "../config/logger";

/**
 * High-performance structured logging middleware for latency measurement and tracing.
 * Assigns an x-correlation-id header and logs duration, endpoint, status, and method.
 * Never logs passwords, tokens, or sensitive user data.
 */
export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  const correlationId = (req.headers["x-correlation-id"] as string) || crypto.randomUUID();

  // Attach correlation ID to response headers for client-side tracing
  res.setHeader("x-correlation-id", correlationId);

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    // Log structured metrics for all requests, highlighting slow ones (>500ms)
    const logData = {
      correlationId,
      endpoint: req.originalUrl || req.url,
      method: req.method,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
    };

    if (durationMs > 1000) {
      logger.warn(`SLOW_API_WARNING: ${JSON.stringify(logData)}`);
    } else if (req.originalUrl?.startsWith("/api/")) {
      logger.info(`PERF_METRIC: ${JSON.stringify(logData)}`);
    }
  });

  next();
};
