import { Queue } from "bullmq";
import { getSharedQueueConnection } from "../lib/redis";
import { defaultJobOptions, QUEUE_NAMES, sharedQueuePrefix } from "./shared";

export interface DeliverNotificationPayload {
  userId: string;
  type: string;
  title: string;
  message: string;
  requestId?: string;
}

export interface FanoutNotificationPayload {
  fanoutId: string;
  role?: string;
  type: string;
  title: string;
  message: string;
  batchSize?: number;
  requestId?: string;
}

export type NotificationJobPayload = DeliverNotificationPayload | FanoutNotificationPayload;

export const notificationQueue = new Queue<NotificationJobPayload>(
  QUEUE_NAMES.NOTIFICATION,
  {
    connection: getSharedQueueConnection() as any,
    prefix: sharedQueuePrefix,
    defaultJobOptions,
  }
);

/**
 * Schedules a delayed deadline or exam reminder for a student.
 */
export const enqueueExamReminder = async (params: {
  testId: string;
  userId: string;
  title: string;
  message: string;
  delayMs: number;
  requestId?: string;
}) => {
  return notificationQueue.add(
    "deliver-notification",
    {
      userId: params.userId,
      type: "EXAM_REMINDER",
      title: params.title,
      message: params.message,
      requestId: params.requestId,
    },
    {
      jobId: `reminder-${params.testId}-${params.userId}`,
      delay: Math.max(0, params.delayMs),
    }
  );
};

/**
 * Enqueues a parent fan-out job that pages user IDs and calls addBulk in batches.
 */
export const enqueueNotificationFanout = async (payload: FanoutNotificationPayload) => {
  return notificationQueue.add("fanout-notification", payload, {
    jobId: `fanout-${payload.fanoutId}`,
  });
};
