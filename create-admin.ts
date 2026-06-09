import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const dbUrlLine = envContent.split('\n').find(line => line.startsWith('DATABASE_URL='));
if (dbUrlLine) {
  process.env.DATABASE_URL = dbUrlLine.substring(13).trim();
}


const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@hyperbox.com';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!admin) {
    console.log("Admin not found. Creating...");
    const hashedPassword = await bcryptjs.hash('admin123', 10);
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'ADMIN',
      }
    });
    console.log("Admin created successfully!");
  } else {
    console.log("Admin already exists!");
    const hashedPassword = await bcryptjs.hash('admin123', 10);
    admin = await prisma.user.update({
      where: { email: adminEmail },
      data: { password: hashedPassword }
    });
    console.log("Password reset to admin123");
  }

  console.log("===============================");
  console.log("Admin credentials:");
  console.log("Email:", admin.email);
  console.log("Password:", "admin123");
  console.log("===============================");
}

main().catch(console.error).finally(() => prisma.$disconnect());
