const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const count = await prisma.question.count();
    console.log('Number of questions in database:', count);
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
