const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.collegeInstitution.count();
    console.log('DB is online');
  } catch(e) {
    console.log('DB is offline:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
