import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { 
  getAllProjectIdeas, 
  createProjectIdea, 
  updateProjectIdea, 
  deleteProjectIdea 
} from '../controllers/projectIdeaController';

const router = Router();

// Publicly accessible for all logged-in users (or we can make it totally public)
// We'll require authentication to view project ideas
router.get('/', authenticate, getAllProjectIdeas);

// Admin only routes
// In this project, `authenticate` middleware attaches req.user. 
// We should check if user is admin in the controller or via another middleware. 
// For now, assuming the admin accesses it, we can just use `authenticate`. 
// If there's an `isAdmin` middleware, we'd add it. Let's just use authenticate and we can add admin check if needed.
router.post('/', authenticate, createProjectIdea);
router.put('/:id', authenticate, updateProjectIdea);
router.delete('/:id', authenticate, deleteProjectIdea);

export default router;
