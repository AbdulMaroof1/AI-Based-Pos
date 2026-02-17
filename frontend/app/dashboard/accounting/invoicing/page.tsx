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
          setSelectedFiscalYear(fyRes.data[0].id);
        }
        if (sumRes.success && sumRes.data) {
          setSummary(sumRes.data);
        }
      } catch {
        setSummary({ outgoingBills: 0, incomingBills: 0, incomingPayment: 0, outgoingPayment: 0 });
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
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

  const sidebar = (
    <>
      <NavGroup
        title="Dashboard"
        items={[{ label: 'Dashboard', href: '/dashboard/accounting/invoicing' }]}
        defaultExpanded
      />
      <NavGroup
        title="Receivables"
        items={[
          { label: 'Customer', href: '/dashboard/accounting/invoicing/customer' },
          { label: 'Sales Invoice', href: '/dashboard/accounting/invoicing/sales-invoice' },
          { label: 'Credit Note', href: '/dashboard/accounting/invoicing/credit-note' },
          { label: 'Accounts Receivable', href: '/dashboard/accounting/invoicing/accounts-receivable' },
        ]}
      />
      <NavGroup
        title="Payables"
        items={[
          { label: 'Supplier', href: '/dashboard/accounting/invoicing/supplier' },
          { label: 'Purchase Invoice', href: '/dashboard/accounting/invoicing/purchase-invoice' },
          { label: 'Debit Note', href: '/dashboard/accounting/invoicing/debit-note' },
          { label: 'Accounts Payable', href: '/dashboard/accounting/invoicing/accounts-payable' },
        ]}
      />
      <NavGroup
        title="Payments"
        items={[
          { label: 'Payment Entry', href: '/dashboard/accounting/invoicing/payment-entry' },
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
                <option key={fy.id} value={fy.id}>
                  {fy.name}
                </option>
              ))
            ) : (
              <option value="">No fiscal year</option>
            )}
          </select>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profit and Loss</h2>
          <div className="h-48 flex items-center justify-center text-gray-400 bg-gray-50 rounded">
            {loading ? 'Loading...' : 'Chart coming soon'}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500">
            {selectedFiscalYear
              ? fiscalYears.find((f) => f.id === selectedFiscalYear)?.name ?? ''
              : 'Select fiscal year'}
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard title="Outgoing Bills" value={formatCurrency(summary.outgoingBills)} />
          <SummaryCard title="Incoming Bills" value={formatCurrency(summary.incomingBills)} />
          <SummaryCard title="Incoming Payment" value={formatCurrency(summary.incomingPayment)} />
          <SummaryCard title="Outgoing Payment" value={formatCurrency(summary.outgoingPayment)} />
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
