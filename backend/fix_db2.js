const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const qs = await prisma.question.findMany({ select: { id: true, title: true } });
  console.log(JSON.stringify(qs, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
