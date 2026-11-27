import { UnrecoverableError, Worker, WorkerOptions } from "bullmq";
import { createWorkerConnection, QUEUE_REDIS_PREFIX } from "../lib/redis";
import { withJobContext } from "../lib/logger";
import { PermanentJobError, RateLimitError } from "../lib/errors";

/**
 * Shared BullMQ v5 Worker defaults tuned for Upstash / managed Redis:
 * - drainDelay: 20s idle pause reduces empty-queue BZPOPMIN polling commands by 4x vs default 5s.
 * - stalledInterval: 120s reduces Lua stalled-check frequency by 4x vs default 30s.
 * - lockDuration: 60s prevents premature stall detection on slow external APIs.
 */
export const buildBaseWorkerOptions = (
  queueName: string,
  overrides: Partial<WorkerOptions> = {}
): WorkerOptions => ({
  connection: createWorkerConnection(queueName) as any,
  prefix: QUEUE_REDIS_PREFIX,
  drainDelay: parseInt(process.env.BULLMQ_DRAIN_DELAY_SEC || "20", 10),
  stalledInterval: parseInt(process.env.BULLMQ_STALLED_INTERVAL_MS || "120000", 10),
  lockDuration: parseInt(process.env.BULLMQ_LOCK_DURATION_MS || "60000", 10),
  ...overrides,
});

/**
 * Exponential backoff with equal jitter (and Retry-After support for HTTP 429)
 * so concurrent Judge0/Brevo failures spread out instead of thundering-herding.
 */
export const exponentialJitterBackoff = (
  attemptsMade: number,
  _type?: string,
  err?: Error
): number => {
  if (err instanceof RateLimitError && err.retryAfterMs && err.retryAfterMs > 0) {
    const jitter = Math.floor(Math.random() * 1_000);
    return Math.min(err.retryAfterMs + jitter, 120_000);
  }
  const baseMs = 2_000;
  const maxMs = 60_000;
  const exp = Math.min(maxMs, baseMs * Math.pow(2, Math.max(0, attemptsMade - 1)));
  return Math.round(exp * (0.5 + Math.random() * 0.5));
};

export const rethrowWithBullMQSemantics = (err: unknown): never => {
  if (err instanceof PermanentJobError) {
    throw new UnrecoverableError(err.message);
  }
  throw err;
};

/**
 * Attaches uniform Winston observability listeners for worker lifecycle events.
 */
export const attachWorkerListeners = <T extends { requestId?: string }>(
  worker: Worker<T>,
  queueName: string
): void => {
  worker.on("completed", (job) => {
    withJobContext({
      queue: queueName,
      jobId: job.id,
      attemptsMade: job.attemptsMade,
      requestId: job.data?.requestId,
    }).info("Job completed", { name: job.name });
  });

  worker.on("failed", (job, error) => {
    withJobContext({
      queue: queueName,
      jobId: job?.id,
      attemptsMade: job?.attemptsMade,
      requestId: job?.data?.requestId,
    }).error("Job failed", {
      name: job?.name,
      error: error.message,
      unrecoverable: error.name === "UnrecoverableError",
    });
  });

  worker.on("stalled", (jobId) => {
    withJobContext({ queue: queueName, jobId }).warn("Job stalled; lock expired before completion");
  });

  worker.on("error", (error) => {
    withJobContext({ queue: queueName }).error("Worker transport/runtime error", {
      error: error.message,
    });
  });
};
