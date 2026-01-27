file_path = "/var/www/autodealercloud/apps/admin-panel/app/tenants/[id]/settings/page.tsx"

with open(file_path, "r") as f:
    content = f.read()

# Add tempPassword display section before Save Button
old_save_button = """          {/* Save Button */}
          <button
            onClick={handleSaveSettings}"""

new_section = """          {/* Temporary Password */}
          {tenant.tempPassword && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Initial Access Password</h2>
              <p className="text-gray-300 mb-4">Share this temporary password with the tenant:</p>
              <div className="bg-gray-800 rounded px-4 py-3 mb-4 flex items-center justify-between">
                <span className="font-mono text-lg text-green-400">{tenant.tempPassword}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(tenant.tempPassword)
                    alert("Password copied to clipboard!")
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                >
                  Copy
                </button>
              </div>
              <p className="text-sm text-gray-400">Tenant should log in at: https://{cmsSubdomain || tenant.slug}.autodealercloud.com/login</p>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}"""

if old_save_button in content:
    content = content.replace(old_save_button, new_section)
    
    with open(file_path, "w") as f:
        f.write(content)
    
    print("✓ Added tempPassword display section to settings page")
else:
    print("✗ Could not find Save Button section")
