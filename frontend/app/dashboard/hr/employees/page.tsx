'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  designation?: string;
  status: string;
  department?: { id: string; name: string; code: string };
}

export default function EmployeesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setLoading(true);
    Promise.all([
      apiClient.getEmployees({ search: search || undefined, departmentId: departmentFilter || undefined, status: statusFilter || undefined }),
      apiClient.getDepartments({ activeOnly: true }),
    ])
      .then(([empRes, depRes]) => {
        if (empRes.success) setEmployees(empRes.data);
        if (depRes.success) setDepartments(depRes.data);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router, search, departmentFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/hr" className="text-primary-600 hover:text-primary-700 text-sm">
          ← HR
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <Link
            href="/dashboard/hr/employees/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
          >
            + New Employee
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-48"
          />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {(d as { name?: string }).name || '—'}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No employees found</div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emp #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/hr/employees/${e.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-primary-600">{e.employeeNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {e.firstName} {e.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{e.department?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{e.designation || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{e.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 text-xs rounded font-medium ${
                          e.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : e.status === 'TERMINATED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
