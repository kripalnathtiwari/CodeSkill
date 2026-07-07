import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const REAL_QUESTIONS: any[] = [];

async function main() {
  let count = 0;
  
  // First, let's delete the mock "Master Challenge" questions to clean up the DB
  await prisma.question.deleteMany({
    where: {
      title: {
        contains: "Master Challenge"
      }
    }
  });

  for (const q of REAL_QUESTIONS) {
    const exists = await prisma.question.findUnique({ where: { slug: q.slug } });
    if (!exists) {
      await prisma.question.create({
        data: {
          title: q.title,
          slug: q.slug,
          difficulty: q.difficulty,
          type: q.type,
          description: q.description,
          constraints: "- 1 <= N <= 10^5\\n- Time complexity: O(N)",
          examples: JSON.stringify([{ input: "...", output: "...", explanation: "..." }]),
          hints: JSON.stringify(["Think carefully."]),
          starterCodes: JSON.stringify({
            javascript: "function solve() {}",
            python: "def solve(): pass"
          }),
          tags: JSON.stringify(q.tags),
          companies: JSON.stringify(q.companies),
          timeLimit: 2000,
          memoryLimit: 256
        }
      });
      count++;
    }
  }
  console.log(`Seeded ${count} realistic questions successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
