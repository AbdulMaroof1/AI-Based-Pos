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

async function nextNum(tenantId: string, prefix: string, model: 'purchaseRequisition' | 'purchaseOrder' | 'goodsReceipt' | 'vendorBill') {
  const count = await (db[model] as { count: (a: { where: { tenantId: string } }) => Promise<number> }).count({ where: { tenantId } });
  return `${prefix}-${String(count + 1).padStart(5, '0')}`;
}

// ===================== VENDORS =====================

export async function getVendors(tenantId: string | undefined, search?: string) {
  const t = tid(tenantId);
  const where: Record<string, unknown> = { tenantId: t };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ];
  }
  return db.vendor.findMany({ where, orderBy: { createdAt: 'desc' } });
}

export async function getVendor(tenantId: string | undefined, id: string) {
  const t = tid(tenantId);
  const v = await db.vendor.findFirst({ where: { id, tenantId: t } });
  if (!v) throw new ApiError('Vendor not found', 404);
  return v;
}

export async function createVendor(
  tenantId: string | undefined,
  data: { name: string; email?: string; phone?: string; company?: string; address?: string; taxId?: string; notes?: string },
) {
  const t = tid(tenantId);
  if (!data.name?.trim()) throw new ApiError('Vendor name is required', 400);
  return db.vendor.create({ data: { tenantId: t, ...data } });
}

export async function updateVendor(tenantId: string | undefined, id: string, data: Record<string, unknown>) {
  const t = tid(tenantId);
  const v = await db.vendor.findFirst({ where: { id, tenantId: t } });
  if (!v) throw new ApiError('Vendor not found', 404);
  return db.vendor.update({ where: { id }, data });
}

// ===================== PURCHASE REQUISITIONS =====================

export async function getRequisitions(tenantId: string | undefined, options?: { status?: string }) {
  const t = tid(tenantId);
  const where: Record<string, unknown> = { tenantId: t };
  if (options?.status) where.status = options.status;
  return db.purchaseRequisition.findMany({
    where, orderBy: { createdAt: 'desc' },
    include: { vendor: { select: { id: true, name: true } }, _count: { select: { lines: true } } },
  });
}

export async function getRequisition(tenantId: string | undefined, id: string) {
  const t = tid(tenantId);
  const r = await db.purchaseRequisition.findFirst({
    where: { id, tenantId: t },
    include: { vendor: { select: { id: true, name: true, email: true } }, lines: true },
  });
  if (!r) throw new ApiError('Requisition not found', 404);
  return r;
}

export async function createRequisition(
  tenantId: string | undefined,
  data: { vendorId?: string; date: string; requestedBy?: string; notes?: string; lines: { description: string; quantity: number; estimatedPrice?: number }[] },
) {
  const t = tid(tenantId);
  if (!data.lines?.length) throw new ApiError('At least one line required', 400);
  const number = await nextNum(t, 'PR', 'purchaseRequisition');
  return db.purchaseRequisition.create({
    data: {
      tenantId: t, vendorId: data.vendorId || null, number,
      date: new Date(data.date), requestedBy: data.requestedBy || null, notes: data.notes || null,
      lines: {
        create: data.lines.map((l) => ({
          description: l.description, quantity: new Decimal(l.quantity),
          estimatedPrice: l.estimatedPrice ? new Decimal(l.estimatedPrice) : null,
        })),
      },
    },
    include: { lines: true, vendor: { select: { id: true, name: true } } },
  });
}

export async function updateRequisitionStatus(tenantId: string | undefined, id: string, status: string) {
  const t = tid(tenantId);
  const r = await db.purchaseRequisition.findFirst({ where: { id, tenantId: t } });
  if (!r) throw new ApiError('Requisition not found', 404);
  const valid = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED'];
  if (!valid.includes(status)) throw new ApiError(`Status must be: ${valid.join(', ')}`, 400);
  return db.purchaseRequisition.update({ where: { id }, data: { status } });
}

export async function convertRequisitionToPO(tenantId: string | undefined, requisitionId: string, vendorId: string) {
  const t = tid(tenantId);
  const r = await db.purchaseRequisition.findFirst({
    where: { id: requisitionId, tenantId: t }, include: { lines: true },
  });
  if (!r) throw new ApiError('Requisition not found', 404);
  if (r.status !== 'APPROVED') throw new ApiError('Only approved requisitions can be converted', 400);

  const vendor = await db.vendor.findFirst({ where: { id: vendorId, tenantId: t } });
  if (!vendor) throw new ApiError('Vendor not found', 404);

  const number = await nextNum(t, 'PO', 'purchaseOrder');
  const lines = r.lines.map((l) => ({
    description: l.description, quantity: l.quantity,
    unitPrice: l.estimatedPrice || new Decimal(0),
    amount: new Decimal(Number(l.quantity) * Number(l.estimatedPrice || 0)),
  }));
  const subtotal = lines.reduce((s, l) => s + Number(l.amount), 0);

  const po = await db.purchaseOrder.create({
    data: {
      tenantId: t, vendorId, requisitionId, number,
      date: new Date(), status: 'CONFIRMED',
      subtotal: new Decimal(subtotal), total: new Decimal(subtotal),
      lines: { create: lines },
    },
    include: { lines: true, vendor: { select: { id: true, name: true } } },
  });

  await db.purchaseRequisition.update({ where: { id: requisitionId }, data: { status: 'APPROVED' } });
  return po;
}

// ===================== PURCHASE ORDERS =====================

export async function getPurchaseOrders(tenantId: string | undefined, options?: { status?: string; vendorId?: string }) {
  const t = tid(tenantId);
  const where: Record<string, unknown> = { tenantId: t };
  if (options?.status) where.status = options.status;
  if (options?.vendorId) where.vendorId = options.vendorId;
  return db.purchaseOrder.findMany({
    where, orderBy: { createdAt: 'desc' },
    include: { vendor: { select: { id: true, name: true, company: true } }, _count: { select: { lines: true, goodsReceipts: true, vendorBills: true } } },
  });
}

export async function getPurchaseOrder(tenantId: string | undefined, id: string) {
  const t = tid(tenantId);
  const po = await db.purchaseOrder.findFirst({
    where: { id, tenantId: t },
    include: {
      vendor: { select: { id: true, name: true, email: true, company: true } },
      requisition: { select: { id: true, number: true } },
      lines: true,
      goodsReceipts: { select: { id: true, number: true, status: true, date: true } },
      vendorBills: { select: { id: true, number: true, status: true, total: true } },
    },
  });
  if (!po) throw new ApiError('Purchase order not found', 404);
  return po;
}

export async function createPurchaseOrder(
  tenantId: string | undefined,
  data: { vendorId: string; date: string; expectedDate?: string; taxRate?: number; notes?: string; lines: { description: string; quantity: number; unitPrice: number; productId?: string }[] },
) {
  const t = tid(tenantId);
  if (!data.lines?.length) throw new ApiError('At least one line required', 400);

  const vendor = await db.vendor.findFirst({ where: { id: data.vendorId, tenantId: t } });
  if (!vendor) throw new ApiError('Vendor not found', 404);

  const number = await nextNum(t, 'PO', 'purchaseOrder');
  const taxRate = data.taxRate || 0;
  const totals = calcTotals(data.lines, taxRate);

  return db.purchaseOrder.create({
    data: {
      tenantId: t, vendorId: data.vendorId, number,
      date: new Date(data.date),
      expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
      subtotal: new Decimal(totals.subtotal), taxRate: new Decimal(taxRate),
      taxAmount: new Decimal(totals.taxAmount), total: new Decimal(totals.total),
      notes: data.notes || null,
      lines: {
        create: data.lines.map((l) => ({
          description: l.description, quantity: new Decimal(l.quantity),
          unitPrice: new Decimal(l.unitPrice), amount: new Decimal(calcLine(l.quantity, l.unitPrice)),
          productId: l.productId || null,
        })),
      },
    },
    include: { lines: true, vendor: { select: { id: true, name: true } } },
  });
}

export async function updatePOStatus(tenantId: string | undefined, id: string, status: string) {
  const t = tid(tenantId);
  const po = await db.purchaseOrder.findFirst({ where: { id, tenantId: t } });
  if (!po) throw new ApiError('Purchase order not found', 404);
  const valid = ['DRAFT', 'CONFIRMED', 'RECEIVED', 'BILLED', 'CANCELLED'];
  if (!valid.includes(status)) throw new ApiError(`Status must be: ${valid.join(', ')}`, 400);
  return db.purchaseOrder.update({ where: { id }, data: { status } });
}

// ===================== GOODS RECEIPTS =====================

export async function createGoodsReceipt(
  tenantId: string | undefined, purchaseOrderId: string,
  data: { date: string; notes?: string; lines: { description: string; quantity: number; productId?: string; locationId?: string; unitCost?: number }[] },
) {
  const t = tid(tenantId);
  const po = await db.purchaseOrder.findFirst({ where: { id: purchaseOrderId, tenantId: t }, include: { lines: true } });
  if (!po) throw new ApiError('Purchase order not found', 404);
  if (!['CONFIRMED', 'RECEIVED'].includes(po.status)) throw new ApiError('PO must be confirmed to receive goods', 400);

  const receiptDate = new Date(data.date);
  const grLines = data.lines.map((l, i) => {
    const poLine = po.lines[i];
    const productId = l.productId ?? poLine?.productId ?? null;
    const unitCost = l.unitCost ?? (poLine ? Number(poLine.unitPrice) : 0);
    return {
      description: l.description,
      quantity: new Decimal(l.quantity),
      productId,
      locationId: l.locationId ?? null,
      unitCost: unitCost ? new Decimal(unitCost) : null,
    };
  });

  const number = await nextNum(t, 'GR', 'goodsReceipt');
  const gr = await db.goodsReceipt.create({
    data: {
      tenantId: t, purchaseOrderId, number, date: receiptDate,
      status: 'RECEIVED', notes: data.notes || null,
      lines: { create: grLines },
    },
    include: { lines: true },
  });

  await db.purchaseOrder.update({ where: { id: purchaseOrderId }, data: { status: 'RECEIVED' } });

  // Inventory integration: when RECEIPT mode, increase stock for lines with productId
  const { getInventorySettings, receivePurchaseIntoStock, getDefaultStockLocation } = await import('@/lib/services/inventory.service');
  const settings = await getInventorySettings(t);
  if (settings.purchaseStockRecognition === 'RECEIPT') {
    const defaultLoc = await getDefaultStockLocation(t);
    const stockLines = gr.lines
      .filter((l) => l.productId)
      .map((l) => ({
        productId: l.productId!,
        locationId: l.locationId ?? defaultLoc!,
        quantity: Number(l.quantity),
        unitCost: Number(l.unitCost ?? 0),
      }))
      .filter((l) => l.locationId);
    if (stockLines.length) {
      await receivePurchaseIntoStock(t, stockLines, receiptDate, `GR:${gr.number}`);
    }
  }

  return gr;
}

// ===================== VENDOR BILLS =====================

export async function getVendorBills(tenantId: string | undefined, options?: { status?: string; vendorId?: string }) {
  const t = tid(tenantId);
  const where: Record<string, unknown> = { tenantId: t };
  if (options?.status) where.status = options.status;
  if (options?.vendorId) where.vendorId = options.vendorId;
  return db.vendorBill.findMany({
    where, orderBy: { createdAt: 'desc' },
    include: { vendor: { select: { id: true, name: true, company: true } }, _count: { select: { payments: true } } },
  });
}

export async function getVendorBill(tenantId: string | undefined, id: string) {
  const t = tid(tenantId);
  const bill = await db.vendorBill.findFirst({
    where: { id, tenantId: t },
    include: {
      vendor: { select: { id: true, name: true, email: true, company: true } },
      purchaseOrder: { select: { id: true, number: true } },
      payments: { orderBy: { date: 'desc' } },
    },
  });
  if (!bill) throw new ApiError('Vendor bill not found', 404);
  return bill;
}

export async function createBillFromPO(tenantId: string | undefined, purchaseOrderId: string) {
  const t = tid(tenantId);
  const po = await db.purchaseOrder.findFirst({
    where: { id: purchaseOrderId, tenantId: t }, include: { lines: true },
  });
  if (!po) throw new ApiError('Purchase order not found', 404);
  if (!['CONFIRMED', 'RECEIVED'].includes(po.status)) throw new ApiError('PO must be confirmed or received', 400);

  const number = await nextNum(t, 'BILL', 'vendorBill');
  const bill = await db.vendorBill.create({
    data: {
      tenantId: t, vendorId: po.vendorId, purchaseOrderId, number,
      date: new Date(), dueDate: new Date(Date.now() + 30 * 86400000),
      subtotal: po.subtotal, taxRate: po.taxRate, taxAmount: po.taxAmount, total: po.total,
      lines: {
        create: po.lines.map((l) => ({
          tenantId: t,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          amount: l.amount,
          productId: l.productId ?? null,
        })),
      },
    },
    include: { vendor: { select: { id: true, name: true } }, lines: true },
  });

  await db.purchaseOrder.update({ where: { id: purchaseOrderId }, data: { status: 'BILLED' } });
  return bill;
}

export async function createDirectBill(
  tenantId: string | undefined,
  data: { vendorId: string; date: string; dueDate?: string; vendorRef?: string; taxRate?: number; notes?: string; lines: { description: string; quantity: number; unitPrice: number }[] },
) {
  const t = tid(tenantId);
  if (!data.lines?.length) throw new ApiError('At least one line required', 400);

  const vendor = await db.vendor.findFirst({ where: { id: data.vendorId, tenantId: t } });
  if (!vendor) throw new ApiError('Vendor not found', 404);

  const number = await nextNum(t, 'BILL', 'vendorBill');
  const taxRate = data.taxRate || 0;
  const totals = calcTotals(data.lines, taxRate);

  return db.vendorBill.create({
    data: {
      tenantId: t, vendorId: data.vendorId, number,
      vendorRef: data.vendorRef || null,
      date: new Date(data.date),
      dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 86400000),
      subtotal: new Decimal(totals.subtotal), taxRate: new Decimal(taxRate),
      taxAmount: new Decimal(totals.taxAmount), total: new Decimal(totals.total),
      notes: data.notes || null,
    },
    include: { vendor: { select: { id: true, name: true } } },
  });
}

export async function postBill(tenantId: string | undefined, id: string) {
  const t = tid(tenantId);
  const bill = await db.vendorBill.findFirst({ where: { id, tenantId: t }, include: { lines: true } });
  if (!bill) throw new ApiError('Bill not found', 404);
  if (bill.isPosted) throw new ApiError('Bill is already posted', 400);

  const updated = await db.vendorBill.update({
    where: { id }, data: { isPosted: true, postedAt: new Date(), status: 'POSTED' },
  });

  // Inventory integration: when BILL mode, increase stock for lines with productId
  const { getInventorySettings, receivePurchaseIntoStock, getDefaultStockLocation } = await import('@/lib/services/inventory.service');
  const settings = await getInventorySettings(t);
  if (settings.purchaseStockRecognition === 'BILL') {
    const defaultLoc = await getDefaultStockLocation(t);
    const stockLines = (bill as typeof bill & { lines: { productId: string | null; locationId?: string | null; quantity: unknown; unitCost?: unknown; unitPrice: unknown }[] }).lines
      .filter((l: { productId: string | null }) => l.productId)
      .map((l: { productId: string; quantity: unknown; unitPrice: unknown }) => ({
        productId: l.productId,
        locationId: defaultLoc!,
        quantity: Number(l.quantity),
        unitCost: Number(l.unitPrice),
      }))
      .filter((l: { locationId: string | null }) => l.locationId);
    if (stockLines.length) {
      await receivePurchaseIntoStock(t, stockLines, bill.date, `BILL:${bill.number}`);
    }
  }

  let accountingStatus = 'success';
  let accountingMessage = '';
  try {
    const result = await createBillJournalEntry(t, { ...updated, lines: bill.lines }, settings.purchaseStockRecognition);
    if (result === 'skipped_accounts') {
      accountingStatus = 'skipped';
      accountingMessage = 'No Expense or Accounts Payable (LIABILITY code 2xxx) account found in Chart of Accounts. Set these up in Accounting first.';
    } else if (result === 'skipped_fiscal') {
      accountingStatus = 'skipped';
      accountingMessage = 'No open fiscal year covers this bill date. Create a fiscal year in Accounting first.';
    }
  } catch (err) {
    accountingStatus = 'error';
    accountingMessage = (err as Error).message;
    console.error('[PURCHASE] Failed to create accounting entry:', accountingMessage);
  }

  return { ...updated, accountingStatus, accountingMessage };
}

async function createBillJournalEntry(
  tenantId: string,
  bill: { id: string; number: string; total: unknown; date: Date; lines?: { productId: string | null; quantity: unknown; unitPrice: unknown; amount: unknown }[] },
  purchaseStockRecognition: string,
): Promise<string> {
  const expenseAccount = await db.account.findFirst({
    where: { tenantId, accountType: 'EXPENSE', code: '5100' },
  }) ?? await db.account.findFirst({
    where: { tenantId, accountType: 'EXPENSE' }, orderBy: { code: 'asc' },
  });
  const invAccount = await db.account.findFirst({ where: { tenantId, code: '1300' } });
  const accruedAccount = await db.account.findFirst({ where: { tenantId, code: '2100' } });
  const apAccount = await db.account.findFirst({
    where: { tenantId, accountType: 'LIABILITY', code: { startsWith: '2' } }, orderBy: { code: 'asc' },
  });
  if (!apAccount) return 'skipped_accounts';

  const fiscalYear = await db.fiscalYear.findFirst({
    where: { tenantId, isLocked: false, startDate: { lte: bill.date }, endDate: { gte: bill.date } },
  });
  if (!fiscalYear) return 'skipped_fiscal';

  const total = Number(bill.total);
  const lines = bill.lines ?? [];
  let invAmount = 0;
  for (const l of lines) {
    if (l.productId) invAmount += Number(l.amount);
  }
  const expAmount = Math.round((total - invAmount) * 100) / 100;

  const jeLines: { accountId: string; debit: number; credit: number; memo: string }[] = [];
  if (invAmount > 0) {
    if (purchaseStockRecognition === 'BILL') {
      if (invAccount) jeLines.push({ accountId: invAccount.id, debit: invAmount, credit: 0, memo: 'Inventory (vendor bill)' });
      else jeLines.push({ accountId: expenseAccount!.id, debit: invAmount, credit: 0, memo: 'Purchase' });
    } else {
      if (accruedAccount) jeLines.push({ accountId: accruedAccount.id, debit: invAmount, credit: 0, memo: 'Clear accrual (GR/IR)' });
      else if (invAccount) jeLines.push({ accountId: invAccount.id, debit: invAmount, credit: 0, memo: 'Reverse receipt accrual' });
    }
  }
  if (expAmount > 0.01 && expenseAccount) {
    jeLines.push({ accountId: expenseAccount.id, debit: expAmount, credit: 0, memo: 'Purchase Expense' });
  }
  jeLines.push({ accountId: apAccount.id, debit: 0, credit: total, memo: 'Accounts Payable' });

  const totalDr = jeLines.reduce((s, l) => s + l.debit, 0);
  if (Math.abs(totalDr - total) > 0.01) return 'skipped_accounts';

  await db.journalEntry.create({
    data: {
      tenantId, fiscalYearId: fiscalYear.id, date: bill.date,
      reference: `BILL:${bill.number}`, memo: `Vendor bill ${bill.number} posted`,
      isPosted: true, postedAt: new Date(),
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

// ===================== VENDOR PAYMENTS =====================

export async function recordVendorPayment(
  tenantId: string | undefined, billId: string,
  data: { date: string; amount: number; method?: string; reference?: string; notes?: string },
) {
  const t = tid(tenantId);
  const bill = await db.vendorBill.findFirst({ where: { id: billId, tenantId: t } });
  if (!bill) throw new ApiError('Bill not found', 404);
  if (!bill.isPosted) throw new ApiError('Bill must be posted before recording payment', 400);

  const remaining = Number(bill.total) - Number(bill.paidAmount);
  if (data.amount <= 0) throw new ApiError('Amount must be positive', 400);
  if (data.amount > remaining + 0.01) throw new ApiError(`Overpayment: remaining is ${remaining.toFixed(2)}`, 400);

  const payment = await db.vendorPayment.create({
    data: {
      tenantId: t, billId, date: new Date(data.date),
      amount: new Decimal(data.amount), method: data.method || 'BANK',
      reference: data.reference || null, notes: data.notes || null,
    },
  });

  const newPaid = Number(bill.paidAmount) + data.amount;
  const newStatus = newPaid >= Number(bill.total) - 0.01 ? 'PAID' : 'PARTIALLY_PAID';
  await db.vendorBill.update({ where: { id: billId }, data: { paidAmount: new Decimal(newPaid), status: newStatus } });

  // Create accounting entry: Debit A/P, Credit Cash/Bank
  try {
    await createPaymentJournalEntry(t, bill.number, payment.id, data.date, data.amount);
  } catch (err) {
    console.error('[PURCHASE] Failed to create payment journal entry:', (err as Error).message);
  }

  return payment;
}

async function createPaymentJournalEntry(
  tenantId: string,
  billNumber: string,
  paymentId: string,
  dateStr: string,
  amount: number,
) {
  const apAccount = await db.account.findFirst({
    where: { tenantId, accountType: 'LIABILITY', code: { startsWith: '2' } },
    orderBy: { code: 'asc' },
  });
  const cashAccount = await db.account.findFirst({
    where: { tenantId, accountType: 'ASSET', code: { in: ['1000', '1100'] } },
    orderBy: { code: 'asc' },
  }) ?? await db.account.findFirst({
    where: { tenantId, accountType: 'ASSET', code: { startsWith: '1' } },
    orderBy: { code: 'asc' },
  });
  if (!apAccount || !cashAccount) return;

  const payDate = new Date(dateStr);
  const fiscalYear = await db.fiscalYear.findFirst({
    where: { tenantId, isLocked: false, startDate: { lte: payDate }, endDate: { gte: payDate } },
  });
  if (!fiscalYear) return;

  await db.journalEntry.create({
    data: {
      tenantId, fiscalYearId: fiscalYear.id, date: payDate,
      reference: `PAY:${paymentId}`, memo: `Vendor payment for bill ${billNumber}`,
      isPosted: true, postedAt: new Date(),
      lines: {
        create: [
          { accountId: apAccount.id, debit: new Decimal(amount), credit: new Decimal(0), memo: 'Accounts Payable' },
          { accountId: cashAccount.id, debit: new Decimal(0), credit: new Decimal(amount), memo: 'Bank/Cash' },
        ],
      },
    },
  });
}

// ===================== DASHBOARD =====================

export async function getPurchaseSummary(tenantId: string | undefined) {
  const t = tid(tenantId);
  const [vendors, requisitions, orders, bills, payments] = await Promise.all([
    db.vendor.count({ where: { tenantId: t } }),
    db.purchaseRequisition.count({ where: { tenantId: t } }),
    db.purchaseOrder.count({ where: { tenantId: t } }),
    db.vendorBill.count({ where: { tenantId: t } }),
    db.vendorPayment.aggregate({ where: { tenantId: t }, _sum: { amount: true } }),
  ]);
  const outstanding = await db.vendorBill.aggregate({
    where: { tenantId: t, isPosted: true, status: { in: ['POSTED', 'PARTIALLY_PAID'] } },
    _sum: { total: true, paidAmount: true },
  });
  return {
    vendors, requisitions, orders, bills,
    totalPayments: Number(payments._sum.amount || 0),
    totalOutstanding: Number(outstanding._sum.total || 0) - Number(outstanding._sum.paidAmount || 0),
  };
}

export async function getLinkedJournalEntry(tenantId: string | undefined, reference: string) {
  const t = tid(tenantId);
  return db.journalEntry.findFirst({
    where: { tenantId: t, reference },
    include: { lines: { include: { account: { select: { code: true, name: true } } } } },
  });
}

export async function retryBillAccounting(tenantId: string | undefined, id: string) {
  const t = tid(tenantId);
  const bill = await db.vendorBill.findFirst({ where: { id, tenantId: t } });
  if (!bill) throw new ApiError('Bill not found', 404);
  if (!bill.isPosted) throw new ApiError('Bill is not posted', 400);

  const existing = await db.journalEntry.findFirst({ where: { tenantId: t, reference: `BILL:${bill.number}` } });
  if (existing) throw new ApiError('Journal entry already exists for this bill', 400);

  const result = await createBillJournalEntry(t, bill);
  if (result === 'skipped_accounts') throw new ApiError('No Expense or Accounts Payable account found. Set up Chart of Accounts first.', 400);
  if (result === 'skipped_fiscal') throw new ApiError('No open fiscal year covers this bill date. Create a fiscal year first.', 400);

  return { success: true, message: 'Journal entry created successfully.' };
}
