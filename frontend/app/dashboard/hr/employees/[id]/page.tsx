'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    departmentId: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    dateOfJoining: '',
    designation: '',
    status: 'ACTIVE',
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiClient.getEmployee(id),
      apiClient.getDepartments(),
    ]).then(([empRes, depRes]) => {
      if (empRes.success && empRes.data) {
        const e = empRes.data;
        setEmployeeNumber(e.employeeNumber);
        setForm({
          firstName: e.firstName || '',
          lastName: e.lastName || '',
          departmentId: e.departmentId || '',
          email: e.email || '',
          phone: e.phone || '',
          dateOfBirth: e.dateOfBirth ? (e.dateOfBirth as string).slice(0, 10) : '',
          dateOfJoining: e.dateOfJoining ? (e.dateOfJoining as string).slice(0, 10) : '',
          designation: e.designation || '',
          status: e.status || 'ACTIVE',
        });
      }
      if (depRes.success) setDepartments(depRes.data);
      setLoading(false);
    });
  }, [id]);

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await apiClient.updateEmployee(id, {
        ...form,
        departmentId: form.departmentId || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        dateOfJoining: form.dateOfJoining || undefined,
      });
      if (res.success) router.push('/dashboard/hr/employees');
      else setError(res.error || 'Failed');
    } catch {
      setError('Failed to update employee');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/hr/employees" className="text-primary-600 hover:text-primary-700 text-sm">
          ← Employees
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Edit Employee {employeeNumber && `(${employeeNumber})`}
        </h1>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">{error}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={form.departmentId}
              onChange={(e) => set('departmentId', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">— Select —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
            <input
              type="text"
              value={form.designation}
              onChange={(e) => set('designation', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => set('dateOfBirth', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Joining</label>
              <input
                type="date"
                value={form.dateOfJoining}
                onChange={(e) => set('dateOfJoining', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Link href="/dashboard/hr/employees" className="px-4 py-2 border border-gray-300 rounded-md text-sm">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
