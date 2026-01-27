'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PageVersion {
  id: string
  version: number
  status: 'draft' | 'preview' | 'published'
  createdAt: string
  updatedAt: string
  createdBy?: string
  releaseNotes?: string
}

interface Page {
  id: string
  title: string
  slug: string
  versions: PageVersion[]
  published?: PageVersion
}

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedPage, setExpandedPage] = useState<string | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<PageVersion | null>(null)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/templates', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setPages(data.data || [])
    } catch (error) {
      console.error('Failed to fetch pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublishVersion = async (pageId: string, versionId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/pages/${pageId}/versions/${versionId}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'published' }),
      })
      const data = await response.json()
      if (data.success) {
        alert('Version published!')
        fetchPages()
      }
    } catch (error) {
      console.error('Failed to publish version:', error)
    }
  }

  const handleRollback = async (pageId: string, versionId: string) => {
    if (confirm('Are you sure you want to rollback to this version?')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/v1/pages/${pageId}/versions/rollback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ versionId }),
        })
        const data = await response.json()
        if (data.success) {
          alert('Rolled back successfully!')
          fetchPages()
        }
      } catch (error) {
        console.error('Failed to rollback:', error)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'preview':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/admin" className="text-blue-600 hover:underline">
          ← Back to Admin
        </Link>
        <h1 className="text-3xl font-bold mt-2">Page Versions</h1>
        <p className="text-gray-600">Manage page versions, previews, and publishing</p>
      </div>

      {pages.length > 0 ? (
        <div className="space-y-4">
          {pages.map((page) => (
            <div key={page.id} className="bg-white rounded-lg border">
              <button
                onClick={() => setExpandedPage(expandedPage === page.id ? null : page.id)}
                className="w-full p-4 flex justify-between items-center hover:bg-gray-50"
              >
                <div className="text-left">
                  <h3 className="font-bold text-lg">{page.title}</h3>
                  <p className="text-sm text-gray-600">/{page.slug}</p>
                </div>
                <div className="flex items-center gap-4">
                  {page.published && (
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      Published: v{page.published.version}
                    </span>
                  )}
                  <span className="text-gray-400">
                    {expandedPage === page.id ? '▼' : '▶'}
                  </span>
                </div>
              </button>

              {expandedPage === page.id && (
                <div className="border-t p-4 bg-gray-50">
                  <h4 className="font-bold mb-3">Version History</h4>
                  <div className="space-y-3">
                    {page.versions.length > 0 ? (
                      page.versions.map((version) => (
                        <div
                          key={version.id}
                          className="bg-white p-4 rounded border flex justify-between items-center"
                        >
                          <div>
                            <div className="flex items-center gap-3">
                              <p className="font-medium">Version {version.version}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(version.status)}`}>
                                {version.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(version.createdAt).toLocaleString()}
                            </p>
                            {version.releaseNotes && (
                              <p className="text-sm text-gray-500 mt-1">{version.releaseNotes}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {version.status === 'draft' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedVersion(version)
                                    setShowPreviewModal(true)
                                  }}
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                >
                                  Preview
                                </button>
                                <button
                                  onClick={() => handlePublishVersion(page.id, version.id)}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                >
                                  Publish
                                </button>
                              </>
                            )}
                            {version.status !== 'draft' && (
                              <button
                                onClick={() => handleRollback(page.id, version.id)}
                                className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                              >
                                Rollback
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No versions yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No pages found</p>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Preview - Version {selectedVersion.version}</h3>
            <div className="bg-gray-50 p-4 rounded border mb-4 min-h-96">
              <p className="text-center text-gray-500">Preview content would load here</p>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setShowPreviewModal(false)
                  setSelectedVersion(null)
                }}
                className="px-4 py-2 rounded border hover:bg-gray-50"
              >
                Close
              </button>
              <a
                href={`/preview/${selectedVersion.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Open in New Tab
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
