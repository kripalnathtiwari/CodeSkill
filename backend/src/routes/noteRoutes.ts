import express from "express";
import { getMyNotes, getUserNotes, createUserNote, deleteNote } from "../controllers/noteController";
import { authenticateJWT, requireRole } from "../middlewares/authMiddleware";

const router = express.Router();

// Apply base authentication
router.use(authenticateJWT);

// Student route: Get own notes
router.get("/my-notes", getMyNotes);

// Admin routes
router.get("/admin/users/:userId/notes", requireRole(["ADMIN", "COLLEGE_ADMIN", "INSTRUCTOR"]), getUserNotes);
router.post("/admin/users/:userId/notes", requireRole(["ADMIN", "COLLEGE_ADMIN", "INSTRUCTOR"]), createUserNote);
router.delete("/admin/notes/:noteId", requireRole(["ADMIN", "COLLEGE_ADMIN", "INSTRUCTOR"]), deleteNote);

export default router;
