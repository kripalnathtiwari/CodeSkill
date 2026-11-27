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

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Middleware to ensure user is admin
const requireAdmin = [authenticateJWT, requireRole(['ADMIN', 'SUPERADMIN'])];

// ==========================
// CV Samples
// ==========================
const PUBLIC_CATALOG_CACHE = cache(600, {
  scope: 'public',
  maxAge: 60,
  staleWhileRevalidate: 600,
});

router.post('/samples', requireAdmin, upload.single('file'), uploadSampleCv);
router.get('/samples', PUBLIC_CATALOG_CACHE, getSampleCvs); // Public so users can view them
router.delete('/samples/:id', requireAdmin, deleteSampleCv);

// ==========================
// Job Skills
// ==========================
router.post('/skills', requireAdmin, addJobSkill);
router.put('/skills/remove/:id', requireAdmin, removeJobSkill);
router.get('/skills', PUBLIC_CATALOG_CACHE, getJobSkills); // Public so CV builder can fetch them
router.delete('/skills/:id', requireAdmin, deleteJobSkillMap);

export default router;
