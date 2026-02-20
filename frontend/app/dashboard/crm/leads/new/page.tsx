'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { LEAD_SOURCES, SOURCE_LABELS } from '@/lib/crm-config';

export default function NewLeadPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'OTHER',
    expectedRevenue: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) { router.push('/login'); return null; }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.createLead({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        company: form.company || undefined,
        source: form.source,
        expectedRevenue: form.expectedRevenue ? parseFloat(form.expectedRevenue) : undefined,
        notes: form.notes || undefined,
      });
      if (res.success) {
        router.push(`/dashboard/crm/leads/${res.data.id}`);
      } else {
        setError(res.error || 'Failed to create lead');
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/crm/leads" className="text-primary-600 hover:text-primary-700">← Back to Leads</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">New Lead</h1>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text" required placeholder="Full name"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                value={form.name} onChange={(e) => set('name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" placeholder="email@example.com"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                value={form.email} onChange={(e) => set('email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel" placeholder="+1 234 567 890"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                value={form.phone} onChange={(e) => set('phone', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text" placeholder="Company name"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                value={form.company} onChange={(e) => set('company', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                value={form.source} onChange={(e) => set('source', e.target.value)}
              >
                {LEAD_SOURCES.map((s) => <option key={s} value={s}>{SOURCE_LABELS[s] || s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Revenue</label>
              <input
                type="number" step="0.01" min="0" placeholder="0.00"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                value={form.expectedRevenue} onChange={(e) => set('expectedRevenue', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={3} placeholder="Additional notes about this lead..."
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              value={form.notes} onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit" disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'Creating...' : 'Create Lead'}
            </button>
            <Link href="/dashboard/crm/leads" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
