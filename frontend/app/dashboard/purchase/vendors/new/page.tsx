'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function NewVendorPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', address: '', taxId: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await apiClient.createVendor(form);
      if (res.success) router.push('/dashboard/purchase/vendors');
      else setError(res.error || 'Failed');
    } catch { setError('Failed to create vendor'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/purchase/vendors" className="text-primary-600 hover:text-primary-700 text-sm">← Vendors</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">New Vendor</h1>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['name', 'company', 'email', 'phone', 'taxId', 'address'] as const).map((f) => (
              <div key={f}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{f === 'taxId' ? 'Tax ID' : f}{f === 'name' ? ' *' : ''}</label>
                <input type={f === 'email' ? 'email' : 'text'} value={form[f]} onChange={(e) => set(f, e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-3">
            <Link href="/dashboard/purchase/vendors" className="px-4 py-2 border border-gray-300 rounded-md text-sm">Cancel</Link>
            <button type="submit" disabled={submitting} className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Vendor'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
