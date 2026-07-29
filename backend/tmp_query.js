const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const q = await prisma.question.findMany({ select: { id: true, title: true, slug: true } });
  console.log(JSON.stringify(q, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
