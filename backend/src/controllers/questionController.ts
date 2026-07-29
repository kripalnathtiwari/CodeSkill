import { Request, Response } from "express";
import prisma from "../config/db";
import logger from "../config/logger";
import { invalidateCachePattern } from "../middlewares/cacheMiddleware";

export class QuestionController {
  public static async getQuestions(req: Request, res: Response) {
    const { difficulty, type, tag, page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    try {
      const where: any = {};
      if (difficulty) where.difficulty = difficulty;
      if (type) where.type = type;

      // Handle in-memory tags filter or SQLite tags match
      const [questions, total] = await Promise.all([
        prisma.question.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            type: true,
            tags: true,
            companies: true,
            likes: true,
            dislikes: true,
            acceptanceRate: true,
            createdAt: true,
          },
        }),
        prisma.question.count({ where }),
      ]);

      // Parse JSON string fields back to objects for frontend consumption
      let formattedQuestions = questions.map((q) => ({
        ...q,
        tags: JSON.parse((q.tags as string) || "[]"),
        companies: JSON.parse((q.companies as string) || "[]"),
      }));

      // Apply tag filter post-query if tag query parameter is set
      if (tag) {
        formattedQuestions = formattedQuestions.filter((q) =>
          q.tags.includes(tag as string)
        );
      }

      return res.status(200).json({
        questions: formattedQuestions,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (err: any) {
      logger.error(`Get questions failed: ${err.message}`);
      return res.status(500).json({ error: "Failed to load questions list" });
    }
  }

  public static async getQuestionDetails(req: Request, res: Response) {
    const { slug } = req.params;

    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);
      
      const question = await prisma.question.findFirst({
        where: isUUID ? {
          OR: [
            { slug: slug },
            { id: slug }
          ]
        } : { slug: slug },
        include: {
          testCases: {
            where: { isHidden: false },
          },
          mcqOptions: true,
        },
      });

      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }

      // Deserialize SQLite JSON string fields
      const formattedQuestion = {
        ...question,
        examples: JSON.parse((question.examples as string) || "[]"),
        hints: JSON.parse((question.hints as string) || "[]"),
        tags: JSON.parse((question.tags as string) || "[]"),
        companies: JSON.parse((question.companies as string) || "[]"),
        starterCodes: JSON.parse((question.starterCodes as string) || "{}"),
        mcqOptions: question.mcqOptions.map((mcq) => ({
          ...mcq,
          options: JSON.parse((mcq.options as string) || "[]"),
          correctAnswers: JSON.parse((mcq.correctAnswers as string) || "[]"),
        })),
      };

      return res.status(200).json(formattedQuestion);
    } catch (err: any) {
      logger.error(`Get question details failed: ${err.message}`);
      return res.status(500).json({ error: "Failed to retrieve question details" });
    }
  }

  public static async createQuestion(req: Request, res: Response) {
    const {
      title,
      difficulty,
      type,
      description,
      constraints,
      examples,
      hints,
      editorial,
      starterCodes,
      timeLimit,
      memoryLimit,
      tags,
      companies,
      testCases,
      mcqOptions,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required fields" });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    try {
      const existing = await prisma.question.findUnique({ where: { slug } });
      if (existing) {
        return res.status(409).json({ error: "A problem with a similar title already exists" });
      }

      // Serialize arrays and objects to JSON strings for SQLite compatibility
      const question = await prisma.question.create({
        data: {
          title,
          slug,
          difficulty: difficulty || "EASY",
          type: type || "CODING",
          description,
          constraints,
          examples: JSON.stringify(examples || []),
          hints: JSON.stringify(hints || []),
          editorial,
          starterCodes: JSON.stringify(starterCodes || {}),
          timeLimit: timeLimit || 2000,
          memoryLimit: memoryLimit || 256,
          tags: JSON.stringify(tags || []),
          companies: JSON.stringify(companies || []),
          testCases: testCases
            ? {
                create: testCases.map((tc: any) => ({
                  input: tc.input,
                  output: tc.output,
                  isHidden: !!tc.isHidden,
                })),
              }
            : undefined,
          mcqOptions:
            mcqOptions && type === "MCQ"
              ? {
                  create: {
                    options: JSON.stringify(mcqOptions.options || []),
                    correctAnswers: JSON.stringify(mcqOptions.correctAnswers || []),
                  },
                }
              : undefined,
        },
      });

      logger.info(`Question created successfully: ${question.id}`);
      await invalidateCachePattern("*/api/questions*");
      return res.status(201).json(question);
    } catch (err: any) {
      logger.error(`Create question database entry failed: ${err.message}`);
      return res.status(500).json({ error: "Failed to record question entry" });
    }
  }

  public static async updateQuestion(req: Request, res: Response) {
    const { id } = req.params;
    const updateData = req.body;

    // Serialize any input arrays if they exist in the update body
    const formattedUpdate: any = { ...updateData };
    if (updateData.examples) formattedUpdate.examples = JSON.stringify(updateData.examples);
    if (updateData.hints) formattedUpdate.hints = JSON.stringify(updateData.hints);
    if (updateData.starterCodes) formattedUpdate.starterCodes = JSON.stringify(updateData.starterCodes);
    if (updateData.tags) formattedUpdate.tags = JSON.stringify(updateData.tags);
    if (updateData.companies) formattedUpdate.companies = JSON.stringify(updateData.companies);

    try {
      const question = await prisma.question.update({
        where: { id },
        data: {
          ...formattedUpdate,
          testCases: undefined,
        },
      });
      await invalidateCachePattern("*/api/questions*");
      return res.status(200).json(question);
    } catch (err: any) {
      logger.error(`Update question failed: ${err.message}`);
      return res.status(500).json({ error: "Failed to update question metadata" });
    }
  }

  public static async deleteQuestion(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.question.delete({ where: { id } });
      await invalidateCachePattern("*/api/questions*");
      return res.status(200).json({ message: "Question deleted successfully" });
    } catch (err: any) {
      logger.error(`Delete question failed: ${err.message}`);
      return res.status(500).json({ error: "Failed to delete question" });
    }
  }
}
export default QuestionController;
