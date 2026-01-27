#!/bin/bash

# Fix for Tenant CMS 404 issue
# The tenant cmsSubdomain in the database needs to match the Nginx subdomain being accessed

# Update the Tenant table to set the correct cmsSubdomain
export PGPASSWORD="autodealercloud_pass_2026"

psql -h localhost -U autodealercloud autodealercloud << EOF
UPDATE "Tenant" SET "cmsSubdomain" = 'mountainvalleymotorsports' WHERE "slug" = 'mountainvalleymotorsports';
EOF

echo "Tenant cmsSubdomain updated successfully!"
echo "The tenant CMS page should now render correctly at https://mountainvalleymotorsports.autodealercloud.com/"
