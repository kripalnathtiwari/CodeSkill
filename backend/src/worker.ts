/**
 * Dedicated Worker Service Entry Point (separate Railway service).
 * Start command: `npm run worker` -> `node dist/worker.js`
 */
import dotenv from "dotenv";
dotenv.config();

import logger from "./lib/logger";
import { disconnectPrisma } from "./config/db";
import { closeAllRedisConnections } from "./lib/redis";
import { closeSocketEmitter, getSocketEmitter } from "./lib/socketEmitter";
import { closeAllQueues, registerPerformanceSchedulers } from "./queues";

import { emailWorker } from "./workers/emailWorker";
import { codeExecutionWorker } from "./workers/codeExecutionWorker";
import { examWorker } from "./workers/examWorker";
import { performanceWorker } from "./workers/performanceWorker";
import { fileWorker } from "./workers/fileWorker";
import { notificationWorker } from "./workers/notificationWorker";
import { atsWorker } from "./jobs/workers/atsWorker";

const workers = [
  emailWorker,
  codeExecutionWorker,
  examWorker,
  performanceWorker,
  fileWorker,
  notificationWorker,
  atsWorker,
];

let isShuttingDown = false;

const bootstrap = async () => {
  // Initialize Redis emitter eagerly so startup logs surface connection issues immediately
  getSocketEmitter();

  // Register BullMQ v5 Job Schedulers (idempotent upsert)
  await registerPerformanceSchedulers();

  logger.info("CodeSkill BullMQ worker service ready", {
    pid: process.pid,
    queues: workers.map((w) => w.name),
  });
};

const shutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info(`[Worker] Received ${signal}. Closing workers cleanly...`);

  const forceTimer = setTimeout(() => {
    logger.error("[Worker] Graceful shutdown timed out after 30s; exiting");
    process.exit(1);
  }, 30_000);

  try {
    // 1. Pause/close workers so active jobs finish before closing DB or Redis
    await Promise.allSettled(workers.map((w) => w.close()));
    await closeAllQueues();
    await closeSocketEmitter();
    await closeAllRedisConnections();
    await disconnectPrisma();

    clearTimeout(forceTimer);
    logger.info("[Worker] Shutdown complete");
    process.exit(0);
  } catch (err: any) {
    logger.error("[Worker] Error during shutdown", { error: err.message });
    clearTimeout(forceTimer);
    process.exit(1);
  }
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("unhandledRejection", (reason: any) => {
  logger.error("[Worker] Unhandled rejection", { error: reason?.message || String(reason) });
});

bootstrap().catch((err) => {
  logger.error("[Worker] Failed to bootstrap worker service", { error: err.message });
  process.exit(1);
});
