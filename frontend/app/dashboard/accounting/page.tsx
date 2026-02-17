'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { ModuleGridCard } from '@/components/modules';
import { ACCOUNTING_SUB_MODULES } from '@/lib/accounting-config';

export default function AccountingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
          ← Back to Apps
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Accounting</h1>
        <p className="mt-1 text-sm text-gray-500">Select a module to get started</p>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {ACCOUNTING_SUB_MODULES.map((mod) => (
            <ModuleGridCard
              key={mod.id}
              title={mod.title}
              href={mod.href}
              icon={mod.icon}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
