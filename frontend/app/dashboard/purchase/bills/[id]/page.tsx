'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { STATUS_COLORS, PAYMENT_METHODS, formatCurrency, formatDate } from '@/lib/purchase-config';

interface Payment { id: string; date: string; amount: number; method: string; reference?: string; }
interface VendorBill {
  id: string; number: string; vendorRef?: string; date: string; dueDate?: string; status: string;
  subtotal: number; taxRate: number; taxAmount: number; total: number; paidAmount: number;
  isPosted: boolean; postedAt?: string; notes?: string;
  vendor: { id: string; name: string; email?: string; company?: string };
  purchaseOrder?: { id: string; number: string };
  payments: Payment[];
}

export default function BillDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [bill, setBill] = useState<VendorBill | null>(null);
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

  const load = () => { apiClient.getVendorBill(id).then((res) => { if (res.success) setBill(res.data); }).finally(() => setLoading(false)); };
  const loadJE = (billNumber: string) => { apiClient.getLinkedJournalEntry(`BILL:${billNumber}`).then((res) => { if (res.success && res.data) setJournalEntry(res.data); }); };

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router, id]);

  useEffect(() => {
    if (bill?.isPosted && bill.number) loadJE(bill.number);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bill?.isPosted, bill?.number]);

  const postBill = async () => {
    setActing(true);
    setPostMessage('');
    try {
      const res = await apiClient.postVendorBill(id);
      if (res.success && res.data?.accountingStatus === 'skipped') {
        setPostMessage(res.data.accountingMessage);
      } else if (res.success && res.data?.accountingStatus === 'success') {
        setPostMessage('Journal entry created in Accounting.');
      }
      load();
      if (bill) loadJE(bill.number);
    } finally { setActing(false); }
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault(); setPayError('');
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) { setPayError('Enter a valid amount'); return; }
    setActing(true);
    try {
      const res = await apiClient.recordVendorPayment(id, { date: payDate, amount: amt, method: payMethod, reference: payRef || undefined });
      if (res.success) { setShowPayment(false); setPayAmount(''); setPayRef(''); load(); }
      else setPayError(res.error || 'Failed');
    } catch (err) { setPayError((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed'); }
    finally { setActing(false); }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!bill) return <div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500">Not found</div>;

  const balance = Number(bill.total) - Number(bill.paidAmount);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <Link href="/dashboard/purchase/bills" className="text-primary-600 hover:text-primary-700 text-sm">← Bills</Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{bill.number}</h1>
            <span className={`mt-1 inline-flex px-2 py-0.5 text-xs rounded font-medium ${STATUS_COLORS[bill.status] || ''}`}>{bill.status}</span>
            {bill.purchaseOrder && <Link href={`/dashboard/purchase/orders/${bill.purchaseOrder.id}`} className="ml-2 text-xs text-primary-600 hover:underline">from {bill.purchaseOrder.number}</Link>}
          </div>
          <div className="flex gap-2">
            {!bill.isPosted && <button onClick={postBill} disabled={acting} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm disabled:opacity-50">Post Bill</button>}
            {bill.isPosted && balance > 0.01 && <button onClick={() => setShowPayment(true)} disabled={acting} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm disabled:opacity-50">Record Payment</button>}
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-500 block">Vendor</span><span className="font-medium">{bill.vendor.name}</span></div>
            {bill.vendor.company && <div><span className="text-gray-500 block">Company</span><span className="font-medium">{bill.vendor.company}</span></div>}
            <div><span className="text-gray-500 block">Bill Date</span><span className="font-medium">{formatDate(bill.date)}</span></div>
            {bill.dueDate && <div><span className="text-gray-500 block">Due Date</span><span className="font-medium">{formatDate(bill.dueDate)}</span></div>}
            {bill.vendorRef && <div><span className="text-gray-500 block">Vendor Ref</span><span className="font-medium">{bill.vendorRef}</span></div>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(bill.total)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">
            <p className="text-sm text-gray-500">Paid</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(bill.paidAmount)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">
            <p className="text-sm text-gray-500">Balance</p>
            <p className={`text-2xl font-bold ${balance > 0.01 ? 'text-amber-600' : 'text-green-600'}`}>{balance > 0.01 ? formatCurrency(balance) : 'Fully Paid'}</p>
          </div>
        </div>

        {showPayment && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Record Payment</h2>
            <form onSubmit={submitPayment} className="space-y-4">
              {payError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">{payError}</div>}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Amount</label><input type="number" step="0.01" min="0" max={balance} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder={balance.toFixed(2)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Method</label><select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">{PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Reference</label><input type="text" value={payRef} onChange={(e) => setPayRef(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={acting} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm disabled:opacity-50">Save Payment</button>
                <button type="button" onClick={() => setShowPayment(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {bill.payments.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
            <table className="min-w-full">
              <thead><tr className="text-left text-xs text-gray-500 uppercase border-b"><th className="pb-2">Date</th><th className="pb-2">Method</th><th className="pb-2">Reference</th><th className="pb-2 text-right">Amount</th></tr></thead>
              <tbody>
                {bill.payments.map((p) => (
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
        {postMessage && (
          <div className={`rounded-lg border p-4 ${postMessage.includes('created') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
            <p className="text-sm font-medium">Accounting Integration</p>
            <p className="text-sm mt-1">{postMessage}</p>
          </div>
        )}

        {bill.isPosted && (
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
                <p className="font-medium">No journal entry found for this bill.</p>
                <p className="mt-1">Make sure you have set up in Accounting:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>An <strong>Expense</strong> account in Chart of Accounts</li>
                  <li>A <strong>Liability</strong> account (code starting with 2) for Accounts Payable</li>
                  <li>An open <strong>Fiscal Year</strong> covering the bill date</li>
                </ul>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={async () => {
                      setActing(true); setPostMessage('');
                      try {
                        const res = await apiClient.retryBillAccounting(id);
                        if (res.success) { setPostMessage(res.data.message); loadJE(bill.number); }
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
