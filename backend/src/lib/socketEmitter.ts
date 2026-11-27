import { Emitter } from "@socket.io/redis-emitter";
import Redis from "ioredis";
import { createBullMQRedisConnection, isQueueRedisConfigured } from "./redis";
import logger from "./logger";

let emitterInstance: Emitter | null = null;
let emitterRedisClient: Redis | null = null;

/**
 * Worker-side Socket.IO Redis emitter.
 * Workers live in a separate Railway service and cannot access the API's `io` server;
 * this publishes events into Redis where `@socket.io/redis-adapter` on the API fans them out.
 */
export const getSocketEmitter = (): Emitter | null => {
  if (emitterInstance) {
    return emitterInstance;
  }

  if (!isQueueRedisConfigured() && process.env.NODE_ENV === "production") {
    logger.warn("[SocketEmitter] QUEUE_REDIS_URL / REDIS_URL not set; real-time worker emits disabled.");
    return null;
  }

  try {
    emitterRedisClient = createBullMQRedisConnection("SocketEmitter");
    emitterInstance = new Emitter(emitterRedisClient);
    logger.info("[SocketEmitter] @socket.io/redis-emitter initialized");
    return emitterInstance;
  } catch (err: any) {
    logger.error("[SocketEmitter] Failed to initialize emitter", { error: err.message });
    return null;
  }
};

export const emitToUser = (userId: string, event: string, payload: Record<string, unknown>): void => {
  const emitter = getSocketEmitter();
  if (!emitter) return;
  emitter.to(`user:${userId}`).emit(event, payload);
};

export const emitToAttempt = (attemptId: string, event: string, payload: Record<string, unknown>): void => {
  const emitter = getSocketEmitter();
  if (!emitter) return;
  emitter.to(`attempt:${attemptId}`).emit(event, payload);
};

export const closeSocketEmitter = async (): Promise<void> => {
  if (emitterRedisClient && emitterRedisClient.status !== "end") {
    await emitterRedisClient.quit().catch(() => emitterRedisClient?.disconnect());
  }
  emitterRedisClient = null;
  emitterInstance = null;
};
