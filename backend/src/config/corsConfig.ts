import { CorsOptions } from "cors";
import logger from "./logger";

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "https://codeskill.vercel.app" // Main intended production URL
].filter(Boolean) as string[];

export const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // 1. Allow requests with no origin (e.g., mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // 2. Allow explicitly defined origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 3. Strict validation for Vercel preview URLs specific to this project
    // Examples:
    // https://frontend-react-i8vluda9w-saurabh15.vercel.app
    // https://frontend-react-[hash]-saurabh15.vercel.app
    const isAllowedVercelPreview = /^https:\/\/frontend-react-[a-z0-9-]+-saurabh15\.vercel\.app$/.test(origin);

    if (isAllowedVercelPreview) {
      return callback(null, true);
    }

    // 4. Reject all other origins
    logger.warn(`CORS rejected origin: ${origin}`);
    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};
