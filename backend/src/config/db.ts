import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["query", "error", "info", "warn"],
});

prisma.$on("query", (e) => {
  // logger.debug(`Query: ${e.query}`);
});

prisma.$on("error", (e) => {
  // logger.error(`Prisma Error: ${e.message}`);
});

export default prisma;
