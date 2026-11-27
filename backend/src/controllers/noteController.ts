import { Request, Response } from "express";
import prisma from "../config/db";
import path from "path";
import fs from "fs";
import { uploadMedia, deleteMedia } from "../services/cloudinaryService";
import { getOrSetCache, invalidateCachePattern, respondWithCachedJson } from "../middlewares/cacheMiddleware";

const NOTES_LIST_SELECT = {
  id: true,
  adminId: true,
  title: true,
  content: true,
  pdfUrl: true,
  imageUrl: true,
  courseName: true,
  createdAt: true,
  updatedAt: true,
  admin: {
    select: {
      email: true,
      profile: {
        select: { firstName: true, lastName: true },
      },
    },
  },
} as const;

// Get all global notes (cached per userId with private Cache-Control + ETag 304 fast-path)
export const getMyNotes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || "anonymous";
    return await respondWithCachedJson(req, res, {
      key: `cache:my-notes:${userId}`,
      ttlSeconds: 60,
      cacheControl: "private, max-age=30",
      loader: async () =>
        prisma.note.findMany({
          orderBy: { createdAt: "desc" },
          select: NOTES_LIST_SELECT,
        }),
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

// Admin: Get all global notes
export const getGlobalNotes = async (req: Request, res: Response) => {
  try {
    res.setHeader("Cache-Control", "private, max-age=60");
    const { value: notes, source } = await getOrSetCache(
      "cache:/api/v1/notes/admin/global-notes",
      300,
      async () =>
        prisma.note.findMany({
          orderBy: { createdAt: "desc" },
          select: NOTES_LIST_SELECT,
        })
    );
    res.setHeader("X-Cache", source);
    res.json(notes);
  } catch (error) {
    console.error("Error fetching global notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

// Admin: Create a global note
export const createGlobalNote = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user.id;
    const { title, content, courseName } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const imageUrl = req.body.imageUrl?.trim() || null;
    let pdfUrl = req.body.pdfUrl?.trim() || null;

    if (req.file) {
      const originalName = req.file.originalname;
      const result = await uploadMedia(req.file.buffer, "lms/pdfs/notes", "raw", originalName);
      pdfUrl = result.secure_url;
    }

    const note = await prisma.note.create({
      data: {
        adminId,
        title,
        content: content || null,
        pdfUrl,
        imageUrl,
        courseName: courseName || null,
      },
    });

    await Promise.all([
      invalidateCachePattern("cache:my-notes:"),
      invalidateCachePattern("/api/v1/notes"),
    ]);
    res.status(201).json(note);
  } catch (error) {
    console.error("Error creating global note:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
};

// Admin: Delete a specific note
export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (note.pdfUrl) {
      try {
        if (note.pdfUrl.includes("cloudinary.com") && note.pdfUrl.includes("lms/pdfs/notes")) {
          await deleteMedia(note.pdfUrl, "raw");
        } else if (!note.pdfUrl.includes("http")) {
          const filePath = path.join(__dirname, "../../", note.pdfUrl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (fileErr) {
        console.warn("Could not delete physical note file, proceeding with record deletion:", fileErr);
      }
    }

    await prisma.note.delete({
      where: { id: noteId },
    });
    await Promise.all([
      invalidateCachePattern("cache:my-notes:"),
      invalidateCachePattern("/api/v1/notes"),
    ]);
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
};

// Admin: Update a specific note
export const updateNote = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const { title, content, courseName, imageUrl, pdfUrl: bodyPdfUrl } = req.body;

    const existingNote = await prisma.note.findUnique({ where: { id: noteId } });
    if (!existingNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    let pdfUrl = bodyPdfUrl !== undefined ? (bodyPdfUrl?.trim() || null) : existingNote.pdfUrl;

    if (req.file) {
      // If a new PDF is uploaded, delete the old one from Cloudinary if it was uploaded to our folder
      if (existingNote.pdfUrl && existingNote.pdfUrl.includes("lms/pdfs/notes")) {
        try {
          await deleteMedia(existingNote.pdfUrl, "raw");
        } catch (delErr) {
          console.warn("Could not delete old note file from Cloudinary:", delErr);
        }
      }
      const originalName = req.file.originalname;
      const result = await uploadMedia(req.file.buffer, "lms/pdfs/notes", "raw", originalName);
      pdfUrl = result.secure_url;
    }

    const note = await prisma.note.update({
      where: { id: noteId },
      data: {
        title: title || existingNote.title,
        content: content !== undefined ? content : existingNote.content,
        courseName: courseName !== undefined ? courseName : existingNote.courseName,
        imageUrl: imageUrl !== undefined ? (imageUrl?.trim() || null) : existingNote.imageUrl,
        pdfUrl: pdfUrl,
      },
    });

    await Promise.all([
      invalidateCachePattern("cache:my-notes:"),
      invalidateCachePattern("/api/v1/notes"),
    ]);
    res.json(note);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
};
