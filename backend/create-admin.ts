import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'saurabhtiwari08071999@gmail.com';
  const password = 'Papa9450@';
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE'
    },
    create: {
      email,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  });

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      firstName: 'Saurabh',
      lastName: 'Tiwari'
    },
    create: {
      userId: user.id,
      firstName: 'Saurabh',
      lastName: 'Tiwari'
    }
  });

  console.log('Successfully created/updated admin user:', user.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
