export const REQUISITION_STATUSES = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED'] as const;
export const PO_STATUSES = ['DRAFT', 'CONFIRMED', 'RECEIVED', 'BILLED', 'CANCELLED'] as const;
export const BILL_STATUSES = ['DRAFT', 'POSTED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'] as const;
export const PAYMENT_METHODS = ['CASH', 'BANK', 'CHECK', 'OTHER'] as const;

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-red-50 text-red-600',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  RECEIVED: 'bg-emerald-100 text-emerald-700',
  BILLED: 'bg-purple-100 text-purple-700',
  POSTED: 'bg-indigo-100 text-indigo-700',
  PARTIALLY_PAID: 'bg-amber-100 text-amber-700',
  PAID: 'bg-green-100 text-green-700',
};

export function formatCurrency(n: number | string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n));
}

export function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
