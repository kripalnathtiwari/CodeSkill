import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

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

// Workers hook (so the worker registers and starts listening)
// import "./jobs/submissionWorker";

const app = express();
const server = http.createServer(app);

// Initialize Socket.io WebSockets
initSocketServer(server);

// Security and Logging middleware
app.use(helmet());
app.use(cors({ origin: "*" })); // Adjust origin dynamically in prod config
app.use(express.json());
app.use(compression());

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

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
});

export default app;