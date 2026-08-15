import express from "express";
import { getDashboardStats, getUserActivities } from "../controllers/adminController";
import { authenticateJWT, requireRole } from "../middlewares/authMiddleware";
import { cache } from "../middlewares/cacheMiddleware";

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authenticateJWT);
router.use(requireRole(["ADMIN", "COLLEGE_ADMIN", "INSTRUCTOR"])); // Adjust roles as needed

router.get("/dashboard-stats", cache("admin_stats", 30), getDashboardStats);
router.get("/user-activity", cache("admin_activity", 30), getUserActivities);

export default router;
