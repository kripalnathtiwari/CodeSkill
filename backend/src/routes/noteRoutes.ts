import express from "express";
import { getMyNotes, getGlobalNotes, createGlobalNote, deleteNote, updateNote } from "../controllers/noteController";
import { authenticateJWT, requireRole } from "../middlewares/authMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

// Apply base authentication
router.use(authenticateJWT);

// Student route: Get own notes (now returns all global notes)
router.get("/my-notes", getMyNotes);

// Admin routes
router.get("/admin/global-notes", requireRole(["ADMIN", "COLLEGE_ADMIN", "INSTRUCTOR"]), getGlobalNotes);
router.post("/admin/global-notes", requireRole(["ADMIN", "COLLEGE_ADMIN", "INSTRUCTOR"]), upload.single('pdf'), createGlobalNote);
router.delete("/admin/notes/:noteId", requireRole(["ADMIN", "COLLEGE_ADMIN", "INSTRUCTOR"]), deleteNote);
router.put("/admin/notes/:noteId", requireRole(["ADMIN", "COLLEGE_ADMIN", "INSTRUCTOR"]), upload.single('pdf'), updateNote);

export default router;
