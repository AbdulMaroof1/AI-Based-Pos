'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ModuleLayout } from '@/components/modules';

const PLACEHOLDER_MODULES: Record<string, string> = {
  payments: 'Payments',
  'financial-reports': 'Financial Reports',
  'accounts-statement': 'Accounts Statement',
  taxes: 'Taxes',
  banking: 'Banking',
  budget: 'Budget',
  'share-management': 'Share Management',
  subscription: 'Subscription',
};

export default function AccountingSubModulePage() {
  const params = useParams();
  const slug = (params.slug as string[]) || [];
  const moduleId = slug[0] || '';
  const title = PLACEHOLDER_MODULES[moduleId] || moduleId || 'Accounting';

  const sidebar = (
    <div className="text-sm text-gray-500 p-2">Coming soon</div>
  );

  return (
    <ModuleLayout
      moduleName={title}
      basePath={`/dashboard/accounting/${moduleId}`}
      backHref="/dashboard/accounting"
      backLabel="Back to Accounting"
      sidebar={sidebar}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">/ {title}</h1>
        <p className="mt-4 text-gray-600">
          This module is under development. Check back soon.
        </p>
        <Link
          href="/dashboard/accounting/invoicing"
          className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
        >
          → Go to Invoicing (available now)
        </Link>
      </div>
    </ModuleLayout>
  );
}
