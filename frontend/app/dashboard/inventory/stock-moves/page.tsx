'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface StockMoveLine { productId: string; quantity: number; product?: { sku: string; name: string }; }
interface StockMove { id: string; number: string; type: string; date: string; memo?: string; isPosted: boolean; postedAt?: string; lines: StockMoveLine[]; }

const formatDate = (d: string) => new Date(d).toLocaleDateString();
const TYPE_LABELS: Record<string, string> = { ADJUSTMENT: 'Adjustment', TRANSFER: 'Transfer', QUARANTINE: 'Quarantine', RECEIPT: 'Receipt', ISSUE: 'Issue' };

export default function StockMovesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [moves, setMoves] = useState<StockMove[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    apiClient.getStockMoves()
      .then((res) => { if (res.success) setMoves(res.data); })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const handlePost = async (id: string) => {
    try {
      const res = await apiClient.postStockMove(id);
      if (res.success) {
        setMoves((prev) => prev.map((m) => m.id === id ? { ...m, isPosted: true, postedAt: new Date().toISOString() } : m));
      }
    } catch (e) {
      alert((e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to post');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/inventory" className="text-primary-600 hover:text-primary-700 text-sm">← Inventory</Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-gray-900">Stock Movements</h1>
          <Link href="/dashboard/inventory/stock-moves/new" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium">+ New Stock Move</Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : moves.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No stock moves yet.</p>
            <Link href="/dashboard/inventory/stock-moves/new" className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm">+ Create Stock Move</Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lines</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {moves.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">{m.number}</td>
                    <td className="px-4 py-3 text-sm"><span className="px-2 py-0.5 text-xs rounded bg-gray-100">{TYPE_LABELS[m.type] || m.type}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(m.date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{m.lines?.length ?? 0} line(s)</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded font-medium ${m.isPosted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {m.isPosted ? 'Posted' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!m.isPosted && (
                        <button onClick={() => handlePost(m.id)} className="text-sm font-medium text-primary-600 hover:text-primary-700">
                          Post
                        </button>
                      )}
                    </td>
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
