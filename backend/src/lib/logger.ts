import winston from "winston";
import baseLogger from "../config/logger";

export interface JobLogContext {
  jobId?: string;
  queue?: string;
  attemptsMade?: number;
  requestId?: string;
  [key: string]: unknown;
}

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Structured Winston logger for background workers and queue lifecycle events.
 * Emits structured JSON in production and readable structured fields everywhere.
 */
export const jobLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "development" ? "debug" : "info"),
  format:
    process.env.NODE_ENV === "production"
      ? jsonFormat
      : winston.format.combine(
          winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
            return `[${timestamp}] [${level}]: ${message}${metaStr}`;
          })
        ),
  transports: [new winston.transports.Console()],
});

/**
 * Returns a contextual logger carrying jobId, queue, attemptsMade, and requestId.
 */
export const withJobContext = (ctx: JobLogContext) => {
  const baseMeta = {
    ...(ctx.queue ? { queue: ctx.queue } : {}),
    ...(ctx.jobId ? { jobId: ctx.jobId } : {}),
    ...(ctx.attemptsMade !== undefined ? { attemptsMade: ctx.attemptsMade } : {}),
    ...(ctx.requestId ? { requestId: ctx.requestId } : {}),
  };

  return {
    info: (message: string, extra?: Record<string, unknown>) =>
      jobLogger.info(message, { ...baseMeta, ...extra }),
    warn: (message: string, extra?: Record<string, unknown>) =>
      jobLogger.warn(message, { ...baseMeta, ...extra }),
    error: (message: string, extra?: Record<string, unknown>) =>
      jobLogger.error(message, { ...baseMeta, ...extra }),
    debug: (message: string, extra?: Record<string, unknown>) =>
      jobLogger.debug(message, { ...baseMeta, ...extra }),
  };
};

export { baseLogger };
export default jobLogger;
