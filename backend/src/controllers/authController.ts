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
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyTurnstile(token: string) {
  if (!token) return false;
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
    const { email, password, firstName, lastName, role, cfToken, phoneNumber } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required profile fields" });
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
    const { email, password, cfToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
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
      return res.status(500).json({ error: "Login internal database issue" });
    }
  }

  public static async googleAuth(req: Request, res: Response) {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "No Google token provided" });
    }

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        return res.status(400).json({ error: "Invalid Google token payload" });
      }

      const email = payload.email;
      const firstName = payload.given_name || "Google";
      const lastName = payload.family_name || "User";

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
      return res.status(500).json({ error: "Google Authentication failed" });
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

      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "Unknown User",
        email: user.email,
        role: user.role,
        status: "active",
        joined: user.createdAt.toISOString().split("T")[0]
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
  public static async requestOtp(req: Request, res: Response) {
    const { email } = req.body;
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
      
      // Store in Redis (5 mins expiration)
      if (redis) {
        await redis.setex(`otp:${email}`, 300, otp);
      } else {
        logger.error("Redis is unavailable for OTP storage");
        return res.status(500).json({ error: "Internal server error" });
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
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    try {
      if (!redis) {
        return res.status(500).json({ error: "Redis is unavailable" });
      }

      const storedOtp = await redis.get(`otp:${email}`);
      if (!storedOtp || storedOtp !== otp) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      // Clear the OTP
      await redis.del(`otp:${email}`);

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
    const { email, resetToken, newPassword } = req.body;
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
}
export default AuthController;
