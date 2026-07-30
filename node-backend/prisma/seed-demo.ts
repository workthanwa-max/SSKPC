import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Demo Data for Presentation...');
  
  const password = await bcrypt.hash('password123', 12);

  // Ensure base users exist
  const centralUser = await prisma.user.findUnique({ where: { email: 'central@test.com' } });
  const firstBranchUser = await prisma.user.findUnique({ where: { email: 'branch@test.com' } });

  if (!centralUser || !firstBranchUser) {
    console.error('Base users not found. Please run seed:users first.');
    return;
  }

  // --- Seed Branch Locations ---
  console.log('Seeding branch locations...');
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

  for (const b of borderBranches) {
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

    const existingLocation = await prisma.branchLocation.findUnique({
      where: { userId: branchUser.id },
    });

    if (!existingLocation) {
      const location = await prisma.branchLocation.create({
        data: {
          userId: branchUser.id,
          name: b.name,
          description: b.desc,
          latitude: b.lat,
          longitude: b.lng,
          capacity: Math.floor(Math.random() * 500) + 100, // Random capacity between 100 and 600
        },
      });

    }
  }

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

  // --- Seed Stock Data ---
  console.log('Seeding stock data...');
  const stockOwners = [centralUser.id, firstBranchUser.id];
  
  for (const ownerId of stockOwners) {
    const existingCategories = await prisma.stockCategory.findFirst({ where: { ownerId } });
    if (!existingCategories) {
      // 1. Create Categories
      const catFood = await prisma.stockCategory.create({
        data: { name: 'อาหารแห้ง', description: 'อาหารกึ่งสำเร็จรูปและอาหารกระป๋อง', ownerId }
      });
      const catWater = await prisma.stockCategory.create({
        data: { name: 'น้ำดื่ม', description: 'น้ำดื่มบรรจุขวด', ownerId }
      });
      const catMeds = await prisma.stockCategory.create({
        data: { name: 'ยารักษาโรค', description: 'ยาสามัญประจำบ้านและเวชภัณฑ์', ownerId }
      });

      // 2. Create Products
      const productsData = [
        { name: 'บะหมี่กึ่งสำเร็จรูป', unit: 'กล่อง', qty: 150, catId: catFood.id },
        { name: 'ปลากระป๋อง', unit: 'แพ็ค', qty: 200, catId: catFood.id },
        { name: 'น้ำดื่ม 600ml', unit: 'แพ็ค', qty: 500, catId: catWater.id },
        { name: 'พาราเซตามอล', unit: 'แผง', qty: 300, catId: catMeds.id },
        { name: 'ชุดทำแผล', unit: 'ชุด', qty: 50, catId: catMeds.id },
      ];

      for (const p of productsData) {
        const product = await prisma.stockProduct.create({
          data: {
            name: p.name,
            sku: `SKU-${Math.floor(Math.random() * 10000)}`,
            unit: p.unit,
            quantity: p.qty,
            categoryId: p.catId,
            ownerId
          }
        });

        // 3. Create Transactions (Initial Inbound)
        await prisma.stockTransaction.create({
          data: {
            type: 'INBOUND',
            quantity: p.qty,
            note: 'ยอดยกมา (ยอดเริ่มต้น)',
            productId: product.id,
            ownerId
          }
        });
      }
    }
  }

  // --- Seed Evacuees Data ---
  console.log('Seeding evacuees data...');
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
