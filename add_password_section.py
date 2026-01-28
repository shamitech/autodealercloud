#!/usr/bin/env python3

file_path = '/var/www/autodealercloud/apps/admin-panel/app/tenants/[id]/settings/page.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Only add if not already present
if 'Initial Access Password' in content:
    print('✓ Password section already present')
else:
    password_block = '''          {/* Initial Access Password */}
          {tenant.tempPassword && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-2xl font-bold mb-4">Initial Access Password</h2>
              <div className="space-y-4">
                <div className="bg-gray-700 rounded px-4 py-3 flex items-center justify-between">
                  <span className="font-mono text-white">{tenant.tempPassword}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(tenant.tempPassword)}
                    className="ml-4 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-medium transition"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm text-gray-400">
                  Share this temporary password with the tenant to log in for the first time.
                </p>
              </div>
            </div>
          )}

'''
    
    api_marker = '          {/* API Configuration Info */}'
    if api_marker in content:
        content = content.replace(api_marker, password_block + api_marker)
        with open(file_path, 'w') as f:
            f.write(content)
        print('✓ Added password section')
    else:
        print('! Could not find API marker')
