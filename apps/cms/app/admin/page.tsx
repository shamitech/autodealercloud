'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface DashboardStats {
  components: number
  customComponents: number
  templates: number
  pages: number
  previewTokens: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    components: 0,
    customComponents: 0,
    templates: 0,
    pages: 0,
    previewTokens: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')

      const [componentsRes, templatesRes, customRes] = await Promise.all([
        fetch('/api/v1/components/definitions', {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ json: () => Promise.resolve({ data: [] }) })),
        fetch('/api/v1/templates', {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ json: () => Promise.resolve({ data: [] }) })),
        fetch(`/api/v1/tenants/default/custom-components`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ json: () => Promise.resolve({ data: [] }) })),
      ])

      const componentsData = await componentsRes.json()
      const templatesData = await templatesRes.json()
      const customData = await customRes.json()

      setStats({
        components: componentsData.data?.length || 0,
        customComponents: customData.data?.length || 0,
        templates: templatesData.data?.length || 0,
        pages: templatesData.data?.reduce((sum: number, t: any) => sum + (t._count?.pages || 0), 0) || 0,
        previewTokens: 0,
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({
    title,
    value,
    icon,
    href,
  }: {
    title: string
    value: number | string
    icon: string
    href: string
  }) => (
    <Link href={href}>
      <div className="bg-white rounded-lg p-6 border hover:border-blue-600 transition cursor-pointer">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-600 text-sm">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <span className="text-4xl">{icon}</span>
        </div>
      </div>
    </Link>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Component System Admin</h1>
          <p className="text-gray-600 mt-2">Manage core components, templates, and page versions</p>
        </div>

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            <StatCard
              title="Core Components"
              value={stats.components}
              icon="🧩"
              href="/admin/components"
            />
            <StatCard
              title="Custom Components"
              value={stats.customComponents}
              icon="🔗"
              href="/admin/custom-components"
            />
            <StatCard title="Templates" value={stats.templates} icon="📋" href="/admin/templates" />
            <StatCard title="Pages" value={stats.pages} icon="📄" href="/admin/pages" />
            <StatCard
              title="Preview Links"
              value={stats.previewTokens}
              icon="👁️"
              href="/admin/preview-access"
            />
          </div>
        )}

        {/* Main Navigation */}
        <div className="bg-white rounded-lg border overflow-hidden mb-12">
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-xl font-bold">Component Management</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {/* Core Components */}
            <Link href="/admin/components">
              <div className="p-6 rounded-lg border hover:border-blue-600 hover:bg-blue-50 transition cursor-pointer">
                <h3 className="font-bold text-lg mb-2">🧩 Core Components</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create and manage atom, molecule, and organism components
                </p>
                <div className="text-xs text-blue-600 font-medium">View all →</div>
              </div>
            </Link>

            {/* Custom Components */}
            <Link href="/admin/custom-components">
              <div className="p-6 rounded-lg border hover:border-blue-600 hover:bg-blue-50 transition cursor-pointer">
                <h3 className="font-bold text-lg mb-2">🔗 Custom Components</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Combine core components to create custom ones
                </p>
                <div className="text-xs text-blue-600 font-medium">Manage →</div>
              </div>
            </Link>

            {/* Templates */}
            <Link href="/admin/templates">
              <div className="p-6 rounded-lg border hover:border-blue-600 hover:bg-blue-50 transition cursor-pointer">
                <h3 className="font-bold text-lg mb-2">📋 Templates & Zones</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Define page layouts and content zones
                </p>
                <div className="text-xs text-blue-600 font-medium">Organize →</div>
              </div>
            </Link>

            {/* Pages */}
            <Link href="/admin/pages">
              <div className="p-6 rounded-lg border hover:border-blue-600 hover:bg-blue-50 transition cursor-pointer">
                <h3 className="font-bold text-lg mb-2">📄 Page Versions</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Manage page versions, drafts, and publishing
                </p>
                <div className="text-xs text-blue-600 font-medium">Manage →</div>
              </div>
            </Link>

            {/* JS Functions */}
            <Link href="/admin/js-functions">
              <div className="p-6 rounded-lg border hover:border-blue-600 hover:bg-blue-50 transition cursor-pointer">
                <h3 className="font-bold text-lg mb-2">⚙️ JS Functions</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Bind pre-made functions to page elements
                </p>
                <div className="text-xs text-blue-600 font-medium">Configure →</div>
              </div>
            </Link>

            {/* Preview Access */}
            <Link href="/admin/preview-access">
              <div className="p-6 rounded-lg border hover:border-blue-600 hover:bg-blue-50 transition cursor-pointer">
                <h3 className="font-bold text-lg mb-2">👁️ Preview Access</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Grant and manage preview links for stakeholders
                </p>
                <div className="text-xs text-blue-600 font-medium">Control →</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-bold text-lg mb-4">Quick Start</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/components"
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              <p className="font-medium text-blue-900">1. Create Core Component</p>
              <p className="text-xs text-blue-700 mt-1">Start by defining a basic component</p>
            </a>
            <a
              href="/admin/custom-components"
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
            >
              <p className="font-medium text-green-900">2. Build Custom Component</p>
              <p className="text-xs text-green-700 mt-1">Combine components into custom ones</p>
            </a>
            <a
              href="/admin/pages"
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
            >
              <p className="font-medium text-purple-900">3. Create & Publish Page</p>
              <p className="text-xs text-purple-700 mt-1">Build and publish your page</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
