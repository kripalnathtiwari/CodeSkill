import { Router } from "express";
import { saveSnapshot, getSnapshots } from "../controllers/testController";
import ExamController from "../controllers/examController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = Router();

// Exam attempt lifecycle (BullMQ auto-submit + grading pipeline)
router.post("/:testId/start", authenticateJWT, ExamController.startAttempt);
router.post("/attempts/:attemptId/submit", authenticateJWT, ExamController.submitAttempt);
router.get("/attempts/:attemptId", authenticateJWT, ExamController.getAttemptResult);

// Proctoring snapshots
router.post("/snapshots", authenticateJWT, saveSnapshot);
router.get("/:testId/snapshots", authenticateJWT, getSnapshots);

export default router;
