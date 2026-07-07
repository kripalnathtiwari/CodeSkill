import prisma from "../config/db";
import CompilerService from "../services/compilerService";
import logger from "../config/logger";
import { notifySubmissionUpdate } from "../sockets/socketServer";

/**
 * Core execution routine processes compilation sandboxes and updates SQLite databases.
 */
export const processSubmissionInMemory = async (submissionId: string) => {
  logger.info(`Starting evaluation processing: ${submissionId}`);

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      question: {
        include: {
          testCases: true,
        },
      },
    },
  });

  if (!submission) {
    logger.error(`Submission ID ${submissionId} not found in database.`);
    return;
  }

  // Update DB status to processing
  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: "PENDING",
    },
  });

  const testCases = submission.question.testCases;
  let passedCount = 0;
  let maxRuntime = 0;
  let maxMemory = 0;
  let finalStatus = "ACCEPTED";
  let compileError: string | null = null;
  let runError: string | null = null;

  if (testCases.length === 0) {
    finalStatus = "ACCEPTED";
  } else {
    for (const tc of testCases) {
      // Execute compiler run
      const result = await CompilerService.executeCode(
        submission.code,
        submission.language,
        tc.input,
        tc.output,
        submission.question.timeLimit
      );

      if (result.runtime && result.runtime > maxRuntime) {
        maxRuntime = result.runtime;
      }
      if (result.memory && result.memory > maxMemory) {
        maxMemory = result.memory;
      }

      if (result.status === "ACCEPTED") {
        passedCount++;
      } else {
        finalStatus = result.status;
        if (result.error) {
          if (result.status === "COMPILATION_ERROR") {
            compileError = result.error;
          } else {
            runError = result.error;
          }
        }
        // Break early on failure
        if (["COMPILATION_ERROR", "RUNTIME_ERROR", "TIME_LIMIT_EXCEEDED", "MEMORY_LIMIT_EXCEEDED"].includes(result.status)) {
          break;
        }
      }
    }
  }

  // Update submission database record
  const updatedSubmission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: finalStatus,
      runtime: maxRuntime,
      memory: maxMemory,
      compileOutput: compileError,
      errorOutput: runError,
      passedCount,
      totalCount: testCases.length,
    },
  });

  logger.info(`Submission ${submissionId} evaluation done. Status: ${finalStatus}, Passed: ${passedCount}/${testCases.length}`);

  // Increment total solved count in profile
  if (finalStatus === "ACCEPTED") {
    try {
      await prisma.profile.update({
        where: { userId: submission.userId },
        data: {
          totalSolved: { increment: 1 },
        },
      });
    } catch (err: any) {
      logger.error(`Failed to update profile count: ${err.message}`);
    }
  }

  // Socket notification
  notifySubmissionUpdate(submission.userId, {
    submissionId: updatedSubmission.id,
    status: updatedSubmission.status,
    passedCount: updatedSubmission.passedCount,
    totalCount: updatedSubmission.totalCount,
    runtime: updatedSubmission.runtime,
    memory: updatedSubmission.memory,
  });
};

logger.info("Local In-Memory submission task worker ready.");
