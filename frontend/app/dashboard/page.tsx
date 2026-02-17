'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { Search, LayoutGrid } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';

interface ActiveModule {
  moduleName: string;
  label: string;
  href: string;
  displayOrder: number;
}

function AppLauncherDashboard({
  user,
  onLogout,
}: {
  user: { firstName?: string; lastName?: string; tenantId?: string };
  onLogout: () => void;
}) {
  const [activeModules, setActiveModules] = useState<ActiveModule[]>([]);
  const [enabledModuleNames, setEnabledModuleNames] = useState<Set<string> | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const tenantId = user?.tenantId;

  useEffect(() => {
    apiClient
      .getActiveModules()
      .then((res) => {
        if (res.success && res.data) {
          setActiveModules(res.data);
        }
        setLoading(false);
      })
      .catch(() => {
        setActiveModules([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (tenantId) {
      apiClient
        .getModulePermissions(tenantId)
        .then((res) => {
          if (res.success && res.data?.permissions) {
            const enabled = new Set(
              (res.data.permissions as { moduleName: string; isEnabled: boolean }[])
                .filter((p) => p.isEnabled)
                .map((p) => p.moduleName)
            );
            setEnabledModuleNames(enabled);
          } else {
            setEnabledModuleNames(new Set());
          }
        })
        .catch(() => setEnabledModuleNames(new Set()));
    } else {
      setEnabledModuleNames(new Set(['ALL']));
    }
  }, [tenantId]);

  const filteredApps = activeModules.filter((app) => {
    const matchesSearch = !search || app.label.toLowerCase().includes(search.toLowerCase());
    const hasAccess =
      app.moduleName === 'SETTINGS' ||
      enabledModuleNames === null ||
      enabledModuleNames.has('ALL') ||
      enabledModuleNames.has(app.moduleName);
    return matchesSearch && hasAccess;
  });

  const initials = [user?.firstName?.[0] || '', user?.lastName?.[0] || ''].filter(Boolean).join('').toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-400 rounded-sm" />
          </div>
          <div className="flex-1 max-w-xl mx-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Q Search"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Ctrl+K</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/settings"
              className="text-primary-600 font-medium text-sm hover:text-primary-700"
            >
              {initials}
            </Link>
            <button
              onClick={onLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No apps available. Your administrator will enable modules for your company.</p>
            <p className="mt-2 text-sm">
              If you just registered, try refreshing the page. Otherwise, ask your admin to enable modules in Module Access.
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredApps.map((app) => (
            <Link
              key={app.moduleName}
              href={app.href}
              className="flex flex-col items-center p-6 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-colors group"
            >
              <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-3 bg-primary-100 text-primary-600 group-hover:bg-primary-200 transition-colors">
                <LayoutGrid className="w-7 h-7" />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">{app.label}</span>
            </Link>
          ))}
        </div>
        )}
      </main>
    </div>
  );
}

function AdminDashboard({
  user,
  tenants,
  loading,
  onLogout,
}: {
  user: { firstName?: string; lastName?: string };
  tenants: Tenant[];
  loading: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">ABMNEXT ERP</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.firstName} {user?.lastName}
              </span>
              <button onClick={onLogout} className="zoho-button-secondary text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
          <p className="text-sm text-gray-600">Manage your tenants and modules</p>
        </div>

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

        <div className="zoho-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tenants</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
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

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role === SUPER_ADMIN_ROLE) {
      loadTenants();
    } else {
      setLoading(false);
    }
  }, [mounted, isAuthenticated, user?.role, router]);

  const loadTenants = async () => {
    try {
      const response = await apiClient.getTenants();
      if (response.success) {
        setTenants(response.data?.data ?? response.data ?? []);
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

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const isSuperAdmin = user.role === SUPER_ADMIN_ROLE;

  return isSuperAdmin ? (
    <AdminDashboard user={user} tenants={tenants} loading={loading} onLogout={handleLogout} />
  ) : (
    <AppLauncherDashboard user={user} onLogout={handleLogout} />
  );
}
