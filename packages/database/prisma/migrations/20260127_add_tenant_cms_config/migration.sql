-- AddTenantCmsConfig
ALTER TABLE "Tenant" ADD COLUMN "cmsSubdomain" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "publisherUrl" TEXT;
CREATE UNIQUE INDEX "Tenant_cmsSubdomain_key" ON "Tenant"("cmsSubdomain");
