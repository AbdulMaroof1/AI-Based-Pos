'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Summary {
  departments: number;
  employees: number;
  todayPresent: number;
  pendingLeaves: number;
}

export default function HrPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    apiClient
      .getHrSummary()
      .then((res) => {
        if (res.success) setSummary(res.data);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const cards = summary
    ? [
        { label: 'Departments', value: summary.departments, href: '/dashboard/hr/departments', color: 'bg-slate-500' },
        { label: 'Employees', value: summary.employees, href: '/dashboard/hr/employees', color: 'bg-blue-500' },
        { label: 'Present Today', value: summary.todayPresent, href: '/dashboard/hr/attendance', color: 'bg-green-500' },
        { label: 'Pending Leaves', value: summary.pendingLeaves, href: '/dashboard/hr/leaves?status=PENDING', color: 'bg-amber-500' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm">
          ← Back to Apps
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">HR</h1>
        <p className="mt-1 text-sm text-gray-500">Departments, employees, attendance & leave</p>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {cards.map((c) => (
                <Link
                  key={c.label}
                  href={c.href}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className={`inline-flex w-3 h-3 rounded-full ${c.color} mb-2`} />
                  <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{c.label}</p>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/dashboard/hr/departments"
                className="bg-white p-5 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <h3 className="font-medium text-gray-900">Departments</h3>
                <p className="text-sm text-gray-500 mt-1">Manage organizational units</p>
              </Link>
              <Link href="/dashboard/hr/employees" className="bg-white p-5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">Employees</h3>
                <p className="text-sm text-gray-500 mt-1">Employee directory & profiles</p>
              </Link>
              <Link href="/dashboard/hr/attendance" className="bg-white p-5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">Attendance</h3>
                <p className="text-sm text-gray-500 mt-1">Mark and view attendance</p>
              </Link>
              <Link href="/dashboard/hr/leaves" className="bg-white p-5 rounded-lg border border-gray-200 hover:bg-gray-50">
                <h3 className="font-medium text-gray-900">Leave</h3>
                <p className="text-sm text-gray-500 mt-1">Apply and approve leave requests</p>
              </Link>
              <Link href="/dashboard/hr/departments/new" className="bg-primary-600 text-white p-5 rounded-lg hover:bg-primary-700">
                <h3 className="font-medium">+ New Department</h3>
                <p className="text-sm text-primary-100 mt-1">Add a department</p>
              </Link>
              <Link href="/dashboard/hr/employees/new" className="bg-indigo-600 text-white p-5 rounded-lg hover:bg-indigo-700">
                <h3 className="font-medium">+ New Employee</h3>
                <p className="text-sm text-indigo-100 mt-1">Register a new employee</p>
              </Link>
              <Link href="/dashboard/hr/leaves/new" className="bg-emerald-600 text-white p-5 rounded-lg hover:bg-emerald-700">
                <h3 className="font-medium">+ Apply Leave</h3>
                <p className="text-sm text-emerald-100 mt-1">Submit a leave request</p>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
