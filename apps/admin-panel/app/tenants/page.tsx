'use client'

import { useState } from 'react'
import { TenantForm } from '@/app/components/tenant-form'
import { TenantList } from '@/app/components/tenant-list'
import { Tenant } from '@/lib/tenant-service'

export default function TenantsPage() {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleTenantCreated = (tenant: Tenant) => {
    setShowForm(false)
    setRefreshKey(prev => prev + 1)
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Tenant Management</h1>
            <p className="text-gray-400">Create and manage tenant accounts</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition"
          >
            {showForm ? 'Cancel' : '+ New Tenant'}
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <TenantForm
              onSuccess={handleTenantCreated}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">All Tenants</h2>
            <TenantList key={refreshKey} />
          </div>
        </div>
      </div>
    </main>
  )
}
