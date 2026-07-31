import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ข้อมูลปัจจัย 4 พื้นฐาน (หมวดหมู่ระบบ)
const FUNDAMENTAL_CATEGORIES = [
  { name: 'อาหาร', description: 'อาหารแห้งและอาหารสำเร็จรูป', isCritical: true, isSystem: true },
  { name: 'น้ำดื่ม', description: 'น้ำสะอาดสำหรับบริโภค', isCritical: true, isSystem: true },
  { name: 'ยารักษาโรค', description: 'ยาสามัญประจำบ้านและเวชภัณฑ์พื้นฐาน', isCritical: true, isSystem: true },
  { name: 'เครื่องนุ่งห่ม', description: 'เสื้อผ้าและเครื่องกันหนาว', isCritical: true, isSystem: true },
];

async function seedFundamentalCategoriesForOwner(ownerId: string) {
  const createdCategories: Record<string, string> = {};
  
  for (const cat of FUNDAMENTAL_CATEGORIES) {
    const existing = await prisma.stockCategory.findFirst({
      where: { ownerId, name: cat.name }
    });

    if (!existing) {
      const created = await prisma.stockCategory.create({
        data: { ...cat, ownerId }
      });
      createdCategories[cat.name] = created.id;
    } else {
      // Ensure existing ones have the system flags set properly
      const updated = await prisma.stockCategory.update({
        where: { id: existing.id },
        data: { isCritical: cat.isCritical, isSystem: cat.isSystem }
      });
      createdCategories[cat.name] = updated.id;
    }
  }
  return createdCategories;
}

async function main() {
  const isProd = process.argv.includes('--prod');
  
  console.log(`Starting Database Seeding... (Mode: ${isProd ? 'PRODUCTION' : 'DEMO'})`);
  
  console.log('Seeding baseline users (ADMIN, CENTRAL, BRANCH)...');
  const password = await bcrypt.hash('password123', 12);

  // 1. ADMIN
  const adminUser = await prisma.user.upsert({
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
  const centralUser = await prisma.user.upsert({
    where: { email: 'central@test.com' },
    update: {},
    create: {
      email: 'central@test.com',
      name: 'ศูนย์บัญชาการกลาง (Central)',
      password,
      role: Role.CENTRAL,
    },
  });
  // สร้างหมวดหมู่บังคับ (ปัจจัย 4) ให้ส่วนกลาง
  await seedFundamentalCategoriesForOwner(centralUser.id);

  // 3. BRANCH (Main Test Branch)
  const firstBranchUser = await prisma.user.upsert({
    where: { email: 'branch@test.com' },
    update: {},
    create: {
      email: 'branch@test.com',
      name: 'ศูนย์พักพิงย่อยหลัก (Branch)',
      password,
      role: Role.BRANCH,
    },
  });
  // สร้างหมวดหมู่บังคับ (ปัจจัย 4) ให้สาขาหลัก
  const mainBranchCats = await seedFundamentalCategoriesForOwner(firstBranchUser.id);

  // --- Seed Primary Test Branch Location ---
  let firstBranchLocation = await prisma.branchLocation.findUnique({ where: { userId: firstBranchUser.id } });
  if (!firstBranchLocation) {
    firstBranchLocation = await prisma.branchLocation.create({
      data: {
        userId: firstBranchUser.id,
        name: 'สาขาหลัก (ทดสอบ)',
        description: 'ศูนย์พักพิงหลักสำหรับทดสอบระบบ',
        latitude: 13.7563,
        longitude: 100.5018,
        capacity: 500,
        specInfo: 'ศูนย์พักพิงชั่วคราว อาคารอเนกประสงค์ มีเต็นท์ 100 หลัง ห้องน้ำ 20 ห้อง รองรับผู้ป่วยได้ 50 เตียง'
      }
    });
  }

  console.log('Baseline users and fundamental categories seeded successfully.');

  if (isProd) {
    console.log('Production mode active. Skipping demo data.');
    return;
  }

  // ==========================================
  // DEMO DATA SEEDING (Only runs if not --prod)
  // ==========================================
  console.log('Seeding Demo Data for Presentation...');

  // --- Seed Branch Locations (8 border branches) ---
  console.log('Seeding extra demo branch locations...');
  const borderBranches = [
    { name: 'สาขาอรัญประเทศ (สระแก้ว)', email: 'branch_aranya@test.com', lat: 13.6897, lng: 102.5020, desc: 'ศูนย์ด่านพรมแดนบ้านคลองลึก' },
    { name: 'สาขาคลองหาด (สระแก้ว)', email: 'branch_klonghat@test.com', lat: 13.4357, lng: 102.3168, desc: 'ศูนย์บ้านเขาดิน' },
    { name: 'สาขาโป่งน้ำร้อน (จันทบุรี)', email: 'branch_pongnamron@test.com', lat: 12.9238, lng: 102.2612, desc: 'ศูนย์บ้านแหลม' },
    { name: 'สาขาภูสิงห์ (ศรีสะเกษ)', email: 'branch_phusing@test.com', lat: 14.4172, lng: 104.1481, desc: 'ศูนย์ช่องสะงำ' },
    { name: 'สาขากันทรลักษ์ (ศรีสะเกษ)', email: 'branch_kthralak@test.com', lat: 14.6465, lng: 104.6499, desc: 'ศูนย์เขาพระวิหาร' },
    { name: 'สาขาน้ำยืน (อุบลราชธานี)', email: 'branch_namyuen@test.com', lat: 14.4754, lng: 104.9754, desc: 'ศูนย์สามเหลี่ยมมรกต' },
    { name: 'สาขาบุณฑริก (อุบลราชธานี)', email: 'branch_buntharik@test.com', lat: 14.7570, lng: 105.2975, desc: 'ด่านช่องเม็ก' },
    { name: 'สาขาคลองใหญ่ (ตราด)', email: 'branch_klongyai@test.com', lat: 11.7770, lng: 102.8800, desc: 'ศูนย์ด่านหาดเล็ก' },
  ];

  for (const [index, b] of borderBranches.entries()) {
    const branchUser = await prisma.user.upsert({
      where: { email: b.email },
      update: {},
      create: {
        email: b.email,
        name: b.name,
        password,
        role: Role.BRANCH,
      },
    });

    // สร้างปัจจัย 4 ให้กับทุกสาขาจำลองด้วย
    await seedFundamentalCategoriesForOwner(branchUser.id);

    const existingLocation = await prisma.branchLocation.findUnique({
      where: { userId: branchUser.id },
    });

    if (!existingLocation) {
      await prisma.branchLocation.create({
        data: {
          userId: branchUser.id,
          name: b.name,
          description: b.desc,
          latitude: b.lat,
          longitude: b.lng,
          capacity: Math.floor(Math.random() * 500) + 100, // Random capacity between 100 and 600
          isReady: index < 4, // 4 ready, 4 not ready
        },
      });
    }
  }

  // --- Seed Stock Products & Transactions ---
  console.log('Seeding stock products (demo)...');
  const existingProducts = await prisma.stockProduct.count({ where: { ownerId: firstBranchUser.id } });
  if (existingProducts === 0) {
    const productsData = [
      { name: 'บะหมี่กึ่งสำเร็จรูป', unit: 'กล่อง', qty: 150, catId: mainBranchCats['อาหาร'] },
      { name: 'ปลากระป๋อง', unit: 'แพ็ค', qty: 200, catId: mainBranchCats['อาหาร'] },
      { name: 'น้ำดื่ม 600ml', unit: 'แพ็ค', qty: 500, catId: mainBranchCats['น้ำดื่ม'] },
      { name: 'พาราเซตามอล', unit: 'แผง', qty: 300, catId: mainBranchCats['ยารักษาโรค'] },
      { name: 'ชุดทำแผล', unit: 'ชุด', qty: 50, catId: mainBranchCats['ยารักษาโรค'] },
      { name: 'ผ้าห่ม', unit: 'ผืน', qty: 100, catId: mainBranchCats['เครื่องนุ่งห่ม'] },
    ];

    for (const p of productsData) {
      const product = await prisma.stockProduct.create({
        data: {
          name: p.name,
          sku: `SKU-${Math.floor(Math.random() * 10000)}`,
          unit: p.unit,
          quantity: p.qty,
          categoryId: p.catId,
          ownerId: firstBranchUser.id
        }
      });

      await prisma.stockTransaction.create({
        data: {
          type: 'INBOUND',
          quantity: p.qty,
          note: 'ยอดยกมา (ยอดเริ่มต้น)',
          productId: product.id,
          ownerId: firstBranchUser.id
        }
      });
    }
  }

  // --- Seed Evacuees Data ---
  console.log('Seeding evacuees data (demo)...');
  const existingEvacuees = await prisma.evacuee.count({ where: { branchLocationId: firstBranchLocation.id } });
  
  if (existingEvacuees === 0) {
    const evacueesData = [
      { name: 'สมชาย ใจดี', basicInfo: 'บาดเจ็บที่ขาเล็กน้อย ต้องการทำแผล', status: 'IN_SHELTER' },
      { name: 'มานี รักเรียน', basicInfo: 'เด็กเล็ก อายุ 5 ขวบ ต้องการนมและเสื้อผ้า', status: 'IN_SHELTER' },
      { name: 'สมปอง ทองดี', basicInfo: 'ผู้สูงอายุ มีโรคประจำตัวความดันโลหิตสูง', status: 'IN_SHELTER' },
      { name: 'อำนาจ ชาญชัย', basicInfo: 'แพ้อาหารทะเล', status: 'IN_SHELTER' },
      { name: 'สมหญิง รักชาติ', basicInfo: 'ปกติ', status: 'IN_SHELTER' },
      { name: 'บุญมี ศรีสุข', basicInfo: 'ต้องการยารักษาโรคเบาหวาน', status: 'IN_SHELTER' },
      { name: 'วิชัย ใจสู้', basicInfo: 'ปกติ', status: 'CHECKED_OUT' },
      { name: 'มาลัย ดวงดาว', basicInfo: 'มีโรคหอบหืด', status: 'CHECKED_OUT' },
      { name: 'สมศักดิ์ รักไทย', basicInfo: 'ปกติ', status: 'CHECKED_OUT' },
    ];

    for (const [index, e] of evacueesData.entries()) {
      const registrationCode = `EV-DEMO${index.toString().padStart(3, '0')}`;
      await prisma.evacuee.create({
        data: {
          registrationCode,
          name: e.name,
          basicInfo: e.basicInfo,
          status: e.status as 'IN_SHELTER' | 'CHECKED_OUT',
          branchLocationId: firstBranchLocation.id,
          checkInAt: new Date(Date.now() - Math.floor(Math.random() * (7 * 24 * 60 * 60 * 1000))),
          checkOutAt: e.status === 'CHECKED_OUT' ? new Date() : null,
        }
      });
    }
  }

  console.log('Demo data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
