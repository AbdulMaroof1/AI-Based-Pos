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

export default function TenantsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.createTenant(formData);
      if (response.success) {
        setShowCreateForm(false);
        setFormData({ name: '', email: '', phone: '', address: '' });
        loadTenants();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create tenant');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="zoho-button-primary"
            >
              {showCreateForm ? 'Cancel' : '+ Create Tenant'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showCreateForm && (
          <div className="zoho-card mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Tenant</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    className="zoho-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="zoho-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    className="zoho-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    required
                    className="zoho-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="zoho-button-primary">
                Create Tenant
              </button>
            </form>
          </div>
        )}

        <div className="zoho-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Tenants</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No tenants found. Create your first tenant.</p>
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
                  {tenants.map((tenant) => (
                    <tr key={tenant.id}>
                      <td className="font-medium">{tenant.name}</td>
                      <td>{tenant.email}</td>
                      <td>{tenant.phone}</td>
                      <td>{tenant.address}</td>
                      <td>
                        <Link
                          href={`/dashboard/tenants/${tenant.id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm mr-4"
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/modules?tenantId=${tenant.id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          Modules
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

