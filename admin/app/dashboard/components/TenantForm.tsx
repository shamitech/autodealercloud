'use client';

import { useState } from 'react';

const TRADE_TYPES = [
  'Dealership',
  'Private Seller',
  'Auction House',
  'Rental Company',
  'Leasing Company',
  'Fleet Management',
];

const SERVICE_TYPES = ['Basic', 'Enterprise'];

interface TenantFormProps {
  onTenantCreated: () => void;
}

export default function TenantForm({ onTenantCreated }: TenantFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    businessName: '',
    tradeType: TRADE_TYPES[0],
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    serviceType: SERVICE_TYPES[0],
    cmsRootPassword: '',
  });

  // Auto-generate business slug from business name
  const businessSlug = formData.businessName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          businessSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create tenant');
        return;
      }

      // Reset form
      setFormData({
        businessName: '',
        tradeType: TRADE_TYPES[0],
        primaryContactName: '',
        primaryContactEmail: '',
        primaryContactPhone: '',
        serviceType: SERVICE_TYPES[0],
        cmsRootPassword: '',
      });
      setIsOpen(false);
      onTenantCreated();
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mb-6 rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
      >
        Add Tenant
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Add New Tenant</h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Name *
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter business name"
            />
          </div>

          {/* Business Slug (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Slug
            </label>
            <input
              type="text"
              value={businessSlug || 'auto-generated'}
              disabled
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
            />
          </div>

          {/* Trade Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Trade Type *
            </label>
            <select
              name="tradeType"
              value={formData.tradeType}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {TRADE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Contact Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Primary Contact Name *
            </label>
            <input
              type="text"
              name="primaryContactName"
              value={formData.primaryContactName}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter contact name"
            />
          </div>

          {/* Primary Contact Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Primary Contact Email *
            </label>
            <input
              type="email"
              name="primaryContactEmail"
              value={formData.primaryContactEmail}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter email address"
            />
          </div>

          {/* Primary Contact Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Primary Contact Phone Number *
            </label>
            <input
              type="tel"
              name="primaryContactPhone"
              value={formData.primaryContactPhone}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter phone number"
            />
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Service Type *
            </label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* CMS Root Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              CMS Root Password *
            </label>
            <input
              type="password"
              name="cmsRootPassword"
              value={formData.cmsRootPassword}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter CMS password"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !formData.businessName}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Tenant'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
