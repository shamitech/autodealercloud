import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const tenant = await prisma.tenant.update({
    where: { id: 'cmkrlvad00000pbsy5fuauy5o' },
    data: { 
      cmsSubdomain: 'jared-auto', 
      publisherUrl: 'https://jaredshami.com' 
    }
  });
  console.log('✓ Updated tenant:', {
    id: tenant.id,
    name: tenant.name,
    cmsSubdomain: tenant.cmsSubdomain,
    publisherUrl: tenant.publisherUrl
  });
} catch (error) {
  console.error('✗ Error:', error.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
