'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import { ModuleLayout, NavGroup } from '@/components/modules';

interface TrialBalanceRow {
  accountId: string;
  code: string;
  name: string;
  accountType: string;
  debit: number;
  credit: number;
  balance: number;
}

export default function TrialBalancePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [fiscalYears, setFiscalYears] = useState<{ id: string; name: string }[]>([]);
  const [selectedFY, setSelectedFY] = useState('');
  const [data, setData] = useState<{ rows: TrialBalanceRow[]; totalDebit: number; totalCredit: number } | null>(null);
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
      } else {
        setLoading(false);
      }
    });
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!selectedFY) return;
    setLoading(true);
    apiClient.getTrialBalance(selectedFY).then((res) => {
      if (res.success && res.data) setData(res.data);
    }).finally(() => setLoading(false));
  }, [selectedFY]);

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
          <h1 className="text-2xl font-bold text-gray-900">Trial Balance</h1>
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
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : !data || data.rows.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-2">No posted transactions found for this fiscal year.</p>
            <p className="text-sm text-gray-400">Select a different fiscal year above if your bills/invoices are dated in another period (e.g. FY 2026).</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.rows.map((row) => (
                  <tr key={row.accountId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                        {row.accountType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      {row.debit > 0 ? fmt(row.debit) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      {row.credit > 0 ? fmt(row.credit) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm font-bold text-gray-900">Total</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">{fmt(data.totalDebit)}</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">{fmt(data.totalCredit)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-xs text-gray-500">Difference</td>
                  <td colSpan={2} className="px-4 py-2 text-xs text-right">
                    <span className={Math.abs(data.totalDebit - data.totalCredit) < 0.01 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {Math.abs(data.totalDebit - data.totalCredit) < 0.01
                        ? 'Balanced'
                        : fmt(Math.abs(data.totalDebit - data.totalCredit))}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">Only posted journal entries are included in this report.</p>
      </div>
    </ModuleLayout>
  );
}
