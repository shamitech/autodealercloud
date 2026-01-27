ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "cmsSubdomain" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "publisherUrl" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Tenant_cmsSubdomain_key" ON "Tenant"("cmsSubdomain");

UPDATE "Tenant" SET "cmsSubdomain"='jared-auto', "publisherUrl"='https://jaredshami.com' WHERE id='cmkrlvad00000pbsy5fuauy5o';

SELECT id, name, "cmsSubdomain", "publisherUrl" FROM "Tenant" WHERE id='cmkrlvad00000pbsy5fuauy5o';
