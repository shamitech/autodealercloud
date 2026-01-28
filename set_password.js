const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const tenant = await prisma.tenant.update({
    where: { slug: 'testaccount' },
    data: { tempPassword: 'TestPassword123!' },
  });
  console.log('Updated tenant:', tenant.slug, 'Password:', tenant.tempPassword);
  await prisma.$disconnect();
})();
