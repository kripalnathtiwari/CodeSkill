import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import logger from "../lib/logger";
import { corsOptions } from "../config/corsConfig";
import { createSocketAdapterClients } from "../lib/redis";

let io: SocketIOServer | null = null;

export const initSocketServer = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: corsOptions,
  });

  // Attach Redis Pub/Sub adapter so separate BullMQ worker processes using
  // @socket.io/redis-emitter can broadcast to any connected WebSocket client.
  const adapterClients = createSocketAdapterClients();
  if (adapterClients) {
    io.adapter(createAdapter(adapterClients.pubClient, adapterClients.subClient));
    logger.info("[Socket.IO] Attached @socket.io/redis-adapter");
  } else {
    logger.warn("[Socket.IO] Redis not configured; running with single-instance memory adapter");
  }

  io.on("connection", (socket) => {
    logger.debug(`Socket client connected: ${socket.id}`);

    socket.on("join-user-room", (userId: string) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
      logger.debug(`Socket ${socket.id} joined room user:${userId}`);
    });

    socket.on("join-attempt-room", (attemptId: string) => {
      if (!attemptId) return;
      socket.join(`attempt:${attemptId}`);
      logger.debug(`Socket ${socket.id} joined room attempt:${attemptId}`);
    });

    socket.on("leave-attempt-room", (attemptId: string) => {
      if (!attemptId) return;
      socket.leave(`attempt:${attemptId}`);
    });

    socket.on("disconnect", () => {
      logger.debug(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return io;
};

export const notifySubmissionUpdate = (userId: string, data: any) => {
  if (!io) {
    logger.warn("Socket.io server uninitialized. Skipping notification.");
    return;
  }
  io.to(`user:${userId}`).emit("submission-finished", data);
  io.to(`user:${userId}`).emit("submission:completed", data);
};

export const emitForceLogout = (userId: string, message: string, email?: string) => {
  if (!io) {
    logger.warn("Socket.io server uninitialized. Skipping force-logout notification.");
    return;
  }
  io.to(`user:${userId}`).emit("force-logout", { message });
  if (email) {
    io.to(`user:${email.toLowerCase().trim()}`).emit("force-logout", { message });
  }
  logger.info(`Force-logout emitted to user:${userId}${email ? ` and ${email}` : ""}`);
};
