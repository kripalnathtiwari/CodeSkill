import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const subs = await prisma.submission.findMany({
    select: { status: true, userId: true, questionId: true },
    take: 10
  });
  console.dir(subs, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());
