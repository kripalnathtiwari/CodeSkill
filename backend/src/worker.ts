import dotenv from "dotenv";
dotenv.config();

import { atsWorker } from "./jobs/workers/atsWorker";
import logger from "./config/logger";

logger.info("[ATS Worker] Started");

const shutdown = async () => {
  logger.info("[ATS Worker] Shutting down...");
  try {
    await atsWorker.close();
    logger.info("[ATS Worker] BullMQ worker closed successfully.");
    process.exit(0);
  } catch (error) {
    logger.error(`[ATS Worker] Error during shutdown: ${error}`);
    process.exit(1);
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
