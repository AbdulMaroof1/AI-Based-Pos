'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Product { id: string; sku: string; name: string; type: string; standardCost: number; salePrice: number; isActive: boolean; createdAt: string; }

const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ sku: '', name: '', type: 'STOCK' as 'STOCK' | 'SERVICE', standardCost: '', salePrice: '', isActive: true });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string | number | boolean) => setForm({ ...form, [k]: v });

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    apiClient.getProduct(id).then((res) => {
      if (res.success && res.data) {
        setProduct(res.data);
        setForm({
          sku: res.data.sku,
          name: res.data.name,
          type: res.data.type,
          standardCost: String(res.data.standardCost ?? 0),
          salePrice: String(res.data.salePrice ?? 0),
          isActive: res.data.isActive ?? true,
        });
      }
    }).finally(() => setLoading(false));
  }, [isAuthenticated, router, id]);

  const handleSave = async () => {
    if (!product) return;
    if (!form.sku.trim()) { setError('SKU is required'); return; }
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await apiClient.updateProduct(product.id, {
        sku: form.sku.trim(),
        name: form.name.trim(),
        type: form.type,
        standardCost: form.standardCost ? parseFloat(form.standardCost) : undefined,
        salePrice: form.salePrice ? parseFloat(form.salePrice) : undefined,
        isActive: form.isActive,
      });
      if (res.success) {
        setProduct(res.data);
        setEditMode(false);
      } else setError(res.error || 'Failed');
    } catch { setError('Failed to update'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!product) return <div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Product not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/inventory/products" className="text-primary-600 hover:text-primary-700 text-sm">← Products</Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <span className={`px-2 py-0.5 text-xs rounded font-medium ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{product.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-8">
        {editMode ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <input type="text" value={form.sku} onChange={(e) => set('sku', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => set('type', e.target.value as 'STOCK' | 'SERVICE')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="STOCK">Stock</option>
                <option value="SERVICE">Service</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Standard Cost</label>
                <input type="number" step="0.01" min="0" value={form.standardCost} onChange={(e) => set('standardCost', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
                <input type="number" step="0.01" min="0" value={form.salePrice} onChange={(e) => set('salePrice', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="rounded border-gray-300" />
              <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm">Cancel</button>
              <button type="button" onClick={handleSave} disabled={submitting} className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium disabled:opacity-50">
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500 block">SKU</span><span className="font-medium">{product.sku}</span></div>
              <div><span className="text-gray-500 block">Type</span><span className="font-medium">{product.type}</span></div>
              <div><span className="text-gray-500 block">Standard Cost</span><span className="font-medium">{formatCurrency(Number(product.standardCost))}</span></div>
              <div><span className="text-gray-500 block">Sale Price</span><span className="font-medium">{formatCurrency(Number(product.salePrice))}</span></div>
            </div>
            <div className="mt-6">
              <button type="button" onClick={() => setEditMode(true)} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium">Edit</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
