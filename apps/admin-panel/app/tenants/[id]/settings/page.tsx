'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient as api } from '@/lib/api-client'

export default function TenantSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const tenantId = params.id as string
  
  const [tenant, setTenant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cmsSubdomain, setCmsSubdomain] = useState('')
  const [publisherUrl, setPublisherUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadTenant()
  }, [tenantId])

  const loadTenant = async () => {
    try {
      const response: any = await api.get(`/tenants/${tenantId}`)
      if (response.success) {
        setTenant(response.data)
        setCmsSubdomain(response.data.cmsSubdomain || response.data.slug)
        setPublisherUrl(response.data.publisherUrl || '')
      }
    } catch (error: any) {
      console.error('Error loading tenant:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!cmsSubdomain.match(/^[a-z0-9-]+$/)) {
      alert('Subdomain must contain only lowercase letters, numbers, and hyphens')
      return
    }

    setSaving(true)
    try {
      const response: any = await api.put(`/tenants/${tenantId}`, {
        ...tenant,
        cmsSubdomain,
        publisherUrl,
      })
      
      if (response.success) {
        setTenant(response.data)
        alert('Settings saved successfully!')
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-white">Loading...</div>
  }

  if (!tenant) {
    return <div className="p-8 text-white">Tenant not found</div>
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-400 hover:text-blue-300 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold mb-2">{tenant.name}</h1>
          <p className="text-gray-400">Configure CMS subdomain and publisher environment</p>
        </div>

        <div className="space-y-8">
          {/* CMS Subdomain Configuration */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-4">CMS Subdomain</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Custom CMS URL
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">https://</span>
                  <input
                    type="text"
                    value={cmsSubdomain}
                    onChange={(e) => setCmsSubdomain(e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500"
                    placeholder="my-dealer"
                  />
                  <span className="text-gray-400">.autodealercloud.com</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  This will be: https://{cmsSubdomain}.autodealercloud.com
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Status
                </label>
                <div className="bg-gray-700 rounded px-4 py-2">
                  {cmsSubdomain ? (
                    <p className="text-green-400">✓ Configured: https://{cmsSubdomain}.autodealercloud.com</p>
                  ) : (
                    <p className="text-yellow-400">⚠ Not configured</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Publisher Environment */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-4">Publisher Environment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Publisher URL / Domain
                </label>
                <input
                  type="url"
                  value={publisherUrl}
                  onChange={(e) => setPublisherUrl(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500"
                  placeholder="e.g., https://mydealer.com or https://dealer.mysite.com"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Where the tenant's published pages will appear
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Access Link
                </label>
                <div className="bg-gray-700 rounded px-4 py-2">
                  {publisherUrl ? (
                    <a 
                      href={publisherUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 break-all"
                    >
                      {publisherUrl} →
                    </a>
                  ) : (
                    <p className="text-gray-500">Not configured</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* API Configuration Info */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-4">API Configuration</h2>
            <div className="space-y-2 text-sm text-gray-400 font-mono">
              <p>Tenant ID: <span className="text-white">{tenant.id}</span></p>
              <p>Slug: <span className="text-white">{tenant.slug}</span></p>
              <p>Status: <span className="text-white">{tenant.status}</span></p>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-medium transition text-white"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </main>
  )
}
