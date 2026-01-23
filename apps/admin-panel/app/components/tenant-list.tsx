'use client'

import { useState, useEffect } from 'react'
import { Tenant, tenantService } from '@/lib/tenant-service'

export function TenantList() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await tenantService.getTenants()
      setTenants(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tenants')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return

    try {
      await tenantService.deleteTenant(id)
      setTenants(tenants.filter(t => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tenant')
    }
  }

  if (loading) {
    return <div className="text-gray-400">Loading tenants...</div>
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-700 text-red-100 p-4 rounded-lg">
        Error: {error}
      </div>
    )
  }

  if (tenants.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No tenants found</p>
        <p className="text-gray-500 text-sm mt-2">Create your first tenant to get started</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-3 px-4 text-sm font-semibold text-gray-300">Name</th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-300">Email</th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-300">Status</th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-300">Created</th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => (
            <tr key={tenant.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
              <td className="py-3 px-4">{tenant.name}</td>
              <td className="py-3 px-4 text-gray-400">{tenant.email || '-'}</td>
              <td className="py-3 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  tenant.status === 'active' ? 'bg-green-900 text-green-100' :
                  tenant.status === 'suspended' ? 'bg-yellow-900 text-yellow-100' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {tenant.status || 'active'}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-400 text-sm">
                {new Date(tenant.createdAt).toLocaleDateString()}
              </td>
              <td className="py-3 px-4">
                <button 
                  onClick={() => handleDelete(tenant.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tenants.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No tenants found. Create your first tenant to get started.
        </div>
      )}
    </div>
  )
}
