import {
  FileText,
  CreditCard,
  BarChart3,
  FileStack,
  Percent,
  Landmark,
  PiggyBank,
  Share2,
  Repeat,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AccountingSubModule {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
}

export const ACCOUNTING_SUB_MODULES: AccountingSubModule[] = [
  { id: 'invoicing', title: 'Invoicing', href: '/dashboard/accounting/invoicing', icon: FileText },
  { id: 'payments', title: 'Payments', href: '/dashboard/accounting/payments', icon: CreditCard },
  { id: 'financial-reports', title: 'Financial Reports', href: '/dashboard/accounting/financial-reports', icon: BarChart3 },
  { id: 'accounts-statement', title: 'Accounts Statement', href: '/dashboard/accounting/accounts-statement', icon: FileStack },
  { id: 'taxes', title: 'Taxes', href: '/dashboard/accounting/taxes', icon: Percent },
  { id: 'banking', title: 'Banking', href: '/dashboard/accounting/banking', icon: Landmark },
  { id: 'budget', title: 'Budget', href: '/dashboard/accounting/budget', icon: PiggyBank },
  { id: 'share-management', title: 'Share Management', href: '/dashboard/accounting/share-management', icon: Share2 },
  { id: 'subscription', title: 'Subscription', href: '/dashboard/accounting/subscription', icon: Repeat },
];

export interface MasterSection {
  title: string;
  items: { label: string; href: string }[];
}

export const INVOICING_MASTER_SECTIONS: MasterSection[] = [
  {
    title: 'Accounting Masters',
    items: [
      { label: 'Company', href: '/dashboard/accounting/invoicing/company' },
      { label: 'Chart of Accounts', href: '/dashboard/accounting/invoicing/chart-of-accounts' },
      { label: 'Accounts Settings', href: '/dashboard/accounting/invoicing/accounts-settings' },
      { label: 'Fiscal Year', href: '/dashboard/accounting/invoicing/fiscal-year' },
      { label: 'Payment Term', href: '/dashboard/accounting/invoicing/payment-term' },
    ],
  },
  {
    title: 'Payments',
    items: [
      { label: 'Payment Entry', href: '/dashboard/accounting/invoicing/payment-entry' },
      { label: 'Journal Entry', href: '/dashboard/accounting/invoicing/journal-entry' },
      { label: 'Terms and Conditions', href: '/dashboard/accounting/invoicing/terms' },
      { label: 'Mode of Payment', href: '/dashboard/accounting/invoicing/mode-of-payment' },
    ],
  },
  {
    title: 'Receivables',
    items: [
      { label: 'Customer', href: '/dashboard/accounting/invoicing/customer' },
      { label: 'Sales Invoice', href: '/dashboard/accounting/invoicing/sales-invoice' },
      { label: 'Credit Note', href: '/dashboard/accounting/invoicing/credit-note' },
      { label: 'Accounts Receivable', href: '/dashboard/accounting/invoicing/accounts-receivable' },
    ],
  },
  {
    title: 'Payables',
    items: [
      { label: 'Supplier', href: '/dashboard/accounting/invoicing/supplier' },
      { label: 'Purchase Invoice', href: '/dashboard/accounting/invoicing/purchase-invoice' },
      { label: 'Debit Note', href: '/dashboard/accounting/invoicing/debit-note' },
      { label: 'Accounts Payable', href: '/dashboard/accounting/invoicing/accounts-payable' },
    ],
  },
];
