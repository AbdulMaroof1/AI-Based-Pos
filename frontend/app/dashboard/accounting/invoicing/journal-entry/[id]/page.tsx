'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { ModuleLayout, NavGroup } from '@/components/modules';

interface JournalEntryDetail {
  id: string;
  date: string;
  reference: string | null;
  memo: string | null;
  isPosted: boolean;
  postedAt: string | null;
  createdAt: string;
  fiscalYear: { id: string; name: string; isLocked: boolean };
  lines: {
    id: string;
    debit: number;
    credit: number;
    memo: string | null;
    account: { id: string; code: string; name: string; accountType: string };
  }[];
}

export default function JournalEntryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [entry, setEntry] = useState<JournalEntryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  const id = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    apiClient.getJournalEntry(id).then((res) => {
      if (res.success && res.data) setEntry(res.data);
      else setError('Journal entry not found');
    }).catch(() => setError('Failed to load journal entry')).finally(() => setLoading(false));
  }, [isAuthenticated, router, id]);

  const handlePost = async () => {
    setActionLoading('post');
    setError('');
    try {
      const res = await apiClient.postJournalEntry(id);
      if (res.success && res.data) setEntry(res.data);
      else setError(res.error || 'Failed to post');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error || 'Failed to post entry');
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this journal entry? This cannot be undone.')) return;
    setActionLoading('delete');
    setError('');
    try {
      const res = await apiClient.deleteJournalEntry(id);
      if (res.success) router.push('/dashboard/accounting/invoicing/journal-entry');
      else setError(res.error || 'Failed to delete');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error || 'Failed to delete entry');
    } finally {
      setActionLoading('');
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n));

  const sidebar = (
    <>
      <NavGroup title="Dashboard" items={[{ label: 'Dashboard', href: '/dashboard/accounting/invoicing' }]} />
      <NavGroup
        title="Entries"
        items={[{ label: 'Journal Entry', href: '/dashboard/accounting/invoicing/journal-entry' }]}
        defaultExpanded
      />
      <NavGroup
        title="Reports"
        items={[
          { label: 'General Ledger', href: '/dashboard/accounting/invoicing/general-ledger' },
          { label: 'Trial Balance', href: '/dashboard/accounting/invoicing/trial-balance' },
          { label: 'Financial Reports', href: '/dashboard/accounting/invoicing/financial-reports' },
        ]}
      />
    </>
  );

  if (loading) {
    return (
      <ModuleLayout moduleName="Invoicing" basePath="/dashboard/accounting/invoicing" backHref="/dashboard/accounting/invoicing/journal-entry" backLabel="Back to Journal Entries" sidebar={sidebar}>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </ModuleLayout>
    );
  }

  if (!entry) {
    return (
      <ModuleLayout moduleName="Invoicing" basePath="/dashboard/accounting/invoicing" backHref="/dashboard/accounting/invoicing/journal-entry" backLabel="Back to Journal Entries" sidebar={sidebar}>
        <div className="p-6">
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">{error || 'Entry not found'}</div>
        </div>
      </ModuleLayout>
    );
  }

  const totalDebit = entry.lines.reduce((s, l) => s + Number(l.debit), 0);
  const totalCredit = entry.lines.reduce((s, l) => s + Number(l.credit), 0);

  return (
    <ModuleLayout
      moduleName="Invoicing"
      basePath="/dashboard/accounting/invoicing"
      backHref="/dashboard/accounting/invoicing/journal-entry"
      backLabel="Back to Journal Entries"
      sidebar={sidebar}
    >
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Journal Entry {entry.reference && <span className="text-gray-500">#{entry.reference}</span>}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {entry.fiscalYear.name} &middot; Created {new Date(entry.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium ${
              entry.isPosted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {entry.isPosted ? 'Posted' : 'Draft'}
            </span>
            {!entry.isPosted && (
              <>
                <button
                  onClick={handlePost}
                  disabled={!!actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                >
                  {actionLoading === 'post' ? 'Posting...' : 'Post Entry'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!!actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                >
                  {actionLoading === 'delete' ? 'Deleting...' : 'Delete'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Date</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{new Date(entry.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Reference</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{entry.reference || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Fiscal Year</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{entry.fiscalYear.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">
                {entry.isPosted ? 'Posted At' : 'Status'}
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {entry.isPosted && entry.postedAt
                  ? new Date(entry.postedAt).toLocaleString()
                  : 'Draft — not yet posted'}
              </p>
            </div>
          </div>
          {entry.memo && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-medium">Memo</p>
              <p className="text-sm text-gray-700 mt-1">{entry.memo}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Memo</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entry.lines.map((line) => (
                <tr key={line.id}>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-medium text-gray-900">{line.account.code}</span>
                    <span className="text-gray-500 ml-2">{line.account.name}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{line.account.accountType}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{line.memo || '—'}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                    {Number(line.debit) > 0 ? fmt(line.debit) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                    {Number(line.credit) > 0 ? fmt(line.credit) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-900">Total</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">{fmt(totalDebit)}</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">{fmt(totalCredit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {entry.isPosted && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
            This entry is posted and cannot be edited or deleted.
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
