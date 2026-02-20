'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { STATUS_COLORS, PAYMENT_METHODS, formatCurrency, formatDate } from '@/lib/sales-config';

interface Payment { id: string; date: string; amount: number; method: string; reference?: string; notes?: string; }
interface CreditNoteRef { id: string; number: string; status: string; total: number; }
interface SalesInvoice {
  id: string; number: string; date: string; dueDate?: string; status: string;
  subtotal: number; taxRate: number; taxAmount: number; total: number; paidAmount: number;
  isPosted: boolean; postedAt?: string; notes?: string;
  customer: { id: string; name: string; email?: string; company?: string };
  salesOrder?: { id: string; number: string };
  payments: Payment[];
  creditNotes: CreditNoteRef[];
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [invoice, setInvoice] = useState<SalesInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK');
  const [payRef, setPayRef] = useState('');
  const [payError, setPayError] = useState('');
  const [journalEntry, setJournalEntry] = useState<{ id: string; reference: string; memo: string; lines: { account: { code: string; name: string }; debit: number; credit: number }[] } | null>(null);
  const [postMessage, setPostMessage] = useState('');

  const load = () => {
    apiClient.getSalesInvoice(id).then((res) => { if (res.success) setInvoice(res.data); }).finally(() => setLoading(false));
  };
  const loadJE = (invNumber: string) => { apiClient.getLinkedJournalEntry(`INV:${invNumber}`).then((res) => { if (res.success && res.data) setJournalEntry(res.data); }).catch(() => {}); };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router, id]);

  useEffect(() => {
    if (invoice?.isPosted && invoice.number) loadJE(invoice.number);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice?.isPosted, invoice?.number]);

  const postInv = async () => {
    setActing(true);
    setPostMessage('');
    try {
      const res = await apiClient.postSalesInvoice(id);
      if (res.success && res.data?.accountingStatus === 'skipped') {
        setPostMessage(res.data.accountingMessage);
      } else if (res.success && res.data?.accountingStatus === 'success') {
        setPostMessage('Journal entry created in Accounting.');
      }
      load();
      if (invoice) loadJE(invoice.number);
    } finally { setActing(false); }
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayError('');
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) { setPayError('Enter a valid amount'); return; }
    setActing(true);
    try {
      const res = await apiClient.recordPayment(id, { date: payDate, amount: amt, method: payMethod, reference: payRef || undefined });
      if (res.success) { setShowPayment(false); setPayAmount(''); setPayRef(''); load(); }
      else setPayError(res.error || 'Failed');
    } catch (err) {
      setPayError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to record payment');
    } finally { setActing(false); }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!invoice) return <div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Invoice not found</div>;

  const inv = invoice;
  const balance = Number(inv.total) - Number(inv.paidAmount);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/sales/invoices" className="text-primary-600 hover:text-primary-700 text-sm">← Invoices</Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{inv.number}</h1>
            <span className={`mt-1 inline-flex px-2 py-0.5 text-xs rounded font-medium ${STATUS_COLORS[inv.status] || ''}`}>{inv.status}</span>
            {inv.salesOrder && <Link href={`/dashboard/sales/orders/${inv.salesOrder.id}`} className="ml-2 text-xs text-primary-600 hover:underline">from {inv.salesOrder.number}</Link>}
          </div>
          <div className="flex gap-2">
            {!inv.isPosted && (
              <button onClick={postInv} disabled={acting} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm disabled:opacity-50">Post Invoice</button>
            )}
            {inv.isPosted && balance > 0.01 && (
              <button onClick={() => setShowPayment(true)} disabled={acting} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50">Record Payment</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-500 block">Customer</span><span className="font-medium">{inv.customer.name}</span></div>
            {inv.customer.company && <div><span className="text-gray-500 block">Company</span><span className="font-medium">{inv.customer.company}</span></div>}
            <div><span className="text-gray-500 block">Invoice Date</span><span className="font-medium">{formatDate(inv.date)}</span></div>
            {inv.dueDate && <div><span className="text-gray-500 block">Due Date</span><span className="font-medium">{formatDate(inv.dueDate)}</span></div>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(inv.total)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">
            <p className="text-sm text-gray-500">Paid</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(inv.paidAmount)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">
            <p className="text-sm text-gray-500">Balance</p>
            <p className={`text-2xl font-bold ${balance > 0.01 ? 'text-amber-600' : 'text-green-600'}`}>
              {balance > 0.01 ? formatCurrency(balance) : 'Fully Paid'}
            </p>
          </div>
        </div>

        {showPayment && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Record Payment</h2>
            <form onSubmit={submitPayment} className="space-y-4">
              {payError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">{payError}</div>}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input type="number" step="0.01" min="0" max={balance} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder={balance.toFixed(2)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                  <input type="text" value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="Check #, txn ID..." className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={acting} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50">Save Payment</button>
                <button type="button" onClick={() => setShowPayment(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {inv.payments.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
            <table className="min-w-full">
              <thead><tr className="text-left text-xs text-gray-500 uppercase border-b"><th className="pb-2">Date</th><th className="pb-2">Method</th><th className="pb-2">Reference</th><th className="pb-2 text-right">Amount</th></tr></thead>
              <tbody>
                {inv.payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="py-3 text-sm">{formatDate(p.date)}</td>
                    <td className="py-3 text-sm">{p.method}</td>
                    <td className="py-3 text-sm text-gray-500">{p.reference || '—'}</td>
                    <td className="py-3 text-sm text-right font-medium text-green-600">{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {inv.creditNotes.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Credit Notes</h2>
            <div className="space-y-2">
              {inv.creditNotes.map((cn) => (
                <div key={cn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm font-medium">{cn.number}</span>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded font-medium ${STATUS_COLORS[cn.status] || ''}`}>{cn.status}</span>
                  </div>
                  <span className="text-sm font-medium text-red-600">-{formatCurrency(cn.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {postMessage && (
          <div className={`rounded-lg border p-4 ${postMessage.includes('created') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
            <p className="text-sm font-medium">Accounting Integration</p>
            <p className="text-sm mt-1">{postMessage}</p>
          </div>
        )}

        {inv.isPosted && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Accounting Entry</h2>
            {journalEntry ? (
              <div>
                <p className="text-sm text-gray-600 mb-3">{journalEntry.memo} <span className="text-gray-400">({journalEntry.reference})</span></p>
                <table className="min-w-full">
                  <thead><tr className="text-left text-xs text-gray-500 uppercase border-b"><th className="pb-2">Account</th><th className="pb-2 text-right">Debit</th><th className="pb-2 text-right">Credit</th></tr></thead>
                  <tbody>
                    {journalEntry.lines.map((l, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-2 text-sm">{l.account.code} — {l.account.name}</td>
                        <td className="py-2 text-sm text-right">{Number(l.debit) > 0 ? formatCurrency(l.debit) : ''}</td>
                        <td className="py-2 text-sm text-right">{Number(l.credit) > 0 ? formatCurrency(l.credit) : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Link href="/dashboard/accounting/invoicing/journal-entry" className="text-sm text-primary-600 hover:underline mt-3 inline-block">View all journal entries →</Link>
              </div>
            ) : (
              <div className="text-sm text-amber-600 bg-amber-50 p-4 rounded">
                <p className="font-medium">No journal entry found for this invoice.</p>
                <p className="mt-1">Make sure you have set up in Accounting:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>An <strong>Asset</strong> account (code starting with 1) for Accounts Receivable</li>
                  <li>A <strong>Revenue</strong> account in Chart of Accounts</li>
                  <li>An open <strong>Fiscal Year</strong> covering the invoice date</li>
                </ul>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={async () => {
                      setActing(true); setPostMessage('');
                      try {
                        const res = await apiClient.retryInvoiceAccounting(id);
                        if (res.success) { setPostMessage(res.data.message); loadJE(invoice!.number); }
                      } catch (err) {
                        setPostMessage((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create entry');
                      } finally { setActing(false); }
                    }}
                    disabled={acting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                  >
                    {acting ? 'Creating...' : 'Retry: Create Journal Entry'}
                  </button>
                  <Link href="/dashboard/accounting/invoicing/chart-of-accounts" className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 inline-flex items-center">Go to Chart of Accounts</Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
