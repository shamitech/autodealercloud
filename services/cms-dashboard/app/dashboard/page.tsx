'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
}

const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:3002/api';

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('cms_token') : null;
      const response = await axios.get(`${CMS_API_URL}/pages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPages(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Pages</h2>
        <Link
          href="/pages/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New Page
        </Link>
      </div>
      {pages.length === 0 ? (
        <p className="text-gray-600">No pages yet. Create one to get started!</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Title</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Slug</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id}>
                <td className="border border-gray-300 px-4 py-2">{page.title}</td>
                <td className="border border-gray-300 px-4 py-2">{page.slug}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <span className={`px-2 py-1 rounded text-sm ${page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {page.status}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <Link
                    href={`/pages/${page.id}`}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
