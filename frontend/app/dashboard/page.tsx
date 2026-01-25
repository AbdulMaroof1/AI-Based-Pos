'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadTenants();
  }, [isAuthenticated, router]);

  const loadTenants = async () => {
    try {
      const response = await apiClient.getTenants();
      if (response.success) {
        setTenants(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">AI-Based POS System</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="zoho-button-secondary text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-600">Manage your tenants and modules</p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/dashboard/tenants" className="zoho-card hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tenants</h3>
            <p className="text-sm text-gray-600">Manage restaurants and branches</p>
            <div className="mt-4 text-2xl font-bold text-primary-600">{tenants.length}</div>
          </Link>

          <Link href="/dashboard/modules" className="zoho-card hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Module Access</h3>
            <p className="text-sm text-gray-600">Enable/disable modules per tenant</p>
          </Link>

          <Link href="/pos" className="zoho-card hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">POS Interface</h3>
            <p className="text-sm text-gray-600">Point of Sale operations</p>
          </Link>
        </div>

        {/* Recent Tenants */}
        <div className="zoho-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tenants</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No tenants yet. Create your first tenant to get started.</p>
              <Link href="/dashboard/tenants" className="zoho-button-primary mt-4 inline-block">
                Create Tenant
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="zoho-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.slice(0, 5).map((tenant) => (
                    <tr key={tenant.id}>
                      <td>{tenant.name}</td>
                      <td>{tenant.email}</td>
                      <td>{tenant.phone}</td>
                      <td>{tenant.address}</td>
                      <td>
                        <Link
                          href={`/dashboard/tenants/${tenant.id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

