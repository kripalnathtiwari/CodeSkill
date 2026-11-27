import express, { NextFunction, Request, Response } from "express";
import multer from "multer";
import {
  getMyNotes,
  getGlobalNotes,
  getNoteById,
  createGlobalNote,
  deleteNote,
  updateNote,
  MAX_NOTE_PDF_SIZE_BYTES,
} from "../controllers/noteController";
import { authenticateJWT, requireRole } from "../middlewares/authMiddleware";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_NOTE_PDF_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const lowerName = file.originalname.toLowerCase();
    if (file.mimetype !== "application/pdf" || !lowerName.endsWith(".pdf")) {
      return cb(new Error("Only valid PDF files (.pdf) are allowed"));
    }
    cb(null, true);
  },
});

const handlePdfUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single("pdf")(req, res, (err: any) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      const maxMb = Math.round(MAX_NOTE_PDF_SIZE_BYTES / (1024 * 1024));
      return res.status(400).json({
        success: false,
        error: `PDF file exceeds maximum allowed size of ${maxMb}MB`,
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message || "Invalid file upload",
    });
  });
};

const requireNotesAdmin = requireRole(["ADMIN", "COLLEGE_ADMIN", "INSTRUCTOR"]);

router.use(authenticateJWT);

// Student route: Get all notes (preserved for Student Notes page)
router.get("/my-notes", getMyNotes);

// Admin routes
router.get("/admin/global-notes", requireNotesAdmin, getGlobalNotes);
router.get("/admin/notes/:noteId", requireNotesAdmin, getNoteById);
router.post("/admin/global-notes", requireNotesAdmin, handlePdfUpload, createGlobalNote);
router.put("/admin/notes/:noteId", requireNotesAdmin, handlePdfUpload, updateNote);
router.delete("/admin/notes/:noteId", requireNotesAdmin, deleteNote);

export default router;
