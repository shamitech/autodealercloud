'use client'

import { useAuthStore } from '@/lib/store'

export default function SettingsPage() {
  const { tenant } = useAuthStore()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tenant Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant Name
              </label>
              <input
                type="text"
                defaultValue={tenant?.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                defaultValue={tenant?.slug}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Custom Domains</h2>
          <p className="text-gray-600 mb-4">Manage your custom domains coming soon</p>
        </div>
      </div>
    </div>
  )
}
