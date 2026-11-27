import { Router } from "express";
import QuestionController from "../controllers/questionController";
import { authenticateJWT, requireRole } from "../middlewares/authMiddleware";
import { cache } from "../middlewares/cacheMiddleware";

const router = Router();

const PUBLIC_CATALOG_CACHE = cache(600, {
  scope: "public",
  maxAge: 60,
  staleWhileRevalidate: 600,
});

// Public lists or user searches
router.get("/", PUBLIC_CATALOG_CACHE, QuestionController.getQuestions);
router.get("/metadata/aggregates", QuestionController.getTagsAndCompanies); // Cached 1h with singleflight in controller
router.get("/:slug", PUBLIC_CATALOG_CACHE, QuestionController.getQuestionDetails);

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
