'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Vendor { id: string; name: string; company?: string; }
interface Line { description: string; quantity: number; unitPrice: number; }

export default function NewDirectBillPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorId, setVendorId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [vendorRef, setVendorRef] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Line[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    apiClient.getVendors().then((res) => { if (res.success) setVendors(res.data); });
  }, [isAuthenticated, router]);

  const addLine = () => setLines([...lines, { description: '', quantity: 1, unitPrice: 0 }]);
  const removeLine = (i: number) => lines.length > 1 && setLines(lines.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof Line, value: string | number) => {
    const updated = [...lines];
    (updated[i] as Record<string, unknown>)[field] = value;
    setLines(updated);
  };

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const tax = subtotal * taxRate / 100;
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!vendorId) { setError('Select a vendor'); return; }
    if (lines.some((l) => !l.description)) { setError('All lines need a description'); return; }
    setSubmitting(true);
    try {
      const res = await apiClient.createDirectBill({ vendorId, date, dueDate: dueDate || undefined, vendorRef: vendorRef || undefined, taxRate, notes: notes || undefined, lines });
      if (res.success) router.push(`/dashboard/purchase/bills/${res.data.id}`);
      else setError(res.error || 'Failed');
    } catch { setError('Failed to create bill'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/purchase/bills" className="text-primary-600 hover:text-primary-700 text-sm">← Bills</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">New Direct Bill</h1>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor *</label>
              <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="">Select vendor...</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}{v.company ? ` — ${v.company}` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Reference</label>
              <input type="text" value={vendorRef} onChange={(e) => setVendorRef(e.target.value)} placeholder="Vendor invoice #" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input type="number" step="0.01" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Line Items</h3>
              <button type="button" onClick={addLine} className="text-sm text-primary-600 hover:text-primary-700">+ Add Line</button>
            </div>
            <table className="min-w-full">
              <thead><tr className="text-left text-xs text-gray-500 uppercase"><th className="pb-2">Description</th><th className="pb-2 w-24">Qty</th><th className="pb-2 w-32">Unit Price</th><th className="pb-2 w-28 text-right">Amount</th><th className="pb-2 w-10"></th></tr></thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-2 pr-2"><input type="text" value={l.description} onChange={(e) => updateLine(i, 'description', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" placeholder="Item description" /></td>
                    <td className="py-2 pr-2"><input type="number" step="0.001" min="0" value={l.quantity} onChange={(e) => updateLine(i, 'quantity', parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                    <td className="py-2 pr-2"><input type="number" step="0.01" min="0" value={l.unitPrice} onChange={(e) => updateLine(i, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded px-2 py-1 text-sm" /></td>
                    <td className="py-2 text-right text-sm font-medium">${(l.quantity * l.unitPrice).toFixed(2)}</td>
                    <td className="py-2 text-center">{lines.length > 1 && <button type="button" onClick={() => removeLine(i)} className="text-red-500 hover:text-red-700 text-sm">×</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tax ({taxRate}%)</span><span className="font-medium">${tax.toFixed(2)}</span></div>
                <div className="flex justify-between border-t pt-1 font-semibold"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Link href="/dashboard/purchase/bills" className="px-4 py-2 border border-gray-300 rounded-md text-sm">Cancel</Link>
            <button type="submit" disabled={submitting} className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Bill'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
