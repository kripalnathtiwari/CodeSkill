import { Queue } from "bullmq";
import { getSharedQueueConnection } from "../lib/redis";
import { defaultJobOptions, QUEUE_NAMES, sharedQueuePrefix } from "./shared";

export interface CodeExecutionJobPayload {
  submissionId: string;
  userId: string;
  testAttemptId?: string | null;
  requestId?: string;
}

export const codeExecutionQueue = new Queue<CodeExecutionJobPayload>(
  QUEUE_NAMES.CODE_EXECUTION,
  {
    connection: getSharedQueueConnection() as any,
    prefix: sharedQueuePrefix,
    defaultJobOptions: {
      ...defaultJobOptions,
      attempts: 4,
      // Custom strategy name handled in worker (`exponential-jitter`) for 5xx/timeouts/429
      backoff: {
        type: "exponential-jitter",
        delay: 2_000,
      },
    },
  }
);

/**
 * Enqueue submission evaluation idempotently using deterministic jobId `sub-${submissionId}`.
 */
export const enqueueCodeExecution = async (params: CodeExecutionJobPayload) => {
  return codeExecutionQueue.add("execute-submission", params, {
    jobId: `sub-${params.submissionId}`,
  });
};
