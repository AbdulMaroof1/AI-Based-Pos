'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { ModuleLayout, NavGroup } from '@/components/modules';

interface JournalEntryRow {
  id: string;
  date: string;
  reference: string | null;
  memo: string | null;
  isPosted: boolean;
  postedAt: string | null;
  fiscalYear: { id: string; name: string };
  lines: { debit: number; credit: number }[];
}

export default function JournalEntryListPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [entries, setEntries] = useState<JournalEntryRow[]>([]);
  const [fiscalYears, setFiscalYears] = useState<{ id: string; name: string }[]>([]);
  const [selectedFY, setSelectedFY] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    apiClient.getFiscalYears().then((res) => {
      if (res.success && res.data?.length) {
        setFiscalYears(res.data);
        const today = new Date();
        const containing = res.data.find(
          (fy: { id: string; startDate?: string; endDate?: string }) => {
            const start = fy.startDate ? new Date(fy.startDate) : null;
            const end = fy.endDate ? new Date(fy.endDate) : null;
            return start && end && today >= start && today <= end;
          },
        );
        setSelectedFY(containing?.id ?? res.data[0].id);
      }
    });
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!selectedFY) { setLoading(false); return; }
    setLoading(true);
    apiClient.getJournalEntries(selectedFY).then((res) => {
      if (res.success && res.data) setEntries(res.data);
    }).finally(() => setLoading(false));
  }, [selectedFY]);

  const totalAmount = (lines: { debit: number; credit: number }[]) =>
    lines.reduce((sum, l) => sum + Number(l.debit), 0);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const sidebar = (
    <>
      <NavGroup title="Dashboard" items={[{ label: 'Dashboard', href: '/dashboard/accounting/invoicing' }]} />
      <NavGroup
        title="Accounting Masters"
        items={[
          { label: 'Chart of Accounts', href: '/dashboard/accounting/invoicing/chart-of-accounts' },
          { label: 'Fiscal Year', href: '/dashboard/accounting/invoicing/fiscal-year' },
        ]}
      />
      <NavGroup
        title="Entries"
        items={[{ label: 'Journal Entry', href: '/dashboard/accounting/invoicing/journal-entry' }]}
        defaultExpanded
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
          <h1 className="text-2xl font-bold text-gray-900">Journal Entries</h1>
          <div className="flex items-center gap-3">
            <select
              value={selectedFY}
              onChange={(e) => setSelectedFY(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {fiscalYears.length ? (
                fiscalYears.map((fy) => <option key={fy.id} value={fy.id}>{fy.name}</option>)
              ) : (
                <option value="">No fiscal year</option>
              )}
            </select>
            <Link
              href="/dashboard/accounting/invoicing/journal-entry/new"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
            >
              + New Entry
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">No journal entries yet for this fiscal year.</p>
            <p className="text-sm text-gray-400 mb-4">
              If your bills or invoices are dated in another year, select that fiscal year above (e.g. FY 2026).
            </p>
            <Link
              href="/dashboard/accounting/invoicing/journal-entry/new"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Create your first journal entry
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Memo</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{entry.reference || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{entry.memo || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {fmt(totalAmount(entry.lines))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs rounded font-medium ${
                        entry.isPosted
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entry.isPosted ? 'Posted' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/accounting/invoicing/journal-entry/${entry.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
