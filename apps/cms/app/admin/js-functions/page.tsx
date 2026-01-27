'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface JSFunctionTemplate {
  id: string
  name: string
  description?: string
  parameterSchema?: any
}

interface PageJSFunction {
  id: string
  name: string
  templateId: string
  pageId: string
  elementSelector: string
  eventTrigger: string
  parameters: any
  isActive: boolean
}

export default function JSFunctionsPage() {
  const [templates, setTemplates] = useState<JSFunctionTemplate[]>([])
  const [pageFunctions, setPageFunctions] = useState<PageJSFunction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    elementSelector: '',
    eventTrigger: 'click',
    parameters: {} as any,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const pageId = localStorage.getItem('currentPageId') || ''

      const [templatesRes, functionsRes] = await Promise.all([
        fetch('/api/v1/js-function-templates', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/v1/pages/${pageId}/js-functions`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ json: () => Promise.resolve({ data: [] }) })),
      ])

      const templatesData = await templatesRes.json()
      const functionsData = await functionsRes.json()

      setTemplates(templatesData.data || [])
      setPageFunctions(functionsData.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFunction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplate) {
      alert('Please select a template')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const pageId = localStorage.getItem('currentPageId') || ''

      const response = await fetch('/api/v1/js-functions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          templateId: selectedTemplate,
          pageId,
          elementSelector: formData.elementSelector,
          eventTrigger: formData.eventTrigger,
          parameters: formData.parameters,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Function added successfully!')
        setShowForm(false)
        setFormData({ name: '', elementSelector: '', eventTrigger: 'click', parameters: {} })
        setSelectedTemplate(null)
        fetchData()
      }
    } catch (error) {
      console.error('Failed to add function:', error)
    }
  }

  const handleDeleteFunction = async (functionId: string) => {
    if (confirm('Delete this function?')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/v1/js-functions/${functionId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (data.success) {
          fetchData()
        }
      } catch (error) {
        console.error('Failed to delete function:', error)
      }
    }
  }

  const handleTestFunction = (func: PageJSFunction) => {
    alert(`Test triggered for: ${func.name}\nEvent: ${func.eventTrigger}\nSelector: ${func.elementSelector}`)
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/admin/pages" className="text-blue-600 hover:underline">
            ← Back to Pages
          </Link>
          <h1 className="text-3xl font-bold mt-2">JavaScript Functions</h1>
          <p className="text-gray-600">Configure and bind pre-made JS functions to page elements</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Function'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-6 border mb-8">
          <h2 className="text-xl font-bold mb-4">Add JavaScript Function</h2>

          <form onSubmit={handleAddFunction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Function Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Show Modal on Click"
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Select Template</label>
                <select
                  value={selectedTemplate || ''}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="">Choose a template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Element Selector</label>
                <input
                  type="text"
                  value={formData.elementSelector}
                  onChange={(e) => setFormData({ ...formData, elementSelector: e.target.value })}
                  placeholder="e.g., .button-primary, #hero-btn"
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Event Trigger</label>
                <select
                  value={formData.eventTrigger}
                  onChange={(e) => setFormData({ ...formData, eventTrigger: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option>click</option>
                  <option>hover</option>
                  <option>load</option>
                  <option>scroll</option>
                  <option>submit</option>
                </select>
              </div>
            </div>

            {selectedTemplate && templates.find((t) => t.id === selectedTemplate)?.parameterSchema && (
              <div className="bg-blue-50 p-4 rounded">
                <p className="font-medium mb-3">Template Parameters</p>
                {/* Dynamic parameter form would go here */}
                <p className="text-sm text-gray-600">Parameters configured based on selected template</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Add Function
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 rounded-lg border hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-xl font-bold">Page Functions</h2>
        {pageFunctions.length > 0 ? (
          pageFunctions.map((func) => {
            const template = templates.find((t) => t.id === func.templateId)
            return (
              <div key={func.id} className="bg-white rounded-lg p-4 border flex justify-between items-center">
                <div>
                  <p className="font-bold">{func.name}</p>
                  <div className="text-sm text-gray-600 space-y-1 mt-2">
                    <p>Template: {template?.name}</p>
                    <p>Selector: <code className="bg-gray-100 px-2 py-1 rounded">{func.elementSelector}</code></p>
                    <p>Trigger: {func.eventTrigger}</p>
                    <p>Status: <span className={func.isActive ? 'text-green-600' : 'text-red-600'}>
                      {func.isActive ? 'Active' : 'Inactive'}
                    </span></p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTestFunction(func)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => handleDeleteFunction(func.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No functions added yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
