/**
 * Domain-level job error hierarchy.
 *
 * Pure business logic under `src/jobs/` throws these classes instead of
 * importing `bullmq` (`UnrecoverableError`), keeping job logic framework-agnostic
 * and trivially unit-testable without Redis. Workers translate `PermanentJobError`
 * into BullMQ's `UnrecoverableError`.
 */

export class PermanentJobError extends Error {
  public readonly code: string;

  constructor(message: string, code = "PERMANENT_ERROR") {
    super(message);
    this.name = "PermanentJobError";
    this.code = code;
    Object.setPrototypeOf(this, PermanentJobError.prototype);
  }
}

export class RetryableServiceError extends Error {
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "RetryableServiceError";
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, RetryableServiceError.prototype);
  }
}

export class RateLimitError extends RetryableServiceError {
  public readonly retryAfterMs?: number;

  constructor(message: string, retryAfterMs?: number) {
    super(message, 429);
    this.name = "RateLimitError";
    this.retryAfterMs = retryAfterMs;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}
