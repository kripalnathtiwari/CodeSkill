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

    // Check Redis first for fast lookup (<2ms)
    if (redis) {
      try {
        const redisSession = await redis.get(`session:${decoded.sessionId}`);
        if (redisSession !== null) {
          if (redisSession === "revoked") {
            return res.status(401).json({
              error: "Your account has been logged in on another device.",
              code: "SESSION_REVOKED",
            });
          }

          try {
            const parsed = JSON.parse(redisSession);
            if (parsed.status === "revoked" || parsed.active === false) {
              return res.status(401).json({
                error: "Your account has been logged in on another device.",
                code: "SESSION_REVOKED",
              });
            }
            if ((parsed.status === "active" || parsed.active === true) && parsed.user) {
              // Ultra-fast path: satisfied entirely from Redis in memory
              req.user = { ...parsed.user, sessionId: decoded.sessionId };
              return next();
            }
          } catch {
            if (redisSession === "active") {
              isSessionActive = true;
            }
          }
        }
      } catch (redisErr: any) {
        logger.warn(`Redis session check failed: ${redisErr.message}`);
      }
    }

    // If Redis didn't confirm, verify in PostgreSQL
    if (!isSessionActive) {
      const session = await prisma.deviceSession.findUnique({
        where: { sessionId: decoded.sessionId },
        select: { isActive: true, userId: true },
      });

      if (!session || !session.isActive || session.userId !== decoded.id) {
        if (redis) {
          redis.set(`session:${decoded.sessionId}`, "revoked", "EX", 86400).catch(() => {});
        }
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

    // Cache verified session + user info in Redis for future requests (7 days TTL)
    if (redis) {
      redis.set(
        `session:${decoded.sessionId}`,
        JSON.stringify({
          status: "active",
          user: { id: user.id, email: user.email, role: user.role }
        }),
        "EX",
        604800
      ).catch(() => {});
    }

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
