import { Router } from 'express';
import { getAllInstitutions, getPublicInstitutions, createInstitution, updateInstitution, deleteInstitution, deleteTutor } from '../controllers/collegeManagementController';
import { authenticateJWT, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Get public institutions (no auth required)
router.get('/public', getPublicInstitutions);

// Get all institutions
router.get('/', authenticateJWT, getAllInstitutions);

// Create a new institution
router.post('/', authenticateJWT, requireRole(['ADMIN']), createInstitution);

// Update an existing institution
router.put('/:id', authenticateJWT, requireRole(['ADMIN']), updateInstitution);

// Delete an institution by ID
router.delete('/:id', authenticateJWT, requireRole(['ADMIN']), deleteInstitution);

// Delete a tutor by ID
router.delete('/:collegeId/tutors/:tutorId', authenticateJWT, requireRole(['ADMIN']), deleteTutor);

export default router;
