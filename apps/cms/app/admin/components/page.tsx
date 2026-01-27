'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Component {
  id: string
  type: 'atom' | 'molecule' | 'organism'
  name: string
  slug: string
  description?: string
  category?: string
  createdAt: string
  versions: { id: string; version: string; createdAt: string }[]
}

export default function ComponentsPage() {
  const router = useRouter()
  const [components, setComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'atom' | 'molecule' | 'organism'>('all')
  const [formData, setFormData] = useState({
    type: 'atom' as const,
    name: '',
    slug: '',
    description: '',
    category: '',
  })

  useEffect(() => {
    fetchComponents()
  }, [])

  const fetchComponents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/components/definitions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setComponents(data.data || [])
    } catch (error) {
      console.error('Failed to fetch components:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/components/definitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success) {
        setFormData({ type: 'atom', name: '', slug: '', description: '', category: '' })
        setShowForm(false)
        fetchComponents()
      }
    } catch (error) {
      console.error('Failed to create component:', error)
    }
  }

  const filteredComponents = filterType === 'all' 
    ? components 
    : components.filter(c => c.type === filterType)

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Core Components</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'New Component'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateComponent} className="mb-8 bg-gray-50 p-6 rounded-lg border">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="atom">Atom</option>
                <option value="molecule">Molecule</option>
                <option value="organism">Organism</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Button"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., button"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., UI"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Component description..."
                rows={3}
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Create Component
          </button>
        </form>
      )}

      {/* Filter buttons */}
      <div className="mb-6 flex gap-2">
        {(['all', 'atom', 'molecule', 'organism'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filterType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {type === 'all' ? 'All' : type}
          </button>
        ))}
      </div>

      {/* Components grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComponents.map((component) => (
          <Link
            key={component.id}
            href={`/admin/components/${component.id}`}
            className="bg-white border rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg">{component.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{component.type}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {component.versions?.length || 0} versions
              </span>
            </div>
            {component.description && (
              <p className="text-sm text-gray-700 mb-3">{component.description}</p>
            )}
            <div className="text-xs text-gray-500">
              Slug: <code className="bg-gray-100 px-1">{component.slug}</code>
            </div>
          </Link>
        ))}
      </div>

      {filteredComponents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No components found</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first component
          </button>
        </div>
      )}
    </div>
  )
}
