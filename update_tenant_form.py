#!/usr/bin/env python3

file_path = "/var/www/autodealercloud/apps/admin-panel/app/components/tenant-form.tsx"

with open(file_path, "r") as f:
    content = f.read()

# Update handleSubmit to show tempPassword in alert
old_handle = """      const tenant = await tenantService.createTenant(formData)
                                                           onSuccess(tenant)"""

new_handle = """      const tenant = await tenantService.createTenant(formData)
      if (tenant.tempPassword) {
        alert(`Tenant created successfully!\\n\\nTemporary Password: ${tenant.tempPassword}\\n\\nShare this password with the tenant. They can change it after logging in.`)
      }
      onSuccess(tenant)"""

if old_handle in content:
    content = content.replace(old_handle, new_handle)
    
    with open(file_path, "w") as f:
        f.write(content)
    
    print("✓ Updated tenant form to display tempPassword")
else:
    print("✗ Could not find handleSubmit code")
