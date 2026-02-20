'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { ModuleLayout, NavGroup } from '@/components/modules';

interface LineItem {
  accountId: string;
  debit: string;
  credit: string;
  memo: string;
}

const emptyLine = (): LineItem => ({ accountId: '', debit: '', credit: '', memo: '' });

export default function NewJournalEntryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [accounts, setAccounts] = useState<{ id: string; code: string; name: string }[]>([]);
  const [fiscalYears, setFiscalYears] = useState<{ id: string; name: string; isLocked: boolean }[]>([]);
  const [form, setForm] = useState({
    fiscalYearId: '',
    date: new Date().toISOString().slice(0, 10),
    reference: '',
    memo: '',
  });
  const [lines, setLines] = useState<LineItem[]>([emptyLine(), emptyLine()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    Promise.all([apiClient.getAccounts(), apiClient.getFiscalYears()]).then(([accRes, fyRes]) => {
      if (accRes.success && accRes.data) setAccounts(accRes.data);
      if (fyRes.success && fyRes.data?.length) {
        setFiscalYears(fyRes.data);
        const open = fyRes.data.find((f: { isLocked: boolean }) => !f.isLocked);
        if (open) setForm((f) => ({ ...f, fiscalYearId: open.id }));
      }
    });
  }, [isAuthenticated, router]);

  const updateLine = (idx: number, field: keyof LineItem, value: string) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);

  const removeLine = (idx: number) => {
    if (lines.length <= 2) return;
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalDebit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.fiscalYearId) { setError('Select a fiscal year'); return; }
    if (!isBalanced) { setError('Journal entry must be balanced (debits = credits)'); return; }

    const validLines = lines
      .filter((l) => l.accountId && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0))
      .map((l) => ({
        accountId: l.accountId,
        debit: parseFloat(l.debit) || 0,
        credit: parseFloat(l.credit) || 0,
        memo: l.memo || undefined,
      }));

    if (validLines.length < 2) { setError('At least 2 lines required'); return; }

    setLoading(true);
    try {
      const res = await apiClient.createJournalEntry({
        fiscalYearId: form.fiscalYearId,
        date: form.date,
        reference: form.reference || undefined,
        memo: form.memo || undefined,
        lines: validLines,
      });
      if (res.success) {
        router.push(`/dashboard/accounting/invoicing/journal-entry/${res.data.id}`);
      } else {
        setError(res.error || 'Failed to create journal entry');
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error || 'Failed to create journal entry');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => n.toFixed(2);

  const sidebar = (
    <>
      <NavGroup title="Dashboard" items={[{ label: 'Dashboard', href: '/dashboard/accounting/invoicing' }]} />
      <NavGroup
        title="Accounting Masters"
        items={[
          { label: 'Chart of Accounts', href: '/dashboard/accounting/invoicing/chart-of-accounts' },
          { label: 'Fiscal Year', href: '/dashboard/accounting/invoicing/fiscal-year' },
        ]}
      />
      <NavGroup
        title="Entries"
        items={[{ label: 'Journal Entry', href: '/dashboard/accounting/invoicing/journal-entry' }]}
        defaultExpanded
      />
    </>
  );

  return (
    <ModuleLayout
      moduleName="Invoicing"
      basePath="/dashboard/accounting/invoicing"
      backHref="/dashboard/accounting/invoicing/journal-entry"
      backLabel="Back to Journal Entries"
      sidebar={sidebar}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New Journal Entry</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year</label>
                <select
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  value={form.fiscalYearId}
                  onChange={(e) => setForm((f) => ({ ...f, fiscalYearId: e.target.value }))}
                >
                  <option value="">Select...</option>
                  {fiscalYears.filter((fy) => !fy.isLocked).map((fy) => (
                    <option key={fy.id} value={fy.id}>{fy.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                <input
                  type="text"
                  placeholder="e.g. INV-001"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  value={form.reference}
                  onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Memo</label>
                <input
                  type="text"
                  placeholder="Optional description"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  value={form.memo}
                  onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-2/5">Account</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-1/6">Debit</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-1/6">Credit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Memo</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lines.map((line, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2">
                      <select
                        required
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                        value={line.accountId}
                        onChange={(e) => updateLine(idx, 'accountId', e.target.value)}
                      >
                        <option value="">Select account...</option>
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-right"
                        value={line.debit}
                        onChange={(e) => {
                          updateLine(idx, 'debit', e.target.value);
                          if (parseFloat(e.target.value) > 0) updateLine(idx, 'credit', '');
                        }}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-right"
                        value={line.credit}
                        onChange={(e) => {
                          updateLine(idx, 'credit', e.target.value);
                          if (parseFloat(e.target.value) > 0) updateLine(idx, 'debit', '');
                        }}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        placeholder="Line memo"
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                        value={line.memo}
                        onChange={(e) => updateLine(idx, 'memo', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-2">
                      {lines.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={addLine}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      + Add Line
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-sm">{fmt(totalDebit)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-sm">{fmt(totalCredit)}</td>
                  <td className="px-4 py-3">
                    {totalDebit > 0 && (
                      <span className={`text-xs font-medium ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                        {isBalanced ? 'Balanced' : `Difference: ${fmt(Math.abs(totalDebit - totalCredit))}`}
                      </span>
                    )}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || !isBalanced}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'Creating...' : 'Create Journal Entry'}
            </button>
            <Link
              href="/dashboard/accounting/invoicing/journal-entry"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </ModuleLayout>
  );
}
