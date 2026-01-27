'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface PublishedPage {
  id: string
  title: string
  slug: string
  description?: string
  content: any
  metadata?: any
  publishedAt?: string
  tenant: {
    id: string
    name: string
  }
}

export default function PublishedView() {
  const params = useParams()
  const tenantId = params.tenantId as string
  const pathname = params['*'] as string[] || []
  const slug = pathname.length > 0 ? pathname.join('/') : 'home'

  const [page, setPage] = useState<PublishedPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true)
        // Determine API base URL
        const apiUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? 'http://localhost:3004/api/v1'
          : 'https://api.autodealercloud.com/api/v1'
        
        // Fetch all pages for this tenant and find the one matching the slug
        const response = await fetch(
          `${apiUrl}/tenants/${tenantId}/pages?status=published`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch pages: ${response.statusText}`)
        }

        const data = await response.json()
        
        // Find page matching the slug
        let matchedPage = null
        if (data.success && data.data && Array.isArray(data.data)) {
          matchedPage = data.data.find((p: any) => p.slug === slug)
        }
        
        if (matchedPage) {
          setPage(matchedPage)
        } else if (slug !== 'home') {
          setError('Page not found')
        } else {
          setError('No published content yet')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load page')
      } finally {
        setLoading(false)
      }
    }

    if (tenantId) {
      fetchPage()
    }
  }, [tenantId, slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a href="/" className="text-blue-600 hover:text-blue-700">
            Go to home page
          </a>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Content</h1>
          <p className="text-gray-600">This page has no published content yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{page.title}</h1>
          {page.description && (
            <p className="text-xl text-gray-600">{page.description}</p>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="prose prose-lg max-w-none">
          {typeof page.content === 'string' ? (
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          ) : (
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(page.content, null, 2)}
            </pre>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} {page.tenant.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
