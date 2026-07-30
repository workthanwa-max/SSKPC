# 🛡️ AEGIS Command - Shelter Management System

ระบบบัญชาการและจัดการศูนย์พักพิงอัจฉริยะ (AEGIS Command) พัฒนาด้วยสถาปัตยกรรม 3-Tier Enterprise-grade (React Frontend, Node.js Backend, PostgreSQL Database) รองรับการจัดการทรัพยากรบุคคล การจัดการคลังปัจจัยยังชีพ (Stock) การวิเคราะห์ข้อมูลความอยู่รอด และระบบรักษาความปลอดภัยแบบ Zero-Trust

## 🚀 Tech Stack

**Frontend**
- React 18 (Vite)
- Tailwind CSS & shadcn/ui
- Zustand (State Management)
- React Router DOM
- React Map GL (Mapbox)

**Backend**
- Node.js & Express.js
- Prisma ORM
- PostgreSQL & PostGIS
- Redis (Rate Limiting & Token Blacklist)
- Zod (Schema Validation)

**Security (Zero-Trust Model)**
- Dual-Token JWT (HTTPOnly Refresh Token)
- Redis Token Revocation Blacklist
- Distributed Rate Limiting
- Immutable Audit Logs (Tracking all sensitive actions)

---

## 🛠️ การติดตั้งและรันระบบ (Installation)

### 1. Requirements
- Node.js v20+
- Docker & Docker Compose (สำหรับ Database และ Redis)
- npm หรือ yarn

### 2. โคลนโปรเจกต์
```bash
git clone <repository_url>
cd App
```

### 3. ตั้งค่า Backend
```bash
cd node-backend

# 1. ติดตั้ง Dependencies
npm install

# 2. คัดลอกไฟล์ Environment
cp .env.example .env

# 3. สตาร์ท Database และ Redis ผ่าน Docker
docker-compose up -d

# 4. อัปเดต Prisma Schema ไปยัง Database
npm run db:push

# 5. รันข้อมูลจำลองลง Database (Seed)
# เลือกหนึ่งในคำสั่งด้านล่าง:
npm run seed:users   # สร้างเฉพาะบัญชีพื้นฐานสำหรับเข้าสู่ระบบ 3 สิทธิ์ (แนะนำสำหรับการเริ่ม Dev ใหม่)
# หรือ
npm run seed:demo    # สร้างข้อมูลจำลองเต็มรูปแบบ (ผู้พักพิง, สิ่งของ, สาขา) สำหรับพรีเซนต์งาน

# 6. รัน Backend Server
npm run dev
```

### 4. ตั้งค่า Frontend
เปิด Terminal ใหม่อีกหน้าต่าง:
```bash
cd react-frontend

# 1. ติดตั้ง Dependencies
npm install

# 2. คัดลอกไฟล์ Environment
cp .env.example .env

# 3. รัน Frontend Server
npm run dev
```
เข้าไปที่ `http://localhost:5173` เพื่อใช้งานระบบ

---

## 🔑 บัญชีทดสอบระบบ (Seed Accounts)

หากคุณรัน `npm run seed:users` หรือ `npm run seed:demo` แล้ว สามารถล็อกอินด้วยบัญชีต่อไปนี้ (รหัสผ่านเหมือนกันทั้งหมด):

- **รหัสผ่าน:** `password123`

| บทบาท | อีเมล (Email) | คำอธิบาย |
| :--- | :--- | :--- |
| **ADMIN** | `admin@test.com` | ผู้บัญชาการสูงสุด เข้าถึงได้ทุกฟังก์ชันและหน้า Security Audit Log |
| **CENTRAL** | `central@test.com` | ศูนย์บัญชาการกลาง (คลังส่วนกลาง, ตรวจสอบทุกสาขา) |
| **BRANCH** | `branch@test.com` | หัวหน้าศูนย์พักพิงย่อย (ดูแลผู้พักพิง, สต๊อกภายในสาขาตัวเอง) |

---

## 📁 โครงสร้างโปรเจกต์แบบ Monorepo

```text
/App
├── react-frontend/        # UI layer (React + Vite + shadcn/ui)
│   ├── src/
│   │   ├── components/    # คอมโพเนนต์ UI พื้นฐาน (Button, Table, ฯลฯ)
│   │   ├── pages/         # หน้าเว็บตามโมดูลและบทบาท (admin, central, branch)
│   │   ├── services/      # API Services สำหรับเรียกข้อมูล (แยกตามโมดูล)
│   │   ├── store/         # Zustand global state (Auth)
│   │   └── router/        # React Router configuration
├── node-backend/          # API & Logic layer (Express + Prisma)
│   ├── prisma/            # Schema ของฐานข้อมูลและ Seed files
│   ├── src/
│   │   ├── modules/       # จัดกลุ่มโค้ดตาม Domain (auth, evacuees, stock ฯลฯ)
│   │   ├── infrastructure/# Database, Redis, Logger connection
│   │   └── shared/        # Middlewares (Rate limit, Auth), Utils
│   └── docker-compose.yml # การตั้งค่า Container สำหรับ DB/Redis
└── .gitignore             # Root gitignore สำหรับ Monorepo
```

## 🔒 Security Notes
โปรเจกต์นี้มีกลไกป้องกันการ Commit ความลับหลุดสู่สาธารณะผ่าน Git Hook (`pre-commit`) หากคุณเผลอเพิ่มไฟล์ `.env` หรือเขียนรหัสผ่านแบบ Hardcode ลงไป ระบบจะไม่อนุญาตให้ทำการ Commit
