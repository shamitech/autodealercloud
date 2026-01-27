'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Template {
  id: string
  name: string
  zones: Zone[]
}

interface Zone {
  id: string
  name: string
  order: number
}

interface Component {
  id: string
  name: string
  type: string
}

interface PageContent {
  zoneId: string
  components: any[]
  styles?: any
}

interface Page {
  id: string
  title: string
  slug: string
  templateId: string
  content?: PageContent[]
}

export default function PageEditorPage() {
  const params = useParams()
  const pageId = params.id as string
  const [page, setPage] = useState<Page | null>(null)
  const [template, setTemplate] = useState<Template | null>(null)
  const [components, setComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [showComponentLibrary, setShowComponentLibrary] = useState(false)
  const [pageTitle, setPageTitle] = useState('')
  const [pageSlug, setPageSlug] = useState('')
  const [zoneContent, setZoneContent] = useState<Record<string, any[]>>({})

  useEffect(() => {
    if (pageId && pageId !== 'new') {
      fetchPage()
    } else {
      setLoading(false)
    }
    fetchTemplates()
  }, [pageId])

  const fetchPage = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/templates/${pageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.data) {
        setPage(data.data)
        setPageTitle(data.data.title)
        setPageSlug(data.data.slug)
      }
    } catch (error) {
      console.error('Failed to fetch page:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token')

      const [templatesRes, componentsRes] = await Promise.all([
        fetch('/api/v1/templates', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/v1/components/definitions', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const templatesData = await templatesRes.json()
      const componentsData = await componentsRes.json()

      setComponents(componentsData.data || [])

      // Set first template if available
      if (templatesData.data?.length > 0 && !template) {
        setTemplate(templatesData.data[0])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleAddComponentToZone = (componentId: string) => {
    if (!selectedZone) return

    const newComponent = {
      id: Math.random().toString(36).substr(2, 9),
      componentId,
      props: {},
    }

    setZoneContent((prev) => ({
      ...prev,
      [selectedZone]: [...(prev[selectedZone] || []), newComponent],
    }))
  }

  const handleRemoveComponentFromZone = (zoneId: string, componentIndex: number) => {
    setZoneContent((prev) => ({
      ...prev,
      [zoneId]: prev[zoneId].filter((_, i) => i !== componentIndex),
    }))
  }

  const handleSavePage = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/templates', {
        method: page ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: pageTitle,
          slug: pageSlug,
          templateId: template?.id,
          content: Object.entries(zoneContent).map(([zoneId, components]) => ({
            zoneId,
            components,
          })),
        }),
      })
      const data = await response.json()
      if (data.success) {
        alert('Page saved!')
        if (!page) {
          setPage(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to save page:', error)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Component Library */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b">
          <h3 className="font-bold mb-4">Components</h3>
          {selectedZone && (
            <button
              onClick={() => setShowComponentLibrary(!showComponentLibrary)}
              className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
            >
              {showComponentLibrary ? 'Hide Library' : 'Show Library'}
            </button>
          )}
        </div>

        {showComponentLibrary && (
          <div className="p-4 space-y-2">
            {components.length > 0 ? (
              components.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => handleAddComponentToZone(comp.id)}
                  disabled={!selectedZone}
                  className="w-full text-left p-3 bg-gray-50 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <p className="font-medium text-sm">{comp.name}</p>
                  <p className="text-xs text-gray-500">{comp.type}</p>
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-500">No components available</p>
            )}
          </div>
        )}

        {selectedZone && (
          <div className="p-4 border-t">
            <p className="text-xs font-medium text-gray-600 mb-2">Zone Components</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {zoneContent[selectedZone]?.map((comp, idx) => {
                const component = components.find((c) => c.id === comp.componentId)
                return (
                  <div key={idx} className="bg-blue-50 p-2 rounded border-l-4 border-blue-600 text-xs">
                    <p className="font-medium">{component?.name}</p>
                    <button
                      onClick={() => handleRemoveComponentFromZone(selectedZone, idx)}
                      className="text-red-600 hover:text-red-700 text-xs mt-1"
                    >
                      Remove
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin/pages" className="text-blue-600 hover:underline">
              ← Back to Pages
            </Link>
            <h1 className="text-3xl font-bold mt-2">Page Editor</h1>
          </div>

          {/* Page Settings */}
          <div className="bg-white rounded-lg p-6 border mb-8">
            <h2 className="text-xl font-bold mb-4">Page Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Page Title</label>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Page title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Page Slug</label>
                <input
                  type="text"
                  value={pageSlug}
                  onChange={(e) => setPageSlug(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="/my-page"
                />
              </div>
            </div>
          </div>

          {/* Template Zones */}
          {template && (
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="p-6 border-b bg-gray-50">
                <h2 className="text-xl font-bold">Template: {template.name}</h2>
              </div>

              <div className="p-6 space-y-6">
                {template.zones
                  .sort((a, b) => a.order - b.order)
                  .map((zone) => (
                    <div
                      key={zone.id}
                      onClick={() => setSelectedZone(zone.id)}
                      className={`min-h-48 p-6 rounded-lg border-2 cursor-pointer transition ${
                        selectedZone === zone.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <h3 className="font-bold mb-4">{zone.name}</h3>

                      <div className="space-y-2">
                        {zoneContent[zone.id]?.length > 0 ? (
                          zoneContent[zone.id].map((comp, idx) => {
                            const component = components.find((c) => c.id === comp.componentId)
                            return (
                              <div
                                key={idx}
                                className="bg-white p-4 rounded border flex justify-between items-center"
                              >
                                <div>
                                  <p className="font-medium">{component?.name}</p>
                                  <p className="text-xs text-gray-500">{component?.type}</p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveComponentFromZone(zone.id, idx)
                                  }}
                                  className="text-red-600 hover:text-red-700 text-xs"
                                >
                                  Remove
                                </button>
                              </div>
                            )
                          })
                        ) : (
                          <p className="text-gray-500 text-sm italic">
                            {selectedZone === zone.id ? 'Click a component on the left to add' : 'Empty'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleSavePage}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              Save Page
            </button>
            <Link
              href="/admin/pages"
              className="px-8 py-3 rounded-lg border hover:bg-gray-50 font-medium"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
