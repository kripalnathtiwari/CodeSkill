import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["query", "error", "info", "warn"],
});

// Prisma event handlers removed to prevent TS errors on default log configuration

export default prisma;
