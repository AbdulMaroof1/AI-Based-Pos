'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { ModuleLayout, NavGroup } from '@/components/modules';

interface Account {
  id: string;
  code: string;
  name: string;
  accountType: string;
  parentId: string | null;
  isActive: boolean;
  parent: { id: string; code: string; name: string } | null;
  children: { id: string; code: string; name: string }[];
}

const TYPE_COLORS: Record<string, string> = {
  ASSET: 'bg-blue-100 text-blue-800',
  LIABILITY: 'bg-orange-100 text-orange-800',
  EQUITY: 'bg-purple-100 text-purple-800',
  REVENUE: 'bg-green-100 text-green-800',
  EXPENSE: 'bg-red-100 text-red-800',
};

export default function ChartOfAccountsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  const loadAccounts = () => {
    apiClient.getAccounts().then((res) => {
      if (res.success && res.data) setAccounts(res.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadAccounts();
  }, [isAuthenticated, router]);

  const handleSeed = async () => {
    setSeeding(true); setSeedMsg('');
    try {
      const res = await apiClient.seedStarterAccounts();
      if (res.success) { setSeedMsg(res.data.message); loadAccounts(); }
      else setSeedMsg(res.error || 'Failed');
    } catch { setSeedMsg('Failed to seed accounts'); }
    finally { setSeeding(false); }
  };

  const filtered = accounts.filter((a) => {
    if (filterType && a.accountType !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
    }
    return true;
  });

  const rootAccounts = filtered.filter((a) => !a.parentId);
  const childMap = new Map<string, Account[]>();
  for (const a of filtered) {
    if (a.parentId) {
      if (!childMap.has(a.parentId)) childMap.set(a.parentId, []);
      childMap.get(a.parentId)!.push(a);
    }
  }

  const renderRow = (account: Account, depth: number) => {
    const children = childMap.get(account.id) || [];
    return (
      <tbody key={account.id}>
        <tr className="hover:bg-gray-50">
          <td className="px-4 py-3 text-sm font-medium text-gray-900" style={{ paddingLeft: `${16 + depth * 24}px` }}>
            {depth > 0 && <span className="text-gray-300 mr-2">└</span>}
            {account.code}
          </td>
          <td className="px-4 py-3 text-sm text-gray-700">{account.name}</td>
          <td className="px-4 py-3">
            <span className={`inline-flex px-2 py-0.5 text-xs rounded font-medium ${TYPE_COLORS[account.accountType] || 'bg-gray-100 text-gray-600'}`}>
              {account.accountType}
            </span>
          </td>
          <td className="px-4 py-3 text-sm text-gray-500">
            {account.parent ? `${account.parent.code} — ${account.parent.name}` : '—'}
          </td>
          <td className="px-4 py-3 text-sm text-gray-500 text-center">
            {account.children.length > 0 ? account.children.length : '—'}
          </td>
        </tr>
        {children.map((child) => renderRow(child, depth + 1))}
      </tbody>
    );
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
          <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
          <div className="flex gap-2">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm font-medium disabled:opacity-50"
            >
              {seeding ? 'Setting up...' : accounts.length === 0 ? 'Quick Setup' : 'Ensure Accounts + Fiscal Year'}
            </button>
            <Link
              href="/dashboard/accounting/invoicing/chart-of-accounts/new"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
            >
              + Add Account
            </Link>
          </div>
        </div>
        {seedMsg && <div className={`mb-4 p-3 rounded text-sm ${seedMsg.includes('Created') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>{seedMsg}</div>}

        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by code or name..."
            className="rounded-md border border-gray-300 px-3 py-2 text-sm flex-1 max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="ASSET">Asset</option>
            <option value="LIABILITY">Liability</option>
            <option value="EQUITY">Equity</option>
            <option value="REVENUE">Revenue</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <span className="text-sm text-gray-500">{filtered.length} accounts</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                {accounts.length === 0 ? (
                  <div>
                    <p className="text-gray-500 mb-4">No accounts yet. Set up a starter chart of accounts to get going quickly.</p>
                    {seedMsg && <p className={`text-sm mb-3 ${seedMsg.includes('Created') ? 'text-green-600' : 'text-amber-600'}`}>{seedMsg}</p>}
                    <button
                      onClick={handleSeed}
                      disabled={seeding}
                      className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium disabled:opacity-50"
                    >
                      {seeding ? 'Setting up...' : 'Setup Starter Chart of Accounts + Fiscal Year'}
                    </button>
                    <p className="text-xs text-gray-400 mt-3">Creates 23 standard accounts (Assets, Liabilities, Equity, Revenue, Expenses) and a fiscal year for {new Date().getFullYear()}.</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No accounts match your filter.</p>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Children</th>
                  </tr>
                </thead>
                {rootAccounts.map((account) => renderRow(account, 0))}
              </table>
            )}
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
