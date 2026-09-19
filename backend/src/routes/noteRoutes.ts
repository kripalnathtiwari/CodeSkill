import express from "express";
import { getMyNotes, getGlobalNotes, createGlobalNote, deleteNote } from "../controllers/noteController";
import { authenticateJWT, requireRole } from "../middlewares/authMiddleware";

const router = express.Router();

// Apply base authentication
router.use(authenticateJWT);

// Student route: Get own notes (now returns all global notes)
router.get("/my-notes", getMyNotes);

// Admin routes
router.get("/admin/global-notes", requireRole(["ADMIN", "COLLEGE_ADMIN", "INSTRUCTOR"]), getGlobalNotes);
router.post("/admin/global-notes", requireRole(["ADMIN", "COLLEGE_ADMIN", "INSTRUCTOR"]), createGlobalNote);
router.delete("/admin/notes/:noteId", requireRole(["ADMIN", "COLLEGE_ADMIN", "INSTRUCTOR"]), deleteNote);

export default router;
