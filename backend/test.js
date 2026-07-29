const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.archiveRecord.findMany().then(r => console.log(JSON.stringify(r, null, 2))).catch(e => console.error(e)).finally(() => prisma.$disconnect());
