import { Router } from "express";
import SubmissionController from "../controllers/submissionController";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { rateLimiter } from "../middlewares/rateLimitMiddleware";

const router = Router();

// Public endpoint for Sandbox compilation
router.post(
  "/run",
  rateLimiter({ windowSeconds: 60, maxRequests: 20 }), // Compile execution limit
  SubmissionController.runCode
);

// Protected endpoints
router.use(authenticateJWT);

router.post(
  "/submit",
  rateLimiter({ windowSeconds: 60, maxRequests: 10 }), // Solve submissions limit
  SubmissionController.submitCode
);

router.get("/history", SubmissionController.getHistory);
router.get("/heatmap", SubmissionController.getHeatmap);
router.get("/:id", SubmissionController.getSubmission);

export default router;
