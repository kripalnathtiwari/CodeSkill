import { Request, Response } from 'express';
import prisma from '../config/db';
import { getOrSetCache, invalidateCachePattern } from '../middlewares/cacheMiddleware';

export const getAllProjectIdeas = async (req: Request, res: Response) => {
  try {
    res.setHeader('Cache-Control', 'private, max-age=120');
    const { value: projects, source } = await getOrSetCache(
      'cache:/api/v1/projects',
      600,
      async () =>
        prisma.projectIdea.findMany({
          orderBy: { createdAt: 'desc' },
        })
    );
    res.setHeader('X-Cache', source);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching project ideas:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProjectIdeaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await prisma.projectIdea.findUnique({
      where: { id }
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project idea not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project idea:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createProjectIdea = async (req: Request, res: Response) => {
  try {
    const { title, description, domain, difficulty, techStack, imageUrl } = req.body;
    
    const project = await prisma.projectIdea.create({
      data: {
        title,
        description,
        domain,
        difficulty,
        imageUrl: imageUrl || null,
        techStack: techStack || []
      }
    });
    
    await invalidateCachePattern('/api/v1/projects');
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project idea:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProjectIdea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, domain, difficulty, techStack, imageUrl } = req.body;
    
    const project = await prisma.projectIdea.update({
      where: { id },
      data: {
        title,
        description,
        domain,
        difficulty,
        imageUrl: imageUrl || null,
        techStack
      }
    });
    
    await invalidateCachePattern('/api/v1/projects');
    res.json(project);
  } catch (error) {
    console.error('Error updating project idea:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProjectIdea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.projectIdea.delete({
      where: { id }
    });
    await invalidateCachePattern('/api/v1/projects');
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project idea:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
