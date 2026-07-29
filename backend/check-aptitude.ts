import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const problems = await prisma.aptitudeProblem.findMany();
  console.log(JSON.stringify(problems, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
