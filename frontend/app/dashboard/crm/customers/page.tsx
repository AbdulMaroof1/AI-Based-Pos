'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  isActive: boolean;
  createdAt: string;
  leads: { id: string; name: string; status: string }[];
}

export default function CustomersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = (s?: string) => {
    setLoading(true);
    apiClient.getCustomers({ search: s || search || undefined }).then((res) => {
      if (res.success && res.data) {
        setCustomers(res.data.customers);
        setTotal(res.data.total);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    load();
  }, [isAuthenticated, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/crm" className="text-primary-600 hover:text-primary-700">← Back to CRM</Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <span className="text-sm text-gray-500">{total} customers</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <form onSubmit={handleSearch} className="mb-4">
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">No customers yet. Convert a lead to create your first customer.</p>
            <Link href="/dashboard/crm/leads" className="text-primary-600 hover:text-primary-700 font-medium">
              Go to Leads
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From Lead</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{cust.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{cust.company || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{cust.email || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{cust.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      {cust.leads.length > 0 ? (
                        <Link
                          href={`/dashboard/crm/leads/${cust.leads[0].id}`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          {cust.leads[0].name}
                        </Link>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(cust.createdAt).toLocaleDateString()}
                    </td>
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
