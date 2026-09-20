import express from "express";
import { getMyNotes, getGlobalNotes, createGlobalNote, deleteNote, updateNote } from "../controllers/noteController";
import { authenticateJWT, requireRole } from "../middlewares/authMiddleware";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Configure multer for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/notes');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `note-${uniqueSuffix}${ext}`);
  },
});

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
router.put("/admin/notes/:noteId", requireRole(["ADMIN", "COLLEGE_ADMIN", "INSTRUCTOR"]), updateNote);

export default router;
