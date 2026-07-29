import { Request, Response } from 'express';
import prisma from '../config/db';
import { atsQueue } from '../jobs/atsQueue';
import { PdfParserService } from '../services/ats/PdfParserService';

export const uploadResume = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id; // Assuming authMiddleware attaches id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let extractedText = '';
    const fileExt = req.file.originalname.split('.').pop()?.toLowerCase();

    if (fileExt === 'pdf') {
      const parsed = await PdfParserService.parsePdf(req.file.buffer);
      extractedText = parsed.text;
    } else if (fileExt === 'docx' || fileExt === 'doc') {
      const parsed = await PdfParserService.parseDocx(req.file.buffer);
      extractedText = parsed.text;
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    const resume = await prisma.resume.create({
      data: {
        userId,
        fileName: req.file.originalname,
        extractedText,
        // If we implement supabase storage upload, we put fileUrl here
      }
    });

    res.status(201).json({ message: 'Resume uploaded successfully', resumeId: resume.id });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: 'Failed to upload resume', details: error instanceof Error ? error.message : String(error) });
  }
};

export const uploadJobDescription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { content, title } = req.body;
    if (!content) return res.status(400).json({ error: 'Job description content is required' });

    const jd = await prisma.jobDescription.create({
      data: {
        userId,
        content,
        title
      }
    });

    res.status(201).json({ message: 'Job Description saved', jobDescriptionId: jd.id });
  } catch (error) {
    console.error('JD upload error:', error);
    res.status(500).json({ error: 'Failed to save job description', details: error instanceof Error ? error.message : String(error) });
  }
};

export const triggerAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { resumeId, jobDescriptionId } = req.body;
    if (!resumeId || !jobDescriptionId) return res.status(400).json({ error: 'Missing resumeId or jobDescriptionId' });

    // Ensure they exist and belong to user
    const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId } });
    const jd = await prisma.jobDescription.findFirst({ where: { id: jobDescriptionId, userId } });

    if (!resume || !jd) {
      return res.status(404).json({ error: 'Resume or Job Description not found' });
    }

    const analysis = await prisma.atsAnalysis.create({
      data: {
        userId,
        resumeId,
        jobDescriptionId,
        status: 'PENDING'
      }
    });

    // Add to BullMQ
    await atsQueue.add('analyze-resume', {
      analysisId: analysis.id,
      resumeId,
      jobDescriptionId
    });

    res.status(202).json({ message: 'Analysis started', analysisId: analysis.id });
  } catch (error) {
    console.error('Trigger analysis error:', error);
    res.status(500).json({ error: 'Failed to trigger analysis', details: error instanceof Error ? error.message : String(error) });
  }
};

export const getAnalysis = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const analysis = await prisma.atsAnalysis.findFirst({
      where: { id, userId },
      include: {
        resume: { select: { fileName: true } },
        jobDescription: { select: { title: true } }
      }
    });

    if (!analysis) return res.status(404).json({ error: 'Analysis not found' });

    res.status(200).json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const history = await prisma.atsAnalysis.findMany({
      where: { userId },
      include: {
        resume: { select: { fileName: true } },
        jobDescription: { select: { title: true, content: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
