#!/usr/bin/env python3

file_path = "/var/www/autodealercloud/packages/database/prisma/schema.prisma"

with open(file_path, "r") as f:
    content = f.read()

# Find the Tenant model and add tempPassword field  
old_tenant = """  publisherUrl  String?  // URL where published pages will appear
  createdAt     DateTime @default(now())"""

new_tenant = """  publisherUrl  String?  // URL where published pages will appear
  tempPassword  String?  // Temporary password for initial login
  createdAt     DateTime @default(now())"""

if old_tenant in content:
    content = content.replace(old_tenant, new_tenant)
    
    with open(file_path, "w") as f:
        f.write(content)
    
    print("✓ Added tempPassword field to Tenant model")
else:
    print("✗ Could not find publisherUrl field in Tenant model")
