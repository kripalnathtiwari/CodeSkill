import { Router, Request, Response } from "express";
import { allQueues } from "../queues";
import { getPoolConfigSummary, measureDbLatencyMs } from "../config/db";
import { getCacheRedis } from "../lib/redis";
import { authenticateJWT, requireRole } from "../middlewares/authMiddleware";
import logger from "../lib/logger";

const router = Router();

/**
 * GET /health
 * Basic liveness probe for Railway.
 */
router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

/**
 * GET /health/db-latency
 * Protected round-trip ping check for PostgreSQL + Redis + Pool audit.
 */
router.get(
  "/db-latency",
  authenticateJWT,
  requireRole(["ADMIN"]),
  async (_req: Request, res: Response) => {
    try {
      const dbLatencyMs = await measureDbLatencyMs();
      let redisLatencyMs: number | null = null;

      const cacheRedis = getCacheRedis();
      if (cacheRedis) {
        const t0 = process.hrtime.bigint();
        await cacheRedis.ping();
        redisLatencyMs = Math.round((Number(process.hrtime.bigint() - t0) / 1_000_000) * 100) / 100;
      }

      return res.status(200).json({
        status: "healthy",
        dbLatencyMs,
        redisLatencyMs,
        pool: getPoolConfigSummary(),
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      logger.error("DB latency check failed", { error: err.message });
      return res.status(503).json({
        status: "degraded",
        error: err.message,
      });
    }
  }
);

/**
 * GET /health/queues
 * Returns BullMQ getJobCounts() plus oldest waiting job age (seconds) per queue for alerting.
 */
router.get("/queues", async (_req: Request, res: Response) => {
  try {
    const queueStats = await Promise.all(
      allQueues.map(async (queue) => {
        const [counts, oldestWaitingJobs] = await Promise.all([
          queue.getJobCounts("waiting", "active", "completed", "failed", "delayed", "paused"),
          queue.getWaiting(0, 0),
        ]);

        const oldestJob = oldestWaitingJobs[0];
        const oldestWaitingAgeSec = oldestJob?.timestamp
          ? Math.max(0, Math.round((Date.now() - oldestJob.timestamp) / 1000))
          : 0;

        return {
          name: queue.name,
          counts,
          oldestWaitingAgeSec,
        };
      })
    );

    return res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      queues: Object.fromEntries(
        queueStats.map((q) => [
          q.name,
          { ...q.counts, oldestWaitingAgeSec: q.oldestWaitingAgeSec },
        ])
      ),
    });
  } catch (err: any) {
    logger.error("Queue health check failed", { error: err.message });
    return res.status(503).json({
      status: "degraded",
      error: err.message,
    });
  }
});

export default router;
