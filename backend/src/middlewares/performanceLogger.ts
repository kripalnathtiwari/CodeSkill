import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import logger from "../config/logger";
import { getRequestTiming, runWithRequestTiming } from "../lib/requestTiming";

/**
 * High-performance structured logging middleware for latency measurement and tracing.
 * Assigns an x-correlation-id header and logs total duration broken down into
 * auth middleware time, Prisma DB time, query count, and cache status.
 * Never logs passwords, tokens, or sensitive user data.
 */
export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
  runWithRequestTiming(() => {
    const start = process.hrtime.bigint();
    const correlationId = (req.headers["x-correlation-id"] as string) || crypto.randomUUID();

    res.setHeader("x-correlation-id", correlationId);

    res.on("finish", () => {
      const end = process.hrtime.bigint();
      const durationMs = Math.round((Number(end - start) / 1_000_000) * 100) / 100;
      const timing = getRequestTiming();
      const authMs = timing ? Math.round(timing.authMs * 100) / 100 : 0;
      const dbMs = timing ? Math.round(timing.dbMs * 100) / 100 : 0;
      const handlerMs = Math.max(0, Math.round((durationMs - authMs) * 100) / 100);

      const logData = {
        correlationId,
        endpoint: req.originalUrl || req.url,
        method: req.method,
        status: res.statusCode,
        durationMs,
        authMs,
        ...(timing?.authSource ? { authSource: timing.authSource } : {}),
        dbMs,
        dbQueries: timing?.dbQueries ?? 0,
        handlerMs,
        ...(res.getHeader("X-Cache") ? { cache: res.getHeader("X-Cache") } : {}),
      };

      if (durationMs > 1000) {
        logger.warn(`SLOW_API_WARNING: ${JSON.stringify(logData)}`);
      } else if (req.originalUrl?.startsWith("/api/")) {
        logger.info(`PERF_METRIC: ${JSON.stringify(logData)}`);
      }
    });

    next();
  });
};
