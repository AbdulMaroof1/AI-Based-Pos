'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Balance {
  id: string;
  productId: string;
  locationId: string;
  qtyOnHand: number;
  product?: { sku: string; name: string; type: string; standardCost: number };
  location?: { code: string; name: string; warehouseId?: string };
}

export default function BalancesPage() {
  const { isAuthenticated } = useAuthStore();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    apiClient.getStockBalances()
      .then((res) => { if (res.success) setBalances(res.data); })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const formatQty = (n: number) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  const formatCur = (n: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/inventory" className="text-primary-600 hover:text-primary-700 text-sm">← Inventory</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">On-Hand Balances</h1>
        <p className="mt-1 text-sm text-gray-500">Quantity by product and location (only locations with stock shown)</p>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : balances.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No on-hand balances yet.</p>
            <p className="mt-2 text-sm">Post stock moves (adjustments, receipts) to see balances here.</p>
            <Link href="/dashboard/inventory/stock-moves/new" className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm">+ Create Stock Move</Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty On Hand</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value (est.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {balances.map((b) => {
                  const qty = Number(b.qtyOnHand);
                  const cost = Number(b.product?.standardCost ?? 0);
                  const value = qty * cost;
                  return (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{b.product?.sku}</span>
                        <span className="ml-2 text-gray-600">{b.product?.name}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{b.location?.code} — {b.location?.name}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{formatQty(qty)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{formatCur(value)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
