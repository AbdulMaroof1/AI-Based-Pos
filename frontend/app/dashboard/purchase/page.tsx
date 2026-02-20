'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { formatCurrency } from '@/lib/purchase-config';

interface Summary { vendors: number; requisitions: number; orders: number; bills: number; totalPayments: number; totalOutstanding: number; }

export default function PurchasePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    apiClient.getPurchaseSummary()
      .then((res) => { if (res.success) setSummary(res.data); })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const cards = summary ? [
    { label: 'Vendors', value: summary.vendors, href: '/dashboard/purchase/vendors', color: 'bg-slate-500' },
    { label: 'Requisitions', value: summary.requisitions, href: '/dashboard/purchase/requisitions', color: 'bg-blue-500' },
    { label: 'Purchase Orders', value: summary.orders, href: '/dashboard/purchase/orders', color: 'bg-indigo-500' },
    { label: 'Bills', value: summary.bills, href: '/dashboard/purchase/bills', color: 'bg-purple-500' },
    { label: 'Paid', value: formatCurrency(summary.totalPayments), href: '/dashboard/purchase/bills', color: 'bg-green-500' },
    { label: 'Outstanding', value: formatCurrency(summary.totalOutstanding), href: '/dashboard/purchase/bills?status=POSTED', color: 'bg-amber-500' },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm">← Back to Apps</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Purchase</h1>
        <p className="mt-1 text-sm text-gray-500">Vendors, requisitions, purchase orders &amp; bills</p>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {cards.map((c) => (
                <Link key={c.label} href={c.href} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className={`inline-flex w-3 h-3 rounded-full ${c.color} mb-2`} />
                  <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{c.label}</p>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/dashboard/purchase/vendors" className="bg-white p-5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">Vendors</h3>
                <p className="text-sm text-gray-500 mt-1">Manage your suppliers</p>
              </Link>
              <Link href="/dashboard/purchase/requisitions" className="bg-white p-5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">Requisitions</h3>
                <p className="text-sm text-gray-500 mt-1">Submit and approve purchase requests</p>
              </Link>
              <Link href="/dashboard/purchase/orders" className="bg-white p-5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">Purchase Orders</h3>
                <p className="text-sm text-gray-500 mt-1">Create and track purchase orders</p>
              </Link>
              <Link href="/dashboard/purchase/bills" className="bg-white p-5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">Vendor Bills</h3>
                <p className="text-sm text-gray-500 mt-1">Post bills and record payments</p>
              </Link>
              <Link href="/dashboard/purchase/vendors/new" className="bg-primary-600 text-white p-5 rounded-lg hover:bg-primary-700">
                <h3 className="font-medium">+ New Vendor</h3>
                <p className="text-sm text-primary-100 mt-1">Register a new supplier</p>
              </Link>
              <Link href="/dashboard/purchase/orders/new" className="bg-indigo-600 text-white p-5 rounded-lg hover:bg-indigo-700">
                <h3 className="font-medium">+ New PO</h3>
                <p className="text-sm text-indigo-100 mt-1">Create a purchase order</p>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
