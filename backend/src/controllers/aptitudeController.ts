import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import prisma from '../config/db';
import { invalidateCachePattern } from '../middlewares/cacheMiddleware';

export const getAllAptitudeProblems = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = '20', cursor, topic, difficulty } = req.query;

    const parsedLimit = parseInt(limit as string, 10);
    const limitNum = Number.isNaN(parsedLimit) || parsedLimit <= 0 ? 20 : Math.min(parsedLimit, 50);

    const where: any = {};
    if (topic && topic !== "All") where.topic = topic;
    if (difficulty && difficulty !== "All") where.difficulty = difficulty;

    const problems = await prisma.aptitudeProblem.findMany({
      where,
      take: limitNum + 1,
      ...(cursor ? {
        skip: 1,
        cursor: { id: cursor as string }
      } : {}),
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        topic: true,
        difficulty: true,
        createdAt: true,
      }
    });

    let hasMore = false;
    if (problems.length > limitNum) {
      hasMore = true;
      problems.pop();
    }

    const nextCursor = problems.length > 0 ? problems[problems.length - 1].id : null;

    res.status(200).json({
      data: problems,
      pagination: {
        hasMore,
        nextCursor
      }
    });
  } catch (error) {
    console.error('Error fetching aptitude problems:', error);
    res.status(500).json({ error: 'Failed to fetch aptitude problems' });
  }
};

export const getAptitudeAggregates = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const topicGroups = await prisma.aptitudeProblem.groupBy({
      by: ['topic'],
      _count: {
        id: true,
      },
      orderBy: {
        topic: 'asc'
      }
    });

    const topicCounts: Record<string, number> = {};
    topicGroups.forEach(group => {
      topicCounts[group.topic || "Uncategorized"] = group._count.id;
    });

    res.status(200).json({ topicCounts });
  } catch (error) {
    console.error('Error fetching aptitude aggregates:', error);
    res.status(500).json({ error: 'Failed to fetch aptitude aggregates' });
  }
};

export const getAptitudeProblemById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const problem = await prisma.aptitudeProblem.findUnique({
      where: { id }
    });

    if (!problem) {
      return res.status(404).json({ error: "Aptitude problem not found" });
    }

    res.status(200).json(problem);
  } catch (error) {
    console.error('Error fetching aptitude problem:', error);
    res.status(500).json({ error: 'Failed to fetch aptitude problem' });
  }
};

export const createAptitudeProblem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, topic, difficulty, options, correctAnswer, explanation } = req.body;
    
    if (!title || !description || !correctAnswer) {
      res.status(400).json({ error: 'Title, description, and correct answer are required' });
      return;
    }

    const newProblem = await prisma.aptitudeProblem.create({
      data: {
        title,
        description,
        topic,
        difficulty,
        options: typeof options === 'string' ? options : JSON.stringify(options || []),
        correctAnswer,
        explanation
      }
    });

    await invalidateCachePattern("/api/v1/aptitude-problems");
    res.status(201).json(newProblem);
  } catch (error) {
    console.error('Error creating aptitude problem:', error);
    res.status(500).json({ error: 'Failed to create aptitude problem' });
  }
};

export const updateAptitudeProblem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, topic, difficulty, options, correctAnswer, explanation } = req.body;

    const updatedProblem = await prisma.aptitudeProblem.update({
      where: { id },
      data: {
        title,
        description,
        topic,
        difficulty,
        options: typeof options === 'string' ? options : JSON.stringify(options || []),
        correctAnswer,
        explanation
      }
    });

    await invalidateCachePattern("/api/v1/aptitude-problems");
    res.status(200).json(updatedProblem);
  } catch (error) {
    console.error('Error updating aptitude problem:', error);
    res.status(500).json({ error: 'Failed to update aptitude problem' });
  }
};

export const deleteAptitudeProblem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Fetch the problem to archive it
    const problemToArchive = await prisma.aptitudeProblem.findUnique({
      where: { id }
    });

    if (problemToArchive) {
      await prisma.archiveRecord.create({
        data: {
          entityType: 'APTITUDE_PROBLEM',
          originalId: problemToArchive.id,
          data: JSON.stringify(problemToArchive),
          deletedBy: userId
        }
      });
    }

    await prisma.aptitudeProblem.delete({
      where: { id }
    });
    
    await invalidateCachePattern("/api/v1/aptitude-problems");
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting aptitude problem:', error);
    res.status(500).json({ error: 'Failed to delete aptitude problem' });
  }
};
