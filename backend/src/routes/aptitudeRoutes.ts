import { Router } from 'express';
import { getAllAptitudeProblems, createAptitudeProblem, updateAptitudeProblem, deleteAptitudeProblem } from '../controllers/aptitudeController';
import { authenticateJWT, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Get all aptitude problems
router.get('/', getAllAptitudeProblems);

// Create a new aptitude problem
router.post('/', authenticateJWT, requireRole(['ADMIN', 'CONTENT_CREATOR']), createAptitudeProblem);

// Update an existing aptitude problem
router.put('/:id', authenticateJWT, requireRole(['ADMIN', 'CONTENT_CREATOR']), updateAptitudeProblem);

// Delete an aptitude problem by ID
router.delete('/:id', authenticateJWT, requireRole(['ADMIN', 'CONTENT_CREATOR']), deleteAptitudeProblem);

export default router;
