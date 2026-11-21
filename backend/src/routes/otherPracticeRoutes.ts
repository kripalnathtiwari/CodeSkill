import { Router } from 'express';
import {
  getAllSubjects,
  createSubject,
  deleteSubject,
  updateSubjectNote,
  getAllTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest
} from '../controllers/otherPracticeController';
import { authenticateJWT, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Subject routes (public read, authenticated write)
router.get('/subjects', getAllSubjects);
router.post('/subjects', authenticateJWT, requireRole(['ADMIN', 'INSTRUCTOR']), createSubject as any);
router.delete('/subjects/:name', authenticateJWT, requireRole(['ADMIN']), deleteSubject as any);
router.post('/subjects/:name/note', authenticateJWT, requireRole(['ADMIN', 'INSTRUCTOR']), updateSubjectNote as any);

// Test routes (public read, authenticated write)
router.get('/tests', getAllTests);
router.get('/tests/:id', getTestById);
router.post('/tests', authenticateJWT, requireRole(['ADMIN', 'INSTRUCTOR']), createTest as any);
router.put('/tests/:id', authenticateJWT, requireRole(['ADMIN', 'INSTRUCTOR']), updateTest as any);
router.delete('/tests/:id', authenticateJWT, requireRole(['ADMIN', 'INSTRUCTOR']), deleteTest as any);

export default router;
