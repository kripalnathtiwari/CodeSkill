import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/db";
import logger from "../lib/logger";
import { uploadMedia, deleteMedia } from "../services/cloudinaryService";
import {
  getOrSetCache,
  invalidateCachePattern,
  respondWithCachedJson,
} from "../middlewares/cacheMiddleware";

export const MAX_NOTE_PDF_SIZE_BYTES = parseInt(
  process.env.MAX_NOTE_PDF_SIZE_BYTES || String(20 * 1024 * 1024),
  10
);

const MAX_PAGE_LIMIT = 100;
const DEFAULT_PAGE_LIMIT = 20;

const STUDENT_NOTES_SELECT = {
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

// List projection omits `content` to minimize payload size and DB transfer
const ADMIN_NOTES_LIST_SELECT = {
  id: true,
  title: true,
  courseName: true,
  pdfUrl: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
  admin: {
    select: {
      profile: {
        select: { firstName: true, lastName: true },
      },
    },
  },
} as const;

const ADMIN_NOTE_DETAIL_SELECT = {
  id: true,
  adminId: true,
  title: true,
  content: true,
  courseName: true,
  pdfUrl: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
  admin: {
    select: {
      profile: {
        select: { firstName: true, lastName: true },
      },
    },
  },
} as const;

const uuidSchema = z.string().uuid("Invalid note ID format");

const isSafeUrl = (value: string): boolean => {
  if (!value) return true;
  if (value.startsWith("/public/")) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const optionalSafeUrlSchema = z
  .string()
  .trim()
  .max(2048, "URL is too long")
  .refine(isSafeUrl, "Only valid http/https URLs are allowed")
  .optional();

const notePayloadSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(250, "Title cannot exceed 250 characters"),
  content: z.string().max(50_000, "Content exceeds maximum length").optional(),
  courseName: z.string().trim().max(120, "Course name cannot exceed 120 characters").optional(),
  imageUrl: optionalSafeUrlSchema,
  pdfUrl: optionalSafeUrlSchema,
  clearPdf: z.enum(["true", "false"]).optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
  search: z.string().trim().max(120).optional().default(""),
});

const hasValidPdfSignature = (buffer: Buffer): boolean => {
  if (buffer.length < 5) return false;
  return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
};

const isTrustedOwnedCloudinaryNotePdf = (rawUrl: string): boolean => {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.hostname !== "res.cloudinary.com") return false;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    if (cloudName && !parsed.pathname.startsWith(`/${cloudName}/`)) {
      return false;
    }
    return parsed.pathname.includes("/lms/pdfs/notes/");
  } catch {
    return false;
  }
};

const invalidateNotesCaches = async () => {
  await Promise.all([
    invalidateCachePattern("cache:my-notes:"),
    invalidateCachePattern("/api/v1/notes"),
  ]);
};

// Student route: Get all global notes (cached per userId with ETag 304 fast-path)
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
          select: STUDENT_NOTES_SELECT,
        }),
    });
  } catch (error: any) {
    logger.error("Error fetching student notes", { error: error.message });
    return res.status(500).json({ error: "Failed to fetch notes" });
  }
};

// Admin: Get paginated global notes with server-side search
export const getGlobalNotes = async (req: Request, res: Response) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid pagination or search parameters",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { page, limit, search } = parsed.data;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { courseName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  try {
    res.setHeader("Cache-Control", "private, max-age=30");
    const cacheKey = `cache:/api/v1/notes/admin/global-notes?page=${page}&limit=${limit}&search=${encodeURIComponent(
      search.toLowerCase()
    )}`;

    const { value: payload, source } = await getOrSetCache(cacheKey, 60, async () => {
      const [notes, total] = await Promise.all([
        prisma.note.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: ADMIN_NOTES_LIST_SELECT,
        }),
        prisma.note.count({ where }),
      ]);

      return {
        success: true,
        data: notes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      };
    });

    res.setHeader("X-Cache", source);
    return res.status(200).json(payload);
  } catch (error: any) {
    logger.error("Error fetching paginated global notes", { error: error.message });
    return res.status(500).json({ success: false, error: "Failed to fetch notes" });
  }
};

// Admin: Lazy-load full note details (including `content`) for editing
export const getNoteById = async (req: Request, res: Response) => {
  const idCheck = uuidSchema.safeParse(req.params.noteId);
  if (!idCheck.success) {
    return res.status(400).json({ success: false, error: "Invalid note ID" });
  }

  try {
    const note = await prisma.note.findUnique({
      where: { id: idCheck.data },
      select: ADMIN_NOTE_DETAIL_SELECT,
    });

    if (!note) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    return res.status(200).json({ success: true, data: note });
  } catch (error: any) {
    logger.error("Error fetching note details", { error: error.message, noteId: idCheck.data });
    return res.status(500).json({ success: false, error: "Failed to fetch note details" });
  }
};

// Admin: Create a global note
export const createGlobalNote = async (req: Request, res: Response) => {
  const parsed = notePayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid note data",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  if (req.file) {
    if (req.file.size > MAX_NOTE_PDF_SIZE_BYTES) {
      return res.status(400).json({ success: false, error: "PDF file exceeds maximum size limit" });
    }
    if (!hasValidPdfSignature(req.file.buffer)) {
      return res.status(400).json({
        success: false,
        error: "Invalid PDF file signature. Please upload a valid PDF document.",
      });
    }
  }

  let uploadedCloudinaryUrl: string | null = null;

  try {
    const adminId = (req as any).user?.id;
    const { title, content, courseName } = parsed.data;
    const imageUrl = parsed.data.imageUrl || null;
    let pdfUrl = parsed.data.pdfUrl || null;

    if (req.file) {
      const result = await uploadMedia(
        req.file.buffer,
        "lms/pdfs/notes",
        "raw",
        req.file.originalname
      );
      uploadedCloudinaryUrl = result.secure_url;
      pdfUrl = result.secure_url;
    }

    const note = await prisma.note.create({
      data: {
        adminId,
        title,
        content: content?.trim() ? content : null,
        pdfUrl,
        imageUrl,
        courseName: courseName || null,
      },
      select: ADMIN_NOTES_LIST_SELECT,
    });

    await invalidateNotesCaches();
    return res.status(201).json({ success: true, data: note });
  } catch (error: any) {
    if (uploadedCloudinaryUrl && isTrustedOwnedCloudinaryNotePdf(uploadedCloudinaryUrl)) {
      deleteMedia(uploadedCloudinaryUrl, "raw").catch((cleanupErr) =>
        logger.warn("Failed to rollback Cloudinary PDF after DB error", { error: cleanupErr.message })
      );
    }
    logger.error("Error creating global note", { error: error.message });
    return res.status(500).json({ success: false, error: "Failed to create note" });
  }
};

// Admin: Update a specific note
export const updateNote = async (req: Request, res: Response) => {
  const idCheck = uuidSchema.safeParse(req.params.noteId);
  if (!idCheck.success) {
    return res.status(400).json({ success: false, error: "Invalid note ID" });
  }

  const parsed = notePayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid note update data",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  if (req.file) {
    if (req.file.size > MAX_NOTE_PDF_SIZE_BYTES) {
      return res.status(400).json({ success: false, error: "PDF file exceeds maximum size limit" });
    }
    if (!hasValidPdfSignature(req.file.buffer)) {
      return res.status(400).json({
        success: false,
        error: "Invalid PDF file signature. Please upload a valid PDF document.",
      });
    }
  }

  let uploadedCloudinaryUrl: string | null = null;

  try {
    const noteId = idCheck.data;
    const existingNote = await prisma.note.findUnique({ where: { id: noteId } });
    if (!existingNote) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    const { title, content, courseName, imageUrl, pdfUrl: bodyPdfUrl, clearPdf } = parsed.data;

    // Preserve existing PDF unless a replacement file/URL or explicit clear is requested
    let nextPdfUrl: string | null = existingNote.pdfUrl;
    if (req.file) {
      const result = await uploadMedia(
        req.file.buffer,
        "lms/pdfs/notes",
        "raw",
        req.file.originalname
      );
      uploadedCloudinaryUrl = result.secure_url;
      nextPdfUrl = result.secure_url;
    } else if (clearPdf === "true") {
      nextPdfUrl = null;
    } else if (bodyPdfUrl && bodyPdfUrl.length > 0) {
      nextPdfUrl = bodyPdfUrl;
    }

    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        title,
        content: content !== undefined ? (content.trim() ? content : null) : existingNote.content,
        courseName:
          courseName !== undefined ? courseName || null : existingNote.courseName,
        imageUrl: imageUrl !== undefined ? imageUrl || null : existingNote.imageUrl,
        pdfUrl: nextPdfUrl,
      },
      select: ADMIN_NOTES_LIST_SELECT,
    });

    // Clean up replaced Cloudinary asset only after DB update succeeds
    if (
      (req.file || clearPdf === "true") &&
      existingNote.pdfUrl &&
      existingNote.pdfUrl !== nextPdfUrl &&
      isTrustedOwnedCloudinaryNotePdf(existingNote.pdfUrl)
    ) {
      deleteMedia(existingNote.pdfUrl, "raw").catch((delErr) =>
        logger.warn("Could not delete replaced note file from Cloudinary", { error: delErr.message })
      );
    }

    await invalidateNotesCaches();
    return res.status(200).json({ success: true, data: updatedNote });
  } catch (error: any) {
    if (uploadedCloudinaryUrl && isTrustedOwnedCloudinaryNotePdf(uploadedCloudinaryUrl)) {
      deleteMedia(uploadedCloudinaryUrl, "raw").catch((cleanupErr) =>
        logger.warn("Failed to rollback Cloudinary PDF after DB update error", {
          error: cleanupErr.message,
        })
      );
    }
    logger.error("Error updating note", { error: error.message, noteId: idCheck.data });
    return res.status(500).json({ success: false, error: "Failed to update note" });
  }
};

// Admin: Delete a specific note
export const deleteNote = async (req: Request, res: Response) => {
  const idCheck = uuidSchema.safeParse(req.params.noteId);
  if (!idCheck.success) {
    return res.status(400).json({ success: false, error: "Invalid note ID" });
  }

  try {
    const noteId = idCheck.data;
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    await prisma.note.delete({ where: { id: noteId } });

    if (note.pdfUrl && isTrustedOwnedCloudinaryNotePdf(note.pdfUrl)) {
      deleteMedia(note.pdfUrl, "raw").catch((fileErr) =>
        logger.warn("Could not delete Cloudinary PDF after note deletion", {
          error: fileErr.message,
          noteId,
        })
      );
    }

    await invalidateNotesCaches();
    return res.status(200).json({ success: true, message: "Note deleted successfully" });
  } catch (error: any) {
    logger.error("Error deleting note", { error: error.message, noteId: idCheck.data });
    return res.status(500).json({ success: false, error: "Failed to delete note" });
  }
};
