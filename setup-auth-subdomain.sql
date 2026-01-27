-- Check if tenant with cmsSubdomain jared-auto-auth exists
SELECT id, name, "cmsSubdomain" FROM "Tenant" WHERE "cmsSubdomain"='jared-auto-auth';

-- If not exists, update the existing tenant to have this subdomain as an alias
-- Or create the config for the existing jared-auto tenant
UPDATE "Tenant" SET "cmsSubdomain"='jared-auto-auth' WHERE id='cmkrlvad00000pbsy5fuauy5o';

-- Verify
SELECT id, name, "cmsSubdomain", "publisherUrl" FROM "Tenant" WHERE id='cmkrlvad00000pbsy5fuauy5o';
