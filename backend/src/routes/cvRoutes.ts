import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// Protected: Authorize CV download and export (requires JWT auth, returns 401 if unauthenticated)
router.post('/download', authenticateJWT, (req: any, res: any) => {
  return res.status(200).json({
    status: 'success',
    message: 'CV download authorized'
  });
});

export default router;
