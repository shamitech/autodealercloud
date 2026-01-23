'use client'

import { useState, useEffect } from 'react'
import { CustomDomain, domainService, AuthDomain, PublishDomain } from '@/lib/domain-service'
import { tenantService, Tenant } from '@/lib/tenant-service'

export function DomainManagement() {
  const [customDomains, setCustomDomains] = useState<CustomDomain[]>([])
  const [authDomains, setAuthDomains] = useState<AuthDomain[]>([])
  const [publishDomains, setPublishDomains] = useState<PublishDomain[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'custom' | 'auth' | 'publish'>('custom')
  const [newDomain, setNewDomain] = useState('')
  const [selectedTenant, setSelectedTenant] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [custom, auth, publish, tenantList] = await Promise.all([
        domainService.getCustomDomains(),
        domainService.getAuthDomains(),
        domainService.getPublishDomains(),
        tenantService.getTenants(),
      ])
      setCustomDomains(custom)
      setAuthDomains(auth)
      setPublishDomains(publish)
      setTenants(tenantList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load domains')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDomain || !selectedTenant) return

    try {
      const domain = await domainService.createCustomDomain(selectedTenant, newDomain)
      setCustomDomains([...customDomains, domain])
      setNewDomain('')
      setSelectedTenant('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add domain')
    }
  }

  const handleDeleteCustomDomain = async (id: string) => {
    if (!confirm('Delete this domain?')) return
    try {
      await domainService.deleteCustomDomain(id)
      setCustomDomains(customDomains.filter(d => d.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete domain')
    }
  }

  if (loading) return <div className="text-gray-400">Loading domains...</div>

  return (
    <div>
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="flex gap-4 mb-8 border-b border-gray-700">
        {(['custom', 'auth', 'publish'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab === 'custom' ? 'Custom Domains' : tab === 'auth' ? 'Auth Domains' : 'Publish Domains'}
          </button>
        ))}
      </div>

      {activeTab === 'custom' && (
        <div>
          <form onSubmit={handleAddCustomDomain} className="bg-gray-800 p-6 rounded-lg mb-6 border border-gray-700">
            <h3 className="text-lg font-bold mb-4">Add Custom Domain</h3>
            <div className="flex gap-4">
              <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="">Select tenant...</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-medium"
              >
                Add
              </button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-sm font-semibold text-gray-300">Domain</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-300">Tenant</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-300">Status</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-300">SSL</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customDomains.map(d => (
                  <tr key={d.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                    <td className="py-3 px-4 font-mono">{d.domain}</td>
                    <td className="py-3 px-4 text-gray-400">{d.tenantId.substring(0, 8)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        d.verified ? 'bg-green-900 text-green-100' : 'bg-yellow-900 text-yellow-100'
                      }`}>
                        {d.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        d.sslEnabled ? 'bg-green-900 text-green-100' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {d.sslEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteCustomDomain(d.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {customDomains.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No custom domains configured yet.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'auth' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-sm font-semibold text-gray-300">Domain</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300">Created</th>
              </tr>
            </thead>
            <tbody>
              {authDomains.map(d => (
                <tr key={d.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                  <td className="py-3 px-4 font-mono">{d.domain}</td>
                  <td className="py-3 px-4 text-gray-400 text-sm">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {authDomains.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No auth domains configured yet.
            </div>
          )}
        </div>
      )}

      {activeTab === 'publish' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-sm font-semibold text-gray-300">Domain</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-300">Created</th>
              </tr>
            </thead>
            <tbody>
              {publishDomains.map(d => (
                <tr key={d.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                  <td className="py-3 px-4 font-mono">{d.domain}</td>
                  <td className="py-3 px-4 text-gray-400 text-sm">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {publishDomains.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No publish domains configured yet.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
