'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ sku: '', name: '', type: 'STOCK' as 'STOCK' | 'SERVICE', standardCost: '', salePrice: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string | number) => setForm({ ...form, [k]: v });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sku.trim()) { setError('SKU is required'); return; }
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await apiClient.createProduct({
        sku: form.sku.trim(),
        name: form.name.trim(),
        type: form.type,
        standardCost: form.standardCost ? parseFloat(form.standardCost) : 0,
        salePrice: form.salePrice ? parseFloat(form.salePrice) : 0,
      });
      if (res.success) router.push('/dashboard/inventory/products');
      else setError(res.error || 'Failed');
    } catch { setError('Failed to create product'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/inventory/products" className="text-primary-600 hover:text-primary-700 text-sm">← Products</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">New Product</h1>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
            <input type="text" value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="e.g. SKU-001" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Product name" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={form.type} onChange={(e) => set('type', e.target.value as 'STOCK' | 'SERVICE')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="STOCK">Stock (tracked)</option>
              <option value="SERVICE">Service (not tracked)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Standard Cost</label>
              <input type="number" step="0.01" min="0" value={form.standardCost} onChange={(e) => set('standardCost', e.target.value)} placeholder="0.00" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
              <input type="number" step="0.01" min="0" value={form.salePrice} onChange={(e) => set('salePrice', e.target.value)} placeholder="0.00" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Link href="/dashboard/inventory/products" className="px-4 py-2 border border-gray-300 rounded-md text-sm">Cancel</Link>
            <button type="submit" disabled={submitting} className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
