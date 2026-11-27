import { Queue } from "bullmq";
import { getSharedQueueConnection } from "../lib/redis";
import { defaultJobOptions, QUEUE_NAMES, sharedQueuePrefix } from "./shared";

export interface CsvImportPayload {
  backgroundJobId: string;
  target: "STUDENTS" | "QUESTIONS";
  requestedByUserId: string;
  requestId?: string;
}

export interface R2OrphanCleanupPayload {
  backgroundJobId?: string;
  prefix?: string;
  olderThanHours?: number;
  requestId?: string;
}

export interface ExportReportPayload {
  backgroundJobId: string;
  requestedByUserId: string;
  requestId?: string;
}

export type FileJobPayload = CsvImportPayload | R2OrphanCleanupPayload | ExportReportPayload;

export const fileQueue = new Queue<FileJobPayload>(QUEUE_NAMES.FILE, {
  connection: getSharedQueueConnection() as any,
  prefix: sharedQueuePrefix,
  defaultJobOptions,
});

export const enqueueCsvImport = async (payload: CsvImportPayload) => {
  return fileQueue.add("csv-import", payload, {
    jobId: `csv-${payload.backgroundJobId}`,
  });
};

export const enqueueR2OrphanCleanup = async (payload: R2OrphanCleanupPayload) => {
  return fileQueue.add("r2-orphan-cleanup", payload, {
    ...(payload.backgroundJobId ? { jobId: `cleanup-${payload.backgroundJobId}` } : {}),
  });
};

export const enqueueExportReport = async (payload: ExportReportPayload) => {
  return fileQueue.add("export-report", payload, {
    jobId: `export-${payload.backgroundJobId}`,
  });
};
