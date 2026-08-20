import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import logger from "../config/logger";

import { corsOptions } from "../config/corsConfig";

let io: SocketIOServer | null = null;

export const initSocketServer = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: corsOptions, // Enforce identical CORS rules for WebSocket and HTTP
  });

  io.on("connection", (socket) => {
    logger.debug(`Socket client connected: ${socket.id}`);

    // Join room corresponding to authenticated user
    socket.on("join-user-room", (userId: string) => {
      socket.join(`user:${userId}`);
      logger.debug(`Socket ${socket.id} joined room user:${userId}`);
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
  logger.debug(`WebSocket broadcast: submission-finished dispatched to user:${userId}`);
};
