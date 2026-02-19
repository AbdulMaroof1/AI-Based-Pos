'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface ModulePermission {
  moduleName: string;
  isEnabled: boolean;
  enabledAt: string | null;
  enabledBy: string | null;
}

function ModulesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const [tenantId, setTenantId] = useState(searchParams.get('tenantId') || '');
  const [tenants, setTenants] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadTenants();
    if (tenantId) {
      loadPermissions();
    }
  }, [isAuthenticated, router, tenantId]);

  const loadTenants = async () => {
    try {
      const response = await apiClient.getTenants();
      if (response.success) {
        setTenants(response.data?.data ?? response.data ?? []);
      }
    } catch (error) {
      console.error('Failed to load tenants:', error);
    }
  };

  const loadPermissions = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const response = await apiClient.getModulePermissions(tenantId);
      if (response.success) {
        setPermissions(response.data.permissions || []);
      }
    } catch (error) {
      console.error('Failed to load permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (moduleName: string, enabled: boolean) => {
    if (!tenantId || !user?.id) return;
    try {
      if (enabled) {
        await apiClient.enableModule(tenantId, moduleName, user.id);
      } else {
        await apiClient.disableModule(tenantId, moduleName, user.id);
      }
      loadPermissions();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update module');
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
              <h1 className="text-2xl font-bold text-gray-900">Module Access Control</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="zoho-card mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Tenant
          </label>
          <select
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className="zoho-input max-w-md"
          >
            <option value="">-- Select a tenant --</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>

        {tenantId && (
          <div className="zoho-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Module Permissions</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {permissions.map((permission) => (
                  <div
                    key={permission.moduleName}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{permission.moduleName}</h3>
                      <p className="text-sm text-gray-500">
                        {permission.isEnabled
                          ? `Enabled ${permission.enabledAt ? new Date(permission.enabledAt).toLocaleDateString() : ''}`
                          : 'Disabled'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permission.isEnabled}
                        onChange={(e) => toggleModule(permission.moduleName, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ModulesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    }>
      <ModulesContent />
    </Suspense>
  );
}

