'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PreviewAccess {
  id: string
  pageVersionId: string
  grantedToEmail: string
  accessToken: string
  expiresAt: string
  createdAt: string
  usedAt?: string
}

interface PageVersion {
  id: string
  version: number
  pageId: string
  pageTitle?: string
  accesses: PreviewAccess[]
}

export default function PreviewAccessPage() {
  const [pageVersions, setPageVersions] = useState<PageVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [showGrantForm, setShowGrantForm] = useState<string | null>(null)
  const [grantEmail, setGrantEmail] = useState('')
  const [expiryDays, setExpiryDays] = useState(7)

  useEffect(() => {
    fetchPageVersions()
  }, [])

  const fetchPageVersions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/preview-access', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setPageVersions(data.data || [])
    } catch (error) {
      console.error('Failed to fetch preview accesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGrantAccess = async (pageVersionId: string) => {
    if (!grantEmail) {
      alert('Please enter an email address')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/preview-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pageVersionId,
          grantedToEmail: grantEmail,
          expiryDays,
        }),
      })
      const data = await response.json()
      if (data.success) {
        alert(`Access granted to ${grantEmail}! Share this link with them.`)
        setShowGrantForm(null)
        setGrantEmail('')
        setExpiryDays(7)
        fetchPageVersions()
      }
    } catch (error) {
      console.error('Failed to grant access:', error)
    }
  }

  const handleRevokeAccess = async (accessId: string) => {
    if (confirm('Revoke this access?')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/v1/preview-access/${accessId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (data.success) {
          fetchPageVersions()
        }
      } catch (error) {
        console.error('Failed to revoke access:', error)
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const getPreviewUrl = (accessToken: string) => {
    return `${window.location.origin}/preview?token=${accessToken}`
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/admin" className="text-blue-600 hover:underline">
          ← Back to Admin
        </Link>
        <h1 className="text-3xl font-bold mt-2">Preview Access Control</h1>
        <p className="text-gray-600">Manage who can access page version previews</p>
      </div>

      <div className="space-y-6">
        {pageVersions.length > 0 ? (
          pageVersions.map((version) => (
            <div key={version.id} className="bg-white rounded-lg border overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
                <h3 className="font-bold text-lg">{version.pageTitle || 'Untitled Page'}</h3>
                <p className="text-sm text-gray-600">Version {version.version}</p>
              </div>

              <div className="p-4">
                <div className="mb-4 flex justify-between items-center">
                  <p className="font-medium">
                    {version.accesses.length} {version.accesses.length === 1 ? 'access' : 'accesses'}
                  </p>
                  <button
                    onClick={() => setShowGrantForm(showGrantForm === version.id ? null : version.id)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {showGrantForm === version.id ? 'Cancel' : 'Grant Access'}
                  </button>
                </div>

                {showGrantForm === version.id && (
                  <div className="bg-blue-50 rounded p-4 mb-4 border border-blue-200">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Email Address</label>
                        <input
                          type="email"
                          value={grantEmail}
                          onChange={(e) => setGrantEmail(e.target.value)}
                          placeholder="user@example.com"
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Expiry (days)</label>
                        <input
                          type="number"
                          value={expiryDays}
                          onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                          min="1"
                          max="365"
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <button
                        onClick={() => handleGrantAccess(version.id)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Grant Access
                      </button>
                    </div>
                  </div>
                )}

                {version.accesses.length > 0 ? (
                  <div className="space-y-2">
                    {version.accesses.map((access) => (
                      <div key={access.id} className="bg-gray-50 rounded p-3 border flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{access.grantedToEmail}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Expires: {new Date(access.expiresAt).toLocaleDateString()}
                          </p>
                          {access.usedAt && (
                            <p className="text-xs text-gray-500">
                              Last used: {new Date(access.usedAt).toLocaleDateString()}
                            </p>
                          )}
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Preview URL:</p>
                            <div className="flex gap-2">
                              <code className="bg-white px-2 py-1 rounded border text-xs flex-1 overflow-x-auto">
                                {getPreviewUrl(access.accessToken)}
                              </code>
                              <button
                                onClick={() => copyToClipboard(getPreviewUrl(access.accessToken))}
                                className="text-blue-600 hover:text-blue-700 text-xs whitespace-nowrap"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevokeAccess(access.id)}
                          className="text-red-600 hover:text-red-700 text-xs ml-4"
                        >
                          Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No preview access granted</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No page versions available</p>
          </div>
        )}
      </div>
    </div>
  )
}
