import { JobsOptions } from "bullmq";
import { QUEUE_REDIS_PREFIX } from "../lib/redis";

export const QUEUE_NAMES = {
  EMAIL: "email",
  CODE_EXECUTION: "code-execution",
  EXAM: "exam",
  PERFORMANCE: "performance",
  FILE: "file",
  NOTIFICATION: "notification",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const sharedQueuePrefix = QUEUE_REDIS_PREFIX;

/**
 * Shared baseline job options applied across every queue.
 * Individual producers override priority, attempts, or backoff when needed (e.g. OTP emails).
 */
export const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 5_000,
  },
  removeOnComplete: {
    age: 3_600,
    count: 1_000,
  },
  removeOnFail: {
    age: 86_400,
    count: 5_000,
  },
};
