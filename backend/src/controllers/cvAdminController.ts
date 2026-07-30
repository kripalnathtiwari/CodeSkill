import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../config/db';

// ==========================================
// Sample CV Templates
// ==========================================

export const uploadSampleCv = async (req: Request, res: Response) => {
  try {
    const { title, description, category, previewUrl } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Convert file to base64 Data URL so it is stored permanently in PostgreSQL database (Vercel serverless-proof)
    let fileUrl = `/uploads/cv_samples/${file.filename}`;
    try {
      const fileBuffer = fs.readFileSync(file.path);
      const base64Data = fileBuffer.toString('base64');
      fileUrl = `data:${file.mimetype || 'application/pdf'};base64,${base64Data}`;
    } catch (readErr) {
      console.warn('Could not convert file to base64, using local path:', readErr);
    }

    const sampleCv = await prisma.sampleCvTemplate.create({
      data: {
        title,
        description,
        category,
        fileUrl,
        previewUrl: previewUrl || null,
      },
    });

    res.status(201).json({ message: 'Sample CV uploaded successfully', data: sampleCv });
  } catch (error) {
    console.error('Error uploading sample CV:', error);
    res.status(500).json({ error: 'Failed to upload sample CV' });
  }
};

export const getSampleCvs = async (req: Request, res: Response) => {
  try {
    const templates = await prisma.sampleCvTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const validTemplates = templates.filter(t => {
      if (!t.fileUrl && !t.previewUrl) return false;
      if (t.fileUrl && (t.fileUrl.startsWith('data:') || t.fileUrl.startsWith('http'))) return true;
      if (t.previewUrl) return true;
      if (t.fileUrl) {
        const filePath = path.join(process.cwd(), 'public', t.fileUrl);
        const filePathDist = path.join(__dirname, '../../public', t.fileUrl);
        const exists = fs.existsSync(filePath) || fs.existsSync(filePathDist);
        if (!exists) {
          prisma.sampleCvTemplate.delete({ where: { id: t.id } }).catch(err => console.warn('Cleaned up broken template:', err));
          return false;
        }
      }
      return true;
    });
    res.status(200).json(validTemplates);
  } catch (error) {
    console.error('Error fetching sample CVs:', error);
    res.status(500).json({ error: 'Failed to fetch sample CVs' });
  }
};

export const deleteSampleCv = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const template = await prisma.sampleCvTemplate.findUnique({ where: { id } });
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Delete the file from the filesystem if it exists
    const filePath = path.join(__dirname, '../../public', template.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.sampleCvTemplate.delete({ where: { id } });

    res.status(200).json({ message: 'Sample CV deleted successfully' });
  } catch (error) {
    console.error('Error deleting sample CV:', error);
    res.status(500).json({ error: 'Failed to delete sample CV' });
  }
};

// ==========================================
// Job Skills Mapping
// ==========================================

export const addJobSkill = async (req: Request, res: Response) => {
  try {
    const { jobRole, skills } = req.body;

    if (!jobRole || !skills || !Array.isArray(skills)) {
      return res.status(400).json({ error: 'Job role and skills array are required' });
    }

    // Check if role already exists
    const existing = await prisma.jobSkillMap.findUnique({
      where: { jobRole }
    });

    let jobSkillMap;
    if (existing) {
      // Update existing mapping
      const currentSkills = Array.isArray(existing.skills) ? existing.skills : [];
      
      // Merge unique skills
      const updatedSkills = Array.from(new Set([...currentSkills, ...skills]));

      jobSkillMap = await prisma.jobSkillMap.update({
        where: { id: existing.id },
        data: { skills: updatedSkills },
      });
    } else {
      // Create new mapping
      jobSkillMap = await prisma.jobSkillMap.create({
        data: {
          jobRole,
          skills,
        },
      });
    }

    res.status(201).json({ message: 'Job skills saved successfully', data: jobSkillMap });
  } catch (error) {
    console.error('Error adding job skill:', error);
    res.status(500).json({ error: 'Failed to add job skill' });
  }
};

export const removeJobSkill = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { skill } = req.body;
      
      const existing = await prisma.jobSkillMap.findUnique({ where: { id } });
      if(!existing) return res.status(404).json({ error: 'Mapping not found' });

      const currentSkills = Array.isArray(existing.skills) ? existing.skills : [];
      const updatedSkills = currentSkills.filter((s: string) => s !== skill);

      const jobSkillMap = await prisma.jobSkillMap.update({
          where: { id },
          data: { skills: updatedSkills }
      });
      res.status(200).json({ message: 'Skill removed successfully', data: jobSkillMap });
    } catch (error) {
      console.error('Error removing job skill:', error);
      res.status(500).json({ error: 'Failed to remove job skill' });
    }
}

export const getJobSkills = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    
    if (role && typeof role === 'string') {
      const jobSkillMap = await prisma.jobSkillMap.findUnique({
        where: { jobRole: role }
      });
      return res.status(200).json(jobSkillMap ? jobSkillMap.skills : []);
    }

    const jobSkillMaps = await prisma.jobSkillMap.findMany({
      orderBy: { jobRole: 'asc' },
    });
    res.status(200).json(jobSkillMaps);
  } catch (error) {
    console.error('Error fetching job skills:', error);
    res.status(500).json({ error: 'Failed to fetch job skills' });
  }
};

export const deleteJobSkillMap = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.jobSkillMap.delete({ where: { id } });

    res.status(200).json({ message: 'Job skills mapping deleted successfully' });
  } catch (error) {
    console.error('Error deleting job skills mapping:', error);
    res.status(500).json({ error: 'Failed to delete job skills mapping' });
  }
};
