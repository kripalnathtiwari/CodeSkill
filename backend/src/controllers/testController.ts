import { Request, Response } from "express";
import { prisma } from "../config/db";
import logger from "../config/logger";

export const saveSnapshot = async (req: Request, res: Response) => {
  try {
    const { testId, imageUrl } = req.body;
    const userId = (req as any).user?.id; // Assumes authMiddleware attaches user

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    if (!testId || !imageUrl) {
      return res.status(400).json({ message: "testId and imageUrl are required" });
    }

    const snapshot = await prisma.testSnapshot.create({
      data: {
        userId,
        testId: String(testId),
        imageUrl
      }
    });

    return res.status(201).json({
      message: "Snapshot saved successfully",
      snapshot: { id: snapshot.id, capturedAt: snapshot.capturedAt }
    });
  } catch (error) {
    logger.error("Error saving snapshot:", error);
    return res.status(500).json({ message: "Failed to save snapshot", error: (error as Error).message });
  }
};

export const getSnapshots = async (req: Request, res: Response) => {
  try {
    const { testId } = req.params;
    const { email } = req.query; // Admin passing student's email
    
    // We expect admin or instructor to call this
    const requesterRole = (req as any).user?.role;
    if (requesterRole !== "ADMIN" && requesterRole !== "INSTRUCTOR") {
       return res.status(403).json({ message: "Forbidden: Only admins and instructors can view snapshots" });
    }

    if (!testId || !email) {
      return res.status(400).json({ message: "testId and email query parameter are required" });
    }

    // Find user by email
    const student = await prisma.user.findUnique({
      where: { email: String(email) },
      select: { id: true }
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const snapshots = await prisma.testSnapshot.findMany({
      where: {
        testId: String(testId),
        userId: student.id,
      },
      orderBy: {
        capturedAt: 'asc',
      }
    });

    return res.status(200).json({ snapshots });
  } catch (error) {
    logger.error("Error getting snapshots:", error);
    return res.status(500).json({ message: "Failed to fetch snapshots", error: (error as Error).message });
  }
};
