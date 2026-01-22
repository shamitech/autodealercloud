'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cmsApi } from '@/lib/api-client';

export default function PagesPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await cmsApi.getPages();
      setPages(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page?')) return;
    try {
      await cmsApi.deletePage(id);
      setPages(pages.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handlePublish = async (id: string, isPublished: boolean) => {
    try {
      if (isPublished) {
        await cmsApi.unpublishPage(id);
      } else {
        await cmsApi.publishPage(id);
      }
      fetchPages();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to publish/unpublish');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pages</h1>
        <Link href="/pages/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Create Page
        </Link>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Slug</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Published</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-900">{page.title}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{page.slug}</td>
                <td className="px-6 py-3 text-sm">
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                    Draft
                  </span>
                </td>
                <td className="px-6 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      page.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {page.is_published ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-right space-x-2">
                  <Link href={`/pages/${page.id}`} className="text-blue-600 hover:text-blue-900 text-sm">
                    Edit
                  </Link>
                  <button
                    onClick={() => handlePublish(page.id, page.is_published)}
                    className="text-green-600 hover:text-green-900 text-sm"
                  >
                    {page.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => handleDelete(page.id)} className="text-red-600 hover:text-red-900 text-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            No pages yet. <Link href="/pages/new" className="text-blue-600 hover:text-blue-900">Create one</Link>
          </div>
        )}
      </div>
    </div>
  );
}
