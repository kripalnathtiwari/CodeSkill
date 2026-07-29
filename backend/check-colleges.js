const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const c = await prisma.collegeInstitution.findMany();
  console.log(JSON.stringify(c, null, 2));
}

check().finally(() => prisma.$disconnect());
