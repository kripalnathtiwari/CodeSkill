import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(
    `[${req.method}] ${req.url} - Status: ${statusCode} - Msg: ${message} - Stack: ${err.stack}`
  );

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message: process.env.NODE_ENV === "production" ? "Internal Server Error" : message,
  });
};
