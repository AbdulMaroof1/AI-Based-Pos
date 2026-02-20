'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { STATUS_COLORS, ORDER_STATUSES, formatCurrency, formatDate } from '@/lib/sales-config';

interface Order {
  id: string; number: string; date: string; status: string; total: number;
  customer: { id: string; name: string; company?: string };
  _count: { lines: number; invoices: number };
}

export default function SalesOrdersPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(params.get('status') || '');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    setLoading(true);
    apiClient.getSalesOrders({ status: filter || undefined })
      .then((res) => { if (res.success) setOrders(res.data); })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router, filter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/sales" className="text-primary-600 hover:text-primary-700 text-sm">← Sales</Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
          <Link href="/dashboard/sales/orders/new" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium">
            + New Order
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setFilter('')} className={`px-3 py-1 rounded-full text-sm ${!filter ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}>All</button>
          {ORDER_STATUSES.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-full text-sm ${filter === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-700'}`}>{s}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No sales orders found</div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Invoices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/dashboard/sales/orders/${o.id}`)}>
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">{o.number}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{o.customer.name}{o.customer.company ? ` — ${o.customer.company}` : ''}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(o.date)}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded font-medium ${STATUS_COLORS[o.status] || ''}`}>{o.status}</span></td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-500">{o._count.invoices}</td>
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
