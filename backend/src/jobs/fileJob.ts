import { parse } from "csv-parse";
import bcrypt from "bcryptjs";
import prisma from "../config/db";
import r2Service from "../services/r2Service";
import { PermanentJobError } from "../lib/errors";

export interface CsvRowError {
  row: number;
  identifier?: string;
  error: string;
}

export interface CsvImportResult {
  backgroundJobId: string;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  errors: CsvRowError[];
}

const CHUNK_SIZE = 50;

/**
 * Pure business logic: streams a CSV file from R2 and imports students or questions in chunks.
 * Updates Postgres BackgroundJob status/progress and invokes `onProgress` for BullMQ `job.updateProgress`.
 */
export const processCsvImportJob = async (params: {
  backgroundJobId: string;
  target: "STUDENTS" | "QUESTIONS";
  onProgress?: (percent: number) => Promise<void> | void;
}): Promise<CsvImportResult> => {
  const jobRecord = await prisma.backgroundJob.findUnique({
    where: { id: params.backgroundJobId },
  });

  if (!jobRecord) {
    throw new PermanentJobError(
      `BackgroundJob ${params.backgroundJobId} not found`,
      "BACKGROUND_JOB_NOT_FOUND"
    );
  }
  if (!jobRecord.inputKey) {
    throw new PermanentJobError("BackgroundJob missing inputKey for CSV import", "MISSING_INPUT_KEY");
  }

  await prisma.backgroundJob.update({
    where: { id: jobRecord.id },
    data: { status: "RUNNING", startedAt: new Date() },
  });

  const stream = await r2Service.getObjectStream(jobRecord.inputKey);
  const rows: Array<Record<string, string>> = [];

  const parser = stream.pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
  );

  for await (const record of parser) {
    rows.push(record);
  }

  const totalItems = rows.length;
  const errors: CsvRowError[] = [];
  let processedItems = 0;

  await prisma.backgroundJob.update({
    where: { id: jobRecord.id },
    data: { totalItems },
  });

  const defaultPasswordHash = params.target === "STUDENTS" ? await bcrypt.hash("Welcome@123", 10) : "";

  for (let i = 0; i < totalItems; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);

    for (let offset = 0; offset < chunk.length; offset++) {
      const rowNum = i + offset + 2; // +2 accounts for 1-based indexing + header row
      const row = chunk[offset];

      try {
        if (params.target === "STUDENTS") {
          const email = row.email?.toLowerCase().trim();
          const firstName = (row.firstName || row.name || "Student").trim();
          const lastName = (row.lastName || "").trim();

          if (!email || !email.includes("@")) {
            throw new Error("Invalid or missing student email");
          }

          await prisma.user.upsert({
            where: { email },
            create: {
              email,
              passwordHash: defaultPasswordHash,
              role: "STUDENT",
              phoneNumber: row.phone || null,
              profile: { create: { firstName, lastName } },
            },
            update: {
              ...(row.phone ? { phoneNumber: row.phone } : {}),
            },
          });
        } else {
          const title = row.title?.trim();
          const slug = (row.slug || title?.toLowerCase().replace(/[^a-z0-9]+/g, "-"))?.trim();
          const description = row.description?.trim();
          if (!title || !slug || !description) {
            throw new Error("Missing required fields (title, slug, description)");
          }

          await prisma.question.upsert({
            where: { slug },
            create: {
              title,
              slug,
              description,
              difficulty: (row.difficulty || "EASY").toUpperCase(),
              type: (row.type || "CODING").toUpperCase(),
            },
            update: {
              title,
              description,
            },
          });
        }

        processedItems += 1;
      } catch (err: any) {
        errors.push({
          row: rowNum,
          identifier: row.email || row.slug || row.title,
          error: err.message,
        });
      }
    }

    const handled = Math.min(i + chunk.length, totalItems);
    const percent = totalItems > 0 ? Math.round((handled / totalItems) * 100) : 100;

    await prisma.backgroundJob.update({
      where: { id: jobRecord.id },
      data: {
        progress: percent,
        processedItems,
        failedItems: errors.length,
      },
    });

    if (params.onProgress) {
      await params.onProgress(percent);
    }
  }

  await prisma.backgroundJob.update({
    where: { id: jobRecord.id },
    data: {
      status: "DONE",
      progress: 100,
      processedItems,
      failedItems: errors.length,
      errorReport: errors as any,
      completedAt: new Date(),
    },
  });

  return {
    backgroundJobId: jobRecord.id,
    totalItems,
    processedItems,
    failedItems: errors.length,
    errors,
  };
};

/**
 * Pure business logic: deletes stale R2 objects under a temp prefix not referenced by BackgroundJob.
 */
export const processR2OrphanCleanupJob = async (params: {
  backgroundJobId?: string;
  prefix?: string;
  olderThanHours?: number;
}): Promise<{ scanned: number; deleted: number }> => {
  const prefix = params.prefix ?? "tmp/";
  const olderThanMs = (params.olderThanHours ?? 24) * 3600 * 1000;
  const cutoff = Date.now() - olderThanMs;

  if (params.backgroundJobId) {
    await prisma.backgroundJob.update({
      where: { id: params.backgroundJobId },
      data: { status: "RUNNING", startedAt: new Date() },
    });
  }

  const objects = await r2Service.listObjects(prefix, 500);
  const activeJobs = await prisma.backgroundJob.findMany({
    where: { status: { in: ["PENDING", "RUNNING"] } },
    select: { inputKey: true, outputKey: true },
  });

  const activeKeys = new Set<string>();
  for (const j of activeJobs) {
    if (j.inputKey) activeKeys.add(j.inputKey);
    if (j.outputKey) activeKeys.add(j.outputKey);
  }

  let deleted = 0;
  for (const obj of objects) {
    const modifiedMs = obj.lastModified ? obj.lastModified.getTime() : 0;
    if (modifiedMs < cutoff && !activeKeys.has(obj.key)) {
      await r2Service.deleteObject(obj.key);
      deleted += 1;
    }
  }

  if (params.backgroundJobId) {
    await prisma.backgroundJob.update({
      where: { id: params.backgroundJobId },
      data: {
        status: "DONE",
        progress: 100,
        totalItems: objects.length,
        processedItems: deleted,
        completedAt: new Date(),
      },
    });
  }

  return { scanned: objects.length, deleted };
};

/**
 * Pure business logic: exports performance CSV report, uploads to R2, and generates signed download URL.
 */
export const processExportReportJob = async (params: {
  backgroundJobId: string;
}): Promise<{ backgroundJobId: string; outputKey: string; signedUrl: string }> => {
  const jobRecord = await prisma.backgroundJob.findUnique({
    where: { id: params.backgroundJobId },
  });
  if (!jobRecord) {
    throw new PermanentJobError(
      `BackgroundJob ${params.backgroundJobId} not found`,
      "BACKGROUND_JOB_NOT_FOUND"
    );
  }

  await prisma.backgroundJob.update({
    where: { id: jobRecord.id },
    data: { status: "RUNNING", startedAt: new Date() },
  });

  const profiles = await prisma.profile.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { xp: "desc" },
    take: 5000,
  });

  const header = "email,firstName,lastName,totalSolved,xp,level,codingRating";
  const lines = profiles.map((p) =>
    [
      p.user.email,
      JSON.stringify(p.firstName),
      JSON.stringify(p.lastName),
      p.totalSolved,
      p.xp,
      p.level,
      p.codingRating,
    ].join(",")
  );
  const csvContent = [header, ...lines].join("\n");
  const outputKey = `exports/performance-report-${jobRecord.id}.csv`;

  await r2Service.uploadObject({
    key: outputKey,
    body: csvContent,
    contentType: "text/csv",
  });

  const signedUrl = await r2Service.getPresignedDownloadUrl(outputKey, 3600);

  await prisma.backgroundJob.update({
    where: { id: jobRecord.id },
    data: {
      status: "DONE",
      progress: 100,
      totalItems: profiles.length,
      processedItems: profiles.length,
      outputKey,
      metadata: { signedUrlExpiresInSec: 3600 } as any,
      completedAt: new Date(),
    },
  });

  return { backgroundJobId: jobRecord.id, outputKey, signedUrl };
};
