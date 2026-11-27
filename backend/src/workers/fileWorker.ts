import { Job, Worker } from "bullmq";
import {
  CsvImportPayload,
  ExportReportPayload,
  FileJobPayload,
  R2OrphanCleanupPayload,
} from "../queues/fileQueue";
import { QUEUE_NAMES } from "../queues/shared";
import {
  processCsvImportJob,
  processExportReportJob,
  processR2OrphanCleanupJob,
} from "../jobs/fileJob";
import { emitToUser } from "../lib/socketEmitter";
import prisma from "../config/db";
import {
  attachWorkerListeners,
  buildBaseWorkerOptions,
  rethrowWithBullMQSemantics,
} from "./shared";

/**
 * Queue 5 Worker: Chunked CSV imports, R2 orphan cleanup, and report exports with signed URLs.
 */
export const fileWorker = new Worker<FileJobPayload>(
  QUEUE_NAMES.FILE,
  async (job: Job<FileJobPayload>) => {
    try {
      switch (job.name) {
        case "csv-import": {
          const payload = job.data as CsvImportPayload;
          const result = await processCsvImportJob({
            backgroundJobId: payload.backgroundJobId,
            target: payload.target,
            onProgress: async (percent) => {
              await job.updateProgress(percent);
              emitToUser(payload.requestedByUserId, "file:import-progress", {
                backgroundJobId: payload.backgroundJobId,
                progress: percent,
              });
            },
          });
          emitToUser(payload.requestedByUserId, "file:job-completed", {
            backgroundJobId: payload.backgroundJobId,
            status: "DONE",
            processedItems: result.processedItems,
            failedItems: result.failedItems,
          });
          return result;
        }

        case "r2-orphan-cleanup": {
          const payload = job.data as R2OrphanCleanupPayload;
          return await processR2OrphanCleanupJob(payload);
        }

        case "export-report": {
          const payload = job.data as ExportReportPayload;
          const result = await processExportReportJob({
            backgroundJobId: payload.backgroundJobId,
          });
          emitToUser(payload.requestedByUserId, "file:export-ready", result);
          return result;
        }

        default:
          return null;
      }
    } catch (err) {
      return rethrowWithBullMQSemantics(err);
    }
  },
  buildBaseWorkerOptions(QUEUE_NAMES.FILE, {
    concurrency: parseInt(process.env.FILE_WORKER_CONCURRENCY || "2", 10),
    lockDuration: 180_000,
    drainDelay: 30,
  })
);

attachWorkerListeners(fileWorker, QUEUE_NAMES.FILE);

fileWorker.on("failed", async (job, error) => {
  if (!job) return;
  const bgId = (job.data as any)?.backgroundJobId;
  const isFinal = error.name === "UnrecoverableError" || job.attemptsMade >= (job.opts?.attempts ?? 3);
  if (bgId && isFinal) {
    await prisma.backgroundJob
      .update({
        where: { id: bgId },
        data: {
          status: "FAILED",
          errorReport: { message: error.message } as any,
          completedAt: new Date(),
        },
      })
      .catch(() => {});
  }
});
