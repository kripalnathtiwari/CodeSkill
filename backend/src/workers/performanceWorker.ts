import { Job, Worker } from "bullmq";
import {
  PerformanceJobPayload,
  RecomputeStudentStatsPayload,
  ScheduledReportPayload,
} from "../queues/performanceQueue";
import { QUEUE_NAMES } from "../queues/shared";
import {
  processPerformanceReportJob,
  processRecomputeStudentStatsJob,
} from "../jobs/performanceJob";
import { emitToUser } from "../lib/socketEmitter";
import {
  attachWorkerListeners,
  buildBaseWorkerOptions,
  rethrowWithBullMQSemantics,
} from "./shared";

/**
 * Queue 4 Worker: Student stats/leaderboard recomputation and scheduled daily/weekly reports.
 */
export const performanceWorker = new Worker<PerformanceJobPayload>(
  QUEUE_NAMES.PERFORMANCE,
  async (job: Job<PerformanceJobPayload>) => {
    try {
      if (job.name === "daily-report" || job.name === "weekly-report") {
        const payload = job.data as ScheduledReportPayload;
        return await processPerformanceReportJob(payload.period);
      }

      const payload = job.data as RecomputeStudentStatsPayload;
      const stats = await processRecomputeStudentStatsJob(payload.userId);
      emitToUser(payload.userId, "performance:updated", stats as unknown as Record<string, unknown>);
      return stats;
    } catch (err) {
      return rethrowWithBullMQSemantics(err);
    }
  },
  buildBaseWorkerOptions(QUEUE_NAMES.PERFORMANCE, {
    concurrency: parseInt(process.env.PERFORMANCE_WORKER_CONCURRENCY || "4", 10),
    drainDelay: 30,
  })
);

attachWorkerListeners(performanceWorker, QUEUE_NAMES.PERFORMANCE);
