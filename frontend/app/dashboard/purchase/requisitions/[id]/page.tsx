'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { STATUS_COLORS, formatDate, formatCurrency } from '@/lib/purchase-config';

interface Line { id: string; description: string; quantity: number; estimatedPrice?: number; }
interface Vendor { id: string; name: string; }
interface Requisition { id: string; number: string; date: string; status: string; requestedBy?: string; notes?: string; vendor?: Vendor; lines: Line[]; }

export default function RequisitionDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [req, setReq] = useState<Requisition | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [convertVendorId, setConvertVendorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showConvert, setShowConvert] = useState(false);

  const load = () => { apiClient.getRequisition(id).then((res) => { if (res.success) setReq(res.data); }).finally(() => setLoading(false)); };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    load();
    apiClient.getVendors().then((res) => { if (res.success) setVendors(res.data); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router, id]);

  const changeStatus = async (status: string) => {
    setActing(true);
    try { await apiClient.updateRequisitionStatus(id, status); load(); } finally { setActing(false); }
  };

  const convert = async () => {
    if (!convertVendorId) return;
    setActing(true);
    try {
      const res = await apiClient.convertRequisitionToPO(id, convertVendorId);
      if (res.success) router.push(`/dashboard/purchase/orders/${res.data.id}`);
    } finally { setActing(false); }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!req) return <div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/purchase/requisitions" className="text-primary-600 hover:text-primary-700 text-sm">← Requisitions</Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{req.number}</h1>
            <span className={`mt-1 inline-flex px-2 py-0.5 text-xs rounded font-medium ${STATUS_COLORS[req.status] || ''}`}>{req.status}</span>
          </div>
          <div className="flex gap-2">
            {req.status === 'DRAFT' && <button onClick={() => changeStatus('SUBMITTED')} disabled={acting} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50">Submit</button>}
            {req.status === 'SUBMITTED' && (
              <>
                <button onClick={() => changeStatus('APPROVED')} disabled={acting} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm disabled:opacity-50">Approve</button>
                <button onClick={() => changeStatus('REJECTED')} disabled={acting} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm disabled:opacity-50">Reject</button>
              </>
            )}
            {req.status === 'APPROVED' && <button onClick={() => setShowConvert(true)} disabled={acting} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm disabled:opacity-50">Convert to PO</button>}
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-500 block">Date</span><span className="font-medium">{formatDate(req.date)}</span></div>
            {req.vendor && <div><span className="text-gray-500 block">Vendor</span><span className="font-medium">{req.vendor.name}</span></div>}
            {req.requestedBy && <div><span className="text-gray-500 block">Requested By</span><span className="font-medium">{req.requestedBy}</span></div>}
          </div>
          {req.notes && <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">{req.notes}</p>}
        </div>

        {showConvert && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Convert to Purchase Order</h2>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Vendor *</label>
                <select value={convertVendorId} onChange={(e) => setConvertVendorId(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option value="">Select vendor...</option>
                  {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <button onClick={convert} disabled={!convertVendorId || acting} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm disabled:opacity-50">Convert</button>
              <button onClick={() => setShowConvert(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm">Cancel</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
          <table className="min-w-full">
            <thead><tr className="text-left text-xs text-gray-500 uppercase border-b"><th className="pb-2">Description</th><th className="pb-2 text-right">Qty</th><th className="pb-2 text-right">Est. Price</th></tr></thead>
            <tbody>
              {req.lines.map((l) => (
                <tr key={l.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm">{l.description}</td>
                  <td className="py-3 text-sm text-right">{Number(l.quantity)}</td>
                  <td className="py-3 text-sm text-right">{l.estimatedPrice ? formatCurrency(l.estimatedPrice) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
