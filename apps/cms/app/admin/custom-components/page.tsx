'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CoreComponent {
  id: string
  name: string
  type: string
  slug: string
}

interface CompositionComponent {
  componentId: string
  position: number
  props: any
}

export default function CustomComponentsPage() {
  const [coreComponents, setCoreComponents] = useState<CoreComponent[]>([])
  const [customComponents, setCustomComponents] = useState<any[]>([])
  const [showComposer, setShowComposer] = useState(false)
  const [composerName, setComposerName] = useState('')
  const [compositionItems, setCompositionItems] = useState<CompositionComponent[]>([])
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  useEffect(() => {
    fetchCoreComponents()
    fetchCustomComponents()
  }, [])

  const fetchCoreComponents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/components/definitions', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setCoreComponents(data.data || [])
    } catch (error) {
      console.error('Failed to fetch components:', error)
    }
  }

  const fetchCustomComponents = async () => {
    try {
      const token = localStorage.getItem('token')
      const tenantId = localStorage.getItem('tenantId') || 'default'
      const response = await fetch(`/api/v1/tenants/${tenantId}/custom-components`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setCustomComponents(data.data || [])
    } catch (error) {
      console.error('Failed to fetch custom components:', error)
    }
  }

  const addComponentToComposition = (componentId: string) => {
    setCompositionItems([
      ...compositionItems,
      {
        componentId,
        position: compositionItems.length,
        props: {},
      },
    ])
  }

  const removeComponentFromComposition = (position: number) => {
    setCompositionItems(compositionItems.filter((_, i) => i !== position))
  }

  const handleSaveComposition = async () => {
    try {
      const token = localStorage.getItem('token')
      const tenantId = localStorage.getItem('tenantId') || 'default'
      const response = await fetch(`/api/v1/tenants/${tenantId}/custom-components`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: composerName,
          slug: composerName.toLowerCase().replace(/\s+/g, '-'),
          composition: compositionItems,
        }),
      })
      const data = await response.json()
      if (data.success) {
        alert('Custom component created!')
        setShowComposer(false)
        setComposerName('')
        setCompositionItems([])
        fetchCustomComponents()
      }
    } catch (error) {
      console.error('Failed to save composition:', error)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/admin" className="text-blue-600 hover:underline">
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold mt-2">Custom Components</h1>
          <p className="text-gray-600">Combine core components to create custom ones</p>
        </div>
        <button
          onClick={() => setShowComposer(!showComposer)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          {showComposer ? 'Cancel' : 'New Composition'}
        </button>
      </div>

      {showComposer && (
        <div className="bg-white rounded-lg p-6 border mb-8">
          <h2 className="text-xl font-bold mb-4">Create Custom Component</h2>

          <div className="grid grid-cols-3 gap-6">
            {/* Left: Core Components List */}
            <div>
              <h3 className="font-bold mb-3">Available Core Components</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {coreComponents.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => addComponentToComposition(comp.id)}
                    className="w-full text-left p-3 border rounded hover:bg-gray-50 transition"
                  >
                    <p className="font-medium">{comp.name}</p>
                    <p className="text-xs text-gray-500">{comp.type}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Middle: Composition Editor */}
            <div>
              <h3 className="font-bold mb-3">Composition</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Component Name</label>
                <input
                  type="text"
                  value={composerName}
                  onChange={(e) => setComposerName(e.target.value)}
                  placeholder="e.g., Hero Section"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {compositionItems.map((item, index) => {
                  const component = coreComponents.find((c) => c.id === item.componentId)
                  return (
                    <div key={index} className="bg-blue-50 p-3 rounded flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{component?.name}</p>
                        <p className="text-xs text-gray-500">Position: {index}</p>
                      </div>
                      <button
                        onClick={() => removeComponentFromComposition(index)}
                        className="text-red-600 hover:text-red-700 text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: Preview */}
            <div>
              <h3 className="font-bold mb-3">Preview</h3>
              <div className="border rounded p-4 bg-gray-50 min-h-96">
                {compositionItems.length > 0 ? (
                  <div className="space-y-4">
                    {compositionItems.map((item, index) => {
                      const component = coreComponents.find((c) => c.id === item.componentId)
                      return (
                        <div key={index} className="bg-white p-3 rounded border-l-4 border-blue-600">
                          <p className="font-medium text-sm">{component?.name}</p>
                          <p className="text-xs text-gray-500">{component?.type}</p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Add components to see preview</p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveComposition}
            className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Save Composition
          </button>
        </div>
      )}

      {/* Custom Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customComponents.length > 0 ? (
          customComponents.map((comp) => (
            <Link
              key={comp.id}
              href={`/admin/custom-components/${comp.id}`}
              className="bg-white rounded-lg p-6 border hover:border-blue-600 transition"
            >
              <h3 className="font-bold text-lg mb-2">{comp.name}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {comp._count?.composition || 0} components
              </p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>Created: {new Date(comp.createdAt).toLocaleDateString()}</p>
                <p>Versions: {comp._count?.versions || 0}</p>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No custom components yet. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
