import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { email: true } });
  const collegeStudents = await prisma.collegeStudent.findMany({ select: { email: true } });
  const collegeCourseStudents = await prisma.collegeCourseStudent.findMany({ select: { email: true } });
  
  const collegeStudentEmails = new Set([
    ...collegeStudents.map(cs => cs.email.toLowerCase()),
    ...collegeCourseStudents.map(ccs => ccs.email.toLowerCase())
  ]);
  
  console.log('Total users:', users.length);
  const collegeUsers = users.filter(u => collegeStudentEmails.has(u.email.toLowerCase()));
  console.log('Users that are college students:', collegeUsers.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
