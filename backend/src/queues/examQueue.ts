import { Queue } from "bullmq";
import { getSharedQueueConnection } from "../lib/redis";
import { defaultJobOptions, QUEUE_NAMES, sharedQueuePrefix } from "./shared";

export interface AutoSubmitExamPayload {
  attemptId: string;
  userId: string;
  testId: string;
  requestId?: string;
}

export interface GradeExamPayload {
  attemptId: string;
  userId: string;
  testId: string;
  requestId?: string;
}

export interface PublishExamResultPayload {
  attemptId: string;
  userId: string;
  testId: string;
  requestId?: string;
}

export type ExamJobPayload = AutoSubmitExamPayload | GradeExamPayload | PublishExamResultPayload;

export const examQueue = new Queue<ExamJobPayload>(QUEUE_NAMES.EXAM, {
  connection: getSharedQueueConnection() as any,
  prefix: sharedQueuePrefix,
  defaultJobOptions,
});

/**
 * Schedules auto-submission when an exam timer expires (`jobId: autosubmit-${attemptId}`).
 */
export const enqueueAutoSubmitExam = async (
  payload: AutoSubmitExamPayload,
  delayMs: number
) => {
  return examQueue.add("auto-submit", payload, {
    jobId: `autosubmit-${payload.attemptId}`,
    delay: Math.max(0, delayMs),
    attempts: 3,
  });
};

/**
 * Cancels the pending auto-submit job if the student submits manually before timeout.
 * Even if removal races with promotion, `processAutoSubmitExamJob` ignores non-STARTED attempts.
 */
export const cancelAutoSubmitExam = async (attemptId: string): Promise<boolean> => {
  const job = await examQueue.getJob(`autosubmit-${attemptId}`);
  if (!job) return false;
  const state = await job.getState();
  if (state === "delayed" || state === "waiting" || state === "prioritized") {
    await job.remove();
    return true;
  }
  return false;
};

export const enqueueGradeExam = async (payload: GradeExamPayload) => {
  return examQueue.add("grade-exam", payload, {
    jobId: `grade-${payload.attemptId}`,
  });
};

export const enqueuePublishExamResult = async (payload: PublishExamResultPayload) => {
  return examQueue.add("publish-result", payload, {
    jobId: `publish-${payload.attemptId}`,
  });
};
