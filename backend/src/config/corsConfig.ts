import { CorsOptions } from "cors";
import logger from "./logger";

const getFrontendUrls = () => {
  const url = process.env.FRONTEND_URL;
  if (!url) return [];
  // Split by comma in case multiple URLs are provided in FRONTEND_URL
  return url.split(",").map((u) => u.
  trim());
};

const allowedOrigins = [
  ...getFrontendUrls(),
  "http://localhost:5173",
  "http://localhost:3000",
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

    // 3. Reject all other origins
    logger.warn(`CORS rejected origin: ${origin}`);
    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};
