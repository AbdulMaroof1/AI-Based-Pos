'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import { ModuleLayout, NavGroup } from '@/components/modules';

interface AccountRow {
  accountId: string;
  code: string;
  name: string;
  amount: number;
}

interface PnLData {
  fiscalYear: { id: string; name: string; startDate: string; endDate: string };
  revenue: AccountRow[];
  expenses: AccountRow[];
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

interface BSData {
  fiscalYear: { id: string; name: string; startDate: string; endDate: string };
  assets: AccountRow[];
  liabilities: AccountRow[];
  equity: AccountRow[];
  retainedEarnings: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
}

type ReportTab = 'pnl' | 'bs';

export default function FinancialReportsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [tab, setTab] = useState<ReportTab>('pnl');
  const [fiscalYears, setFiscalYears] = useState<{ id: string; name: string }[]>([]);
  const [selectedFY, setSelectedFY] = useState('');
  const [pnl, setPnl] = useState<PnLData | null>(null);
  const [bs, setBs] = useState<BSData | null>(null);
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
    const promises = tab === 'pnl'
      ? apiClient.getProfitAndLoss(selectedFY).then((res) => { if (res.success) setPnl(res.data); })
      : apiClient.getBalanceSheet(selectedFY).then((res) => { if (res.success) setBs(res.data); });
    promises.finally(() => setLoading(false));
  }, [selectedFY, tab]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n));

  const ReportSection = ({ title, rows, total, totalLabel }: {
    title: string;
    rows: AccountRow[];
    total: number;
    totalLabel: string;
  }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 pl-4">No data</p>
      ) : (
        <div className="space-y-1">
          {rows.map((row) => (
            <div key={row.accountId} className="flex justify-between px-4 py-1.5 hover:bg-gray-50 rounded">
              <span className="text-sm text-gray-700">
                <span className="text-gray-400 mr-2">{row.code}</span>
                {row.name}
              </span>
              <span className="text-sm font-medium text-gray-900">{fmt(row.amount)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between px-4 py-2 mt-1 bg-gray-50 rounded font-semibold">
        <span className="text-sm text-gray-900">{totalLabel}</span>
        <span className="text-sm text-gray-900">{fmt(total)}</span>
      </div>
    </div>
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
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

        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setTab('pnl')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === 'pnl'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Profit & Loss
          </button>
          <button
            onClick={() => setTab('bs')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === 'bs'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Balance Sheet
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : tab === 'pnl' ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {pnl ? (
              <>
                <div className="text-xs text-gray-500 mb-4">
                  Period: {new Date(pnl.fiscalYear.startDate).toLocaleDateString()} – {new Date(pnl.fiscalYear.endDate).toLocaleDateString()}
                </div>

                <ReportSection title="Revenue" rows={pnl.revenue} total={pnl.totalRevenue} totalLabel="Total Revenue" />
                <ReportSection title="Expenses" rows={pnl.expenses} total={pnl.totalExpenses} totalLabel="Total Expenses" />

                <div className="border-t-2 border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between px-4 py-3 rounded-lg bg-gray-100">
                    <span className="text-base font-bold text-gray-900">Net Income</span>
                    <span className={`text-base font-bold ${pnl.netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {pnl.netIncome >= 0 ? '' : '('}{fmt(pnl.netIncome)}{pnl.netIncome < 0 ? ')' : ''}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No data available for this fiscal year.</p>
                <p className="text-sm text-gray-400 mt-2">Select FY 2026 if your bills/invoices are dated in 2026.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {bs ? (
              <>
                <div className="text-xs text-gray-500 mb-4">
                  As of: {new Date(bs.fiscalYear.endDate).toLocaleDateString()}
                </div>

                <ReportSection title="Assets" rows={bs.assets} total={bs.totalAssets} totalLabel="Total Assets" />

                <div className="border-t border-gray-200 pt-4">
                  <ReportSection title="Liabilities" rows={bs.liabilities} total={bs.totalLiabilities} totalLabel="Total Liabilities" />
                  <ReportSection title="Equity" rows={bs.equity} total={bs.totalEquity} totalLabel="Total Equity" />

                  {bs.retainedEarnings !== 0 && (
                    <div className="flex justify-between px-4 py-2 mb-4 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">Retained Earnings (Current Year P&L)</span>
                      <span className="text-sm font-medium text-gray-900">{fmt(bs.retainedEarnings)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t-2 border-gray-300 pt-3 mt-3 space-y-2">
                  <div className="flex justify-between px-4 py-3 rounded-lg bg-blue-50">
                    <span className="text-base font-bold text-gray-900">Total Assets</span>
                    <span className="text-base font-bold text-gray-900">{fmt(bs.totalAssets)}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3 rounded-lg bg-blue-50">
                    <span className="text-base font-bold text-gray-900">Total Liabilities + Equity</span>
                    <span className="text-base font-bold text-gray-900">{fmt(bs.totalLiabilitiesAndEquity)}</span>
                  </div>
                  {Math.abs(bs.totalAssets - bs.totalLiabilitiesAndEquity) > 0.01 && (
                    <div className="text-center text-sm text-red-600 font-medium mt-2">
                      Imbalance: {fmt(Math.abs(bs.totalAssets - bs.totalLiabilitiesAndEquity))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No data available for this fiscal year.</p>
                <p className="text-sm text-gray-400 mt-2">Select FY 2026 if your bills/invoices are dated in 2026.</p>
              </div>
            )}
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">Only posted journal entries are included in financial reports.</p>
      </div>
    </ModuleLayout>
  );
}
