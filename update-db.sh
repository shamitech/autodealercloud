#!/bin/bash
PGPASSWORD='autodealercloud_pass_2026' psql -h localhost -U autodealercloud -d autodealercloud << SQL
UPDATE "Tenant" SET "cmsSubdomain"='jared-auto', "publisherUrl"='https://jaredshami.com' WHERE id='cmkrlvad00000pbsy5fuauy5o';
SELECT id, name, "cmsSubdomain", "publisherUrl" FROM "Tenant" WHERE id='cmkrlvad00000pbsy5fuauy5o';
SQL
