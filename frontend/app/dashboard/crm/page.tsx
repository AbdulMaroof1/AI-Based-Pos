'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { STATUS_COLORS } from '@/lib/crm-config';

interface PipelineStat {
  status: string;
  count: number;
  expectedRevenue: number;
}

export default function CrmPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [pipeline, setPipeline] = useState<PipelineStat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    apiClient.getLeadPipeline().then((res) => {
      if (res.success && res.data) {
        setPipeline(res.data.pipeline);
        setTotal(res.data.total);
      }
    }).finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">← Back to Apps</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">CRM</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your leads and customers</p>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Lead Pipeline</h2>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/crm/customers"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium"
            >
              View Customers
            </Link>
            <Link
              href="/dashboard/crm/leads/new"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
            >
              + New Lead
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
              {pipeline.map((stat) => (
                <Link
                  key={stat.status}
                  href={`/dashboard/crm/leads?status=${stat.status}`}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <span className={`inline-flex px-2 py-0.5 text-xs rounded font-medium ${STATUS_COLORS[stat.status] || 'bg-gray-100 text-gray-600'}`}>
                    {stat.status}
                  </span>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{stat.count}</p>
                  {stat.expectedRevenue > 0 && (
                    <p className="text-xs text-gray-500 mt-1">${fmt(stat.expectedRevenue)}</p>
                  )}
                </Link>
              ))}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                <span className="text-sm text-gray-500">{total} total leads</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/dashboard/crm/leads" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <h4 className="font-medium text-gray-900">All Leads</h4>
                  <p className="text-sm text-gray-500 mt-1">View and manage all leads</p>
                </Link>
                <Link href="/dashboard/crm/leads?status=NEW" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <h4 className="font-medium text-gray-900">New Leads</h4>
                  <p className="text-sm text-gray-500 mt-1">Leads awaiting first contact</p>
                </Link>
                <Link href="/dashboard/crm/customers" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <h4 className="font-medium text-gray-900">Customers</h4>
                  <p className="text-sm text-gray-500 mt-1">Converted leads and customers</p>
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
