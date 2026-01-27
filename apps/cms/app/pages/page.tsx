'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'

interface Page {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  publishedAt: string | null
  createdAt: string
}

export default function PagesPage() {
  const { tenant } = useAuthStore()
  const [pages, setPages] = useState<Page[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!tenant) return

    const fetchPages = async () => {
      try {
        const response = await api.get(`/tenants/${tenant.id}/pages`)
        setPages(response.data.data || [])
      } catch (error) {
        console.error('Failed to fetch pages:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPages()
  }, [tenant])

  if (isLoading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pages</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + New Page
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No pages yet. Create your first page to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Title</th>
                <th className="px-6 py-3 text-left font-semibold">Slug</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Created</th>
                <th className="px-6 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3">{page.title}</td>
                  <td className="px-6 py-3 text-gray-600">{page.slug}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        page.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {new Date(page.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">
                    <button className="text-blue-600 hover:underline mr-4">Edit</button>
                    <button className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
