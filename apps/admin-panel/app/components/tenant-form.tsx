'use client'

import { useState } from 'react'
import { Tenant, tenantService } from '@/lib/tenant-service'

interface TenantFormProps {
  onSuccess: (tenant: Tenant) => void
  onCancel: () => void
}

export function TenantForm({ onSuccess, onCancel }: TenantFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    slug: '',
    plan: 'basic',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      const tenant = await tenantService.createTenant(formData)
      onSuccess(tenant)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tenant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 className="text-xl font-bold mb-4">Create New Tenant</h3>
      
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Tenant Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="e.g., Acme Corporation"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Slug
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            placeholder="acme-corp"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Plan
          </label>
          <select
            name="plan"
            value={formData.plan}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 rounded transition"
          >
            {loading ? 'Creating...' : 'Create Tenant'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 rounded transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
