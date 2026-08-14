import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const students = await prisma.collegeCourseStudent.findMany();
  console.log(`Found ${students.length} students in CollegeCourseStudent`);

  const hashedPassword = await bcrypt.hash("Welcome", 10);

  let createdCount = 0;
  for (const s of students) {
    if (s.email) {
      const email = s.email.toLowerCase();
      const existingUser = await prisma.user.findUnique({ where: { email } });
      
      if (!existingUser) {
        let firstName = s.name || "Student";
        let lastName = "";
        const nameParts = firstName.split(" ");
        if (nameParts.length > 1) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(" ");
        }

        await prisma.user.create({
          data: {
            email,
            passwordHash: hashedPassword,
            role: "STUDENT",
            phoneNumber: s.phone || null,
            profile: {
              create: {
                firstName: firstName,
                lastName: lastName,
              }
            }
          }
        });
        createdCount++;
        console.log(`Created user for ${email}`);
      } else {
        console.log(`User already exists for ${email}`);
      }
    }
  }

  console.log(`Finished creating ${createdCount} user accounts.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
