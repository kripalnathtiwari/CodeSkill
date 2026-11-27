import express from "express";
import { getDashboardStats, getUserActivities } from "../controllers/adminController";
import { authenticateJWT, requireRole } from "../middlewares/authMiddleware";
import { cache } from "../middlewares/cacheMiddleware";

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authenticateJWT);
router.use(requireRole(["ADMIN", "COLLEGE_ADMIN", "INSTRUCTOR"])); // Adjust roles as needed

router.get("/dashboard-stats", getDashboardStats);
router.get("/user-activity", cache(60, "private"), getUserActivities);

export default router;
