import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/db";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  };
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: "User session expired or user not found" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired access token" });
  }
};

export const requireRole = (roles: ("STUDENT" | "INSTRUCTOR" | "ADMIN")[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions for this resource" });
    }
    return next();
  };
};
