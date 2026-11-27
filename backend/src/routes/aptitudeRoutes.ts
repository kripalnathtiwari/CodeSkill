import { Router } from 'express';
import { 
  getAllAptitudeProblems, 
  getAptitudeAggregates, 
  getAptitudeProblemById, 
  createAptitudeProblem, 
  createBulkAptitudeProblems, 
  updateAptitudeProblem, 
  deleteAptitudeProblem,
  renameAptitudeTopic,
  deleteAptitudeTopic
} from '../controllers/aptitudeController';
import { authenticateJWT, requireRole } from '../middlewares/authMiddleware';
import { cache } from '../middlewares/cacheMiddleware';

const router = Router();

const PUBLIC_CATALOG_CACHE = cache(600, {
  scope: 'public',
  maxAge: 60,
  staleWhileRevalidate: 600,
});

// Get aptitude aggregates
router.get('/metadata/aggregates', PUBLIC_CATALOG_CACHE, getAptitudeAggregates);

// Bulk create aptitude problems
router.post('/bulk', authenticateJWT, requireRole(['ADMIN', 'CONTENT_CREATOR']), createBulkAptitudeProblems);

// Topic Management (Must precede /:id)
// Rename topic and all questions under it
router.put('/topic/rename', authenticateJWT, requireRole(['ADMIN', 'CONTENT_CREATOR']), renameAptitudeTopic);

// Delete topic and all questions under it
router.delete('/topic/:topicName', authenticateJWT, requireRole(['ADMIN', 'CONTENT_CREATOR']), deleteAptitudeTopic);

// Get all aptitude problems (cached 10 minutes + SWR 600s)
router.get('/', PUBLIC_CATALOG_CACHE, getAllAptitudeProblems);

// Get aptitude problem by ID
router.get('/:id', PUBLIC_CATALOG_CACHE, getAptitudeProblemById);

// Create a new aptitude problem
router.post('/', authenticateJWT, requireRole(['ADMIN', 'CONTENT_CREATOR']), createAptitudeProblem);

// Update an existing aptitude problem
router.put('/:id', authenticateJWT, requireRole(['ADMIN', 'CONTENT_CREATOR']), updateAptitudeProblem);

// Delete an aptitude problem by ID
router.delete('/:id', authenticateJWT, requireRole(['ADMIN', 'CONTENT_CREATOR']), deleteAptitudeProblem);

export default router;
