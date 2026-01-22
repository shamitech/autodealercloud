'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cmsApi } from '@/lib/api-client';

export default function CreateComponentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'header',
    configuration: '{}',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        configuration: JSON.parse(formData.configuration),
      };
      await cmsApi.createComponent(payload);
      router.push('/components');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create component');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create Component</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Component Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="header">Header</option>
            <option value="hero">Hero</option>
            <option value="gallery">Gallery</option>
            <option value="content">Content</option>
            <option value="footer">Footer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Configuration (JSON)</label>
          <textarea
            name="configuration"
            value={formData.configuration}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
          />
          <p className="text-xs text-gray-500 mt-1">Example: {"{\\"backgroundColor\\": \\"#ffffff\\"}"}</p>
        </div>

        <div className="flex space-x-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Component'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
