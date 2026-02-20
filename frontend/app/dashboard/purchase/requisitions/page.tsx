'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { STATUS_COLORS, REQUISITION_STATUSES, formatDate } from '@/lib/purchase-config';

interface Requisition { id: string; number: string; date: string; status: string; requestedBy?: string; vendor?: { id: string; name: string }; _count: { lines: number }; }

export default function RequisitionsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [items, setItems] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    setLoading(true);
    apiClient.getRequisitions({ status: filter || undefined })
      .then((res) => { if (res.success) setItems(res.data); })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router, filter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/purchase" className="text-primary-600 hover:text-primary-700 text-sm">← Purchase</Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-gray-900">Purchase Requisitions</h1>
          <Link href="/dashboard/purchase/requisitions/new" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium">+ New Requisition</Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setFilter('')} className={`px-3 py-1 rounded-full text-sm ${!filter ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}>All</button>
          {REQUISITION_STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-full text-sm ${filter === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}>{s}</button>
          ))}
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No requisitions found</div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Lines</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/dashboard/purchase/requisitions/${r.id}`)}>
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">{r.number}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(r.date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.vendor?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{r.requestedBy || '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded font-medium ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span></td>
                    <td className="px-4 py-3 text-sm text-center text-gray-500">{r._count.lines}</td>
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
