'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { STATUS_COLORS, formatCurrency, formatDate } from '@/lib/purchase-config';

interface Line { id: string; description: string; quantity: number; unitPrice: number; amount: number; productId?: string; }
interface PO {
  id: string; number: string; date: string; expectedDate?: string; status: string;
  subtotal: number; taxRate: number; taxAmount: number; total: number; notes?: string;
  vendor: { id: string; name: string; email?: string; company?: string };
  requisition?: { id: string; number: string };
  lines: Line[];
  goodsReceipts: { id: string; number: string; status: string; date: string }[];
  vendorBills: { id: string; number: string; status: string; total: number }[];
}

export default function PODetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [po, setPo] = useState<PO | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = () => { apiClient.getPurchaseOrder(id).then((res) => { if (res.success) setPo(res.data); }).finally(() => setLoading(false)); };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router, id]);

  const changeStatus = async (status: string) => {
    setActing(true);
    try { await apiClient.updatePOStatus(id, status); load(); } finally { setActing(false); }
  };

  const receiveAll = async () => {
    if (!po) return;
    setActing(true);
    try {
      await apiClient.receiveGoods(id, {
        date: new Date().toISOString().split('T')[0],
        lines: po.lines.map((l) => ({ description: l.description, quantity: Number(l.quantity), productId: l.productId })),
      });
      load();
    } finally { setActing(false); }
  };

  const createBill = async () => {
    setActing(true);
    try {
      const res = await apiClient.createBillFromPO(id);
      if (res.success) router.push(`/dashboard/purchase/bills/${res.data.id}`);
    } finally { setActing(false); }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!po) return <div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/purchase/orders" className="text-primary-600 hover:text-primary-700 text-sm">← Purchase Orders</Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{po.number}</h1>
            <span className={`mt-1 inline-flex px-2 py-0.5 text-xs rounded font-medium ${STATUS_COLORS[po.status] || ''}`}>{po.status}</span>
            {po.requisition && <span className="ml-2 text-xs text-gray-500">from {po.requisition.number}</span>}
          </div>
          <div className="flex gap-2">
            {po.status === 'DRAFT' && <button onClick={() => changeStatus('CONFIRMED')} disabled={acting} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50">Confirm</button>}
            {po.status === 'CONFIRMED' && (
              <>
                <button onClick={receiveAll} disabled={acting} className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm disabled:opacity-50">Receive All</button>
                <button onClick={createBill} disabled={acting} className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm disabled:opacity-50">Create Bill</button>
              </>
            )}
            {po.status === 'RECEIVED' && <button onClick={createBill} disabled={acting} className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm disabled:opacity-50">Create Bill</button>}
            {['DRAFT', 'CONFIRMED'].includes(po.status) && <button onClick={() => changeStatus('CANCELLED')} disabled={acting} className="px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm disabled:opacity-50">Cancel</button>}
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-500 block">Vendor</span><span className="font-medium">{po.vendor.name}</span></div>
            {po.vendor.company && <div><span className="text-gray-500 block">Company</span><span className="font-medium">{po.vendor.company}</span></div>}
            <div><span className="text-gray-500 block">Date</span><span className="font-medium">{formatDate(po.date)}</span></div>
            {po.expectedDate && <div><span className="text-gray-500 block">Expected</span><span className="font-medium">{formatDate(po.expectedDate)}</span></div>}
          </div>
          {po.notes && <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">{po.notes}</p>}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h2>
          <table className="min-w-full">
            <thead><tr className="text-left text-xs text-gray-500 uppercase border-b"><th className="pb-2">Description</th><th className="pb-2 text-right">Qty</th><th className="pb-2 text-right">Unit Price</th><th className="pb-2 text-right">Amount</th></tr></thead>
            <tbody>
              {po.lines.map((l) => (
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
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(po.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax ({Number(po.taxRate)}%)</span><span>{formatCurrency(po.taxAmount)}</span></div>
              <div className="flex justify-between border-t pt-1 text-base font-semibold"><span>Total</span><span>{formatCurrency(po.total)}</span></div>
            </div>
          </div>
        </div>

        {po.goodsReceipts.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Goods Receipts</h2>
            {po.goodsReceipts.map((gr) => (
              <div key={gr.id} className="flex items-center justify-between p-3 bg-gray-50 rounded mb-2">
                <span className="text-sm font-medium">{gr.number}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs rounded font-medium ${STATUS_COLORS[gr.status] || ''}`}>{gr.status}</span>
                  <span className="text-xs text-gray-500">{formatDate(gr.date)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {po.vendorBills.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Vendor Bills</h2>
            {po.vendorBills.map((b) => (
              <Link key={b.id} href={`/dashboard/purchase/bills/${b.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded mb-2 hover:bg-gray-100">
                <div><span className="text-sm font-medium text-primary-600">{b.number}</span><span className={`ml-2 px-2 py-0.5 text-xs rounded font-medium ${STATUS_COLORS[b.status] || ''}`}>{b.status}</span></div>
                <span className="text-sm font-medium">{formatCurrency(b.total)}</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
