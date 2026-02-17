'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ModuleLayout, NavGroup } from '@/components/modules';

const TITLES: Record<string, string> = {
  company: 'Company',
  'accounts-settings': 'Accounts Settings',
  'payment-term': 'Payment Term',
  'payment-entry': 'Payment Entry',
  'journal-entry': 'Journal Entry',
  terms: 'Terms and Conditions',
  'mode-of-payment': 'Mode of Payment',
  customer: 'Customer',
  'sales-invoice': 'Sales Invoice',
  'credit-note': 'Credit Note',
  'accounts-receivable': 'Accounts Receivable',
  supplier: 'Supplier',
  'purchase-invoice': 'Purchase Invoice',
  'debit-note': 'Debit Note',
  'accounts-payable': 'Accounts Payable',
  'general-ledger': 'General Ledger',
  'trial-balance': 'Trial Balance',
  'financial-reports': 'Financial Reports',
};

export default function InvoicingSubPage() {
  const params = useParams();
  const slug = (params.slug as string[]) || [];
  const id = slug[0] || '';
  const title = TITLES[id] || id.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'Details';

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
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-4 text-gray-600">This feature is under development.</p>
        <Link
          href="/dashboard/accounting/invoicing"
          className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
        >
          ← Back to Invoicing Dashboard
        </Link>
      </div>
    </ModuleLayout>
  );
}
