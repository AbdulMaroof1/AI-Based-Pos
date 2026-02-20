'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import {
  ModuleLayout,
  NavGroup,
  SummaryCard,
  SectionCard,
} from '@/components/modules';
import { INVOICING_MASTER_SECTIONS } from '@/lib/accounting-config';

export default function InvoicingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [fiscalYears, setFiscalYears] = useState<{ id: string; name: string }[]>([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('');
  const [summary, setSummary] = useState({
    totalEntries: 0,
    totalDebit: 0,
    totalCredit: 0,
    outgoingBills: 0,
    incomingBills: 0,
    incomingPayment: 0,
    outgoingPayment: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const load = async () => {
      try {
        const [fyRes, sumRes] = await Promise.all([
          apiClient.getFiscalYears(),
          apiClient.getInvoicingSummary(),
        ]);
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
          setSelectedFiscalYear(containing?.id ?? fyRes.data[0].id);
        }
        if (sumRes.success && sumRes.data) {
          setSummary(sumRes.data);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!selectedFiscalYear) return;
    apiClient.getInvoicingSummary(selectedFiscalYear).then((res) => {
      if (res.success && res.data) setSummary(res.data);
    });
  }, [selectedFiscalYear]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const sidebar = (
    <>
      <NavGroup
        title="Dashboard"
        items={[{ label: 'Dashboard', href: '/dashboard/accounting/invoicing' }]}
        defaultExpanded
      />
      <NavGroup
        title="Accounting Masters"
        items={[
          { label: 'Chart of Accounts', href: '/dashboard/accounting/invoicing/chart-of-accounts' },
          { label: 'Fiscal Year', href: '/dashboard/accounting/invoicing/fiscal-year' },
        ]}
      />
      <NavGroup
        title="Entries"
        items={[
          { label: 'Journal Entry', href: '/dashboard/accounting/invoicing/journal-entry' },
        ]}
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
      backHref="/dashboard/accounting"
      backLabel="Back to Accounting"
      sidebar={sidebar}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">/ Invoicing</h1>
          <select
            value={selectedFiscalYear}
            onChange={(e) => setSelectedFiscalYear(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {fiscalYears.length ? (
              fiscalYears.map((fy) => (
                <option key={fy.id} value={fy.id}>{fy.name}</option>
              ))
            ) : (
              <option value="">No fiscal year</option>
            )}
          </select>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500">
            {selectedFiscalYear
              ? fiscalYears.find((f) => f.id === selectedFiscalYear)?.name ?? ''
              : 'Select fiscal year'}
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard title="Posted Entries" value={String(summary.totalEntries)} />
          <SummaryCard title="Total Debits" value={formatCurrency(summary.totalDebit)} />
          <SummaryCard title="Total Credits" value={formatCurrency(summary.totalCredit)} />
          <SummaryCard
            title="Balance"
            value={
              Math.abs(summary.totalDebit - summary.totalCredit) < 0.01
                ? 'Balanced'
                : formatCurrency(Math.abs(summary.totalDebit - summary.totalCredit))
            }
          />
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reports & Masters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INVOICING_MASTER_SECTIONS.map((section) => (
            <SectionCard
              key={section.title}
              title={section.title}
              items={section.items}
            />
          ))}
        </div>
      </div>
    </ModuleLayout>
  );
}
