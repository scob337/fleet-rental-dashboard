const fs = require('fs');
const path = require('path');
const dotenvPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(dotenvPath)) {
  const envContent = fs.readFileSync(dotenvPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const [key, ...rest] = line.split('=');
    if (!key || key.startsWith('#')) return;
    const value = rest.join('=');
    process.env[key.trim()] = value.trim();
  });
}
const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const total = await prisma.tripLog.count();
    const completed = await prisma.tripLog.count({ where: { status: 'COMPLETED' } });
    console.log('TOTAL', total);
    console.log('COMPLETED', completed);
    const sample = await prisma.tripLog.findMany({ take: 3, orderBy: { startDate: 'desc' } });
    console.log('SAMPLE', sample.map(t => ({id: t.id, status: t.status, startDate: t.startDate, vehicleId: t.vehicleId, driverId: t.driverId})));
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
