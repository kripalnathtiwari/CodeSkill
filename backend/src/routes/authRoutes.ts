import { Router } from "express";
import AuthController from "../controllers/authController";
import { rateLimiter } from "../middlewares/rateLimitMiddleware";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = Router();

// Route mappings
router.post("/register", rateLimiter({ windowSeconds: 60, maxRequests: 5 }), AuthController.register);
router.post("/login", rateLimiter({ windowSeconds: 60, maxRequests: 10 }), AuthController.login);
router.post("/google", rateLimiter({ windowSeconds: 60, maxRequests: 10 }), AuthController.googleAuth);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);
router.get("/users", AuthController.getAllUsers);
router.put("/users/:userId/role", AuthController.updateUserRole);
router.put("/profile", authenticateJWT, AuthController.updateProfile as any);

// Password Reset Routes
router.post("/request-otp", rateLimiter({ windowSeconds: 60, maxRequests: 3 }), AuthController.requestOtp);
router.post("/verify-otp", rateLimiter({ windowSeconds: 60, maxRequests: 5 }), AuthController.verifyOtp);
router.post("/reset-password", rateLimiter({ windowSeconds: 60, maxRequests: 3 }), AuthController.resetPassword);

export default router;
