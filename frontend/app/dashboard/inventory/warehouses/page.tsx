'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Location { id: string; code: string; name: string; isQuarantine: boolean; isActive: boolean; }
interface Warehouse { id: string; code: string; name: string; isActive: boolean; locations: Location[]; }

export default function WarehousesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    apiClient.getWarehouses()
      .then((res) => { if (res.success) setWarehouses(res.data); })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/inventory" className="text-primary-600 hover:text-primary-700 text-sm">← Inventory</Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-gray-900">Warehouses &amp; Locations</h1>
          <Link href="/dashboard/inventory/warehouses/new" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium">+ New Warehouse</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : warehouses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No warehouses yet.</p>
            <p className="mt-2 text-sm">Create a warehouse to organize stock. Each warehouse gets Main and Quarantine locations by default.</p>
            <Link href="/dashboard/inventory/warehouses/new" className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm">+ Create Warehouse</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {warehouses.map((wh) => (
              <div key={wh.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-900">{wh.code}</span>
                    <span className="ml-2 text-gray-600">{wh.name}</span>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded ${wh.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{wh.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Locations</p>
                  <div className="flex flex-wrap gap-2">
                    {wh.locations?.map((loc) => (
                      <span key={loc.id} className={`px-2 py-1 text-sm rounded ${loc.isQuarantine ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'}`}>
                        {loc.code} — {loc.name}
                        {loc.isQuarantine && ' (Quarantine)'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
