import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import redis from "../config/redis";
import logger from "../config/logger";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Backward-compatible stub for cross-instance invalidation callers
export const invalidateLocalSession = (_sessionId?: string) => {
  // Authoritative session state is maintained linearly in Redis with immediate cross-instance consistency
};

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

    // --- Strict Single Active Device: validate sessionId presence ---
    if (!decoded.sessionId) {
      return res.status(401).json({
        error: "Your account has been logged in on another device.",
        code: "SESSION_REVOKED",
      });
    }

    let isSessionActive = false;

    // 1. Authoritative Redis session check (bounded timeout to prevent hanging offline queue)
    if (redis) {
      try {
        const redisSession = await Promise.race([
          redis.get(`session:${decoded.sessionId}`),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Redis lookup timeout")), 1500))
        ]);

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
              // Ensure session owner matches token subject
              if (parsed.user.id !== decoded.id) {
                return res.status(401).json({
                  error: "Session identity mismatch.",
                  code: "SESSION_REVOKED",
                });
              }

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
        logger.warn(`Redis session check failed or timed out: ${redisErr.message}. Falling back to PostgreSQL.`);
      }
    }

    // 2. Fallback to PostgreSQL database for source-of-truth verification
    if (!isSessionActive) {
      let session;
      try {
        session = await prisma.deviceSession.findUnique({
          where: { sessionId: decoded.sessionId },
          select: { isActive: true, userId: true },
        });
      } catch (dbErr: any) {
        logger.error(`Database session verification failed: ${dbErr.message}`);
        // Fail-secure: never grant access if session verification database is unreachable
        return res.status(503).json({
          error: "Authentication service temporarily unavailable. Please retry.",
          code: "AUTH_SERVICE_UNAVAILABLE"
        });
      }

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

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true },
      });
    } catch (dbErr: any) {
      logger.error(`Database user lookup failed: ${dbErr.message}`);
      return res.status(503).json({
        error: "Authentication service temporarily unavailable. Please retry.",
        code: "AUTH_SERVICE_UNAVAILABLE"
      });
    }

    if (!user) {
      return res.status(401).json({ error: "User session expired or user not found" });
    }

    const userData = { id: user.id, email: user.email, role: user.role };
    req.user = { ...userData, sessionId: decoded.sessionId };

    // Synchronize active verified session into Redis for rapid subsequent calls across all instances
    if (redis) {
      redis.set(
        `session:${decoded.sessionId}`,
        JSON.stringify({
          status: "active",
          user: userData
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
