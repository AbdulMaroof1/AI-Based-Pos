'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { ModuleLayout, NavGroup } from '@/components/modules';

const ACCOUNT_TYPES = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];

export default function NewAccountPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [existingAccounts, setExistingAccounts] = useState<{ id: string; code: string; name: string; accountType: string }[]>([]);
  const [form, setForm] = useState({
    code: '',
    name: '',
    accountType: 'ASSET',
    parentId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    apiClient.getAccounts().then((res) => {
      if (res.success && res.data) setExistingAccounts(res.data);
    });
  }, [isAuthenticated, router]);

  const parentOptions = existingAccounts.filter((a) => a.accountType === form.accountType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.createAccount({
        code: form.code,
        name: form.name,
        accountType: form.accountType,
        parentId: form.parentId || undefined,
      });
      if (res.success) {
        router.push('/dashboard/accounting/invoicing/chart-of-accounts');
      } else {
        setError(res.error || 'Failed to create account');
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
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
    </>
  );

  return (
    <ModuleLayout
      moduleName="Invoicing"
      basePath="/dashboard/accounting/invoicing"
      backHref="/dashboard/accounting/invoicing/chart-of-accounts"
      backLabel="Back to Chart of Accounts"
      sidebar={sidebar}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Account</h1>
        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Code</label>
            <input
              type="text"
              required
              placeholder="e.g. 1000"
              className="w-full rounded border border-gray-300 px-3 py-2"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Cash and Bank"
              className="w-full rounded border border-gray-300 px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select
              className="w-full rounded border border-gray-300 px-3 py-2"
              value={form.accountType}
              onChange={(e) => setForm((f) => ({ ...f, accountType: e.target.value, parentId: '' }))}
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Account (optional)</label>
            <select
              className="w-full rounded border border-gray-300 px-3 py-2"
              value={form.parentId}
              onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
            >
              <option value="">— No parent (root account) —</option>
              {parentOptions.map((a) => (
                <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Only accounts of the same type can be parents. Changing the type resets the parent.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <Link
              href="/dashboard/accounting/invoicing/chart-of-accounts"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </ModuleLayout>
  );
}
