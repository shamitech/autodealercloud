'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Template {
  id: string
  name: string
  slug: string
  description?: string
  zones: Zone[]
  _count: {
    pages: number
    versions: number
  }
}

interface Zone {
  id: string
  name: string
  templateId: string
  order: number
  allowedComponentTypes?: string[]
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)
  const [showZoneForm, setShowZoneForm] = useState<string | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [zoneData, setZoneData] = useState({ name: '', order: 0 })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/templates', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setTemplates(data.data || [])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: templateName,
          slug: templateName.toLowerCase().replace(/\s+/g, '-'),
        }),
      })
      const data = await response.json()
      if (data.success) {
        alert('Template created!')
        setShowTemplateForm(false)
        setTemplateName('')
        fetchTemplates()
      }
    } catch (error) {
      console.error('Failed to create template:', error)
    }
  }

  const handleAddZone = async (templateId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/zones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          templateId,
          ...zoneData,
        }),
      })
      const data = await response.json()
      if (data.success) {
        alert('Zone added!')
        setShowZoneForm(null)
        setZoneData({ name: '', order: 0 })
        fetchTemplates()
      }
    } catch (error) {
      console.error('Failed to add zone:', error)
    }
  }

  const handleDeleteZone = async (zoneId: string, templateId: string) => {
    if (confirm('Delete this zone?')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/v1/zones/${zoneId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (data.success) {
          fetchTemplates()
        }
      } catch (error) {
        console.error('Failed to delete zone:', error)
      }
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/admin" className="text-blue-600 hover:underline">
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold mt-2">Templates</h1>
          <p className="text-gray-600">Manage page templates and layout zones</p>
        </div>
        <button
          onClick={() => setShowTemplateForm(!showTemplateForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          {showTemplateForm ? 'Cancel' : 'New Template'}
        </button>
      </div>

      {showTemplateForm && (
        <form onSubmit={handleCreateTemplate} className="bg-white rounded-lg p-6 border mb-8">
          <h2 className="text-xl font-bold mb-4">Create Template</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Template Name</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Landing Page Template"
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Create Template
            </button>
            <button
              type="button"
              onClick={() => setShowTemplateForm(false)}
              className="px-6 py-2 rounded-lg border hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {templates.length > 0 ? (
          templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg border">
              <button
                onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
                className="w-full p-4 flex justify-between items-center hover:bg-gray-50"
              >
                <div className="text-left">
                  <h3 className="font-bold text-lg">{template.name}</h3>
                  <p className="text-sm text-gray-600">
                    {template.zones.length} zones • {template._count.pages} pages •{' '}
                    {template._count.versions} versions
                  </p>
                </div>
                <span className="text-gray-400">{expandedTemplate === template.id ? '▼' : '▶'}</span>
              </button>

              {expandedTemplate === template.id && (
                <div className="border-t p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold">Zones</h4>
                    <button
                      onClick={() => setShowZoneForm(showZoneForm === template.id ? null : template.id)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {showZoneForm === template.id ? 'Cancel' : 'Add Zone'}
                    </button>
                  </div>

                  {showZoneForm === template.id && (
                    <div className="bg-white rounded p-4 mb-4 border">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Zone Name</label>
                          <input
                            type="text"
                            value={zoneData.name}
                            onChange={(e) => setZoneData({ ...zoneData, name: e.target.value })}
                            placeholder="e.g., Hero Section"
                            className="w-full px-3 py-2 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Order</label>
                          <input
                            type="number"
                            value={zoneData.order}
                            onChange={(e) =>
                              setZoneData({ ...zoneData, order: parseInt(e.target.value) })
                            }
                            className="w-full px-3 py-2 border rounded text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddZone(template.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                      >
                        Add Zone
                      </button>
                    </div>
                  )}

                  {template.zones.length > 0 ? (
                    <div className="space-y-2">
                      {template.zones
                        .sort((a, b) => a.order - b.order)
                        .map((zone) => (
                          <div key={zone.id} className="bg-white p-3 rounded border flex justify-between items-center">
                            <div>
                              <p className="font-medium">{zone.name}</p>
                              <p className="text-xs text-gray-500">Order: {zone.order}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteZone(zone.id, template.id)}
                              className="text-red-600 hover:text-red-700 text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No zones yet</p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No templates yet. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
