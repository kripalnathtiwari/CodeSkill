import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import redis from "../config/redis";
import logger from "../config/logger";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    sessionId?: string;
  };
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      sessionId?: string;
    };

    // --- Single Active Device: validate sessionId ---
    if (!decoded.sessionId) {
      return res.status(401).json({
        error: "Your account has been logged in on another device.",
        code: "SESSION_REVOKED",
      });
    }

    let isSessionActive = false;

    // Check Redis first for fast lookup
    if (redis) {
      try {
        const redisSession = await redis.get(`session:${decoded.sessionId}`);
        if (redisSession !== null) {
          isSessionActive = redisSession === "active";
          if (!isSessionActive) {
            return res.status(401).json({
              error: "Your account has been logged in on another device.",
              code: "SESSION_REVOKED",
            });
          }
        }
        // If key not found in Redis, fall through to DB check
      } catch (redisErr: any) {
        logger.warn(`Redis session check failed: ${redisErr.message}`);
        // Fall through to DB check
      }
    }

    // If Redis didn't confirm, check DB
    if (!isSessionActive) {
      const session = await prisma.deviceSession.findUnique({
        where: { sessionId: decoded.sessionId },
        select: { isActive: true, userId: true },
      });

      if (!session || !session.isActive || session.userId !== decoded.id) {
        return res.status(401).json({
          error: "Your account has been logged in on another device.",
          code: "SESSION_REVOKED",
        });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: "User session expired or user not found" });
    }

    req.user = { ...user, sessionId: decoded.sessionId } as {
      id: string;
      email: string;
      role: string;
      sessionId?: string;
    };
    return next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired access token" });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions for this resource" });
    }
    return next();
  };
};
