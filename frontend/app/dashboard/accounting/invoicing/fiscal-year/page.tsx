'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
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
  const [lockingId, setLockingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    apiClient.getFiscalYears().then((res) => {
      if (res.success && res.data) setFiscalYears(res.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    load();
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await apiClient.createFiscalYear({
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
      });
      if (res.success) {
        setForm({ name: '', startDate: '', endDate: '' });
        setShowForm(false);
        load();
      } else {
        setError(res.error || 'Failed to create fiscal year');
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error || 'Failed to create fiscal year');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLockToggle = async (fy: FiscalYear) => {
    const action = fy.isLocked ? 'unlock' : 'lock';
    if (!confirm(`${action === 'lock' ? 'Lock' : 'Unlock'} fiscal year "${fy.name}"? ${action === 'lock' ? 'All unposted entries must be posted first.' : ''}`)) return;

    setLockingId(fy.id);
    setError('');
    try {
      const res = fy.isLocked
        ? await apiClient.unlockFiscalYear(fy.id)
        : await apiClient.lockFiscalYear(fy.id);
      if (res.success) {
        load();
      } else {
        setError(res.error || `Failed to ${action}`);
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error || `Failed to ${action}`);
    } finally {
      setLockingId(null);
    }
  };

  const sidebar = (
    <>
      <NavGroup title="Dashboard" items={[{ label: 'Dashboard', href: '/dashboard/accounting/invoicing' }]} />
      <NavGroup
        title="Accounting Masters"
        items={[
          { label: 'Chart of Accounts', href: '/dashboard/accounting/invoicing/chart-of-accounts' },
          { label: 'Fiscal Year', href: '/dashboard/accounting/invoicing/fiscal-year' },
        ]}
        defaultExpanded
      />
      <NavGroup
        title="Entries"
        items={[{ label: 'Journal Entry', href: '/dashboard/accounting/invoicing/journal-entry' }]}
      />
      <NavGroup
        title="Reports"
        items={[
          { label: 'General Ledger', href: '/dashboard/accounting/invoicing/general-ledger' },
          { label: 'Trial Balance', href: '/dashboard/accounting/invoicing/trial-balance' },
          { label: 'Financial Reports', href: '/dashboard/accounting/invoicing/financial-reports' },
        ]}
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>
        )}

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
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
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
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
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
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs rounded font-medium ${
                          fy.isLocked ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {fy.isLocked ? 'Locked' : 'Open'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleLockToggle(fy)}
                          disabled={lockingId === fy.id}
                          className={`text-sm font-medium disabled:opacity-50 ${
                            fy.isLocked
                              ? 'text-green-600 hover:text-green-700'
                              : 'text-amber-600 hover:text-amber-700'
                          }`}
                        >
                          {lockingId === fy.id
                            ? 'Processing...'
                            : fy.isLocked ? 'Unlock' : 'Lock Period'}
                        </button>
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
