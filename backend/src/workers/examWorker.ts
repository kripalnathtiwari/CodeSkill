import { Job, Worker } from "bullmq";
import {
  AutoSubmitExamPayload,
  enqueueGradeExam,
  enqueuePublishExamResult,
  ExamJobPayload,
  GradeExamPayload,
  PublishExamResultPayload,
} from "../queues/examQueue";
import { enqueueTransactionalEmail } from "../queues/emailQueue";
import { enqueuePerformanceRecompute } from "../queues/performanceQueue";
import { QUEUE_NAMES } from "../queues/shared";
import {
  processAutoSubmitExamJob,
  processGradeExamJob,
  processPublishExamResultJob,
} from "../jobs/examJob";
import { emitToAttempt, emitToUser } from "../lib/socketEmitter";
import { withJobContext } from "../lib/logger";
import {
  attachWorkerListeners,
  buildBaseWorkerOptions,
  rethrowWithBullMQSemantics,
} from "./shared";

/**
 * Queue 3 Worker: Exam timer auto-submit, grading aggregation, and result publication.
 */
export const examWorker = new Worker<ExamJobPayload>(
  QUEUE_NAMES.EXAM,
  async (job: Job<ExamJobPayload>) => {
    const jlog = withJobContext({
      queue: QUEUE_NAMES.EXAM,
      jobId: job.id,
      attemptsMade: job.attemptsMade,
      requestId: job.data.requestId,
    });

    try {
      switch (job.name) {
        case "auto-submit": {
          const payload = job.data as AutoSubmitExamPayload;
          const res = await processAutoSubmitExamJob(payload.attemptId);

          if (!res.autoSubmitted) {
            jlog.info("Auto-submit ignored (attempt already submitted)", {
              attemptId: payload.attemptId,
              status: res.status,
            });
            return res;
          }

          emitToUser(res.userId, "exam:auto-submitted", {
            attemptId: res.attemptId,
            testId: res.testId,
          });
          emitToAttempt(res.attemptId, "exam:auto-submitted", {
            attemptId: res.attemptId,
            testId: res.testId,
          });

          await enqueueGradeExam({
            attemptId: res.attemptId,
            userId: res.userId,
            testId: res.testId,
            requestId: payload.requestId,
          });
          return res;
        }

        case "grade-exam": {
          const payload = job.data as GradeExamPayload;
          const graded = await processGradeExamJob(payload.attemptId);

          emitToUser(graded.userId, "exam:graded", {
            attemptId: graded.attemptId,
            testId: graded.testId,
            score: graded.score,
            maxScore: graded.maxScore,
          });
          emitToAttempt(graded.attemptId, "exam:graded", {
            attemptId: graded.attemptId,
            testId: graded.testId,
            score: graded.score,
            maxScore: graded.maxScore,
          });

          await enqueuePublishExamResult({
            attemptId: graded.attemptId,
            userId: graded.userId,
            testId: graded.testId,
            requestId: payload.requestId,
          });
          return graded;
        }

        case "publish-result": {
          const payload = job.data as PublishExamResultPayload;
          const published = await processPublishExamResultJob(payload.attemptId);

          if (!published.alreadyPublished) {
            emitToUser(published.userId, "exam:result-published", {
              attemptId: published.attemptId,
              testId: published.testId,
              score: published.score,
              maxScore: published.maxScore,
            });
            emitToAttempt(published.attemptId, "exam:result-published", {
              attemptId: published.attemptId,
              testId: published.testId,
              score: published.score,
              maxScore: published.maxScore,
            });

            await enqueueTransactionalEmail({
              kind: "result-published",
              to: published.userEmail,
              userId: published.userId,
              userName: published.userName,
              data: {
                testTitle: published.testTitle,
                score: String(published.score),
                maxScore: String(published.maxScore),
              },
              idempotencyKey: `result-email-${published.attemptId}`,
              requestId: payload.requestId,
            });

            await enqueuePerformanceRecompute({
              userId: published.userId,
              trigger: "exam",
              requestId: payload.requestId,
            });
          }

          return published;
        }

        default:
          jlog.warn("Unhandled exam job name", { name: job.name });
          return null;
      }
    } catch (err) {
      return rethrowWithBullMQSemantics(err);
    }
  },
  buildBaseWorkerOptions(QUEUE_NAMES.EXAM, {
    concurrency: parseInt(process.env.EXAM_WORKER_CONCURRENCY || "5", 10),
  })
);

attachWorkerListeners(examWorker, QUEUE_NAMES.EXAM);
