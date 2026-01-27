#!/bin/bash
# Check if columns exist
PGPASSWORD='S3cureDev' psql -h localhost -U postgres -d autodealercloud -c "SELECT column_name FROM information_schema.columns WHERE table_name='Tenant' AND column_name IN ('cmsSubdomain', 'publisherUrl');"
