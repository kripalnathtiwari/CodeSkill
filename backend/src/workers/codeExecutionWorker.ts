import { Job, UnrecoverableError, Worker } from "bullmq";
import { CodeExecutionJobPayload } from "../queues/codeExecutionQueue";
import { QUEUE_NAMES } from "../queues/shared";
import { enqueuePerformanceRecompute } from "../queues/performanceQueue";
import {
  processCodeExecutionJob,
  TerminalCodeSubmissionError,
} from "../jobs/codeExecutionJob";
import { emitToAttempt, emitToUser } from "../lib/socketEmitter";
import { withJobContext } from "../lib/logger";
import prisma from "../config/db";
import {
  attachWorkerListeners,
  buildBaseWorkerOptions,
  exponentialJitterBackoff,
  rethrowWithBullMQSemantics,
} from "./shared";

const JUDGE0_CONCURRENCY = parseInt(process.env.JUDGE0_CONCURRENCY || "5", 10);

const broadcastSubmissionResult = (payload: {
  submissionId: string;
  userId: string;
  testAttemptId: string | null;
  status: string;
  passedCount: number;
  totalCount: number;
  runtime: number | null;
  memory: number | null;
  compileOutput?: string | null;
  errorOutput?: string | null;
}) => {
  emitToUser(payload.userId, "submission:completed", payload);
  emitToUser(payload.userId, "submission-finished", payload);
  if (payload.testAttemptId) {
    emitToAttempt(payload.testAttemptId, "submission:completed", payload);
  }
};

/**
 * Queue 2 Worker: Code Execution via Judge0.
 * Concurrency is controlled via JUDGE0_CONCURRENCY env variable to match plan limits.
 */
export const codeExecutionWorker = new Worker<CodeExecutionJobPayload>(
  QUEUE_NAMES.CODE_EXECUTION,
  async (job: Job<CodeExecutionJobPayload>) => {
    const jlog = withJobContext({
      queue: QUEUE_NAMES.CODE_EXECUTION,
      jobId: job.id,
      attemptsMade: job.attemptsMade,
      requestId: job.data.requestId,
    });

    jlog.info("Executing code submission", { submissionId: job.data.submissionId });

    try {
      const result = await processCodeExecutionJob(job.data.submissionId, job.attemptsMade);
      broadcastSubmissionResult(result);

      // Debounce student stats recalculation cleanly
      await enqueuePerformanceRecompute({
        userId: result.userId,
        trigger: "submission",
        requestId: job.data.requestId,
      });

      return result;
    } catch (err) {
      if (err instanceof TerminalCodeSubmissionError) {
        // Notify student of their compilation error before marking BullMQ job unrecoverable
        broadcastSubmissionResult(err.result);
        throw new UnrecoverableError(err.message);
      }
      return rethrowWithBullMQSemantics(err);
    }
  },
  buildBaseWorkerOptions(QUEUE_NAMES.CODE_EXECUTION, {
    concurrency: JUDGE0_CONCURRENCY,
    lockDuration: 120_000,
    stalledInterval: 120_000,
    settings: {
      backoffStrategy: exponentialJitterBackoff,
    },
  })
);

attachWorkerListeners(codeExecutionWorker, QUEUE_NAMES.CODE_EXECUTION);

// Only mark FAILED in PostgreSQL once all retries are exhausted and status is still non-terminal
codeExecutionWorker.on("failed", async (job, error) => {
  if (!job) return;
  const maxAttempts = job.opts?.attempts ?? 4;
  const isUnrecoverable = error.name === "UnrecoverableError";
  const isFinal = isUnrecoverable || job.attemptsMade >= maxAttempts;

  if (!isFinal) return;

  try {
    const { count } = await prisma.submission.updateMany({
      where: {
        id: job.data.submissionId,
        status: { in: ["PENDING", "RUNNING"] },
      },
      data: {
        status: "FAILED",
        errorOutput: error.message.slice(0, 1000),
      },
    });

    if (count > 0) {
      await prisma.compilerJob
        .update({
          where: { submissionId: job.data.submissionId },
          data: { status: "FAILED", lastError: error.message.slice(0, 1000) },
        })
        .catch(() => {});

      broadcastSubmissionResult({
        submissionId: job.data.submissionId,
        userId: job.data.userId,
        testAttemptId: job.data.testAttemptId ?? null,
        status: "FAILED",
        passedCount: 0,
        totalCount: 0,
        runtime: null,
        memory: null,
        errorOutput: "Code execution failed after retries",
      });
    }
  } catch {
    // DB fallback failure already logged by primary listener
  }
});
