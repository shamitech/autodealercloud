#!/usr/bin/env python3

file_path = "/var/www/autodealercloud/apps/api/src/index.ts"

with open(file_path, "r") as f:
    content = f.read()

# Find the tenant creation return statement and update it to store tempPassword
old_code = """    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8) + '!A0'
    
    return { success: true, data: tenant, tempPassword }"""

new_code = """    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8) + '!A0'
    
    // Update tenant with tempPassword
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { tempPassword },
    })
    
    return { success: true, data: updatedTenant, tempPassword }"""

if old_code in content:
    content = content.replace(old_code, new_code)
    
    with open(file_path, "w") as f:
        f.write(content)
    
    print("✓ Updated API to store tempPassword in database")
else:
    print("✗ Could not find tenant return statement")
