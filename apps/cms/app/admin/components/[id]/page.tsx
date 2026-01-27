'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface ComponentDetail {
  id: string
  type: string
  name: string
  slug: string
  description?: string
  propSchema?: any
  defaultCss?: string
  versions: any[]
  styles: any[]
}

export default function ComponentEditorPage() {
  const params = useParams()
  const componentId = params.id as string
  const [component, setComponent] = useState<ComponentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'versions'>('visual')
  const [cssMode, setCssMode] = useState<'visual' | 'text'>('visual')
  const [cssContent, setCssContent] = useState('')
  const [visualStyle, setVisualStyle] = useState<any>({})

  useEffect(() => {
    fetchComponent()
  }, [componentId])

  const fetchComponent = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/components/definitions/${componentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setComponent(data.data)
    } catch (error) {
      console.error('Failed to fetch component:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveStyle = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/components/styles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          componentId,
          name: `${component?.name} Style`,
          cssContent: cssMode === 'text' ? cssContent : undefined,
          visualStyle: cssMode === 'visual' ? visualStyle : undefined,
          mode: cssMode,
        }),
      })
      const data = await response.json()
      if (data.success) {
        alert('Style saved successfully!')
        fetchComponent()
      }
    } catch (error) {
      console.error('Failed to save style:', error)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!component) return <div className="p-8">Component not found</div>

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/components" className="text-blue-600 hover:underline">
          ← Back to Components
        </Link>
        <h1 className="text-3xl font-bold mt-2">{component.name}</h1>
        <p className="text-gray-600">
          {component.type.charAt(0).toUpperCase() + component.type.slice(1)} • {component.slug}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        {(['visual', 'code', 'versions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'visual' ? 'Styling' : tab === 'code' ? 'Code' : 'Versions'}
          </button>
        ))}
      </div>

      {/* Visual Editor Tab */}
      {activeTab === 'visual' && (
        <div className="bg-white rounded-lg p-6 border">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">CSS Styling</h2>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="cssMode"
                  value="visual"
                  checked={cssMode === 'visual'}
                  onChange={(e) => setCssMode('visual')}
                  className="mr-2"
                />
                Visual Editor
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="cssMode"
                  value="text"
                  checked={cssMode === 'text'}
                  onChange={(e) => setCssMode('text')}
                  className="mr-2"
                />
                Text Editor
              </label>
            </div>
          </div>

          {cssMode === 'visual' ? (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-4">Style Properties</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Background Color</label>
                    <input
                      type="color"
                      value={visualStyle.backgroundColor || '#ffffff'}
                      onChange={(e) => setVisualStyle({ ...visualStyle, backgroundColor: e.target.value })}
                      className="w-full h-10 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Text Color</label>
                    <input
                      type="color"
                      value={visualStyle.color || '#000000'}
                      onChange={(e) => setVisualStyle({ ...visualStyle, color: e.target.value })}
                      className="w-full h-10 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Padding (px)</label>
                    <input
                      type="number"
                      value={visualStyle.padding || 8}
                      onChange={(e) => setVisualStyle({ ...visualStyle, padding: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Border Radius (px)</label>
                    <input
                      type="number"
                      value={visualStyle.borderRadius || 0}
                      onChange={(e) => setVisualStyle({ ...visualStyle, borderRadius: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Font Size (px)</label>
                    <input
                      type="number"
                      value={visualStyle.fontSize || 14}
                      onChange={(e) => setVisualStyle({ ...visualStyle, fontSize: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-4">Preview</h3>
                <div
                  style={{
                    backgroundColor: visualStyle.backgroundColor,
                    color: visualStyle.color,
                    padding: `${visualStyle.padding}px`,
                    borderRadius: `${visualStyle.borderRadius}px`,
                    fontSize: `${visualStyle.fontSize}px`,
                    border: '1px solid #e5e7eb',
                    minHeight: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <p>Preview: {component.name}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">CSS</label>
              <textarea
                value={cssContent}
                onChange={(e) => setCssContent(e.target.value)}
                className="w-full h-64 p-3 border rounded font-mono text-sm"
                placeholder=".component {
  background-color: #f0f0f0;
  padding: 16px;
  border-radius: 8px;
}"
              />
            </div>
          )}

          <button
            onClick={handleSaveStyle}
            className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Save Style
          </button>
        </div>
      )}

      {/* Code Tab */}
      {activeTab === 'code' && (
        <div className="bg-white rounded-lg p-6 border">
          <h2 className="text-xl font-bold mb-4">Component Code</h2>
          <div>
            <label className="block text-sm font-medium mb-2">HTML/JSX</label>
            <textarea
              defaultValue={`<div class="${component.slug}">
  {/* Your component JSX here */}
</div>`}
              className="w-full h-64 p-3 border rounded font-mono text-sm"
            />
          </div>
          <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Save Code
          </button>
        </div>
      )}

      {/* Versions Tab */}
      {activeTab === 'versions' && (
        <div className="bg-white rounded-lg p-6 border">
          <h2 className="text-xl font-bold mb-4">Version History</h2>
          {component.versions.length > 0 ? (
            <div className="space-y-3">
              {component.versions.map((version: any) => (
                <div key={version.id} className="border rounded p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">Version {version.version}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(version.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="text-blue-600 hover:underline">Restore</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No versions yet. Save a style to create a version.</p>
          )}
        </div>
      )}
    </div>
  )
}
