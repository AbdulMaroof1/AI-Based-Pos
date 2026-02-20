'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Vendor { id: string; name: string; email?: string; phone?: string; company?: string; isActive: boolean; }

export default function VendorsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    setLoading(true);
    apiClient.getVendors(search || undefined)
      .then((res) => { if (res.success) setVendors(res.data); })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/purchase" className="text-primary-600 hover:text-primary-700 text-sm">← Purchase</Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <Link href="/dashboard/purchase/vendors/new" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium">+ New Vendor</Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-6">
        <input type="text" placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full md:w-80 border border-gray-300 rounded-md px-3 py-2 text-sm mb-4" />
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No vendors found</div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/dashboard/purchase/vendors/${v.id}`)}>
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">{v.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{v.company || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{v.email || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{v.phone || '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded font-medium ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{v.isActive ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
