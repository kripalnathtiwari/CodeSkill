import { Queue } from "bullmq";
import { createRedisConnection } from "../../config/redis";

const connection = createRedisConnection();

export const atsQueue = new Queue("ats-analysis", {
  connection: connection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      age: 3600, // 1 hour
      count: 1000,
    },
    removeOnFail: {
      age: 86400, // 24 hours
      count: 5000,
    },
  },
});
