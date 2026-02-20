'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Vendor { id: string; name: string; email?: string; phone?: string; company?: string; address?: string; taxId?: string; notes?: string; isActive: boolean; createdAt: string; }

export default function VendorDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    apiClient.getVendor(id).then((res) => { if (res.success) setVendor(res.data); }).finally(() => setLoading(false));
  }, [isAuthenticated, router, id]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!vendor) return <div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Vendor not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/purchase/vendors" className="text-primary-600 hover:text-primary-700 text-sm">← Vendors</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{vendor.name}</h1>
        <span className={`mt-1 inline-flex px-2 py-0.5 text-xs rounded font-medium ${vendor.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{vendor.isActive ? 'Active' : 'Inactive'}</span>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {vendor.company && <div><span className="text-gray-500 block">Company</span><span className="font-medium">{vendor.company}</span></div>}
            {vendor.email && <div><span className="text-gray-500 block">Email</span><span className="font-medium">{vendor.email}</span></div>}
            {vendor.phone && <div><span className="text-gray-500 block">Phone</span><span className="font-medium">{vendor.phone}</span></div>}
            {vendor.address && <div><span className="text-gray-500 block">Address</span><span className="font-medium">{vendor.address}</span></div>}
            {vendor.taxId && <div><span className="text-gray-500 block">Tax ID</span><span className="font-medium">{vendor.taxId}</span></div>}
          </div>
          {vendor.notes && <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">{vendor.notes}</p>}
        </div>
        <div className="mt-6 flex gap-3">
          <Link href={`/dashboard/purchase/orders/new?vendorId=${vendor.id}`} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">Create PO for this vendor</Link>
          <Link href={`/dashboard/purchase/orders?vendorId=${vendor.id}`} className="px-4 py-2 border border-gray-300 rounded-md text-sm">View POs</Link>
        </div>
      </main>
    </div>
  );
}
