import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import prisma from "../config/db";
import CompilerService from "../services/compilerService";
import { addSubmissionJob } from "../jobs/submissionQueue";
import logger from "../config/logger";

export class SubmissionController {
  /**
   * Run code with custom inputs (Dry-run, synchronous)
   */
  public static async runCode(req: AuthenticatedRequest, res: Response) {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: "Code and language parameters are required" });
    }

    try {
      logger.info(`Dry-run code requested by user: ${req.user?.id || "anonymous"}`);
      const execution = await CompilerService.executeCode(code, language, input || "");

      return res.status(200).json(execution);
    } catch (err: any) {
      logger.error(`Dry-run execution request failed: ${err.message}`);
      return res.status(500).json({ error: "Dry-run execution compiler exception" });
    }
  }

  /**
   * Submit code solution (Production-grade asynchronous evaluation queue)
   */
  public static async submitCode(req: AuthenticatedRequest, res: Response) {
    const { code, language, questionId, testAttemptId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    if (!code || !language || !questionId) {
      return res.status(400).json({ error: "Code, language, and questionId are required parameters" });
    }

    try {
      // Validate that the question exists
      const question = await prisma.question.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        return res.status(404).json({ error: "Target question not found" });
      }

      // Create initial pending submission record
      const submission = await prisma.submission.create({
        data: {
          userId,
          questionId,
          code,
          language,
          status: "PENDING",
          testAttemptId,
        },
      });

      // Dispatch to BullMQ for compilation worker
      await addSubmissionJob(submission.id);

      logger.info(`Submission logged. Dispatched job for submission ID: ${submission.id}`);
      return res.status(202).json({
        message: "Submission received and queued for evaluation",
        submissionId: submission.id,
        status: submission.status,
      });
    } catch (err: any) {
      logger.error(`Submit solution failed: ${err.message}`);
      return res.status(500).json({ error: "Submission queue dispatch exception" });
    }
  }

  /**
   * Fetch details of a single submission
   */
  public static async getSubmission(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;

    try {
      const submission = await prisma.submission.findUnique({
        where: { id },
        include: {
          question: {
            select: { title: true, slug: true },
          },
        },
      });

      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }

      // Check access permission (User can only view their own submissions unless they are admin/instructor)
      if (submission.userId !== req.user?.id && req.user?.role === "STUDENT") {
        return res.status(403).json({ error: "Access denied to this resource" });
      }

      return res.status(200).json(submission);
    } catch (err: any) {
      logger.error(`Get submission failed: ${err.message}`);
      return res.status(500).json({ error: "Failed to retrieve submission details" });
    }
  }

  /**
   * Fetch submission history for user
   */
  public static async getHistory(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    const { questionId } = req.query;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
      const submissions = await prisma.submission.findMany({
        where: {
          userId,
          questionId: questionId ? (questionId as string) : undefined,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      return res.status(200).json(submissions);
    } catch (err: any) {
      logger.error(`Get user submission history failed: ${err.message}`);
      return res.status(500).json({ error: "Failed to load submission history list" });
    }
  }
  /**
   * Fetch submission heatmap for user
   */
  public static async getHeatmap(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
      const fiveMonthsAgo = new Date();
      fiveMonthsAgo.setDate(fiveMonthsAgo.getDate() - 154);

      const submissions = await prisma.submission.findMany({
        where: {
          userId,
          createdAt: {
            gte: fiveMonthsAgo,
          },
        },
        select: {
          createdAt: true,
        },
      });

      const heatmap: Record<string, number> = {};
      submissions.forEach((sub) => {
        const dateString = sub.createdAt.toISOString().split("T")[0];
        heatmap[dateString] = (heatmap[dateString] || 0) + 1;
      });

      return res.status(200).json(heatmap);
    } catch (err: any) {
      logger.error(`Get user submission heatmap failed: ${err.message}`);
      return res.status(500).json({ error: "Failed to load submission heatmap data" });
    }
  }
}
export default SubmissionController;
