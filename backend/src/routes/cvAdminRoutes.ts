import { Router } from 'express';
import {
  uploadSampleCv,
  getSampleCvs,
  deleteSampleCv,
  addJobSkill,
  getJobSkills,
  deleteJobSkillMap,
  removeJobSkill
} from '../controllers/cvAdminController';
import multer from 'multer';
import { authenticateJWT, requireRole } from '../middlewares/authMiddleware';
import { cache } from '../middlewares/cacheMiddleware';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/cv_samples');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `sample-cv-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Middleware to ensure user is admin
const requireAdmin = [authenticateJWT, requireRole(['ADMIN', 'SUPERADMIN'])];

// ==========================
// CV Samples
// ==========================
router.post('/samples', requireAdmin, upload.single('file'), uploadSampleCv);
router.get('/samples', cache(300), getSampleCvs); // Public so users can view them
router.delete('/samples/:id', requireAdmin, deleteSampleCv);

// ==========================
// Job Skills
// ==========================
router.post('/skills', requireAdmin, addJobSkill);
router.put('/skills/remove/:id', requireAdmin, removeJobSkill);
router.get('/skills', cache(300), getJobSkills); // Public so CV builder can fetch them
router.delete('/skills/:id', requireAdmin, deleteJobSkillMap);

export default router;
