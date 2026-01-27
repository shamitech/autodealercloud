#!/usr/bin/env python3

file_path = "/var/www/autodealercloud/apps/api/src/index.ts"

with open(file_path, "r") as f:
    content = f.read()

# Find the POST /api/v1/tenants endpoint and add password generation
old_return = "    return { success: true, data: tenant }"
new_code = """    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8) + '!A0'
    
    return { success: true, data: tenant, tempPassword }"""

if old_return in content:
    content = content.replace(old_return, new_code, 1)  # Replace only the first occurrence (the POST endpoint)
    
    with open(file_path, "w") as f:
        f.write(content)
    
    print("✓ Added temporary password generation to tenant creation endpoint")
else:
    print("✗ Could not find the return statement")
