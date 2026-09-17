import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import logger from "../config/logger";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import redis from "../config/redis";
import EmailService from "../services/emailService";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "superrefreshkey";
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET || "1x0000000000000000000000000000000AA";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "864589755138-jvprisoib74mp9ee9pt7kaqinmtjvm9m.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyTurnstile(token: string) {
  if (!token) return false;
  
  // Bypass captcha strictly in local development or if using dummy testing keys
  if (process.env.NODE_ENV === "development" || TURNSTILE_SECRET === "1x0000000000000000000000000000000AA") {
    return true;
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', TURNSTILE_SECRET);
    params.append('response', token);
    const response = await axios.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    return response.data.success;
  } catch (err) {
    return false;
  }
}

export class AuthController {
  public static async register(req: Request, res: Response) {
    const { password, firstName, lastName, role, cfToken, phoneNumber } = req.body;
    const email = req.body.email?.toLowerCase();

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required profile fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const isHuman = await verifyTurnstile(cfToken);
    if (!isHuman) {
      return res.status(400).json({ error: "Captcha verification failed" });
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: "User with this email already registered" });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          phoneNumber,
          role: role === "ADMIN" || role === "INSTRUCTOR" ? role : "STUDENT",
          profile: {
            create: {
              firstName,
              lastName,
            },
          },
        },
        include: {
          profile: true,
        },
      });

      logger.info(`User registered successfully: ${user.id}`);
      return res.status(201).json({
        message: "User account created successfully",
        userId: user.id,
      });
    } catch (err: any) {
      logger.error(`Register logic failed: ${err.message}`);
      return res.status(500).json({ error: "Register internal database issue" });
    }
  }

  public static async login(req: Request, res: Response) {
    const { password, cfToken } = req.body;
    const email = req.body.email?.toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Note: Mock admin and instructor logins bypass this in frontend, but for real logins we check captcha
    const isHuman = await verifyTurnstile(cfToken);
    if (!isHuman) {
      return res.status(400).json({ error: "Captcha verification failed" });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });

      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Invalid email credentials or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email credentials or password" });
      }

      // Generate Access Token (Valid for 7d)
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Generate Refresh Token (Valid for 7 days)
      const refreshToken = jwt.sign(
        { id: user.id },
        REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      // Store Refresh Token Session in Database
      await prisma.deviceSession.create({
        data: {
          userId: user.id,
          refreshToken,
          userAgent: req.headers["user-agent"],
          ipAddress: req.ip,
        },
      });

      logger.info(`User authenticated: ${user.id}`);
      return res.status(200).json({
        message: "Login successful",
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
      });
    } catch (err: any) {
      logger.error(`Login logic failed: ${err.message}`);
      return res.status(500).json({ error: "Login internal database issue", details: err.message || String(err) });
    }
  }

  public static async googleAuth(req: Request, res: Response) {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "No Google token provided" });
    }

    try {
      let email: string;
      let firstName: string;
      let lastName: string;

      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          return res.status(400).json({ error: "Invalid Google token payload" });
        }
        email = payload.email.toLowerCase();
        firstName = payload.given_name || "Google";
        lastName = payload.family_name || "User";
      } catch (idTokenErr) {
        // Fallback: If token is an OAuth access_token from useGoogleLogin custom button
        const userInfoRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!userInfoRes.data || !userInfoRes.data.email) {
          throw new Error("Invalid Google access token or ID token");
        }
        email = userInfoRes.data.email.toLowerCase();
        firstName = userInfoRes.data.given_name || "Google";
        lastName = userInfoRes.data.family_name || "User";
      }

      let user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });

      if (!user) {
        // Create user if they don't exist
        user = await prisma.user.create({
          data: {
            email,
            passwordHash: "", // No password for Google auth
            role: "STUDENT",
            profile: {
              create: {
                firstName,
                lastName,
              },
            },
          },
          include: {
            profile: true,
          },
        });
      }

      // Generate Access Token
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Generate Refresh Token
      const refreshToken = jwt.sign(
        { id: user.id },
        REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      await prisma.deviceSession.create({
        data: {
          userId: user.id,
          refreshToken,
          userAgent: req.headers["user-agent"],
          ipAddress: req.ip,
        },
      });

      logger.info(`User authenticated via Google: ${user.id}`);
      return res.status(200).json({
        message: "Google Login successful",
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
      });
    } catch (err: any) {
      logger.error(`Google auth failed: ${err.message}`);
      return res.status(500).json({ error: "Google Authentication failed", details: err.message || String(err) });
    }
  }

  public static async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is missing" });
    }

    try {
      // Find refresh token session in Database
      const session = await prisma.deviceSession.findUnique({
        where: { refreshToken },
        include: { user: { include: { profile: true } } },
      });

      if (!session) {
        return res.status(403).json({ error: "Session expired or invalid token" });
      }

      // Verify JWT signature
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: string };

      if (decoded.id !== session.userId) {
        return res.status(403).json({ error: "Token tampering detected" });
      }

      // Refresh Access Token
      const accessToken = jwt.sign(
        { id: session.user.id, email: session.user.email, role: session.user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        accessToken,
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          profile: session.user.profile,
        },
      });
    } catch (err: any) {
      logger.error(`Token refresh failed: ${err.message}`);
      return res.status(403).json({ error: "Refresh token has expired" });
    }
  }

  public static async logout(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is missing" });
    }

    try {
      await prisma.deviceSession.delete({
        where: { refreshToken },
      });
      return res.status(200).json({ message: "Logout successful" });
    } catch (err: any) {
      logger.error(`Logout failed: ${err.message}`);
      // Return 200 anyway for client state cleanup
      return res.status(200).json({ message: "Logout processed" });
    }
  }

  public static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        include: { profile: true },
        orderBy: { createdAt: "desc" },
      });

      const collegeStudents = await prisma.collegeStudent.findMany({
        select: { email: true }
      });
      const collegeStudentEmails = new Set(collegeStudents.map(cs => cs.email.toLowerCase()));

      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "Unknown User",
        email: user.email,
        role: user.role,
        status: "active",
        joined: user.createdAt.toISOString().split("T")[0],
        section: collegeStudentEmails.has(user.email.toLowerCase()) ? "College Student" : "New User"
      }));

      return res.status(200).json(formattedUsers);
    } catch (err: any) {
      logger.error(`Get all users failed: ${err.message}`);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response) {
    const { firstName, lastName, phoneNumber } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Update phone number on User model if provided
      if (phoneNumber !== undefined) {
        await prisma.user.update({
          where: { id: userId },
          data: { phoneNumber },
        });
      }

      // Update name on Profile model if provided
      if (firstName !== undefined || lastName !== undefined) {
        const updateData: any = {};
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;

        await prisma.profile.update({
          where: { userId },
          data: updateData,
        });
      }

      return res.status(200).json({ message: "Profile updated successfully" });
    } catch (err: any) {
      logger.error(`Failed to update profile: ${err.message}`);
      return res.status(500).json({ error: "Failed to update profile" });
    }
  }

  public static async updateUserRole(req: Request, res: Response) {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { role },
      });
      return res.status(200).json({ message: "Role updated successfully" });
    } catch (err: any) {
      logger.error(`Failed to update role: ${err.message}`);
      return res.status(500).json({ error: "Failed to update role" });
    }
  }

  public static async deleteUser(req: Request, res: Response) {
    const { userId } = req.params;
    const adminId = (req as any).user?.id;

    try {
      const userToArchive = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      });

      if (!userToArchive) {
        return res.status(404).json({ error: "User not found" });
      }

      await prisma.archiveRecord.create({
        data: {
          entityType: 'USER',
          originalId: userToArchive.id,
          data: JSON.stringify(userToArchive),
          deletedBy: adminId
        }
      });

      await prisma.user.delete({
        where: { id: userId }
      });

      return res.status(204).send();
    } catch (err: any) {
      logger.error(`Failed to delete user: ${err.message}`);
      return res.status(500).json({ error: "Failed to delete user", details: err.message || String(err) });
    }
  }

  public static async requestOtp(req: Request, res: Response) {
    const email = req.body.email?.toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Return 200 to prevent email enumeration, but don't actually send
        return res.status(200).json({ message: "If that email exists, an OTP has been sent." });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store in Redis (5 mins expiration) or Fallback to Database
      let redisSuccess = false;
      if (redis) {
        try {
          await redis.setex(`otp:${email}`, 300, otp);
          redisSuccess = true;
        } catch (redisErr: any) {
          logger.warn(`Redis setex failed (${redisErr.message}), falling back to database for OTP`);
        }
      }

      if (!redisSuccess) {
        await prisma.user.update({
          where: { email },
          data: { forgotPasswordToken: `OTP:${otp}:${Date.now() + 300000}` } // store OTP with 5m expiry
        });
      }

      // Send Email
      await EmailService.sendOtpEmail(email, otp);

      return res.status(200).json({ message: "OTP sent successfully" });
    } catch (err: any) {
      logger.error(`Request OTP failed: ${err.message}`);
      return res.status(500).json({ error: "Failed to request OTP" });
    }
  }

  public static async verifyOtp(req: Request, res: Response) {
    const { otp } = req.body;
    const email = req.body.email?.toLowerCase();
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    try {
      let isValidOtp = false;

      if (redis) {
        try {
          const storedOtp = await redis.get(`otp:${email}`);
          if (storedOtp && storedOtp === otp) {
            isValidOtp = true;
            await redis.del(`otp:${email}`);
          }
        } catch (redisErr: any) {
          logger.warn(`Redis get failed (${redisErr.message}), falling back to database for OTP check`);
        }
      }
      
      // If not valid yet (either Redis failed, or not found in Redis, or Redis is null), check DB
      if (!isValidOtp) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user && user.forgotPasswordToken && user.forgotPasswordToken.startsWith("OTP:")) {
          const parts = user.forgotPasswordToken.split(":");
          if (parts.length === 3 && parts[1] === otp && parseInt(parts[2], 10) > Date.now()) {
            isValidOtp = true;
          }
        }
      }

      if (!isValidOtp) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      // Generate a short-lived reset token
      const resetToken = crypto.randomBytes(32).toString("hex");

      await prisma.user.update({
        where: { email },
        data: { forgotPasswordToken: resetToken },
      });

      return res.status(200).json({
        message: "OTP verified successfully",
        resetToken
      });
    } catch (err: any) {
      logger.error(`Verify OTP failed: ${err.message}`);
      return res.status(500).json({ error: "Failed to verify OTP" });
    }
  }

  public static async resetPassword(req: Request, res: Response) {
    const { resetToken, newPassword } = req.body;
    const email = req.body.email?.toLowerCase();
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || user.forgotPasswordToken !== resetToken) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { email },
        data: {
          passwordHash,
          forgotPasswordToken: null // Clear token after use
        },
      });

      logger.info(`Password reset for user: ${user.id}`);
      return res.status(200).json({ message: "Password has been successfully reset" });
    } catch (err: any) {
      logger.error(`Reset Password failed: ${err.message}`);
      return res.status(500).json({ error: "Failed to reset password" });
    }
  }

  public static async logActivity(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    const { action } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!action) {
      return res.status(400).json({ error: "Action is required" });
    }

    try {
      await prisma.userActivityLog.create({
        data: {
          userId,
          action,
          ipAddress: req.ip,
        }
      });
      return res.status(200).json({ success: true });
    } catch (err: any) {
      logger.error(`Log activity failed: ${err.message}`);
      return res.status(500).json({ error: "Failed to log activity" });
    }
  }

  public static async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // 1. Coding Stats
      const codingTotal = await prisma.question.count({ where: { type: { not: "MCQ" } } });
      const codingEasyTotal = await prisma.question.count({ where: { type: { not: "MCQ" }, difficulty: "EASY" } });
      const codingMediumTotal = await prisma.question.count({ where: { type: { not: "MCQ" }, difficulty: "MEDIUM" } });
      const codingHardTotal = await prisma.question.count({ where: { type: { not: "MCQ" }, difficulty: "HARD" } });

      // Get solved by current user
      const solvedSubmissions = await prisma.submission.findMany({
        where: {
          userId,
          status: "ACCEPTED",
          question: { type: { not: "MCQ" } }
        },
        include: { question: true },
        distinct: ['questionId']
      });

      const codingSolved = solvedSubmissions.length;
      let easySolved = 0, mediumSolved = 0, hardSolved = 0;
      solvedSubmissions.forEach(sub => {
        const diff = sub.question.difficulty?.toUpperCase();
        if (diff === "EASY") easySolved++;
        else if (diff === "MEDIUM") mediumSolved++;
        else if (diff === "HARD") hardSolved++;
      });

      // 2. MCQ Stats
      const mcqQuestionTotal = await prisma.question.count({ where: { type: "MCQ" } });
      const aptitudeTotal = await prisma.aptitudeProblem.count();
      const mcqTotal = mcqQuestionTotal + aptitudeTotal;
      
      const mcqSubmissions = await prisma.submission.findMany({
        where: {
          userId,
          question: { type: "MCQ" }
        },
        distinct: ['questionId']
      });
      
      const mcqSolved = mcqSubmissions.length;
      const mcqCorrect = mcqSubmissions.filter(s => s.status === "ACCEPTED").length;

      return res.status(200).json({
        coding: {
          total: codingTotal,
          solved: codingSolved,
          easy: { total: codingEasyTotal, solved: easySolved },
          medium: { total: codingMediumTotal, solved: mediumSolved },
          hard: { total: codingHardTotal, solved: hardSolved }
        },
        mcq: {
          total: mcqTotal,
          solved: mcqSolved,
          correct: mcqCorrect
        }
      });

    } catch (err: any) {
      logger.error(`Get dashboard stats failed: ${err.message}`);
      return res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  }
}

export default AuthController;
