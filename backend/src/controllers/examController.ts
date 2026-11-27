import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { CorrelatedRequest } from "../middlewares/requestIdMiddleware";
import prisma from "../config/db";
import logger from "../lib/logger";
import {
  cancelAutoSubmitExam,
  enqueueAutoSubmitExam,
  enqueueGradeExam,
} from "../queues/examQueue";

export class ExamController {
  /**
   * POST /api/v1/tests/:testId/start
   * Starts a timed exam attempt in PostgreSQL and schedules a delayed BullMQ auto-submit job.
   */
  public static async startAttempt(
    req: AuthenticatedRequest & CorrelatedRequest,
    res: Response
  ) {
    const { testId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const test = await prisma.test.findUnique({
        where: { id: testId },
        select: { id: true, duration: true, isPublished: true },
      });

      if (!test || !test.isPublished) {
        return res.status(404).json({ error: "Exam not found or not published" });
      }

      const attempt = await prisma.testAttempt.create({
        data: {
          userId,
          testId: test.id,
          status: "STARTED",
          startTime: new Date(),
        },
      });

      const delayMs = Math.max(1, test.duration) * 60 * 1000;
      await enqueueAutoSubmitExam(
        {
          attemptId: attempt.id,
          userId,
          testId: test.id,
          requestId: req.requestId,
        },
        delayMs
      );

      return res.status(201).json({
        attemptId: attempt.id,
        status: attempt.status,
        startTime: attempt.startTime,
        durationMinutes: test.duration,
      });
    } catch (err: any) {
      logger.error("Failed to start exam attempt", { error: err.message, testId, userId });
      return res.status(500).json({ error: "Failed to start exam attempt" });
    }
  }

  /**
   * POST /api/v1/tests/attempts/:attemptId/submit
   * Handles early manual exam submit: persists state, cancels delayed auto-submit, enqueues grading.
   */
  public static async submitAttempt(
    req: AuthenticatedRequest & CorrelatedRequest,
    res: Response
  ) {
    const { attemptId } = req.params;
    const { mcqAnswers } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const { count } = await prisma.testAttempt.updateMany({
        where: { id: attemptId, userId, status: "STARTED" },
        data: {
          status: "SUBMITTED",
          endTime: new Date(),
          ...(mcqAnswers ? { mcqAnswers } : {}),
        },
      });

      const attempt = await prisma.testAttempt.findUnique({
        where: { id: attemptId },
        select: { id: true, userId: true, testId: true, status: true },
      });

      if (!attempt || attempt.userId !== userId) {
        return res.status(404).json({ error: "Exam attempt not found" });
      }

      if (count === 0) {
        return res.status(200).json({
          message: "Attempt already submitted",
          attemptId: attempt.id,
          status: attempt.status,
        });
      }

      await cancelAutoSubmitExam(attempt.id);

      await enqueueGradeExam({
        attemptId: attempt.id,
        userId,
        testId: attempt.testId,
        requestId: req.requestId,
      });

      return res.status(202).json({
        message: "Exam submitted and queued for grading",
        attemptId: attempt.id,
        status: attempt.status,
      });
    } catch (err: any) {
      logger.error("Failed to submit exam attempt", { error: err.message, attemptId, userId });
      return res.status(500).json({ error: "Failed to submit exam attempt" });
    }
  }

  /**
   * GET /api/v1/tests/attempts/:attemptId
   * Reads attempt status and scores directly from PostgreSQL (never depends on Redis).
   */
  public static async getAttemptResult(req: AuthenticatedRequest, res: Response) {
    const { attemptId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const attempt = await prisma.testAttempt.findUnique({
        where: { id: attemptId },
      });

      if (!attempt) {
        return res.status(404).json({ error: "Attempt not found" });
      }

      if (attempt.userId !== userId && req.user?.role === "STUDENT") {
        return res.status(403).json({ error: "Access denied" });
      }

      return res.status(200).json(attempt);
    } catch (err: any) {
      logger.error("Failed to fetch attempt result", { error: err.message, attemptId });
      return res.status(500).json({ error: "Failed to fetch attempt result" });
    }
  }
}

export default ExamController;
