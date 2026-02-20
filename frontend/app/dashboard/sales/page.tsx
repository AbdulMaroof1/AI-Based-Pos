'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { formatCurrency } from '@/lib/sales-config';

interface Summary {
  quotations: number;
  orders: number;
  invoices: number;
  totalPayments: number;
  totalOutstanding: number;
}

export default function SalesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    apiClient.getSalesSummary()
      .then((res) => { if (res.success) setSummary(res.data); })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const cards = summary ? [
    { label: 'Quotations', value: summary.quotations, href: '/dashboard/sales/quotations', color: 'bg-blue-500' },
    { label: 'Sales Orders', value: summary.orders, href: '/dashboard/sales/orders', color: 'bg-indigo-500' },
    { label: 'Invoices', value: summary.invoices, href: '/dashboard/sales/invoices', color: 'bg-purple-500' },
    { label: 'Total Payments', value: formatCurrency(summary.totalPayments), href: '/dashboard/sales/invoices', color: 'bg-green-500' },
    { label: 'Outstanding', value: formatCurrency(summary.totalOutstanding), href: '/dashboard/sales/invoices?status=POSTED', color: 'bg-amber-500' },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm">← Back to Apps</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Sales</h1>
        <p className="mt-1 text-sm text-gray-500">Quotations, orders, invoices &amp; payments</p>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {cards.map((c) => (
                <Link key={c.label} href={c.href} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className={`inline-flex w-3 h-3 rounded-full ${c.color} mb-2`} />
                  <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{c.label}</p>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <Link href="/dashboard/sales/quotations" className="bg-white p-5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">Quotations</h3>
                <p className="text-sm text-gray-500 mt-1">Create and manage sales quotations</p>
              </Link>
              <Link href="/dashboard/sales/orders" className="bg-white p-5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">Sales Orders</h3>
                <p className="text-sm text-gray-500 mt-1">Manage confirmed orders and delivery</p>
              </Link>
              <Link href="/dashboard/sales/invoices" className="bg-white p-5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">Invoices</h3>
                <p className="text-sm text-gray-500 mt-1">Post invoices and record payments</p>
              </Link>
              <Link href="/dashboard/sales/credit-notes" className="bg-white p-5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">Credit Notes</h3>
                <p className="text-sm text-gray-500 mt-1">Issue credit notes for adjustments</p>
              </Link>
              <Link href="/dashboard/sales/quotations/new" className="bg-primary-600 text-white p-5 rounded-lg hover:bg-primary-700">
                <h3 className="font-medium">+ New Quotation</h3>
                <p className="text-sm text-primary-100 mt-1">Start a new customer quotation</p>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
