-- Add missing columns to CustomDomain if they don't exist
ALTER TABLE "CustomDomain" ADD COLUMN IF NOT EXISTS "deployed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CustomDomain" ADD COLUMN IF NOT EXISTS "dnsVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CustomDomain" ADD COLUMN IF NOT EXISTS "dnsRecord" TEXT;

-- Drop the old verified column if it exists
ALTER TABLE "CustomDomain" DROP COLUMN IF EXISTS "verified";

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS "CustomDomain_deployed_idx" ON "CustomDomain" ("deployed");
CREATE INDEX IF NOT EXISTS "CustomDomain_dnsVerified_idx" ON "CustomDomain" ("dnsVerified");
