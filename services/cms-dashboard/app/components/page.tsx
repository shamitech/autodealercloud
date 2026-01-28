'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cmsApi } from '@/lib/api-client';

export default function ComponentsPage() {
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const response = await cmsApi.get('/components');
      setComponents(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch components');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this component?')) return;
    try {
      await cmsApi.delete(`/components/${id}`);
      setComponents(components.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Components (Atoms)</h1>
        <Link href="/components/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Create Component
        </Link>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {components.map((comp) => (
          <div key={comp.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold text-lg mb-2">{comp.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{comp.description || 'No description'}</p>
            <div className="flex space-x-2">
              <Link href={`/components/${comp.id}`} className="text-blue-600 hover:text-blue-900 text-sm">
                Edit
              </Link>
              <button
                onClick={() => handleDelete(comp.id)}
                className="text-red-600 hover:text-red-900 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {components.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No components yet. <Link href="/components/new" className="text-blue-600 hover:text-blue-900">Create one</Link>
        </div>
      )}
    </div>
  );
}
