const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const tenants = await prisma.tenant.findMany({ 
    select: { id: true, slug: true, tempPassword: true } 
  });
  console.log('Tenants:');
  tenants.forEach(t => {
    console.log(`  ${t.slug}: password = ${t.tempPassword ? 'SET' : 'NOT SET'}`);
  });
  await prisma.$disconnect();
})();
