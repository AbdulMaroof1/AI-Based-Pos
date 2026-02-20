'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Product { id: string; sku: string; name: string; type: string; }
interface Location { id: string; code: string; name: string; isQuarantine: boolean; warehouseId: string; }
interface Warehouse { id: string; code: string; name: string; locations: Location[]; }

interface Line { productId: string; fromLocationId: string; toLocationId: string; quantity: string; unitCost: string; }

export default function NewStockMovePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [type, setType] = useState<'ADJUSTMENT' | 'TRANSFER' | 'QUARANTINE'>('ADJUSTMENT');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState('');
  const [lines, setLines] = useState<Line[]>([{ productId: '', fromLocationId: '', toLocationId: '', quantity: '1', unitCost: '0' }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([apiClient.getProducts(), apiClient.getWarehouses()]).then(([pRes, wRes]) => {
      if (pRes.success) setProducts(pRes.data.filter((p: Product) => p.type === 'STOCK'));
      if (wRes.success) setWarehouses(wRes.data);
    });
  }, [isAuthenticated]);

  const allLocations = warehouses.flatMap((w) => (w.locations || []).map((l) => ({ ...l, warehouseCode: w.code })));

  const addLine = () => setLines([...lines, { productId: '', fromLocationId: '', toLocationId: '', quantity: '1', unitCost: '0' }]);
  const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i));
  const updateLine = (i: number, k: keyof Line, v: string) => {
    const next = [...lines];
    next[i] = { ...next[i], [k]: v };
    setLines(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validLines = lines.filter((l) => l.productId && (l.fromLocationId || l.toLocationId) && parseFloat(l.quantity) > 0);
    if (validLines.length === 0) { setError('Add at least one line with product, location(s), and quantity'); return; }
    setSubmitting(true); setError('');
    try {
      const payload = {
        type,
        date,
        memo: memo || undefined,
        lines: validLines.map((l) => ({
          productId: l.productId,
          fromLocationId: l.fromLocationId || undefined,
          toLocationId: l.toLocationId || undefined,
          quantity: parseFloat(l.quantity),
          unitCost: parseFloat(l.unitCost) || 0,
        })),
      };
      const res = await apiClient.createStockMove(payload);
      if (res.success) router.push('/dashboard/inventory/stock-moves');
      else setError(res.error || 'Failed');
    } catch { setError('Failed to create'); }
    finally { setSubmitting(false); }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/inventory/stock-moves" className="text-primary-600 hover:text-primary-700 text-sm">← Stock Moves</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">New Stock Move</h1>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as 'ADJUSTMENT' | 'TRANSFER' | 'QUARANTINE')} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="ADJUSTMENT">Adjustment</option>
                <option value="TRANSFER">Transfer</option>
                <option value="QUARANTINE">Quarantine</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Memo</label>
            <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Optional" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Lines</label>
              <button type="button" onClick={addLine} className="text-sm text-primary-600 hover:text-primary-700">+ Add line</button>
            </div>
            <div className="space-y-3">
              {lines.map((line, i) => (
                <div key={i} className="flex flex-wrap gap-2 items-end border border-gray-100 rounded p-3 bg-gray-50">
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs text-gray-500 mb-0.5">Product</label>
                    <select value={line.productId} onChange={(e) => updateLine(i, 'productId', e.target.value)} required className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                      <option value="">Select...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs text-gray-500 mb-0.5">From</label>
                    <select value={line.fromLocationId} onChange={(e) => updateLine(i, 'fromLocationId', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                      <option value="">—</option>
                      {allLocations.map((l) => (
                        <option key={l.id} value={l.id}>{l.warehouseCode}/{l.code}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs text-gray-500 mb-0.5">To</label>
                    <select value={line.toLocationId} onChange={(e) => updateLine(i, 'toLocationId', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                      <option value="">—</option>
                      {allLocations.map((l) => (
                        <option key={l.id} value={l.id}>{l.warehouseCode}/{l.code}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="block text-xs text-gray-500 mb-0.5">Qty</label>
                    <input type="number" step="0.001" min="0.001" value={line.quantity} onChange={(e) => updateLine(i, 'quantity', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                  </div>
                  <div className="w-20">
                    <label className="block text-xs text-gray-500 mb-0.5">Cost</label>
                    <input type="number" step="0.01" min="0" value={line.unitCost} onChange={(e) => updateLine(i, 'unitCost', e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                  </div>
                  <button type="button" onClick={() => removeLine(i)} className="text-red-600 hover:text-red-700 text-sm">✕</button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">For adjustment IN: set To. For adjustment OUT: set From. For transfer: set both From and To.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link href="/dashboard/inventory/stock-moves" className="px-4 py-2 border border-gray-300 rounded-md text-sm">Cancel</Link>
            <button type="submit" disabled={submitting} className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
