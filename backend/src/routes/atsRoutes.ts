import express from 'express';
import multer from 'multer';
import { uploadResume, uploadJobDescription, triggerAnalysis, getAnalysis, getHistory } from '../controllers/atsController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB limit

// Protect all ATS routes
router.use(authenticateJWT);

router.post('/upload-resume', upload.single('resume'), uploadResume);
router.post('/upload-job', uploadJobDescription);
router.post('/analyze', triggerAnalysis);
router.get('/analysis/:id', getAnalysis);
router.get('/history', getHistory);

export default router;
