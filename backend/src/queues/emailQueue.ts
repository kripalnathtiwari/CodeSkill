import { Queue } from "bullmq";
import { getSharedQueueConnection } from "../lib/redis";
import { defaultJobOptions, QUEUE_NAMES, sharedQueuePrefix } from "./shared";

export interface OtpEmailPayload {
  kind: "otp";
  to: string;
  otp: string;
  createdAt: number;
  ttlMs: number;
  requestId?: string;
}

export interface TransactionalEmailPayload {
  kind: "welcome" | "enrollment" | "result-published";
  to: string;
  userId: string;
  userName?: string;
  data: Record<string, string>;
  requestId?: string;
}

export type EmailJobPayload = OtpEmailPayload | TransactionalEmailPayload;

export const emailQueue = new Queue<EmailJobPayload>(QUEUE_NAMES.EMAIL, {
  connection: getSharedQueueConnection() as any,
  prefix: sharedQueuePrefix,
  defaultJobOptions,
});

const OTP_TTL_MS = parseInt(process.env.OTP_TTL_MS || String(5 * 60 * 1000), 10);

/**
 * Enqueue OTP email with highest priority, max 2 attempts, and short fixed backoff.
 * Worker also drops the job if queue lag pushes it past OTP validity.
 */
export const enqueueOtpEmail = async (params: {
  to: string;
  otp: string;
  requestId?: string;
}) => {
  return emailQueue.add(
    "otp-email",
    {
      kind: "otp",
      to: params.to.toLowerCase().trim(),
      otp: params.otp,
      createdAt: Date.now(),
      ttlMs: OTP_TTL_MS,
      requestId: params.requestId,
    },
    {
      priority: 1,
      attempts: 2,
      backoff: { type: "fixed", delay: 1_000 },
      removeOnComplete: { age: 600, count: 200 },
    }
  );
};

export const enqueueTransactionalEmail = async (params: {
  kind: "welcome" | "enrollment" | "result-published";
  to: string;
  userId: string;
  userName?: string;
  data?: Record<string, string>;
  idempotencyKey?: string;
  requestId?: string;
}) => {
  return emailQueue.add(
    `transactional-${params.kind}`,
    {
      kind: params.kind,
      to: params.to.toLowerCase().trim(),
      userId: params.userId,
      userName: params.userName,
      data: params.data || {},
      requestId: params.requestId,
    },
    {
      priority: 5,
      ...(params.idempotencyKey ? { jobId: params.idempotencyKey } : {}),
    }
  );
};
