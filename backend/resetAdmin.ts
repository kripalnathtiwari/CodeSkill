import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@codesklii.com' },
    update: { passwordHash, role: 'ADMIN' },
    create: {
      email: 'admin@codesklii.com',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User'
        }
      }
    }
  });
  console.log('Admin password explicitly set to password123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
