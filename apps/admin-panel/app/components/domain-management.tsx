'use client'

import { useState, useEffect } from 'react'
import { CustomDomain, domainService, AuthDomain, PublishDomain } from '@/lib/domain-service'
import { tenantService, Tenant } from '@/lib/tenant-service'
import { ConfigPreviewModal } from './config-preview-modal'

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
  const [showPreview, setShowPreview] = useState(false)
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null)
  const [deploying, setDeploying] = useState(false)
  const [verifyingDns, setVerifyingDns] = useState<string | null>(null)

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
      setError(null)
      const domain = await domainService.createCustomDomain(selectedTenant, newDomain)
      console.log('Domain created successfully:', domain)
      
      if (domain && domain.id) {
        // Reload all domains to ensure data is fresh and consistent
        await loadData()
        setNewDomain('')
        setSelectedTenant('')
      } else {
        console.error('Invalid domain response:', domain)
        setError('Domain was created but response was invalid. Refreshing data...')
        await loadData()
      }
    } catch (err) {
      console.error('Error adding domain:', err)
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

  const handlePreviewDeploy = (id: string) => {
    setSelectedDomainId(id)
    setShowPreview(true)
  }

  const handleDeploy = async (id: string) => {
    if (!confirm('Deploy this domain? This will create Nginx configuration and provision SSL certificate.')) return
    try {
      setDeploying(true)
      const result = await domainService.deployCustomDomain(id)
      if (result.success) {
        setShowPreview(false)
        setSelectedDomainId(null)
        await loadData()
        setError(null)
      } else {
        setError(result.error || 'Deployment failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deploy domain')
    } finally {
      setDeploying(false)
    }
  }

  const handleRedeploy = async (id: string) => {
    if (!confirm('Redeploy this domain? This will update the Nginx configuration without reprovisioning SSL.')) return
    try {
      setDeploying(true)
      const result = await domainService.redeployCustomDomain(id)
      if (result.success) {
        setSelectedDomainId(null)
        await loadData()
        setError(null)
      } else {
        setError(result.error || 'Redeployment failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeploy domain')
    } finally {
      setDeploying(false)
    }
  }

  const handleVerifyDns = async (id: string) => {
    try {
      setVerifyingDns(id)
      const result = await domainService.verifyDnsRecord(id)
      if (result.success) {
        await loadData()
        setError(null)
      } else {
        setError(result.error || 'DNS verification failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify DNS')
    } finally {
      setVerifyingDns(null)
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
                  <th className="py-3 px-4 text-sm font-semibold text-gray-300">Deployment</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-300">DNS</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customDomains?.filter(d => d && d.id).map(d => (
                  <tr key={d?.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                    <td className="py-3 px-4 font-mono">{d?.domain || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-400">{d?.tenantId?.substring(0, 8) || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        d?.deployed ? 'bg-green-900 text-green-100' : 'bg-yellow-900 text-yellow-100'
                      }`}>
                        {d?.deployed ? 'Deployed' : 'Not Deployed'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        d?.dnsVerified ? 'bg-green-900 text-green-100' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {d?.dnsVerified ? 'DNS Verified' : 'DNS Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {d && !d.deployed && (
                          <button
                            onClick={() => handlePreviewDeploy(d.id)}
                            disabled={deploying}
                            className="text-blue-400 hover:text-blue-300 text-sm disabled:opacity-50"
                          >
                            {deploying && selectedDomainId === d.id ? 'Deploying...' : 'Deploy'}
                          </button>
                        )}
                        {d && d.deployed && (
                          <button
                            onClick={() => handleRedeploy(d.id)}
                            disabled={deploying}
                            className="text-green-400 hover:text-green-300 text-sm disabled:opacity-50"
                          >
                            {deploying && selectedDomainId === d.id ? 'Redeploying...' : 'Redeploy'}
                          </button>
                        )}
                        {d && (
                          <button
                            onClick={() => handleDeleteCustomDomain(d.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
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

          {customDomains && customDomains.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">DNS Verification</h3>
              {customDomains.filter(d => d && d.id).map(d => (
                <div key={d?.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-mono text-blue-400 text-lg">{d?.domain || 'N/A'}</p>
                      <p className="text-sm text-gray-400 mt-1">Tenant: {d?.tenantId?.substring(0, 8) || 'N/A'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      d?.dnsVerified ? 'bg-green-900 text-green-100' : 'bg-yellow-900 text-yellow-100'
                    }`}>
                      {d?.dnsVerified ? '✓ DNS Verified' : 'Pending DNS'}
                    </span>
                  </div>

                  {d && !d.dnsVerified && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-300">
                        Add this DNS record to your domain registrar to verify ownership:
                      </p>
                      <div className="bg-gray-900 border border-gray-600 rounded p-3">
                        <p className="text-xs text-gray-400 mb-2">Record Type: TXT</p>
                        <p className="text-xs text-gray-400 mb-2">Name: _autodealercloud.{d?.domain}</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs text-gray-300 bg-gray-800 p-2 rounded font-mono break-all">
                            {d?.dnsRecord || 'v=autodealercloud; verification-pending'}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`_autodealercloud.${d?.domain}`)
                            }}
                            className="text-blue-400 hover:text-blue-300 text-xs whitespace-nowrap"
                          >
                            Copy Name
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => d && handleVerifyDns(d.id)}
                        disabled={verifyingDns === d?.id}
                        className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium text-sm disabled:opacity-50"
                      >
                        {verifyingDns === d?.id ? 'Verifying...' : 'Verify DNS Record'}
                      </button>
                    </div>
                  )}

                  {d?.dnsVerified && (
                    <div className="bg-green-900 border border-green-700 rounded p-3">
                      <p className="text-green-100 text-sm">✓ DNS record verified successfully!</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
              {authDomains?.filter(d => d && d.id).map(d => (
                <tr key={d?.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                  <td className="py-3 px-4 font-mono">{d?.domain || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-400 text-sm">
                    {d?.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!authDomains || authDomains.length === 0 && (
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
              {publishDomains?.filter(d => d && d.id).map(d => (
                <tr key={d?.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                  <td className="py-3 px-4 font-mono">{d?.domain || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-400 text-sm">
                    {d?.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!publishDomains || publishDomains.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No publish domains configured yet.
            </div>
          )}
        </div>
      )}

      {showPreview && selectedDomainId && (
        <ConfigPreviewModal
          domainId={selectedDomainId}
          onClose={() => {
            setShowPreview(false)
            setSelectedDomainId(null)
          }}
          onDeploy={() => handleDeploy(selectedDomainId)}
          isDeploying={deploying}
        />
      )}
    </div>
  )
}
