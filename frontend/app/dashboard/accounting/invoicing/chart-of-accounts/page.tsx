'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { ModuleLayout, NavGroup } from '@/components/modules';

export default function ChartOfAccountsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [accounts, setAccounts] = useState<{ id: string; code: string; name: string; accountType: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    apiClient
      .getAccounts()
      .then((res) => {
        if (res.success && res.data) setAccounts(res.data);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

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
          <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
          <Link
            href="/dashboard/accounting/invoicing/chart-of-accounts/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
          >
            + Add Account
          </Link>
        </div>
        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {accounts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No accounts yet. Create your first account to get started.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {accounts.map((a) => (
                    <tr key={a.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{a.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{a.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{a.accountType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
