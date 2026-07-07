import logger from "../config/logger";
import { processSubmissionInMemory } from "./submissionWorker";

// Local in-memory queue array
const localQueue: string[] = [];
let isProcessing = false;

const processNextJob = async () => {
  if (localQueue.length === 0) {
    isProcessing = false;
    return;
  }

  isProcessing = true;
  const submissionId = localQueue.shift()!;

  try {
    logger.info(`In-memory queue: starting evaluation for submission ${submissionId}`);
    await processSubmissionInMemory(submissionId);
  } catch (err: any) {
    logger.error(`In-memory evaluation error: ${err.message}`);
  }

  // Schedule next iteration
  setImmediate(processNextJob);
};

export const addSubmissionJob = async (submissionId: string) => {
  logger.info(`Adding submission ${submissionId} to local in-memory queue`);
  localQueue.push(submissionId);

  if (!isProcessing) {
    setImmediate(processNextJob);
  }
};

logger.info("Local In-Memory submission task queue initialized.");
