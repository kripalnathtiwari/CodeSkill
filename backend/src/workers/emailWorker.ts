import { Job, Worker } from "bullmq";
import { EmailJobPayload } from "../queues/emailQueue";
import { QUEUE_NAMES } from "../queues/shared";
import { processOtpEmailJob, processTransactionalEmailJob } from "../jobs/emailJob";
import { withJobContext } from "../lib/logger";
import {
  attachWorkerListeners,
  buildBaseWorkerOptions,
  rethrowWithBullMQSemantics,
} from "./shared";

/**
 * Queue 1 Worker: Email (OTP + Transactional via Brevo)
 * Uses BullMQ's Redis-backed rate limiter so concurrent workers respect Brevo throughput limits.
 */
export const emailWorker = new Worker<EmailJobPayload>(
  QUEUE_NAMES.EMAIL,
  async (job: Job<EmailJobPayload>) => {
    const jlog = withJobContext({
      queue: QUEUE_NAMES.EMAIL,
      jobId: job.id,
      attemptsMade: job.attemptsMade,
      requestId: job.data.requestId,
    });

    try {
      if (job.data.kind === "otp") {
        const result = await processOtpEmailJob({
          to: job.data.to,
          otp: job.data.otp,
          createdAt: job.data.createdAt,
          ttlMs: job.data.ttlMs,
        });
        if (result.dropped) {
          jlog.warn("Dropped expired OTP email job", { reason: result.reason });
        }
        return result;
      }

      jlog.info("Sending transactional email", { kind: job.data.kind, to: job.data.to });
      return await processTransactionalEmailJob({
        type: job.data.kind,
        to: job.data.to,
        userName: job.data.userName,
        data: job.data.data,
      });
    } catch (err) {
      return rethrowWithBullMQSemantics(err);
    }
  },
  buildBaseWorkerOptions(QUEUE_NAMES.EMAIL, {
    concurrency: parseInt(process.env.EMAIL_WORKER_CONCURRENCY || "5", 10),
    limiter: {
      max: parseInt(process.env.BREVO_LIMITER_MAX || "10", 10),
      duration: parseInt(process.env.BREVO_LIMITER_DURATION_MS || "1000", 10),
    },
  })
);

attachWorkerListeners(emailWorker, QUEUE_NAMES.EMAIL);
