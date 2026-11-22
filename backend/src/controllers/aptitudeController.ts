import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import prisma from '../config/db';
import redisConnection from '../config/redis';
import { invalidateCachePattern } from '../middlewares/cacheMiddleware';

export const invalidateAptitudeCaches = async () => {
  try {
    await invalidateCachePattern("/api/v1/aptitude-problems");
    if (redisConnection) {
      const keys = await redisConnection.keys("aptitude:*").catch(() => []);
      if (keys && keys.length > 0) {
        await redisConnection.del(...keys);
      }
    }
  } catch (err) {
    console.error("Error invalidating aptitude caches:", err);
  }
};

export const getAllAptitudeProblems = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = '20', cursor, topic, difficulty } = req.query;

    const parsedLimit = parseInt(limit as string, 10);
    const limitNum = Number.isNaN(parsedLimit) || parsedLimit <= 0 ? 20 : Math.min(parsedLimit, 500);

    const decodedTopic = topic && topic !== "All" ? decodeURIComponent(topic as string).trim() : null;
    const cacheKey = `aptitude:problems:${decodedTopic || 'all'}:${difficulty || 'all'}:${limitNum}:${cursor || 'start'}`;

    if (redisConnection) {
      try {
        const cached = await redisConnection.get(cacheKey);
        if (cached) {
          res.setHeader("X-Cache", "HIT-REDIS");
          return res.status(200).json(JSON.parse(cached));
        }
      } catch (e) {}
    }

    const where: any = {};
    if (decodedTopic) {
      where.topic = {
        equals: decodedTopic,
        mode: 'insensitive'
      };
    }
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
        description: true,
        topic: true,
        difficulty: true,
        options: true,
        correctAnswer: true,
        explanation: true,
        createdAt: true,
      }
    });

    let hasMore = false;
    if (problems.length > limitNum) {
      hasMore = true;
      problems.pop();
    }

    const nextCursor = problems.length > 0 ? problems[problems.length - 1].id : null;

    const result = {
      data: problems,
      pagination: {
        hasMore,
        nextCursor
      }
    };

    if (redisConnection) {
      redisConnection.setex(cacheKey, 1800, JSON.stringify(result)).catch(() => {});
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching aptitude problems:', error);
    res.status(500).json({ error: 'Failed to fetch aptitude problems' });
  }
};

export const getAptitudeAggregates = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cacheKey = "aptitude:metadata:aggregates";
    if (redisConnection) {
      try {
        const cached = await redisConnection.get(cacheKey);
        if (cached) {
          res.setHeader("X-Cache", "HIT-REDIS");
          return res.status(200).json(JSON.parse(cached));
        }
      } catch (e) {}
    }

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
    let totalQuestions = 0;
    topicGroups.forEach(group => {
      const trimmedTopic = (group.topic || "Uncategorized").trim();
      const count = group._count.id;
      topicCounts[trimmedTopic] = (topicCounts[trimmedTopic] || 0) + count;
      totalQuestions += count;
    });

    const result = {
      topicCounts,
      totalQuestions,
      topics: Object.keys(topicCounts).sort()
    };

    if (redisConnection) {
      redisConnection.setex(cacheKey, 3600, JSON.stringify(result)).catch(() => {});
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching aptitude aggregates:', error);
    res.status(500).json({ error: 'Failed to fetch aptitude aggregates' });
  }
};

export const getAptitudeProblemById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `aptitude:problem:${id}`;

    if (redisConnection) {
      try {
        const cached = await redisConnection.get(cacheKey);
        if (cached) {
          res.setHeader("X-Cache", "HIT-REDIS");
          return res.status(200).json(JSON.parse(cached));
        }
      } catch (e) {}
    }

    const problem = await prisma.aptitudeProblem.findUnique({
      where: { id }
    });

    if (!problem) {
      return res.status(404).json({ error: "Aptitude problem not found" });
    }

    if (redisConnection) {
      redisConnection.setex(cacheKey, 3600, JSON.stringify(problem)).catch(() => {});
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
        title: title.trim(),
        description: description.trim(),
        topic: (topic || "General Aptitude").trim(),
        difficulty: (difficulty || "Medium").trim(),
        options: typeof options === 'string' ? options : JSON.stringify(options || []),
        correctAnswer,
        explanation
      }
    });

    await invalidateAptitudeCaches();
    res.status(201).json(newProblem);
  } catch (error) {
    console.error('Error creating aptitude problem:', error);
    res.status(500).json({ error: 'Failed to create aptitude problem' });
  }
};

export const createBulkAptitudeProblems = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { problems } = req.body;
    if (!Array.isArray(problems) || problems.length === 0) {
      res.status(400).json({ error: 'Problems array is required' });
      return;
    }

    const created = await prisma.aptitudeProblem.createMany({
      data: problems.map((p: any) => ({
        title: (p.title || "Untitled Question").trim(),
        description: (p.description || p.title || "No description").trim(),
        topic: (p.topic || "General Aptitude").trim(),
        difficulty: (p.difficulty || "Medium").trim(),
        options: typeof p.options === 'string' ? p.options : JSON.stringify(p.options || []),
        correctAnswer: p.correctAnswer || p.correctOption || "A",
        explanation: p.explanation || null
      }))
    });

    await invalidateAptitudeCaches();
    res.status(201).json({ count: created.count, message: `Successfully created ${created.count} questions` });
  } catch (error) {
    console.error('Error creating bulk aptitude problems:', error);
    res.status(500).json({ error: 'Failed to create bulk aptitude problems' });
  }
};

export const updateAptitudeProblem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, topic, difficulty, options, correctAnswer, explanation } = req.body;

    const updatedProblem = await prisma.aptitudeProblem.update({
      where: { id },
      data: {
        title: title ? title.trim() : undefined,
        description: description ? description.trim() : undefined,
        topic: topic ? topic.trim() : undefined,
        difficulty: difficulty ? difficulty.trim() : undefined,
        options: typeof options === 'string' ? options : JSON.stringify(options || []),
        correctAnswer,
        explanation
      }
    });

    await invalidateAptitudeCaches();
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
    
    await invalidateAptitudeCaches();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting aptitude problem:', error);
    res.status(500).json({ error: 'Failed to delete aptitude problem' });
  }
};

export const renameAptitudeTopic = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { oldTopic, newTopic } = req.body;
    if (!oldTopic || !newTopic) {
      res.status(400).json({ error: 'Both oldTopic and newTopic are required' });
      return;
    }

    const fromTopic = String(oldTopic).trim();
    const toTopic = String(newTopic).trim();

    if (!fromTopic || !toTopic) {
      res.status(400).json({ error: 'Topic names cannot be empty' });
      return;
    }

    const result = await prisma.aptitudeProblem.updateMany({
      where: {
        topic: {
          equals: fromTopic,
          mode: 'insensitive'
        }
      },
      data: {
        topic: toTopic
      }
    });

    await invalidateAptitudeCaches();

    res.status(200).json({
      message: `Topic renamed from "${fromTopic}" to "${toTopic}"`,
      count: result.count
    });
  } catch (error) {
    console.error('Error renaming aptitude topic:', error);
    res.status(500).json({ error: 'Failed to rename aptitude topic' });
  }
};

export const deleteAptitudeTopic = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { topicName } = req.params;
    if (!topicName) {
      res.status(400).json({ error: 'Topic name is required' });
      return;
    }

    const cleanTopic = decodeURIComponent(topicName).trim();
    const userId = req.user?.id;

    // Fetch problems to archive them
    const problemsToArchive = await prisma.aptitudeProblem.findMany({
      where: {
        topic: {
          equals: cleanTopic,
          mode: 'insensitive'
        }
      }
    });

    if (problemsToArchive.length > 0) {
      await prisma.archiveRecord.createMany({
        data: problemsToArchive.map(p => ({
          entityType: 'APTITUDE_PROBLEM',
          originalId: p.id,
          data: JSON.stringify(p),
          deletedBy: userId || null
        }))
      });
    }

    const deleted = await prisma.aptitudeProblem.deleteMany({
      where: {
        topic: {
          equals: cleanTopic,
          mode: 'insensitive'
        }
      }
    });

    await invalidateAptitudeCaches();

    res.status(200).json({
      message: `Successfully deleted topic "${cleanTopic}" and its ${deleted.count} questions`,
      count: deleted.count
    });
  } catch (error) {
    console.error('Error deleting aptitude topic:', error);
    res.status(500).json({ error: 'Failed to delete aptitude topic' });
  }
};
