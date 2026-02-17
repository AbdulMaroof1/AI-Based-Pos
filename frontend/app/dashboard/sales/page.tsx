'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function SalesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">← Back to Apps</Link>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900">Selling</h1>
        <p className="mt-2 text-gray-600">Coming in Phase 3. Quotations, Sales Orders, Invoices.</p>
      </main>
    </div>
  );
}
