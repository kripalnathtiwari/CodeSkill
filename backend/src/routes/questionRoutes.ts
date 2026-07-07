import { Router } from "express";
import QuestionController from "../controllers/questionController";
import { authenticateJWT, requireRole } from "../middlewares/authMiddleware";
import { cache } from "../middlewares/cacheMiddleware";

const router = Router();

// Public lists or user searches
router.get("/", cache(300), QuestionController.getQuestions);
router.get("/:slug", cache(300), QuestionController.getQuestionDetails);

// Instructor and admin authorized configurations
router.post(
  "/",
  authenticateJWT,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  QuestionController.createQuestion
);
router.put(
  "/:id",
  authenticateJWT,
  requireRole(["INSTRUCTOR", "ADMIN"]),
  QuestionController.updateQuestion
);
router.delete(
  "/:id",
  authenticateJWT,
  requireRole(["ADMIN"]),
  QuestionController.deleteQuestion
);

export default router;
