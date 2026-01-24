-- CreateTable "CustomDomain"
CREATE TABLE IF NOT EXISTS "public"."CustomDomain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'www',
    "ssl" BOOLEAN NOT NULL DEFAULT false,
    "deployed" BOOLEAN NOT NULL DEFAULT false,
    "dnsVerified" BOOLEAN NOT NULL DEFAULT false,
    "dnsRecord" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,
    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
) TABLESPACE pg_default;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CustomDomain_domain_key" ON "public"."CustomDomain" ("domain" ASC) TABLESPACE pg_default;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CustomDomain_tenantId_idx" ON "public"."CustomDomain" ("tenantId" ASC) TABLESPACE pg_default;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CustomDomain_deployed_idx" ON "public"."CustomDomain" ("deployed" ASC) TABLESPACE pg_default;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CustomDomain_dnsVerified_idx" ON "public"."CustomDomain" ("dnsVerified" ASC) TABLESPACE pg_default;

-- AddForeignKey
ALTER TABLE "public"."CustomDomain" ADD CONSTRAINT "CustomDomain_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
