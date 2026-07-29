const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const qs = await prisma.question.findMany({ include: { testCases: true } });
  const q = qs.find(x => x.title.toLowerCase().includes('delivery'));
  if (!q) { console.log("Question not found"); return; }
  
  console.log("Found question:", q.title);
  for (const tc of q.testCases) {
     try {
       const obj = JSON.parse(tc.input);
       if (obj.deliveryTimes && obj.requiredTime !== undefined) {
         // The user's C++ main does:
         // cin >> n; (size of deliveryTimes)
         // for (...) cin >> deliveryTimes[i];
         // cin >> requiredTime;
         const newInp = `${obj.deliveryTimes.length}\n${obj.deliveryTimes.join(' ')}\n${obj.requiredTime}`;
         await prisma.testCase.update({
           where: { id: tc.id },
           data: { input: newInp }
         });
         console.log("Updated test case:", tc.id, "to", newInp.replace(/\n/g, '\\n'));
       } else {
         console.log("Not the expected format:", tc.input);
       }
     } catch (e) {
       console.log("Could not parse as JSON (maybe already formatted):", tc.input);
     }
  }
}
main().then(() => prisma.$disconnect());
