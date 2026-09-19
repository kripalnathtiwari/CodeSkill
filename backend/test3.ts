import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const collegeStudents = await prisma.collegeStudent.findMany({ 
    include: { collection: true }
  });
  const collegeCourseStudents = await prisma.collegeCourseStudent.findMany({ 
    include: { category: true }
  });
  
  const studentMap = new Map<string, string>();
  
  collegeStudents.forEach(cs => {
    studentMap.set(cs.email.toLowerCase().trim(), cs.collection.collegeName || cs.collection.category);
  });
  
  collegeCourseStudents.forEach(ccs => {
    studentMap.set(ccs.email.toLowerCase().trim(), ccs.category.collegeName);
  });
  
  console.log(Array.from(studentMap.entries()).slice(0, 10));
}

main().catch(console.error).finally(() => prisma.$disconnect());
