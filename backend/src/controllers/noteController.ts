import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get notes for the currently logged in student
export const getMyNotes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        admin: {
          select: { name: true, email: true },
        },
      },
    });
    res.json(notes);
  } catch (error) {
    console.error("Error fetching my notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

// Admin: Get notes for a specific user
export const getUserNotes = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        admin: {
          select: { name: true, email: true },
        },
      },
    });
    res.json(notes);
  } catch (error) {
    console.error("Error fetching user notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

// Admin: Create a note for a specific user
export const createUserNote = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const adminId = (req as any).user.id;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const note = await prisma.note.create({
      data: {
        userId,
        adminId,
        title,
        content,
      },
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Error creating user note:", error);
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
