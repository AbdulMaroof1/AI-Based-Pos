'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Product { id: string; sku: string; name: string; type: string; standardCost: number; salePrice: number; isActive: boolean; }

const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export default function ProductsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    setLoading(true);
    apiClient.getProducts(search || undefined)
      .then((res) => { if (res.success) setProducts(res.data); })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/inventory" className="text-primary-600 hover:text-primary-700 text-sm">← Inventory</Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <Link href="/dashboard/inventory/products/new" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium">+ New Product</Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-6">
        <input type="text" placeholder="Search by SKU or name..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-80 border border-gray-300 rounded-md px-3 py-2 text-sm mb-4" />
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No products found</div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/dashboard/inventory/products/${p.id}`)}>
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">{p.sku}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{p.name}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded ${p.type === 'STOCK' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{p.type}</span></td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(Number(p.standardCost))}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700">{formatCurrency(Number(p.salePrice))}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
