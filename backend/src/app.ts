import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// Config & Middlewares
import logger from "./config/logger";
import { errorHandler } from "./middlewares/errorMiddleware";
import { initSocketServer } from "./sockets/socketServer";
import compression from "compression";

// Route lists
import authRoutes from "./routes/authRoutes";
import questionRoutes from "./routes/questionRoutes";
import submissionRoutes from "./routes/submissionRoutes";
import testRoutes from "./routes/testRoutes";
import collegeRoutes from "./routes/collegeRoutes";
import collegeManagementRoutes from "./routes/collegeManagementRoutes";
import aptitudeRoutes from "./routes/aptitudeRoutes";
import archiveRoutes from "./routes/archiveRoutes";
import contactRoutes from "./routes/contactRoutes";
import adminRoutes from "./routes/adminRoutes";
import atsRoutes from "./routes/atsRoutes";
import cvAdminRoutes from "./routes/cvAdminRoutes";

// Background Jobs
// import "./jobs/submissionWorker";
import "./jobs/atsQueue";
import { initBackupCronJob } from "./jobs/backupJob";

const app = express();
const server = http.createServer(app);

// Initialize Socket.io WebSockets
initSocketServer(server);

// Security and Logging middleware
app.use(helmet());
app.use(cors({ origin: "*" })); // Adjust origin dynamically in prod config
app.use(express.json());
app.use(compression());

// Performance & Cache-Control middleware for public read-only endpoints
app.use((req, res, next) => {
  if (req.method === "GET" && (req.path.startsWith("/api/v1/questions") || req.path.startsWith("/api/v1/aptitude-problems") || req.path.startsWith("/api/v1/archives"))) {
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  } else if (req.method === "GET" && req.path.startsWith("/public")) {
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
  }
  next();
});

// Serve public static files for uploads
app.use("/public", express.static(path.join(__dirname, "../public")));

// Bind HTTP access log using Morgan and Winston
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(
  morgan(morganFormat, {
    stream: { write: (message) => logger.http(message.trim()) },
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

// Bind API route paths
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/questions", questionRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/tests", testRoutes);
app.use("/api/v1/colleges", collegeRoutes);
app.use("/api/v1/college-management", collegeManagementRoutes);
app.use("/api/v1/aptitude-problems", aptitudeRoutes);
app.use("/api/v1/archives", archiveRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/admin/cv", cvAdminRoutes);
app.use("/api/v1/ats", atsRoutes);

// Root informational endpoint
app.get("/", (req, res) => {
  res.status(200).send(`
    <h1>Coding and Assessment Platform API Engine</h1>
    <p>Version: 1.0.0</p>
    <p>Status: Operational</p>
  `);
});

// Centralized error handler fallback
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Cron Jobs and Server only when not running on Vercel Serverless
if (!process.env.VERCEL) {
  initBackupCronJob();
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  });
}

export default app;