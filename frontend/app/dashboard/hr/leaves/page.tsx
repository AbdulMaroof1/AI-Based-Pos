'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface LeaveRecord {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number | string;
  status: string;
  reason?: string;
  employee: { id: string; employeeNumber: string; firstName: string; lastName: string };
}

export default function LeavesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams?.get('status') || '';
  const { isAuthenticated } = useAuthStore();
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setLoading(true);
    apiClient
      .getLeaves({ status: statusFilter || undefined })
      .then((res) => {
        if (res.success) setLeaves(res.data);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router, statusFilter]);

  const approve = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await apiClient.approveLeave(id);
    if (res.success) setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'APPROVED' } : l)));
  };

  const reject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await apiClient.rejectLeave(id);
    if (res.success) setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'REJECTED' } : l)));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/hr" className="text-primary-600 hover:text-primary-700 text-sm">
          ← HR
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-gray-900">Leave</h1>
          <Link
            href="/dashboard/hr/leaves/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
          >
            + Apply Leave
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No leave requests found</div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/dashboard/hr/employees/${l.employee.id}`} className="text-primary-600 hover:underline">
                        {l.employee.firstName} {l.employee.lastName} ({l.employee.employeeNumber})
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{l.leaveType}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{String(l.days)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 text-xs rounded font-medium ${
                          l.status === 'APPROVED' ? 'bg-green-100 text-green-700' : l.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {l.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => approve(l.id, e)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={(e) => reject(l.id, e)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      )}
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
