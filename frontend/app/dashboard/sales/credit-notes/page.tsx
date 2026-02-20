'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { STATUS_COLORS, formatCurrency, formatDate } from '@/lib/sales-config';

interface CreditNote {
  id: string; number: string; date: string; status: string; total: number; reason?: string;
  customer: { id: string; name: string };
  invoice?: { id: string; number: string };
}

export default function CreditNotesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [notes, setNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    apiClient.getCreditNotes()
      .then((res) => { if (res.success) setNotes(res.data); })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/sales" className="text-primary-600 hover:text-primary-700 text-sm">← Sales</Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-gray-900">Credit Notes</h1>
          <Link href="/dashboard/sales/credit-notes/new" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium">
            + New Credit Note
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No credit notes found</div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {notes.map((cn) => (
                  <tr key={cn.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">{cn.number}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{cn.customer.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{cn.invoice?.number || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(cn.date)}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded font-medium ${STATUS_COLORS[cn.status] || ''}`}>{cn.status}</span></td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-red-600">{formatCurrency(cn.total)}</td>
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
