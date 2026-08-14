import { Router } from 'express';
import { getAllAptitudeProblems, getAptitudeAggregates, getAptitudeProblemById, createAptitudeProblem, updateAptitudeProblem, deleteAptitudeProblem } from '../controllers/aptitudeController';
import { authenticateJWT, requireRole } from '../middlewares/authMiddleware';
import { cache } from '../middlewares/cacheMiddleware';

const router = Router();

// Get aptitude aggregates
router.get('/metadata/aggregates', cache(300), getAptitudeAggregates);

// Get all aptitude problems (cached for 5 minutes)
router.get('/', cache(300), getAllAptitudeProblems);

// Get aptitude problem by ID
router.get('/:id', cache(300), getAptitudeProblemById);

// Create a new aptitude problem
router.post('/', authenticateJWT, requireRole(['ADMIN', 'CONTENT_CREATOR']), createAptitudeProblem);

// Update an existing aptitude problem
router.put('/:id', authenticateJWT, requireRole(['ADMIN', 'CONTENT_CREATOR']), updateAptitudeProblem);

// Delete an aptitude problem by ID
router.delete('/:id', authenticateJWT, requireRole(['ADMIN', 'CONTENT_CREATOR']), deleteAptitudeProblem);

export default router;
