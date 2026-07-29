import { Router } from 'express';
import { getAllArchives, restoreArchive, deleteArchive, clearArchives } from '../controllers/archiveController';
import { authenticateJWT, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Get all archived records
router.get('/', authenticateJWT, requireRole(['ADMIN']), getAllArchives);

// Restore an archived record (placeholder)
router.post('/:id/restore', authenticateJWT, requireRole(['ADMIN']), restoreArchive);

// Clear all archived records
router.delete('/clear', authenticateJWT, requireRole(['ADMIN']), clearArchives);

// Delete a specific archived record
router.delete('/:id', authenticateJWT, requireRole(['ADMIN']), deleteArchive);

export default router;
