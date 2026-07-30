import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const fundamentalCategories = [
  { name: 'น้ำดื่ม', description: 'น้ำสะอาดสำหรับบริโภค', isCritical: true, isSystem: true },
  { name: 'อาหาร', description: 'อาหารแห้งและอาหารสำเร็จรูป', isCritical: true, isSystem: true },
  { name: 'ยารักษาโรค', description: 'ยาสามัญประจำบ้านและเวชภัณฑ์พื้นฐาน', isCritical: true, isSystem: true },
  { name: 'เครื่องนุ่งห่ม', description: 'เสื้อผ้าและเครื่องกันหนาว', isCritical: true, isSystem: true }
];

async function main() {
  console.log('Seeding fundamental categories...');
  const users = await prisma.user.findMany({
    where: { role: { in: ['BRANCH', 'CENTRAL', 'ADMIN'] } } // We might just need them for BRANCH and CENTRAL
  });

  for (const user of users) {
    for (const cat of fundamentalCategories) {
      // Check if category already exists for this user
      const existing = await prisma.stockCategory.findFirst({
        where: { ownerId: user.id, name: cat.name }
      });

      if (!existing) {
        await prisma.stockCategory.create({
          data: {
            name: cat.name,
            description: cat.description,
            isCritical: cat.isCritical,
            isSystem: cat.isSystem,
            ownerId: user.id
          }
        });
        console.log(`Created ${cat.name} for user ${user.name}`);
      } else {
        // Update existing to be system and critical just in case
        await prisma.stockCategory.update({
          where: { id: existing.id },
          data: { isCritical: cat.isCritical, isSystem: cat.isSystem }
        });
        console.log(`Updated ${cat.name} for user ${user.name}`);
      }
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
