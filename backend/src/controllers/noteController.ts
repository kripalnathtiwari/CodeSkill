import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all global notes (for students to view)
export const getMyNotes = async (req: Request, res: Response) => {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        admin: {
          select: { name: true, email: true },
        },
      },
    });
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

// Admin: Get all global notes
export const getGlobalNotes = async (req: Request, res: Response) => {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        admin: {
          select: { name: true, email: true },
        },
      },
    });
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
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const note = await prisma.note.create({
      data: {
        adminId,
        title,
        content,
      },
    });

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
    await prisma.note.delete({
      where: { id: noteId },
    });
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
};
