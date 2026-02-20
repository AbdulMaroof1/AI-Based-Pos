'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { ModuleLayout, NavGroup } from '@/components/modules';

interface LedgerEntry {
  journalEntryId: string;
  date: string;
  reference: string | null;
  memo: string | null;
  debit: number;
  credit: number;
  balance: number;
}

interface LedgerGroup {
  accountId: string;
  code: string;
  name: string;
  accountType: string;
  entries: LedgerEntry[];
  totalDebit: number;
  totalCredit: number;
}

export default function GeneralLedgerPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [fiscalYears, setFiscalYears] = useState<{ id: string; name: string }[]>([]);
  const [accounts, setAccounts] = useState<{ id: string; code: string; name: string }[]>([]);
  const [selectedFY, setSelectedFY] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [data, setData] = useState<LedgerGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    Promise.all([apiClient.getFiscalYears(), apiClient.getAccounts()]).then(([fyRes, accRes]) => {
      if (fyRes.success && fyRes.data?.length) {
        setFiscalYears(fyRes.data);
        const today = new Date();
        const containing = fyRes.data.find(
          (fy: { id: string; startDate?: string; endDate?: string }) => {
            const start = fy.startDate ? new Date(fy.startDate) : null;
            const end = fy.endDate ? new Date(fy.endDate) : null;
            return start && end && today >= start && today <= end;
          },
        );
        setSelectedFY(containing?.id ?? fyRes.data[0].id);
      }
      if (accRes.success && accRes.data) setAccounts(accRes.data);
    }).finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!selectedFY) return;
    setLoading(true);
    apiClient.getLedger({
      fiscalYearId: selectedFY,
      accountId: selectedAccount || undefined,
    }).then((res) => {
      if (res.success && res.data) setData(res.data);
    }).finally(() => setLoading(false));
  }, [selectedFY, selectedAccount]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const sidebar = (
    <>
      <NavGroup title="Dashboard" items={[{ label: 'Dashboard', href: '/dashboard/accounting/invoicing' }]} />
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
          <h1 className="text-2xl font-bold text-gray-900">General Ledger</h1>
          <div className="flex items-center gap-3">
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
              ))}
            </select>
            <select
              value={selectedFY}
              onChange={(e) => setSelectedFY(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {fiscalYears.map((fy) => <option key={fy.id} value={fy.id}>{fy.name}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-2">No posted transactions found for this fiscal year.</p>
            <p className="text-sm text-gray-400">Select a different fiscal year if your bills/invoices are dated in another period.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((group) => (
              <div key={group.accountId} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-900">{group.code}</span>
                      <span className="ml-2 text-gray-600">{group.name}</span>
                    </div>
                    <span className="inline-flex px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                      {group.accountType}
                    </span>
                  </div>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase">
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-left font-medium">Reference</th>
                      <th className="px-4 py-2 text-left font-medium">Memo</th>
                      <th className="px-4 py-2 text-right font-medium">Debit</th>
                      <th className="px-4 py-2 text-right font-medium">Credit</th>
                      <th className="px-4 py-2 text-right font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {group.entries.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {entry.journalEntryId ? (
                            <Link
                              href={`/dashboard/accounting/invoicing/journal-entry/${entry.journalEntryId}`}
                              className="text-primary-600 hover:text-primary-700"
                            >
                              {entry.reference || 'View'}
                            </Link>
                          ) : (
                            <span className="text-gray-500">{entry.reference || '—'}</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate">{entry.memo || '—'}</td>
                        <td className="px-4 py-2 text-sm text-right font-medium">
                          {entry.debit > 0 ? fmt(entry.debit) : '—'}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-medium">
                          {entry.credit > 0 ? fmt(entry.credit) : '—'}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-semibold">
                          <span className={entry.balance < 0 ? 'text-red-600' : 'text-gray-900'}>
                            {fmt(Math.abs(entry.balance))}{entry.balance < 0 ? ' Cr' : ' Dr'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-sm font-semibold text-gray-900">Account Total</td>
                      <td className="px-4 py-2 text-sm text-right font-bold">{fmt(group.totalDebit)}</td>
                      <td className="px-4 py-2 text-sm text-right font-bold">{fmt(group.totalCredit)}</td>
                      <td className="px-4 py-2 text-sm text-right font-bold">
                        {fmt(Math.abs(group.totalDebit - group.totalCredit))}
                        {group.totalDebit - group.totalCredit < 0 ? ' Cr' : ' Dr'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">Only posted journal entries are included.</p>
      </div>
    </ModuleLayout>
  );
}
