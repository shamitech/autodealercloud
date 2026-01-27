#!/usr/bin/env python3

file_path = "/var/www/autodealercloud/apps/admin-panel/lib/tenant-service.ts"

with open(file_path, "r") as f:
    content = f.read()

# Update Tenant interface to include tempPassword
old_interface = """export interface Tenant {
  id: string
  name: string
  email?: string
  slug?: string
  plan?: string
  status?: 'active' | 'suspended' | 'cancelled'
  createdAt: string
  updatedAt?: string
}"""

new_interface = """export interface Tenant {
  id: string
  name: string
  email?: string
  slug?: string
  plan?: string
  status?: 'active' | 'suspended' | 'cancelled'
  tempPassword?: string
  createdAt: string
  updatedAt?: string
}"""

if old_interface in content:
    content = content.replace(old_interface, new_interface)
    
    with open(file_path, "w") as f:
        f.write(content)
    
    print("✓ Added tempPassword to Tenant interface")
else:
    print("✗ Could not find Tenant interface")
