import { PrismaClient } from '@prisma/client';

const commonPasswords = ['root', 'admin', 'password', '1234', '12345', '123456', '', 'postgres123', 'admin123', 'CodeSklii', 'codesklii'];

async function checkPasswords() {
  for (const pwd of commonPasswords) {
    const url = `postgresql://postgres:${pwd}@localhost:5432/postgres?schema=public`;
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url,
        },
      },
    });

    try {
      await prisma.$connect();
      console.log(`SUCCESS_PASSWORD=${pwd}`);
      await prisma.$disconnect();
      return;
    } catch (e) {
      // ignore
    }
  }
  console.log('FAIL: None of the common passwords worked.');
}

checkPasswords().catch(console.error);
