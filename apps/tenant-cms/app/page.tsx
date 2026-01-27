'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function TenantCMSContent() {
  const [tenant, setTenant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Get tenant from query param, header, or localStorage
    const tenantParam = searchParams.get('tenant')
    const tenantFromStorage = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : null
    
    if (tenantParam) {
      setTenant({ id: tenantParam, name: `Tenant: ${tenantParam}` })
      if (typeof window !== 'undefined') {
        localStorage.setItem('tenant_id', tenantParam)
      }
    } else if (tenantFromStorage) {
      setTenant({ id: tenantFromStorage, name: `Tenant: ${tenantFromStorage}` })
    } else {
      // Extract from hostname
      if (typeof window !== 'undefined') {
        const host = window.location.hostname
        const subdomain = host.split('.')[0]
        if (subdomain !== 'tenant' && subdomain !== 'www' && subdomain !== 'localhost') {
          setTenant({ id: subdomain, name: `Tenant: ${subdomain}` })
          localStorage.setItem('tenant_id', subdomain)
        }
      }
    }
    setLoading(false)
  }, [searchParams])

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex h-16 items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-bold">Tenant CMS & Web Builder</h1>
            {tenant && <p className="text-sm text-gray-500">{tenant.name}</p>}
          </div>
          {loading && <span className="text-sm text-gray-500">Loading...</span>}
        </div>
      </header>

      <div className="flex flex-1 gap-8 p-8">
        {/* File Tree Navigation */}
        <aside className="w-64 bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-lg mb-4">Site Structure</h3>
          <div className="space-y-2">
            <div className="p-2 hover:bg-gray-100 cursor-pointer">📁 Pages</div>
            <div className="p-2 hover:bg-gray-100 cursor-pointer">📁 Templates</div>
            <div className="p-2 hover:bg-gray-100 cursor-pointer">📁 Components</div>
            <div className="p-2 hover:bg-gray-100 cursor-pointer">📁 Content</div>
            <div className="p-2 hover:bg-gray-100 cursor-pointer">⚙️ Settings</div>
          </div>
        </aside>

        {/* Main Canvas */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <h2 className="text-3xl font-bold mb-4">Welcome to Your CMS</h2>
            {tenant ? (
              <p className="text-gray-600 mb-8">
                Welcome, <strong>{tenant.name}</strong>! Build your auto dealer website using our visual builder. Create pages, customize components, and manage content all in one place.
              </p>
            ) : (
              <p className="text-gray-600 mb-8">
                Build your auto dealer website using our visual builder. Create pages, customize components, and manage content all in one place.
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button className="bg-blue-600 text-white p-4 rounded hover:bg-blue-700">
                ➕ Create New Page
              </button>
              <button className="bg-blue-600 text-white p-4 rounded hover:bg-blue-700">
                📋 Browse Templates
              </button>
              <button className="bg-blue-600 text-white p-4 rounded hover:bg-blue-700">
                🎨 Build Components
              </button>
              <button className="bg-blue-600 text-white p-4 rounded hover:bg-blue-700">
                🚀 Publish Site
              </button>
            </div>
          </div>

          {/* Content Sidebar Placeholder */}
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-lg font-bold mb-4">Content Editor</h3>
            <p className="text-gray-600">
              Click on any component to edit its content here. Fill in text, upload images, and customize every element of your site.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function TenantCMS() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TenantCMSContent />
    </Suspense>
  )
}
