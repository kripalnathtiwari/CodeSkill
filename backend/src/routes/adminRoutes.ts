import express from "express";
import { getDashboardStats, getUserActivities } from "../controllers/adminController";
import { authenticateJWT, requireRole } from "../middlewares/authMiddleware";

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authenticateJWT);
router.use(requireRole(["ADMIN", "COLLEGE_ADMIN", "INSTRUCTOR"])); // Adjust roles as needed

router.get("/dashboard-stats", getDashboardStats);
router.get("/user-activity", getUserActivities);

export default router;
