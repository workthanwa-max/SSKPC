import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding baseline users (ADMIN, CENTRAL, BRANCH)...');
  
  const password = await bcrypt.hash('password123', 12);

  // 1. ADMIN
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'ผู้บัญชาการสูงสุด (Admin)',
      password,
      role: Role.ADMIN,
    },
  });

  // 2. CENTRAL
  await prisma.user.upsert({
    where: { email: 'central@test.com' },
    update: {},
    create: {
      email: 'central@test.com',
      name: 'ศูนย์บัญชาการกลาง (Central)',
      password,
      role: Role.CENTRAL,
    },
  });

  // 3. BRANCH
  await prisma.user.upsert({
    where: { email: 'branch@test.com' },
    update: {},
    create: {
      email: 'branch@test.com',
      name: 'ศูนย์พักพิงย่อยหลัก (Branch)',
      password,
      role: Role.BRANCH,
    },
  });

  console.log('Users seeded successfully. You can now login with: admin@test.com, central@test.com, branch@test.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
