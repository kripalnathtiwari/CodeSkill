import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import prisma from '../config/db';
import logger from '../config/logger';

// ==========================================
// SUBJECT CONTROLLERS
// ==========================================

export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.otherPracticeSubject.findMany({
      orderBy: { name: 'asc' }
    });
    return res.status(200).json(subjects);
  } catch (err: any) {
    logger.error(`Error fetching other practice subjects: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

export const createSubject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, noteData } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Subject name is required' });
    }

    const trimmedName = name.trim();

    const subject = await prisma.otherPracticeSubject.upsert({
      where: { name: trimmedName },
      update: {
        ...(noteData !== undefined && { noteData })
      },
      create: {
        name: trimmedName,
        noteData: noteData || null
      }
    });

    return res.status(201).json(subject);
  } catch (err: any) {
    logger.error(`Error creating other practice subject: ${err.message}`);
    return res.status(500).json({ error: 'Failed to create subject' });
  }
};

export const deleteSubject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.params;
    if (!name) return res.status(400).json({ error: 'Subject identifier is required' });

    const decodedName = decodeURIComponent(name).trim();

    // Delete subject by name or id
    await prisma.otherPracticeSubject.deleteMany({
      where: {
        OR: [
          { name: { equals: decodedName, mode: 'insensitive' } },
          { id: decodedName.length === 36 ? decodedName : undefined }
        ]
      }
    });

    return res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (err: any) {
    logger.error(`Error deleting other practice subject: ${err.message}`);
    return res.status(500).json({ error: 'Failed to delete subject' });
  }
};

export const updateSubjectNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.params;
    const { noteData } = req.body;
    if (!name) return res.status(400).json({ error: 'Subject name is required' });

    const decodedName = decodeURIComponent(name).trim();

    const subject = await prisma.otherPracticeSubject.upsert({
      where: { name: decodedName },
      update: { noteData },
      create: {
        name: decodedName,
        noteData
      }
    });

    return res.status(200).json(subject);
  } catch (err: any) {
    logger.error(`Error updating subject note: ${err.message}`);
    return res.status(500).json({ error: 'Failed to update subject note' });
  }
};

// ==========================================
// TEST CONTROLLERS
// ==========================================

const comparePracticeTests = (
  a: { title: string; createdAt: Date },
  b: { title: string; createdAt: Date }
) => {
  const titleA = a.title.trim().replace(/\s+/g, ' ');
  const titleB = b.title.trim().replace(/\s+/g, ' ');
  const titleCmp = titleA.localeCompare(titleB, undefined, {
    numeric: true,
    sensitivity: 'base'
  });
  if (titleCmp !== 0) return titleCmp;
  return a.createdAt.getTime() - b.createdAt.getTime();
};

export const getAllTests = async (req: Request, res: Response) => {
  try {
    const { subject } = req.query;

    const where: any = {};
    if (subject && typeof subject === 'string') {
      where.subject = { equals: subject.trim(), mode: 'insensitive' };
    }

    const tests = await prisma.otherPracticeTest.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    });

    tests.sort(comparePracticeTests);

    // Format for frontend consumption (normalize test.id to testId if present)
    const formatted = tests.map(t => ({
      id: t.testId || t.id,
      dbId: t.id,
      title: t.title,
      subject: t.subject,
      duration: t.duration,
      questions: t.questions,
      createdBy: t.createdBy,
      creatorName: t.creatorName,
      createdAt: t.createdAt
    }));

    return res.status(200).json(formatted);
  } catch (err: any) {
    logger.error(`Error fetching other practice tests: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch tests' });
  }
};

export const getTestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Test ID is required' });

    const test = await prisma.otherPracticeTest.findFirst({
      where: {
        OR: [
          { testId: id },
          { id: id.length === 36 ? id : undefined }
        ]
      }
    });

    if (!test) {
      return res.status(404).json({ error: 'Practice test not found' });
    }

    return res.status(200).json({
      id: test.testId || test.id,
      dbId: test.id,
      title: test.title,
      subject: test.subject,
      duration: test.duration,
      questions: test.questions,
      createdBy: test.createdBy,
      creatorName: test.creatorName,
      createdAt: test.createdAt
    });
  } catch (err: any) {
    logger.error(`Error fetching practice test by id: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch test' });
  }
};

export const createTest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, title, subject, duration, questions } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ error: 'Title and subject are required' });
    }

    const testKey = id || `optest_${Date.now()}`;
    const userEmail = req.user?.email || req.body.createdBy || 'admin';
    const creatorName = req.user?.role === 'ADMIN' ? 'Admin' : req.body.creatorName || 'Instructor';

    // Auto-create subject if it doesn't exist
    await prisma.otherPracticeSubject.upsert({
      where: { name: subject.trim() },
      update: {},
      create: { name: subject.trim() }
    });

    const newTest = await prisma.otherPracticeTest.create({
      data: {
        testId: testKey,
        title: title.trim(),
        subject: subject.trim(),
        duration: duration || '30 Mins',
        questions: Array.isArray(questions) ? questions : [],
        createdBy: userEmail,
        creatorName: creatorName
      }
    });

    return res.status(201).json({
      id: newTest.testId || newTest.id,
      dbId: newTest.id,
      title: newTest.title,
      subject: newTest.subject,
      duration: newTest.duration,
      questions: newTest.questions,
      createdBy: newTest.createdBy,
      creatorName: newTest.creatorName,
      createdAt: newTest.createdAt
    });
  } catch (err: any) {
    logger.error(`Error creating practice test: ${err.message}`);
    return res.status(500).json({ error: 'Failed to create practice test', details: err.message });
  }
};

export const updateTest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, subject, duration, questions } = req.body;

    const existing = await prisma.otherPracticeTest.findFirst({
      where: {
        OR: [
          { testId: id },
          { id: id.length === 36 ? id : undefined }
        ]
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const updated = await prisma.otherPracticeTest.update({
      where: { id: existing.id },
      data: {
        ...(title && { title: title.trim() }),
        ...(subject && { subject: subject.trim() }),
        ...(duration && { duration }),
        ...(questions && { questions: Array.isArray(questions) ? questions : [] })
      }
    });

    return res.status(200).json({
      id: updated.testId || updated.id,
      dbId: updated.id,
      title: updated.title,
      subject: updated.subject,
      duration: updated.duration,
      questions: updated.questions,
      createdAt: updated.createdAt
    });
  } catch (err: any) {
    logger.error(`Error updating practice test: ${err.message}`);
    return res.status(500).json({ error: 'Failed to update test' });
  }
};

export const deleteTest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Test ID is required' });

    await prisma.otherPracticeTest.deleteMany({
      where: {
        OR: [
          { testId: id },
          { id: id.length === 36 ? id : undefined }
        ]
      }
    });

    return res.status(200).json({ message: 'Test deleted successfully' });
  } catch (err: any) {
    logger.error(`Error deleting practice test: ${err.message}`);
    return res.status(500).json({ error: 'Failed to delete test' });
  }
};
