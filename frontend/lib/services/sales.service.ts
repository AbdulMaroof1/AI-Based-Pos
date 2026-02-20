import { db } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { Decimal } from '@prisma/client/runtime/library';

function tid(tenantId: string | undefined): string {
  if (!tenantId) throw new ApiError('Company context required', 403);
  return tenantId;
}

function calcLine(qty: number, price: number) {
  return Math.round(qty * price * 100) / 100;
}

function calcTotals(lines: { quantity: number; unitPrice: number }[], taxRate: number) {
  const subtotal = lines.reduce((s, l) => s + calcLine(l.quantity, l.unitPrice), 0);
  const taxAmount = Math.round(subtotal * taxRate * 100) / 10000;
  return { subtotal, taxAmount, total: subtotal + taxAmount };
}

async function nextNumber(tenantId: string, prefix: string, model: 'quotation' | 'salesOrder' | 'salesInvoice' | 'creditNote') {
  const count = await (db[model] as { count: (args: { where: { tenantId: string } }) => Promise<number> }).count({ where: { tenantId } });
  return `${prefix}-${String(count + 1).padStart(5, '0')}`;
}

// ===================== QUOTATIONS =====================

export async function getQuotations(tenantId: string | undefined, options?: { status?: string; customerId?: string }) {
  const t = tid(tenantId);
  const where: Record<string, unknown> = { tenantId: t };
  if (options?.status) where.status = options.status;
  if (options?.customerId) where.customerId = options.customerId;

  return db.quotation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { customer: { select: { id: true, name: true, company: true } }, _count: { select: { lines: true } } },
  });
}

export async function getQuotation(tenantId: string | undefined, id: string) {
  const t = tid(tenantId);
  const q = await db.quotation.findFirst({
    where: { id, tenantId: t },
    include: { customer: { select: { id: true, name: true, email: true, company: true } }, lines: true },
  });
  if (!q) throw new ApiError('Quotation not found', 404);
  return q;
}

export async function createQuotation(
  tenantId: string | undefined,
  data: { customerId: string; date: string; validUntil?: string; taxRate?: number; notes?: string; lines: { description: string; quantity: number; unitPrice: number; productId?: string }[] },
) {
  const t = tid(tenantId);
  if (!data.lines?.length) throw new ApiError('At least one line required', 400);

  const customer = await db.customer.findFirst({ where: { id: data.customerId, tenantId: t } });
  if (!customer) throw new ApiError('Customer not found', 404);

  const number = await nextNumber(t, 'QTN', 'quotation');
  const taxRate = data.taxRate || 0;
  const totals = calcTotals(data.lines, taxRate);

  return db.quotation.create({
    data: {
      tenantId: t, customerId: data.customerId, number,
      date: new Date(data.date),
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      subtotal: new Decimal(totals.subtotal), taxRate: new Decimal(taxRate),
      taxAmount: new Decimal(totals.taxAmount), total: new Decimal(totals.total),
      notes: data.notes || null,
      lines: {
        create: data.lines.map((l) => ({
          productId: l.productId ?? null,
          description: l.description, quantity: new Decimal(l.quantity),
          unitPrice: new Decimal(l.unitPrice), amount: new Decimal(calcLine(l.quantity, l.unitPrice)),
        })),
      },
    },
    include: { lines: true, customer: { select: { id: true, name: true } } },
  });
}

export async function updateQuotationStatus(tenantId: string | undefined, id: string, status: string) {
  const t = tid(tenantId);
  const q = await db.quotation.findFirst({ where: { id, tenantId: t } });
  if (!q) throw new ApiError('Quotation not found', 404);
  const valid = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'CANCELLED'];
  if (!valid.includes(status)) throw new ApiError(`Status must be: ${valid.join(', ')}`, 400);
  return db.quotation.update({ where: { id }, data: { status } });
}

export async function convertQuotationToOrder(tenantId: string | undefined, quotationId: string) {
  const t = tid(tenantId);
  const q = await db.quotation.findFirst({
    where: { id: quotationId, tenantId: t },
    include: { lines: true },
  });
  if (!q) throw new ApiError('Quotation not found', 404);
  if (q.status !== 'ACCEPTED') throw new ApiError('Only accepted quotations can be converted', 400);

  const number = await nextNumber(t, 'SO', 'salesOrder');

  const order = await db.salesOrder.create({
    data: {
      tenantId: t, customerId: q.customerId, quotationId: q.id, number,
      date: new Date(), status: 'CONFIRMED',
      subtotal: q.subtotal, taxRate: q.taxRate, taxAmount: q.taxAmount, total: q.total,
      notes: q.notes,
      lines: {
        create: q.lines.map((l) => ({
          productId: l.productId ?? null,
          description: l.description, quantity: l.quantity,
          unitPrice: l.unitPrice, amount: l.amount,
        })),
      },
    },
    include: { lines: true, customer: { select: { id: true, name: true } } },
  });

  await db.quotation.update({ where: { id: quotationId }, data: { status: 'ACCEPTED' } });
  return order;
}

// ===================== SALES ORDERS =====================

export async function getSalesOrders(tenantId: string | undefined, options?: { status?: string; customerId?: string }) {
  const t = tid(tenantId);
  const where: Record<string, unknown> = { tenantId: t };
  if (options?.status) where.status = options.status;
  if (options?.customerId) where.customerId = options.customerId;

  return db.salesOrder.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { customer: { select: { id: true, name: true, company: true } }, _count: { select: { lines: true, invoices: true } } },
  });
}

export async function getSalesOrder(tenantId: string | undefined, id: string) {
  const t = tid(tenantId);
  const o = await db.salesOrder.findFirst({
    where: { id, tenantId: t },
    include: {
      customer: { select: { id: true, name: true, email: true, company: true } },
      lines: true, quotation: { select: { id: true, number: true } },
      invoices: { select: { id: true, number: true, status: true, total: true } },
    },
  });
  if (!o) throw new ApiError('Sales order not found', 404);
  return o;
}

export async function createSalesOrder(
  tenantId: string | undefined,
  data: { customerId: string; date: string; taxRate?: number; notes?: string; lines: { description: string; quantity: number; unitPrice: number; productId?: string }[] },
) {
  const t = tid(tenantId);
  if (!data.lines?.length) throw new ApiError('At least one line required', 400);

  const customer = await db.customer.findFirst({ where: { id: data.customerId, tenantId: t } });
  if (!customer) throw new ApiError('Customer not found', 404);

  const number = await nextNumber(t, 'SO', 'salesOrder');
  const taxRate = data.taxRate || 0;
  const totals = calcTotals(data.lines, taxRate);

  return db.salesOrder.create({
    data: {
      tenantId: t, customerId: data.customerId, number,
      date: new Date(data.date),
      subtotal: new Decimal(totals.subtotal), taxRate: new Decimal(taxRate),
      taxAmount: new Decimal(totals.taxAmount), total: new Decimal(totals.total),
      notes: data.notes || null,
      lines: {
        create: data.lines.map((l) => ({
          description: l.description, quantity: new Decimal(l.quantity),
          unitPrice: new Decimal(l.unitPrice), amount: new Decimal(calcLine(l.quantity, l.unitPrice)),
          productId: l.productId ?? null,
        })),
      },
    },
    include: { lines: true, customer: { select: { id: true, name: true } } },
  });
}

export async function updateSalesOrderStatus(tenantId: string | undefined, id: string, status: string) {
  const t = tid(tenantId);
  const o = await db.salesOrder.findFirst({ where: { id, tenantId: t } });
  if (!o) throw new ApiError('Sales order not found', 404);
  const valid = ['DRAFT', 'CONFIRMED', 'DELIVERED', 'INVOICED', 'CANCELLED'];
  if (!valid.includes(status)) throw new ApiError(`Status must be: ${valid.join(', ')}`, 400);
  return db.salesOrder.update({ where: { id }, data: { status } });
}

// ===================== INVOICES =====================

export async function getSalesInvoices(tenantId: string | undefined, options?: { status?: string; customerId?: string }) {
  const t = tid(tenantId);
  const where: Record<string, unknown> = { tenantId: t };
  if (options?.status) where.status = options.status;
  if (options?.customerId) where.customerId = options.customerId;

  return db.salesInvoice.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { customer: { select: { id: true, name: true, company: true } }, _count: { select: { payments: true } } },
  });
}

export async function getSalesInvoice(tenantId: string | undefined, id: string) {
  const t = tid(tenantId);
  const inv = await db.salesInvoice.findFirst({
    where: { id, tenantId: t },
    include: {
      customer: { select: { id: true, name: true, email: true, company: true } },
      salesOrder: { select: { id: true, number: true } },
      payments: { orderBy: { date: 'desc' } },
      creditNotes: { select: { id: true, number: true, status: true, total: true } },
    },
  });
  if (!inv) throw new ApiError('Invoice not found', 404);
  return inv;
}

export async function createInvoiceFromOrder(tenantId: string | undefined, salesOrderId: string) {
  const t = tid(tenantId);
  const order = await db.salesOrder.findFirst({
    where: { id: salesOrderId, tenantId: t },
    include: { lines: true },
  });
  if (!order) throw new ApiError('Sales order not found', 404);
  if (!['CONFIRMED', 'DELIVERED'].includes(order.status)) {
    throw new ApiError('Order must be confirmed or delivered to invoice', 400);
  }

  const number = await nextNumber(t, 'INV', 'salesInvoice');

  const invoice = await db.salesInvoice.create({
    data: {
      tenantId: t, customerId: order.customerId, salesOrderId: order.id, number,
      date: new Date(), dueDate: new Date(Date.now() + 30 * 86400000),
      subtotal: order.subtotal, taxRate: order.taxRate, taxAmount: order.taxAmount, total: order.total,
      lines: {
        create: order.lines.map((l) => ({
          tenantId: t,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          amount: l.amount,
          productId: l.productId ?? null,
        })),
      },
    },
    include: { customer: { select: { id: true, name: true } }, lines: true },
  });

  await db.salesOrder.update({ where: { id: salesOrderId }, data: { status: 'INVOICED' } });
  return invoice;
}

export async function createDirectInvoice(
  tenantId: string | undefined,
  data: { customerId: string; date: string; dueDate?: string; taxRate?: number; notes?: string; lines: { description: string; quantity: number; unitPrice: number; productId?: string }[] },
) {
  const t = tid(tenantId);
  if (!data.lines?.length) throw new ApiError('At least one line required', 400);

  const customer = await db.customer.findFirst({ where: { id: data.customerId, tenantId: t } });
  if (!customer) throw new ApiError('Customer not found', 404);

  const number = await nextNumber(t, 'INV', 'salesInvoice');
  const taxRate = data.taxRate || 0;
  const totals = calcTotals(data.lines, taxRate);

  return db.salesInvoice.create({
    data: {
      tenantId: t, customerId: data.customerId, number,
      date: new Date(data.date),
      dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 86400000),
      subtotal: new Decimal(totals.subtotal), taxRate: new Decimal(taxRate),
      taxAmount: new Decimal(totals.taxAmount), total: new Decimal(totals.total),
      notes: data.notes || null,
      lines: {
        create: data.lines.map((l) => ({
          tenantId: t,
          description: l.description,
          quantity: new Decimal(l.quantity),
          unitPrice: new Decimal(l.unitPrice),
          amount: new Decimal(calcLine(l.quantity, l.unitPrice)),
          productId: l.productId ?? null,
        })),
      },
    },
    include: { customer: { select: { id: true, name: true } }, lines: true },
  });
}

export async function postInvoice(tenantId: string | undefined, id: string) {
  const t = tid(tenantId);
  const inv = await db.salesInvoice.findFirst({
    where: { id, tenantId: t },
    include: { lines: { include: { product: { select: { id: true, type: true, standardCost: true } } } } },
  });
  if (!inv) throw new ApiError('Invoice not found', 404);
  if (inv.isPosted) throw new ApiError('Invoice is already posted', 400);

  const updated = await db.salesInvoice.update({
    where: { id },
    data: { isPosted: true, postedAt: new Date(), status: 'POSTED' },
  });

  // Inventory integration: decrease stock for lines with STOCK product
  let inventoryStatus = 'success';
  let inventoryMessage = '';
  const stockLines = inv.lines
    .filter((l) => l.productId && l.product?.type === 'STOCK')
    .map((l) => ({
      productId: l.productId!,
      quantity: Number(l.quantity),
      unitCost: Number(l.product?.standardCost ?? 0),
    }));
  if (stockLines.length) {
    try {
      const { issueSalesFromStock } = await import('@/lib/services/inventory.service');
      const result = await issueSalesFromStock(t, stockLines, inv.date, `INV:${inv.number}`);
      if (!result.ok) {
        inventoryStatus = 'skipped';
        inventoryMessage = result.message ?? 'Inventory decrease skipped';
      }
    } catch (err) {
      inventoryStatus = 'error';
      inventoryMessage = (err as Error).message;
      console.error('[SALES] Failed to decrease inventory:', inventoryMessage);
    }
  }

  let accountingStatus = 'success';
  let accountingMessage = '';
  try {
    const result = await createInvoiceJournalEntry(t, { ...updated, lines: inv.lines });
    if (result === 'skipped_accounts') {
      accountingStatus = 'skipped';
      accountingMessage = 'No Accounts Receivable (ASSET code 1xxx) or Revenue account found. Set these up in Accounting first.';
    } else if (result === 'skipped_fiscal') {
      accountingStatus = 'skipped';
      accountingMessage = 'No open fiscal year covers this invoice date. Create a fiscal year in Accounting first.';
    }
  } catch (err) {
    accountingStatus = 'error';
    accountingMessage = (err as Error).message;
    console.error('[SALES] Failed to create accounting entry:', accountingMessage);
  }

  return { ...updated, accountingStatus, accountingMessage, inventoryStatus, inventoryMessage };
}

async function createInvoiceJournalEntry(
  tenantId: string,
  invoice: { id: string; number: string; total: unknown; date: Date; lines?: { productId: string | null; quantity: unknown; unitPrice: unknown; product?: { type?: string; standardCost?: unknown } }[] },
): Promise<string> {
  const arAccount = await db.account.findFirst({
    where: { tenantId, accountType: 'ASSET', code: { startsWith: '1' } },
    orderBy: { code: 'asc' },
  });
  const revenueAccount = await db.account.findFirst({
    where: { tenantId, accountType: 'REVENUE' },
    orderBy: { code: 'asc' },
  });

  if (!arAccount || !revenueAccount) return 'skipped_accounts';

  const fiscalYear = await db.fiscalYear.findFirst({
    where: { tenantId, isLocked: false, startDate: { lte: invoice.date }, endDate: { gte: invoice.date } },
  });
  if (!fiscalYear) return 'skipped_fiscal';

  const total = Number(invoice.total);
  const jeLines: { accountId: string; debit: number; credit: number; memo: string }[] = [
    { accountId: arAccount.id, debit: total, credit: 0, memo: 'Accounts Receivable' },
    { accountId: revenueAccount.id, debit: 0, credit: total, memo: 'Sales Revenue' },
  ];

  // COGS for stock items
  const cogsAccount = await db.account.findFirst({ where: { tenantId, code: '5000' } }) ?? await db.account.findFirst({ where: { tenantId, accountType: 'EXPENSE' }, orderBy: { code: 'asc' } });
  const invAccount = await db.account.findFirst({ where: { tenantId, code: '1300' } });
  const lines = invoice.lines ?? [];
  let cogsAmount = 0;
  for (const l of lines) {
    if (l.productId && l.product?.type === 'STOCK') {
      cogsAmount += Number(l.quantity) * Number(l.product?.standardCost ?? 0);
    }
  }
  if (cogsAmount > 0 && cogsAccount && invAccount) {
    jeLines.push({ accountId: cogsAccount.id, debit: Math.round(cogsAmount * 100) / 100, credit: 0, memo: 'Cost of Goods Sold' });
    jeLines.push({ accountId: invAccount.id, debit: 0, credit: Math.round(cogsAmount * 100) / 100, memo: 'Inventory (COGS)' });
  }

  await db.journalEntry.create({
    data: {
      tenantId,
      fiscalYearId: fiscalYear.id,
      date: invoice.date,
      reference: `INV:${invoice.number}`,
      memo: `Sales invoice ${invoice.number} posted`,
      isPosted: true,
      postedAt: new Date(),
      lines: {
        create: jeLines.map((l) => ({
          accountId: l.accountId,
          debit: new Decimal(l.debit),
          credit: new Decimal(l.credit),
          memo: l.memo,
        })),
      },
    },
  });
  return 'success';
}

// ===================== PAYMENTS =====================

export async function recordPayment(
  tenantId: string | undefined,
  invoiceId: string,
  data: { date: string; amount: number; method?: string; reference?: string; notes?: string },
) {
  const t = tid(tenantId);
  const inv = await db.salesInvoice.findFirst({ where: { id: invoiceId, tenantId: t } });
  if (!inv) throw new ApiError('Invoice not found', 404);
  if (!inv.isPosted) throw new ApiError('Invoice must be posted before recording payment', 400);

  const remaining = Number(inv.total) - Number(inv.paidAmount);
  if (data.amount <= 0) throw new ApiError('Amount must be positive', 400);
  if (data.amount > remaining + 0.01) {
    throw new ApiError(`Overpayment: remaining balance is ${remaining.toFixed(2)}`, 400);
  }

  const payment = await db.salesPayment.create({
    data: {
      tenantId: t, invoiceId,
      date: new Date(data.date),
      amount: new Decimal(data.amount),
      method: data.method || 'BANK',
      reference: data.reference || null,
      notes: data.notes || null,
    },
  });

  const newPaid = Number(inv.paidAmount) + data.amount;
  const newStatus = newPaid >= Number(inv.total) - 0.01 ? 'PAID' : 'PARTIALLY_PAID';
  await db.salesInvoice.update({
    where: { id: invoiceId },
    data: { paidAmount: new Decimal(newPaid), status: newStatus },
  });

  try {
    await createSalesPaymentJournalEntry(t, inv.number, payment.id, data.date, data.amount);
  } catch (err) {
    console.error('[SALES] Failed to create payment journal entry:', (err as Error).message);
  }

  return payment;
}

async function createSalesPaymentJournalEntry(
  tenantId: string,
  invNumber: string,
  paymentId: string,
  dateStr: string,
  amount: number,
) {
  const arAccount = await db.account.findFirst({
    where: { tenantId, accountType: 'ASSET', code: { startsWith: '12' } },
    orderBy: { code: 'asc' },
  });
  const cashAccount = await db.account.findFirst({
    where: { tenantId, accountType: 'ASSET', code: { in: ['1000', '1100'] } },
    orderBy: { code: 'asc' },
  }) ?? await db.account.findFirst({
    where: { tenantId, accountType: 'ASSET', code: { startsWith: '1' } },
    orderBy: { code: 'asc' },
  });
  if (!arAccount || !cashAccount) return;

  const payDate = new Date(dateStr);
  const fiscalYear = await db.fiscalYear.findFirst({
    where: { tenantId, isLocked: false, startDate: { lte: payDate }, endDate: { gte: payDate } },
  });
  if (!fiscalYear) return;

  await db.journalEntry.create({
    data: {
      tenantId, fiscalYearId: fiscalYear.id, date: payDate,
      reference: `PAY:${paymentId}`, memo: `Customer payment for invoice ${invNumber}`,
      isPosted: true, postedAt: new Date(),
      lines: {
        create: [
          { accountId: cashAccount.id, debit: new Decimal(amount), credit: new Decimal(0), memo: 'Bank/Cash' },
          { accountId: arAccount.id, debit: new Decimal(0), credit: new Decimal(amount), memo: 'Accounts Receivable' },
        ],
      },
    },
  });
}

// ===================== CREDIT NOTES =====================

export async function getCreditNotes(tenantId: string | undefined) {
  const t = tid(tenantId);
  return db.creditNote.findMany({
    where: { tenantId: t },
    orderBy: { createdAt: 'desc' },
    include: { customer: { select: { id: true, name: true } }, invoice: { select: { id: true, number: true } } },
  });
}

export async function createCreditNote(
  tenantId: string | undefined,
  data: { customerId: string; invoiceId?: string; date: string; taxRate?: number; reason?: string; notes?: string; lines: { description: string; quantity: number; unitPrice: number }[] },
) {
  const t = tid(tenantId);
  if (!data.lines?.length) throw new ApiError('At least one line required', 400);

  const number = await nextNumber(t, 'CN', 'creditNote');
  const taxRate = data.taxRate || 0;
  const totals = calcTotals(data.lines, taxRate);

  return db.creditNote.create({
    data: {
      tenantId: t, customerId: data.customerId,
      invoiceId: data.invoiceId || null, number,
      date: new Date(data.date),
      subtotal: new Decimal(totals.subtotal), taxRate: new Decimal(taxRate),
      taxAmount: new Decimal(totals.taxAmount), total: new Decimal(totals.total),
      reason: data.reason || null, notes: data.notes || null,
      lines: {
        create: data.lines.map((l) => ({
          description: l.description, quantity: new Decimal(l.quantity),
          unitPrice: new Decimal(l.unitPrice), amount: new Decimal(calcLine(l.quantity, l.unitPrice)),
        })),
      },
    },
    include: { lines: true, customer: { select: { id: true, name: true } } },
  });
}

// ===================== SALES DASHBOARD =====================

export async function getSalesSummary(tenantId: string | undefined) {
  const t = tid(tenantId);

  const [quotations, orders, invoices, payments] = await Promise.all([
    db.quotation.count({ where: { tenantId: t } }),
    db.salesOrder.count({ where: { tenantId: t } }),
    db.salesInvoice.count({ where: { tenantId: t } }),
    db.salesPayment.aggregate({ where: { tenantId: t }, _sum: { amount: true } }),
  ]);

  const outstanding = await db.salesInvoice.aggregate({
    where: { tenantId: t, isPosted: true, status: { in: ['POSTED', 'PARTIALLY_PAID'] } },
    _sum: { total: true, paidAmount: true },
  });

  const totalOutstanding = Number(outstanding._sum.total || 0) - Number(outstanding._sum.paidAmount || 0);

  return {
    quotations,
    orders,
    invoices,
    totalPayments: Number(payments._sum.amount || 0),
    totalOutstanding,
  };
}

export async function retryInvoiceAccounting(tenantId: string | undefined, id: string) {
  const t = tid(tenantId);
  const inv = await db.salesInvoice.findFirst({ where: { id, tenantId: t } });
  if (!inv) throw new ApiError('Invoice not found', 404);
  if (!inv.isPosted) throw new ApiError('Invoice is not posted', 400);

  const existing = await db.journalEntry.findFirst({ where: { tenantId: t, reference: `INV:${inv.number}` } });
  if (existing) throw new ApiError('Journal entry already exists for this invoice', 400);

  const result = await createInvoiceJournalEntry(t, inv);
  if (result === 'skipped_accounts') throw new ApiError('No Accounts Receivable (ASSET) or Revenue account found. Set up Chart of Accounts first.', 400);
  if (result === 'skipped_fiscal') throw new ApiError('No open fiscal year covers this invoice date. Create a fiscal year first.', 400);

  return { success: true, message: 'Journal entry created successfully.' };
}
