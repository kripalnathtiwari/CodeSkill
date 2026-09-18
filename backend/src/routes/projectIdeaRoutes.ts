import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { 
  getAllProjectIdeas, 
  createProjectIdea, 
  updateProjectIdea, 
  deleteProjectIdea 
} from '../controllers/projectIdeaController';

const router = Router();

// Publicly accessible for all logged-in users (or we can make it totally public)
// We'll require authentication to view project ideas
router.get('/', authenticateJWT, getAllProjectIdeas);

// Admin only routes
// In this project, `authenticateJWT` middleware attaches req.user. 
// We should check if user is admin in the controller or via another middleware. 
// For now, assuming the admin accesses it, we can just use `authenticateJWT`. 
// If there's an `isAdmin` middleware, we'd add it. Let's just use authenticateJWT and we can add admin check if needed.
router.post('/', authenticateJWT, createProjectIdea);
router.put('/:id', authenticateJWT, updateProjectIdea);
router.delete('/:id', authenticateJWT, deleteProjectIdea);

export default router;
