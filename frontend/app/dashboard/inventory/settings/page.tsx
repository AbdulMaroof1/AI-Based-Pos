'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function InventorySettingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [recognition, setRecognition] = useState<'RECEIPT' | 'BILL'>('RECEIPT');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    apiClient.getInventorySettings()
      .then((res) => {
        if (res.success && res.data?.purchaseStockRecognition) {
          setRecognition(res.data.purchaseStockRecognition);
        }
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const handleSave = async () => {
    setSaving(true); setMessage('');
    try {
      const res = await apiClient.updateInventorySettings({ purchaseStockRecognition: recognition });
      if (res.success) setMessage('Settings saved.');
    } catch { setMessage('Failed to save'); }
    finally { setSaving(false); }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/inventory" className="text-primary-600 hover:text-primary-700 text-sm">← Inventory</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Inventory Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Enterprise options for purchase and accounting</p>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Purchase Stock Recognition</h2>
              <p className="text-sm text-gray-500 mb-4">When should purchased inventory be added to stock?</p>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50/50">
                  <input type="radio" name="recognition" value="RECEIPT" checked={recognition === 'RECEIPT'} onChange={() => setRecognition('RECEIPT')} className="mt-1 text-primary-600" />
                  <div>
                    <span className="font-medium text-gray-900">On Goods Receipt</span>
                    <span className="block text-xs text-gray-500 mt-0.5">Recommended. Stock increases when you receive goods, before the vendor bill.</span>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50/50">
                  <input type="radio" name="recognition" value="BILL" checked={recognition === 'BILL'} onChange={() => setRecognition('BILL')} className="mt-1 text-primary-600" />
                  <div>
                    <span className="font-medium text-gray-900">On Vendor Bill</span>
                    <span className="block text-xs text-gray-500 mt-0.5">Stock increases when the vendor bill is posted.</span>
                  </div>
                </label>
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded text-sm ${message.includes('saved') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                {message}
              </div>
            )}

            <div className="flex justify-end">
              <button type="button" onClick={handleSave} disabled={saving} className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
