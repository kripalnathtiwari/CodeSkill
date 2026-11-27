import { PrismaClient } from "@prisma/client";
import logger from "../lib/logger";
import { recordDbTiming } from "../lib/requestTiming";

// Strip accidental wrapping quotes from Railway/Vercel dashboard env values
if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/^"(.*)"$/, "$1").trim();
}
if (process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DIRECT_URL.replace(/^"(.*)"$/, "$1").trim();
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const createTimedPrismaClient = (): PrismaClient => {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  const extended = base.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const t0 = process.hrtime.bigint();
          try {
            return await query(args);
          } finally {
            const elapsedMs = Number(process.hrtime.bigint() - t0) / 1_000_000;
            recordDbTiming(elapsedMs);
          }
        },
      },
    },
  });

  return extended as unknown as PrismaClient;
};

/**
 * IMPORTANT (Supabase PgBouncer pooling):
 * API and worker processes MUST use DATABASE_URL (the PgBouncer pooled string on port 6543
 * with ?pgbouncer=true&connection_limit=5..10), never DIRECT_URL (port 5432), which is
 * reserved for Prisma CLI migrations (`directUrl` in schema.prisma).
 */
export const prisma: PrismaClient = globalForPrisma.prisma || createTimedPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Audits non-secret Prisma/PostgreSQL connection pool settings from DATABASE_URL.
 */
export const getPoolConfigSummary = () => {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    return { configured: false, pgbouncer: false, connectionLimit: "default", poolTimeout: "default" };
  }
  try {
    const parsed = new URL(raw);
    return {
      configured: true,
      port: parsed.port || "5432",
      pgbouncer: parsed.searchParams.get("pgbouncer") === "true",
      connectionLimit: parsed.searchParams.get("connection_limit") || "default (Prisma num_cpus*2+1)",
      poolTimeout: parsed.searchParams.get("pool_timeout") || "10s (default)",
    };
  } catch {
    return { configured: true, pgbouncer: false, connectionLimit: "unparsed", poolTimeout: "unparsed" };
  }
};

/**
 * Measures PostgreSQL round-trip ping latency (SELECT 1) in milliseconds.
 */
export const measureDbLatencyMs = async (): Promise<number> => {
  const start = process.hrtime.bigint();
  await prisma.$queryRaw`SELECT 1`;
  const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
  return Math.round(elapsedMs * 100) / 100;
};

export const disconnectPrisma = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info("[Prisma] Database client disconnected cleanly");
  } catch (err: any) {
    logger.error("[Prisma] Error disconnecting client", { error: err.message });
  }
};

export default prisma;
