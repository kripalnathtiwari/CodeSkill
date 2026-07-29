const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRestore() {
  const archive = await prisma.archiveRecord.findFirst({
    where: { status: 'ARCHIVED', entityType: 'COLLEGE_INSTITUTION' }
  });
  if (!archive) {
    console.log("No archive found");
    return;
  }
  
  console.log("Found archive:", archive.id);
  
  const payload = JSON.parse(archive.data);
  const scalarPayload = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === null || typeof value !== 'object') {
      scalarPayload[key] = value;
    }
  }
  
  const modelName = archive.entityType
    .toLowerCase()
    .replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    
  console.log("Model name:", modelName);
  
  try {
    const delegate = prisma[modelName];
    const result = await delegate.create({ data: scalarPayload });
    console.log("Inserted successfully:", result.id);
  } catch (e) {
    console.error("Failed to insert:", e);
  } finally {
    prisma.$disconnect();
  }
}

testRestore();
