import { Queue } from "bullmq";
import { getSharedQueueConnection } from "../lib/redis";
import { defaultJobOptions, QUEUE_NAMES, sharedQueuePrefix } from "./shared";

export interface RecomputeStudentStatsPayload {
  userId: string;
  trigger: "submission" | "exam" | "manual";
  requestId?: string;
}

export interface ScheduledReportPayload {
  period: "DAILY" | "WEEKLY";
  requestId?: string;
}

export type PerformanceJobPayload = RecomputeStudentStatsPayload | ScheduledReportPayload;

export const performanceQueue = new Queue<PerformanceJobPayload>(
  QUEUE_NAMES.PERFORMANCE,
  {
    connection: getSharedQueueConnection() as any,
    prefix: sharedQueuePrefix,
    defaultJobOptions,
  }
);

/**
 * Coalesces rapid bursts of submissions/exam events per user with a deterministic jobId + short delay.
 * Removing on completion frees the ID for subsequent future updates.
 */
export const enqueuePerformanceRecompute = async (
  payload: RecomputeStudentStatsPayload,
  debounceMs = 3_000
) => {
  return performanceQueue.add("recompute-student-stats", payload, {
    jobId: `perf-${payload.userId}`,
    delay: debounceMs,
    removeOnComplete: true,
    removeOnFail: { age: 3_600, count: 500 },
  });
};

/**
 * Registers recurring performance report schedulers using BullMQ v5 `upsertJobScheduler`.
 * Never uses deprecated `repeat` jobs.
 */
export const registerPerformanceSchedulers = async (): Promise<void> => {
  await performanceQueue.upsertJobScheduler(
    "daily-performance-report",
    {
      pattern: process.env.DAILY_REPORT_CRON || "0 1 * * *",
      tz: process.env.SCHEDULER_TIMEZONE || "UTC",
    },
    {
      name: "daily-report",
      data: { period: "DAILY" },
      opts: { attempts: 3 },
    }
  );

  await performanceQueue.upsertJobScheduler(
    "weekly-performance-report",
    {
      pattern: process.env.WEEKLY_REPORT_CRON || "0 2 * * 1",
      tz: process.env.SCHEDULER_TIMEZONE || "UTC",
    },
    {
      name: "weekly-report",
      data: { period: "WEEKLY" },
      opts: { attempts: 3 },
    }
  );
};
