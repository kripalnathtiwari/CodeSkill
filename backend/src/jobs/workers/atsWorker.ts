import { Worker } from "bullmq";
import { createRedisConnection } from "../../config/redis";
import { processAtsAnalysis } from "../processors/atsProcessor";
import logger from "../../config/logger";

const connection = createRedisConnection();

export const atsWorker = new Worker(
  "ats-analysis",
  processAtsAnalysis,
  {
    connection: connection as any,
    // Start conservatively for SaaS production to prevent AI API / Redis limits
    concurrency: 2,
    limiter: {
      max: 5,
      duration: 1000,
    },
  }
);

atsWorker.on("completed", (job) => {
  logger.info(`[ATS] Job ${job.id} completed`);
});

atsWorker.on("failed", (job, error) => {
  logger.error(`[ATS] Job ${job?.id} failed: ${error.message}`);
});

atsWorker.on("error", (error) => {
  logger.error(`[ATS Worker] Redis/Worker error: ${error.message}`);
});
