import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export interface CorrelatedRequest extends Request {
  requestId?: string;
}

/**
 * Propagates or creates an X-Request-Id correlation header on every HTTP request
 * so controllers can pass `req.requestId` into BullMQ job payloads for end-to-end tracing.
 */
export const requestIdMiddleware = (req: CorrelatedRequest, res: Response, next: NextFunction) => {
  const incoming = req.headers["x-request-id"];
  const requestId =
    typeof incoming === "string" && incoming.trim().length > 0
      ? incoming.trim().slice(0, 64)
      : crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
};
