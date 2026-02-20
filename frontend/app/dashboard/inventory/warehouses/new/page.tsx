'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function NewWarehousePage() {
  const router = useRouter();
  const [form, setForm] = useState({ code: '', name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { setError('Code is required'); return; }
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await apiClient.createWarehouse({
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
      });
      if (res.success) router.push('/dashboard/inventory/warehouses');
      else setError(res.error || 'Failed');
    } catch { setError('Failed to create warehouse'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/inventory/warehouses" className="text-primary-600 hover:text-primary-700 text-sm">← Warehouses</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">New Warehouse</h1>
        <p className="mt-1 text-sm text-gray-500">Creates Main and Quarantine locations automatically</p>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
            <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. WH01" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Main Warehouse" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Link href="/dashboard/inventory/warehouses" className="px-4 py-2 border border-gray-300 rounded-md text-sm">Cancel</Link>
            <button type="submit" disabled={submitting} className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Warehouse'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
