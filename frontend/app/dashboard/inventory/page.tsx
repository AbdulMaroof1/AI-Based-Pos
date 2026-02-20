'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function InventoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [summary, setSummary] = useState<{ products: number; warehouses: number; locations: number; stockMoves: number; totalQtyOnHand: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    apiClient.getInventorySummary()
      .then((res) => { if (res.success) setSummary(res.data); })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">← Back to Apps</Link>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="mt-1 text-sm text-gray-500">Products, warehouses, locations and stock movements</p>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 mb-8">
              <Link href="/dashboard/inventory/products" className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <p className="text-2xl font-bold text-gray-900">{summary?.products ?? 0}</p>
                <p className="text-sm text-gray-500 mt-1">Products</p>
              </Link>
              <Link href="/dashboard/inventory/warehouses" className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <p className="text-2xl font-bold text-gray-900">{summary?.warehouses ?? 0}</p>
                <p className="text-sm text-gray-500 mt-1">Warehouses</p>
              </Link>
              <Link href="/dashboard/inventory/warehouses" className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <p className="text-2xl font-bold text-gray-900">{summary?.locations ?? 0}</p>
                <p className="text-sm text-gray-500 mt-1">Locations</p>
              </Link>
              <Link href="/dashboard/inventory/stock-moves" className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <p className="text-2xl font-bold text-gray-900">{summary?.stockMoves ?? 0}</p>
                <p className="text-sm text-gray-500 mt-1">Stock Moves</p>
              </Link>
              <Link href="/dashboard/inventory/balances" className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <p className="text-2xl font-bold text-gray-900">{Number(summary?.totalQtyOnHand ?? 0).toFixed(3)}</p>
                <p className="text-sm text-gray-500 mt-1">Total Qty On Hand</p>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/dashboard/inventory/products" className="bg-white p-5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">Products</h3>
                <p className="text-sm text-gray-500 mt-1">Create stock items and services</p>
              </Link>
              <Link href="/dashboard/inventory/warehouses" className="bg-white p-5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">Warehouses &amp; Locations</h3>
                <p className="text-sm text-gray-500 mt-1">Organize stock with warehouses and quarantine</p>
              </Link>
              <Link href="/dashboard/inventory/stock-moves" className="bg-white p-5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">Stock Movements</h3>
                <p className="text-sm text-gray-500 mt-1">Adjustments, transfers and receipts/issues</p>
              </Link>
              <Link href="/dashboard/inventory/balances" className="bg-white p-5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">On-hand Balances</h3>
                <p className="text-sm text-gray-500 mt-1">See quantity by product and location</p>
              </Link>
              <Link href="/dashboard/inventory/settings" className="bg-white p-5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">Inventory Settings</h3>
                <p className="text-sm text-gray-500 mt-1">Enterprise options for purchase stock recognition</p>
              </Link>
              <Link href="/dashboard/inventory/products/new" className="bg-primary-600 text-white p-5 rounded-lg hover:bg-primary-700">
                <h3 className="font-medium">+ New Product</h3>
                <p className="text-sm text-primary-100 mt-1">Add your first SKU</p>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
