import { Router } from 'express';
import { getAllColleges, createCollege, updateCollege, deleteCollege } from '../controllers/collegeController';
import { authenticateJWT, requireRole } from '../middlewares/authMiddleware';
import { cache } from '../middlewares/cacheMiddleware';

const router = Router();

// Get all college collections
router.get('/', authenticateJWT, cache(180), getAllColleges);

// Create a new college collection
router.post('/', authenticateJWT, requireRole(['ADMIN', 'COLLEGE_ADMIN']), createCollege);

// Update an existing college collection
router.put('/:id', authenticateJWT, requireRole(['ADMIN', 'COLLEGE_ADMIN']), updateCollege);

// Delete a college collection by ID
router.delete('/:id', authenticateJWT, requireRole(['ADMIN', 'COLLEGE_ADMIN']), deleteCollege);

export default router;
