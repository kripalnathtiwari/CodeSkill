import { emailQueue } from "./emailQueue";
import { codeExecutionQueue } from "./codeExecutionQueue";
import { examQueue } from "./examQueue";
import { performanceQueue } from "./performanceQueue";
import { fileQueue } from "./fileQueue";
import { notificationQueue } from "./notificationQueue";

export const allQueues = [
  emailQueue,
  codeExecutionQueue,
  examQueue,
  performanceQueue,
  fileQueue,
  notificationQueue,
];

export const closeAllQueues = async (): Promise<void> => {
  await Promise.allSettled(allQueues.map((q) => q.close()));
};

export * from "./shared";
export * from "./emailQueue";
export * from "./codeExecutionQueue";
export * from "./examQueue";
export * from "./performanceQueue";
export * from "./fileQueue";
export * from "./notificationQueue";
