'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    apiClient.logout();
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Apps
          </Link>
          <span className="text-sm text-gray-600">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">ABMNEXT ERP Settings</h1>
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          <div className="mt-4 flex gap-3">
          <Link
            href="/dashboard/modules"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
          >
            Module Access
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
          >
            Logout
          </button>
        </div>
        </div>
      </main>
    </div>
  );
}
