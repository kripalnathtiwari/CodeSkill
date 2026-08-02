import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// Public: Browse job opportunities
router.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Job listings' });
});

// Protected: Apply for a job (requires JWT auth, returns 401 if unauthenticated)
router.post('/apply', authenticateJWT, (req: any, res: any) => {
  const { jobId } = req.body;
  if (!jobId) {
    return res.status(400).json({ error: 'jobId is required' });
  }
  return res.status(200).json({
    status: 'success',
    message: 'Application submitted successfully',
    applicationId: `app-${Date.now()}`
  });
});

export default router;
