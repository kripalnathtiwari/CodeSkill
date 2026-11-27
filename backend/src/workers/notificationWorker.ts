import { Job, Worker } from "bullmq";
import {
  DeliverNotificationPayload,
  FanoutNotificationPayload,
  NotificationJobPayload,
  notificationQueue,
} from "../queues/notificationQueue";
import { QUEUE_NAMES } from "../queues/shared";
import {
  fetchNotificationTargetBatch,
  processDeliverNotificationJob,
} from "../jobs/notificationJob";
import { emitToUser } from "../lib/socketEmitter";
import {
  attachWorkerListeners,
  buildBaseWorkerOptions,
  rethrowWithBullMQSemantics,
} from "./shared";

/**
 * Queue 6 Worker: Delayed reminders and batched `addBulk` fan-out delivery.
 */
export const notificationWorker = new Worker<NotificationJobPayload>(
  QUEUE_NAMES.NOTIFICATION,
  async (job: Job<NotificationJobPayload>) => {
    try {
      if (job.name === "fanout-notification") {
        const payload = job.data as FanoutNotificationPayload;
        const batchSize = Math.min(payload.batchSize ?? 100, 250);
        let cursorUserId: string | undefined;
        let totalDispatched = 0;

        while (true) {
          const userIds = await fetchNotificationTargetBatch({
            role: payload.role,
            cursorUserId,
            batchSize,
          });
          if (userIds.length === 0) break;

          await notificationQueue.addBulk(
            userIds.map((userId) => ({
              name: "deliver-notification",
              data: {
                userId,
                type: payload.type,
                title: payload.title,
                message: payload.message,
                requestId: payload.requestId,
              },
              opts: {
                jobId: `fanout-${payload.fanoutId}-${userId}`,
              },
            }))
          );

          totalDispatched += userIds.length;
          cursorUserId = userIds[userIds.length - 1];
          await job.updateProgress(totalDispatched);

          if (userIds.length < batchSize) break;
        }

        return { fanoutId: payload.fanoutId, dispatched: totalDispatched };
      }

      const payload = job.data as DeliverNotificationPayload;
      const saved = await processDeliverNotificationJob(payload);
      emitToUser(saved.userId, "notification:new", saved);
      return saved;
    } catch (err) {
      return rethrowWithBullMQSemantics(err);
    }
  },
  buildBaseWorkerOptions(QUEUE_NAMES.NOTIFICATION, {
    concurrency: parseInt(process.env.NOTIFICATION_WORKER_CONCURRENCY || "8", 10),
    drainDelay: 30,
  })
);

attachWorkerListeners(notificationWorker, QUEUE_NAMES.NOTIFICATION);
