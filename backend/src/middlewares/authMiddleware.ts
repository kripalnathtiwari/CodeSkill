import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import redis from "../config/redis";
import logger from "../config/logger";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// High-speed in-process cache for verified device sessions (TTL: 20 seconds)
// Dramatically cuts repeated session-status and navigation authorization overhead to <0.1ms
interface LocalCachedSession {
  user: {
    id: string;
    email: string;
    role: string;
  };
  expiresAt: number;
}

const localSessionCache = new Map<string, LocalCachedSession>();
const LOCAL_SESSION_TTL_MS = 20 * 1000; // 20 seconds

export const invalidateLocalSession = (sessionId?: string) => {
  if (sessionId) {
    localSessionCache.delete(sessionId);
  } else {
    localSessionCache.clear();
  }
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

    // --- Single Active Device: validate sessionId ---
    if (!decoded.sessionId) {
      return res.status(401).json({
        error: "Your account has been logged in on another device.",
        code: "SESSION_REVOKED",
      });
    }

    const now = Date.now();

    // 1. Check in-process cache first (<0.1ms)
    const localHit = localSessionCache.get(decoded.sessionId);
    if (localHit && localHit.expiresAt > now && localHit.user.id === decoded.id) {
      req.user = { ...localHit.user, sessionId: decoded.sessionId };
      return next();
    } else if (localHit) {
      localSessionCache.delete(decoded.sessionId);
    }

    let isSessionActive = false;

    // 2. Check Redis for fast distributed session verification (~30-50ms)
    if (redis) {
      try {
        const redisSession = await redis.get(`session:${decoded.sessionId}`);
        if (redisSession !== null) {
          if (redisSession === "revoked") {
            localSessionCache.delete(decoded.sessionId);
            return res.status(401).json({
              error: "Your account has been logged in on another device.",
              code: "SESSION_REVOKED",
            });
          }

          try {
            const parsed = JSON.parse(redisSession);
            if (parsed.status === "revoked" || parsed.active === false) {
              localSessionCache.delete(decoded.sessionId);
              return res.status(401).json({
                error: "Your account has been logged in on another device.",
                code: "SESSION_REVOKED",
              });
            }
            if ((parsed.status === "active" || parsed.active === true) && parsed.user) {
              // Valid in Redis: cache in process memory for subsequent rapid requests
              localSessionCache.set(decoded.sessionId, {
                user: parsed.user,
                expiresAt: now + LOCAL_SESSION_TTL_MS,
              });
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

    // 3. Fallback: If Redis didn't confirm, verify in PostgreSQL
    if (!isSessionActive) {
      const session = await prisma.deviceSession.findUnique({
        where: { sessionId: decoded.sessionId },
        select: { isActive: true, userId: true },
      });

      if (!session || !session.isActive || session.userId !== decoded.id) {
        localSessionCache.delete(decoded.sessionId);
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
      localSessionCache.delete(decoded.sessionId);
      return res.status(401).json({ error: "User session expired or user not found" });
    }

    const userData = { id: user.id, email: user.email, role: user.role };
    req.user = { ...userData, sessionId: decoded.sessionId };

    // Cache verified session + user info in local process cache
    localSessionCache.set(decoded.sessionId, {
      user: userData,
      expiresAt: now + LOCAL_SESSION_TTL_MS,
    });

    // Cache verified session in Redis for distributed instances (7 days TTL)
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
