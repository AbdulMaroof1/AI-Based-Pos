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
      { label: 'Chart of Accounts', href: '/dashboard/accounting/invoicing/chart-of-accounts' },
      { label: 'Fiscal Year', href: '/dashboard/accounting/invoicing/fiscal-year' },
    ],
  },
  {
    title: 'Entries',
    items: [
      { label: 'Journal Entry', href: '/dashboard/accounting/invoicing/journal-entry' },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'General Ledger', href: '/dashboard/accounting/invoicing/general-ledger' },
      { label: 'Trial Balance', href: '/dashboard/accounting/invoicing/trial-balance' },
      { label: 'Profit & Loss', href: '/dashboard/accounting/invoicing/financial-reports' },
      { label: 'Balance Sheet', href: '/dashboard/accounting/invoicing/financial-reports' },
    ],
  },
];
