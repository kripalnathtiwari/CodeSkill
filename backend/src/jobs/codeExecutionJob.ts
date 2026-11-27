import prisma from "../config/db";
import judge0Service from "../services/judge0Service";
import { PermanentJobError } from "../lib/errors";
import logger from "../lib/logger";
import { getCacheRedis } from "../lib/redis";

export interface CodeExecutionResult {
  submissionId: string;
  userId: string;
  testAttemptId: string | null;
  status: string;
  passedCount: number;
  totalCount: number;
  runtime: number | null;
  memory: number | null;
  compileOutput?: string | null;
  errorOutput?: string | null;
  skipped?: boolean;
}

/**
 * Thrown after persisting COMPILATION_ERROR / INVALID_INPUT so the worker can still
 * push the terminal status to the student over Socket.IO and tell BullMQ not to retry.
 */
export class TerminalCodeSubmissionError extends PermanentJobError {
  public readonly result: CodeExecutionResult;

  constructor(message: string, code: string, result: CodeExecutionResult) {
    super(message, code);
    this.name = "TerminalCodeSubmissionError";
    this.result = result;
    Object.setPrototypeOf(this, TerminalCodeSubmissionError.prototype);
  }
}

const TERMINAL_SUBMISSION_STATUSES = new Set([
  "ACCEPTED",
  "WRONG_ANSWER",
  "COMPILATION_ERROR",
  "TIME_LIMIT_EXCEEDED",
  "MEMORY_LIMIT_EXCEEDED",
  "RUNTIME_ERROR",
  "FAILED",
]);

/**
 * Pure business logic for evaluating a student code submission against test cases via Judge0.
 * Idempotent by submissionId: terminal records short-circuit without re-calling Judge0.
 */
export const processCodeExecutionJob = async (
  submissionId: string,
  attemptsMade = 0
): Promise<CodeExecutionResult> => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      question: {
        include: { testCases: true },
      },
    },
  });

  if (!submission) {
    throw new PermanentJobError(`Submission ${submissionId} not found`, "SUBMISSION_NOT_FOUND");
  }

  // Idempotency guard: if a previous worker or stalled run already reached a terminal state, return it
  if (TERMINAL_SUBMISSION_STATUSES.has(submission.status)) {
    return {
      submissionId: submission.id,
      userId: submission.userId,
      testAttemptId: submission.testAttemptId,
      status: submission.status,
      passedCount: submission.passedCount,
      totalCount: submission.totalCount,
      runtime: submission.runtime,
      memory: submission.memory,
      compileOutput: submission.compileOutput,
      errorOutput: submission.errorOutput,
      skipped: true,
    };
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: "RUNNING" },
  });

  await prisma.compilerJob.upsert({
    where: { submissionId },
    create: { submissionId, status: "RUNNING", attempts: attemptsMade + 1 },
    update: { status: "RUNNING", attempts: attemptsMade + 1, lastError: null },
  });

  const testCases = submission.question.testCases;
  let passedCount = 0;
  let maxRuntime = 0;
  let maxMemory = 0;
  let finalStatus = "ACCEPTED";
  let compileOutput: string | null = null;
  let errorOutput: string | null = null;
  let lastJudge0Token: string | null = null;

  try {
    for (const tc of testCases) {
      const execResult = await judge0Service.executeTestCase({
        code: submission.code,
        language: submission.language,
        stdin: tc.input,
        expectedOutput: tc.output,
        timeLimitMs: submission.question.timeLimit,
        memoryLimitMb: submission.question.memoryLimit,
      });

      lastJudge0Token = execResult.token;
      if (execResult.runtimeMs > maxRuntime) maxRuntime = execResult.runtimeMs;
      if (execResult.memoryKb > maxMemory) maxMemory = execResult.memoryKb;

      if (execResult.status === "ACCEPTED") {
        passedCount += 1;
        continue;
      }

      finalStatus = execResult.status;
      if (execResult.status === "COMPILATION_ERROR") {
        compileOutput = execResult.compileOutput || execResult.stderr || "Compilation failed";
        break;
      }

      errorOutput = execResult.stderr || execResult.stdout || null;
      if (["TIME_LIMIT_EXCEEDED", "MEMORY_LIMIT_EXCEEDED", "RUNTIME_ERROR"].includes(execResult.status)) {
        break;
      }
    }
  } catch (err: any) {
    if (err instanceof PermanentJobError) {
      const failedRecord = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: "COMPILATION_ERROR",
          compileOutput: err.message,
          passedCount: 0,
          totalCount: testCases.length,
        },
      });

      await prisma.compilerJob.update({
        where: { submissionId },
        data: { status: "FAILED", lastError: err.message },
      });

      throw new TerminalCodeSubmissionError(err.message, err.code, {
        submissionId: failedRecord.id,
        userId: submission.userId,
        testAttemptId: submission.testAttemptId,
        status: failedRecord.status,
        passedCount: 0,
        totalCount: testCases.length,
        runtime: 0,
        memory: 0,
        compileOutput: err.message,
      });
    }

    // Retryable error (5xx / 429 / timeout): revert status to PENDING so retries stay clean
    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: "PENDING" },
    });
    await prisma.compilerJob.update({
      where: { submissionId },
      data: { status: "QUEUED", lastError: err.message },
    });
    throw err;
  }

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: finalStatus,
      runtime: maxRuntime,
      memory: maxMemory,
      compileOutput,
      errorOutput,
      passedCount,
      totalCount: testCases.length,
    },
  });

  await prisma.compilerJob.update({
    where: { submissionId },
    data: {
      status: finalStatus === "ACCEPTED" ? "DONE" : "FAILED",
      judge0Id: lastJudge0Token,
      lastError: compileOutput || errorOutput,
    },
  });

  // Idempotent totalSolved update: recompute distinct solved count instead of blind increment
  if (finalStatus === "ACCEPTED") {
    try {
      const distinctSolved = await prisma.submission.findMany({
        where: { userId: submission.userId, status: "ACCEPTED" },
        distinct: ["questionId"],
        select: { questionId: true },
      });
      await prisma.profile.updateMany({
        where: { userId: submission.userId },
        data: { totalSolved: distinctSolved.length },
      });
      await getCacheRedis()?.del(`cache:user-progress:${submission.userId}`).catch(() => {});
    } catch (err: any) {
      logger.warn("Failed to sync totalSolved after ACCEPTED submission", {
        userId: submission.userId,
        error: err.message,
      });
    }
  }

  const payload: CodeExecutionResult = {
    submissionId: updated.id,
    userId: submission.userId,
    testAttemptId: submission.testAttemptId,
    status: updated.status,
    passedCount: updated.passedCount,
    totalCount: updated.totalCount,
    runtime: updated.runtime,
    memory: updated.memory,
    compileOutput: updated.compileOutput,
    errorOutput: updated.errorOutput,
  };

  // Surface compilation error as non-retryable while preserving persisted DB & Socket payload
  if (finalStatus === "COMPILATION_ERROR") {
    throw new TerminalCodeSubmissionError(
      compileOutput || "Compilation error",
      "COMPILATION_ERROR",
      payload
    );
  }

  return payload;
};
