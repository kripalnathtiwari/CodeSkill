import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { getApiUrl } from "../utils/apiConfig";

interface UseRealtimeJobEventsOptions {
  userId?: string;
  attemptId?: string;
}

/**
 * Listens for Socket.IO worker notifications bridged through @socket.io/redis-emitter
 * and invalidates matching TanStack Query caches so React UI stays synced with PostgreSQL.
 */
export function useRealtimeJobEvents({ userId, attemptId }: UseRealtimeJobEventsOptions) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const socketUrl = getApiUrl("").replace(/\/+$/, "");
    const socket: Socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      socket.emit("join-user-room", userId);
      if (attemptId) {
        socket.emit("join-attempt-room", attemptId);
      }
    });

    socket.on("submission:completed", (payload: { submissionId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["submission", payload.submissionId] });
      queryClient.invalidateQueries({ queryKey: ["submissionHistory"] });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    });

    socket.on("exam:auto-submitted", (payload: { attemptId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["examAttempt", payload.attemptId] });
    });

    socket.on("exam:graded", (payload: { attemptId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["examAttempt", payload.attemptId] });
    });

    socket.on("exam:result-published", (payload: { attemptId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["examAttempt", payload.attemptId] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    });

    socket.on("performance:updated", () => {
      queryClient.invalidateQueries({ queryKey: ["dsaStats"] });
      queryClient.invalidateQueries({ queryKey: ["mcqStats"] });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    });

    socket.on("notification:new", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return () => {
      if (attemptId) {
        socket.emit("leave-attempt-room", attemptId);
      }
      socket.disconnect();
    };
  }, [userId, attemptId, queryClient]);
}
