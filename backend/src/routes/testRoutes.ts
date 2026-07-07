import { Router } from "express";
import { saveSnapshot, getSnapshots } from "../controllers/testController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = Router();

// Store snapshot (requires authentication)
router.post("/snapshots", authenticateJWT, saveSnapshot);

// Get snapshots for a test and user (requires authentication, admin/instructor role checked in controller)
router.get("/:testId/snapshots", authenticateJWT, getSnapshots);

export default router;
