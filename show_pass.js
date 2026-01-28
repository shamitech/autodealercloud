const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const tenant = await prisma.tenant.findUnique({ 
    where: { slug: 'testsite3' },
    select: { slug: true, tempPassword: true }
  });
  console.log('testsite3 password:', tenant.tempPassword);
  await prisma.$disconnect();
})();
