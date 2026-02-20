'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { STATUS_COLORS, formatCurrency, formatDate } from '@/lib/sales-config';

interface Line { id: string; description: string; quantity: number; unitPrice: number; amount: number; }
interface Quotation {
  id: string; number: string; date: string; validUntil?: string; status: string;
  subtotal: number; taxRate: number; taxAmount: number; total: number; notes?: string;
  customer: { id: string; name: string; email?: string; company?: string };
  lines: Line[];
}

export default function QuotationDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = () => {
    apiClient.getQuotation(id).then((res) => { if (res.success) setQuotation(res.data); }).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router, id]);

  const changeStatus = async (status: string) => {
    setActing(true);
    try {
      await apiClient.updateQuotationStatus(id, status);
      load();
    } finally { setActing(false); }
  };

  const convert = async () => {
    setActing(true);
    try {
      const res = await apiClient.convertQuotationToOrder(id);
      if (res.success) router.push(`/dashboard/sales/orders/${res.data.id}`);
    } finally { setActing(false); }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!quotation) return <div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Quotation not found</div>;

  const q = quotation;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/sales/quotations" className="text-primary-600 hover:text-primary-700 text-sm">← Quotations</Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{q.number}</h1>
            <span className={`mt-1 inline-flex px-2 py-0.5 text-xs rounded font-medium ${STATUS_COLORS[q.status] || ''}`}>{q.status}</span>
          </div>
          <div className="flex gap-2">
            {q.status === 'DRAFT' && (
              <button onClick={() => changeStatus('SENT')} disabled={acting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50">Mark Sent</button>
            )}
            {q.status === 'SENT' && (
              <>
                <button onClick={() => changeStatus('ACCEPTED')} disabled={acting} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50">Accept</button>
                <button onClick={() => changeStatus('REJECTED')} disabled={acting} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50">Reject</button>
              </>
            )}
            {q.status === 'ACCEPTED' && (
              <button onClick={convert} disabled={acting} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm disabled:opacity-50">Convert to Order</button>
            )}
            {['DRAFT', 'SENT'].includes(q.status) && (
              <button onClick={() => changeStatus('CANCELLED')} disabled={acting} className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 text-sm disabled:opacity-50">Cancel</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-500 block">Customer</span><span className="font-medium">{q.customer.name}</span></div>
            {q.customer.company && <div><span className="text-gray-500 block">Company</span><span className="font-medium">{q.customer.company}</span></div>}
            <div><span className="text-gray-500 block">Date</span><span className="font-medium">{formatDate(q.date)}</span></div>
            {q.validUntil && <div><span className="text-gray-500 block">Valid Until</span><span className="font-medium">{formatDate(q.validUntil)}</span></div>}
          </div>
          {q.notes && <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">{q.notes}</p>}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h2>
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b">
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Qty</th>
                <th className="pb-2 text-right">Unit Price</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {q.lines.map((l) => (
                <tr key={l.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm">{l.description}</td>
                  <td className="py-3 text-sm text-right">{Number(l.quantity)}</td>
                  <td className="py-3 text-sm text-right">{formatCurrency(l.unitPrice)}</td>
                  <td className="py-3 text-sm text-right font-medium">{formatCurrency(l.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(q.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax ({Number(q.taxRate)}%)</span><span>{formatCurrency(q.taxAmount)}</span></div>
              <div className="flex justify-between border-t pt-1 text-base font-semibold"><span>Total</span><span>{formatCurrency(q.total)}</span></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
