const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allColleges = await prisma.collegeInstitution.findMany();
  
  const toDelete = allColleges.filter(c => c.name.toLowerCase() !== 'lpu');
  
  if (toDelete.length > 0) {
    const result = await prisma.collegeInstitution.deleteMany({
      where: {
        id: {
          in: toDelete.map(c => c.id)
        }
      }
    });
    console.log('Deleted colleges from DB:', result.count);
  } else {
    console.log('No colleges to delete from DB.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
