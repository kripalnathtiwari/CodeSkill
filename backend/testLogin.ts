import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  const email = "admin@codesklii.com";
  const password = "password123";

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("User not found!");
    return;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  console.log(`Password is valid: ${isValid}`);
}

testLogin().catch(console.error).finally(() => prisma.$disconnect());
