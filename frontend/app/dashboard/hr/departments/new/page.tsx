'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function NewDepartmentPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', code: '', isActive: true });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string | boolean) => setForm({ ...form, [k]: v });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.code.trim()) {
      setError('Code is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await apiClient.createDepartment(form);
      if (res.success) router.push('/dashboard/hr/departments');
      else setError(res.error || 'Failed');
    } catch {
      setError('Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/hr/departments" className="text-primary-600 hover:text-primary-700 text-sm">
          ← Departments
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">New Department</h1>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => set('code', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="e.g. IT, HR, OPS"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label className="text-sm text-gray-700">Active</label>
          </div>
          <div className="flex justify-end gap-3">
            <Link href="/dashboard/hr/departments" className="px-4 py-2 border border-gray-300 rounded-md text-sm">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
