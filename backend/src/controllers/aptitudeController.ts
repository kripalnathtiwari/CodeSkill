import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import prisma from '../config/db';

export const getAllAptitudeProblems = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const problems = await prisma.aptitudeProblem.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(problems);
  } catch (error) {
    console.error('Error fetching aptitude problems:', error);
    res.status(500).json({ error: 'Failed to fetch aptitude problems' });
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
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting aptitude problem:', error);
    res.status(500).json({ error: 'Failed to delete aptitude problem' });
  }
};
