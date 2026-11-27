import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import redis from "../config/redis";
import logger from "../config/logger";
import { recordAuthTiming } from "../lib/requestTiming";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Short-TTL L1 in-memory session cache cuts ~190ms cross-region Redis RTT on repeat requests.
// Trade-off: on multi-instance deployments, force-logout propagation can lag up to SESSION_L1_TTL_MS
// (set SESSION_L1_TTL_MS=0 to enforce strict per-request Redis checks across replicas).
const SESSION_L1_TTL_MS = parseInt(process.env.SESSION_L1_TTL_MS || "15000", 10);
const MAX_LOCAL_SESSION_CACHE = 2000;

interface CachedSessionUser {
  status: "active" | "revoked";
  user?: { id: string; email: string; role: string };
  expiresAt: number;
}

const localSessionCache = new Map<string, CachedSessionUser>();

const setLocalSession = (sessionId: string, entry: Omit<CachedSessionUser, "expiresAt">) => {
  if (SESSION_L1_TTL_MS <= 0) return;
  if (localSessionCache.size >= MAX_LOCAL_SESSION_CACHE) {
    const oldest = localSessionCache.keys().next().value;
    if (oldest) localSessionCache.delete(oldest);
  }
  localSessionCache.set(sessionId, {
    ...entry,
    expiresAt: Date.now() + SESSION_L1_TTL_MS,
  });
};

export const invalidateLocalSession = (sessionId?: string) => {
  if (!sessionId) return;
  localSessionCache.delete(sessionId);
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
  const authStart = process.hrtime.bigint();
  const finishAuth = (source: string) => {
    const elapsedMs = Number(process.hrtime.bigint() - authStart) / 1_000_000;
    recordAuthTiming(elapsedMs, source);
  };

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    finishAuth("NONE");
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
      finishAuth("JWT-NO-SESSION");
      return res.status(401).json({
        error: "Your account has been logged in on another device.",
        code: "SESSION_REVOKED",
      });
    }

    // 0. L1 In-Process Session Cache (short TTL, skips cross-region Redis RTT)
    if (SESSION_L1_TTL_MS > 0) {
      const l1 = localSessionCache.get(decoded.sessionId);
      if (l1 && l1.expiresAt > Date.now()) {
        if (l1.status === "revoked") {
          finishAuth("L1-REVOKED");
          return res.status(401).json({
            error: "Your account has been logged in on another device.",
            code: "SESSION_REVOKED",
          });
        }
        if (l1.user && l1.user.id === decoded.id) {
          req.user = { ...l1.user, sessionId: decoded.sessionId };
          finishAuth("L1-MEMORY");
          return next();
        }
      } else if (l1) {
        localSessionCache.delete(decoded.sessionId);
      }
    }

    let isSessionActive = false;

    // 1. Authoritative Redis session check (bounded timeout with cleanup to avoid dangling timers)
    if (redis) {
      let timeoutHandle: NodeJS.Timeout | undefined;
      try {
        const redisSession = await Promise.race([
          redis.get(`session:${decoded.sessionId}`),
          new Promise<null>((_, reject) => {
            timeoutHandle = setTimeout(() => reject(new Error("Redis lookup timeout")), 800);
          }),
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
              setLocalSession(decoded.sessionId, { status: "active", user: parsed.user });
              finishAuth("L2-REDIS");
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
      } finally {
        if (timeoutHandle) clearTimeout(timeoutHandle);
      }
    }

    // 2. Single relational PostgreSQL lookup (eliminates sequential session + user round-trips)
    if (!isSessionActive) {
      let session;
      try {
        session = await prisma.deviceSession.findUnique({
          where: { sessionId: decoded.sessionId },
          select: {
            isActive: true,
            userId: true,
            user: {
              select: { id: true, email: true, role: true },
            },
          },
        });
      } catch (dbErr: any) {
        logger.error(`Database session verification failed: ${dbErr.message}`);
        return res.status(503).json({
          error: "Authentication service temporarily unavailable. Please retry.",
          code: "AUTH_SERVICE_UNAVAILABLE",
        });
      }

      if (!session || !session.isActive || session.userId !== decoded.id || !session.user) {
        if (redis) {
          redis.set(`session:${decoded.sessionId}`, "revoked", "EX", 86400).catch(() => {});
        }
        return res.status(401).json({
          error: "Your account has been logged in on another device.",
          code: "SESSION_REVOKED",
        });
      }

      const userData = { id: session.user.id, email: session.user.email, role: session.user.role };
      req.user = { ...userData, sessionId: decoded.sessionId };
      setLocalSession(decoded.sessionId, { status: "active", user: userData });

      if (redis) {
        redis
          .set(
            `session:${decoded.sessionId}`,
            JSON.stringify({ status: "active", user: userData }),
            "EX",
            604800
          )
          .catch(() => {});
      }

      finishAuth("DB-FALLBACK");
      return next();
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
    setLocalSession(decoded.sessionId, { status: "active", user: userData });

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

    finishAuth("DB-LEGACY");
    return next();
  } catch (error) {
    finishAuth("JWT-INVALID");
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
