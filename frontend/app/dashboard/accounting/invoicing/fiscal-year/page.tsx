'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { ModuleLayout, NavGroup } from '@/components/modules';

interface FiscalYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
}

export default function FiscalYearPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    apiClient
      .getFiscalYears()
      .then((res) => {
        if (res.success && res.data) setFiscalYears(res.data);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.createFiscalYear({
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
      });
      if (res.success) {
        setForm({ name: '', startDate: '', endDate: '' });
        setShowForm(false);
        const list = await apiClient.getFiscalYears();
        if (list.success && list.data) setFiscalYears(list.data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const sidebar = (
    <>
      <NavGroup
        title="Dashboard"
        items={[{ label: 'Dashboard', href: '/dashboard/accounting/invoicing' }]}
      />
      <NavGroup
        title="Accounting Masters"
        items={[
          { label: 'Chart of Accounts', href: '/dashboard/accounting/invoicing/chart-of-accounts' },
          { label: 'Fiscal Year', href: '/dashboard/accounting/invoicing/fiscal-year' },
        ]}
        defaultExpanded
      />
    </>
  );

  return (
    <ModuleLayout
      moduleName="Invoicing"
      basePath="/dashboard/accounting/invoicing"
      backHref="/dashboard/accounting/invoicing"
      backLabel="Back to Invoicing"
      sidebar={sidebar}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Fiscal Year</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
          >
            {showForm ? 'Cancel' : '+ Add Fiscal Year'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-lg border border-gray-200 space-y-4">
            <h3 className="font-medium">New Fiscal Year</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2025-2026"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </form>
        )}

        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {fiscalYears.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No fiscal years yet. Create one to start.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fiscalYears.map((fy) => (
                    <tr key={fy.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{fy.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(fy.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(fy.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs rounded ${
                            fy.isLocked ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {fy.isLocked ? 'Locked' : 'Open'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
