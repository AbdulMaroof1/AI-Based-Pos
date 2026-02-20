import { db } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { Decimal } from '@prisma/client/runtime/library';

function tid(tenantId: string | undefined): string {
  if (!tenantId) throw new ApiError('Company context required', 403);
  return tenantId;
}

async function nextNum(tenantId: string, prefix: string, model: 'stockMove') {
  const count = await (db[model] as { count: (a: { where: { tenantId: string } }) => Promise<number> }).count({ where: { tenantId } });
  return `${prefix}-${String(count + 1).padStart(5, '0')}`;
}

// ===================== SETTINGS =====================

export async function getInventorySettings(tenantId: string | undefined) {
  const t = tid(tenantId);
  return db.inventorySettings.upsert({
    where: { tenantId: t },
    update: {},
    create: { tenantId: t, purchaseStockRecognition: 'RECEIPT' },
  });
}

export async function updateInventorySettings(
  tenantId: string | undefined,
  data: { purchaseStockRecognition?: 'RECEIPT' | 'BILL' },
) {
  const t = tid(tenantId);
  const allowed = ['RECEIPT', 'BILL'] as const;
  if (data.purchaseStockRecognition && !allowed.includes(data.purchaseStockRecognition)) {
    throw new ApiError(`purchaseStockRecognition must be: ${allowed.join(', ')}`, 400);
  }
  return db.inventorySettings.upsert({
    where: { tenantId: t },
    update: { purchaseStockRecognition: data.purchaseStockRecognition },
    create: { tenantId: t, purchaseStockRecognition: data.purchaseStockRecognition ?? 'RECEIPT' },
  });
}

// ===================== PRODUCTS =====================

export async function getProducts(tenantId: string | undefined, search?: string) {
  const t = tid(tenantId);
  const where: Record<string, unknown> = { tenantId: t };
  if (search) {
    where.OR = [
      { sku: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }
  return db.product.findMany({ where, orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }] });
}

export async function getProduct(tenantId: string | undefined, id: string) {
  const t = tid(tenantId);
  const p = await db.product.findFirst({ where: { id, tenantId: t } });
  if (!p) throw new ApiError('Product not found', 404);
  return p;
}

export async function createProduct(
  tenantId: string | undefined,
  data: { sku: string; name: string; type?: 'STOCK' | 'SERVICE'; standardCost?: number; salePrice?: number; isActive?: boolean },
) {
  const t = tid(tenantId);
  if (!data.sku?.trim()) throw new ApiError('SKU is required', 400);
  if (!data.name?.trim()) throw new ApiError('Name is required', 400);
  const type = data.type ?? 'STOCK';
  if (!['STOCK', 'SERVICE'].includes(type)) throw new ApiError('Type must be STOCK or SERVICE', 400);
  return db.product.create({
    data: {
      tenantId: t,
      sku: data.sku.trim(),
      name: data.name.trim(),
      type,
      standardCost: new Decimal(data.standardCost ?? 0),
      salePrice: new Decimal(data.salePrice ?? 0),
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateProduct(
  tenantId: string | undefined,
  id: string,
  data: { sku?: string; name?: string; type?: 'STOCK' | 'SERVICE'; standardCost?: number; salePrice?: number; isActive?: boolean },
) {
  const t = tid(tenantId);
  const p = await db.product.findFirst({ where: { id, tenantId: t } });
  if (!p) throw new ApiError('Product not found', 404);
  if (data.type && !['STOCK', 'SERVICE'].includes(data.type)) throw new ApiError('Type must be STOCK or SERVICE', 400);
  return db.product.update({
    where: { id },
    data: {
      sku: data.sku?.trim(),
      name: data.name?.trim(),
      type: data.type,
      standardCost: data.standardCost == null ? undefined : new Decimal(data.standardCost),
      salePrice: data.salePrice == null ? undefined : new Decimal(data.salePrice),
      isActive: data.isActive,
    },
  });
}

// ===================== WAREHOUSES / LOCATIONS =====================

export async function getWarehouses(tenantId: string | undefined) {
  const t = tid(tenantId);
  return db.warehouse.findMany({
    where: { tenantId: t },
    orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    include: { locations: { orderBy: { code: 'asc' } } },
  });
}

export async function createWarehouse(
  tenantId: string | undefined,
  data: { code: string; name: string },
) {
  const t = tid(tenantId);
  if (!data.code?.trim()) throw new ApiError('Warehouse code is required', 400);
  if (!data.name?.trim()) throw new ApiError('Warehouse name is required', 400);
  const code = data.code.trim().toUpperCase();

  // Enterprise default: create main + quarantine locations
  return db.warehouse.create({
    data: {
      tenantId: t,
      code,
      name: data.name.trim(),
      locations: {
        create: [
          { tenantId: t, code: 'MAIN', name: 'Main Stock', isQuarantine: false },
          { tenantId: t, code: 'QUAR', name: 'Quarantine', isQuarantine: true },
        ],
      },
    },
    include: { locations: true },
  });
}

export async function createLocation(
  tenantId: string | undefined,
  warehouseId: string,
  data: { code: string; name: string; isQuarantine?: boolean },
) {
  const t = tid(tenantId);
  const wh = await db.warehouse.findFirst({ where: { id: warehouseId, tenantId: t } });
  if (!wh) throw new ApiError('Warehouse not found', 404);
  if (!data.code?.trim()) throw new ApiError('Location code is required', 400);
  if (!data.name?.trim()) throw new ApiError('Location name is required', 400);
  return db.location.create({
    data: {
      tenantId: t,
      warehouseId,
      code: data.code.trim().toUpperCase(),
      name: data.name.trim(),
      isQuarantine: data.isQuarantine ?? false,
    },
  });
}

// ===================== STOCK BALANCES =====================

export async function getStockBalances(tenantId: string | undefined, options?: { productId?: string; warehouseId?: string }) {
  const t = tid(tenantId);
  const where: Record<string, unknown> = { tenantId: t };
  if (options?.productId) where.productId = options.productId;
  if (options?.warehouseId) where.location = { warehouseId: options.warehouseId };
  return db.stockBalance.findMany({
    where,
    include: {
      product: { select: { id: true, sku: true, name: true, type: true, standardCost: true } },
      location: { select: { id: true, code: true, name: true, warehouseId: true } },
    },
    orderBy: [{ product: { sku: 'asc' } }, { location: { code: 'asc' } }],
  });
}

// ===================== STOCK MOVES =====================

export async function getStockMoves(tenantId: string | undefined) {
  const t = tid(tenantId);
  return db.stockMove.findMany({
    where: { tenantId: t },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    include: { lines: { include: { product: { select: { sku: true, name: true } } } } },
  });
}

export async function getInventorySummary(tenantId: string | undefined) {
  const t = tid(tenantId);
  const [products, warehouses, locations, moves, qty] = await Promise.all([
    db.product.count({ where: { tenantId: t } }),
    db.warehouse.count({ where: { tenantId: t } }),
    db.location.count({ where: { tenantId: t } }),
    db.stockMove.count({ where: { tenantId: t } }),
    db.stockBalance.aggregate({ where: { tenantId: t }, _sum: { qtyOnHand: true } }),
  ]);
  return {
    products,
    warehouses,
    locations,
    stockMoves: moves,
    totalQtyOnHand: Number(qty._sum.qtyOnHand || 0),
  };
}

export async function createStockMove(
  tenantId: string | undefined,
  data: {
    type: 'ADJUSTMENT' | 'TRANSFER' | 'QUARANTINE' | 'RECEIPT' | 'ISSUE';
    date: string;
    memo?: string;
    lines: { productId: string; fromLocationId?: string; toLocationId?: string; quantity: number; unitCost?: number; memo?: string }[];
  },
) {
  const t = tid(tenantId);
  if (!data.lines?.length) throw new ApiError('At least one line is required', 400);
  if (!['ADJUSTMENT', 'TRANSFER', 'QUARANTINE', 'RECEIPT', 'ISSUE'].includes(data.type)) {
    throw new ApiError('Invalid stock move type', 400);
  }

  const number = await nextNum(t, 'SM', 'stockMove');
  return db.stockMove.create({
    data: {
      tenantId: t,
      number,
      type: data.type,
      date: new Date(data.date),
      memo: data.memo || null,
      lines: {
        create: data.lines.map((l) => ({
          tenantId: t,
          productId: l.productId,
          fromLocationId: l.fromLocationId || null,
          toLocationId: l.toLocationId || null,
          quantity: new Decimal(l.quantity),
          unitCost: new Decimal(l.unitCost ?? 0),
          memo: l.memo || null,
        })),
      },
    },
    include: { lines: true },
  });
}

/** Get default receiving location (first warehouse's main non-quarantine) for ERP integrations */
export async function getDefaultStockLocation(tenantId: string | undefined): Promise<string | null> {
  const t = tid(tenantId);
  const loc = await db.location.findFirst({
    where: { tenantId: t, isQuarantine: false, isActive: true, warehouse: { isActive: true } },
    orderBy: { warehouse: { createdAt: 'asc' } },
  });
  return loc?.id ?? null;
}

/** Increase inventory for purchase receipt - called by purchase.service when RECEIPT mode */
export async function receivePurchaseIntoStock(
  tenantId: string | undefined,
  lines: { productId: string; locationId: string; quantity: number; unitCost: number }[],
  date: Date,
  reference: string,
) {
  const t = tid(tenantId);
  if (!lines.length) return;
  const stockLines = lines.map((l) => ({
    productId: l.productId,
    toLocationId: l.locationId,
    quantity: l.quantity,
    unitCost: l.unitCost,
  }));
  const move = await createStockMove(t, {
    type: 'RECEIPT',
    date: date.toISOString().split('T')[0],
    memo: reference,
    lines: stockLines,
  });
  await postStockMoveInternal(t, move.id, date);
}

/** Decrease inventory for sales issue - called by sales.service when posting invoice */
export async function issueSalesFromStock(
  tenantId: string | undefined,
  lines: { productId: string; quantity: number; unitCost: number }[],
  date: Date,
  reference: string,
): Promise<{ ok: boolean; message?: string }> {
  const t = tid(tenantId);
  if (!lines.length) return { ok: true };
  const loc = await getDefaultStockLocation(t);
  if (!loc) return { ok: false, message: 'No stock location configured. Create a warehouse in Inventory first.' };
  const stockLines = lines.map((l) => ({
    productId: l.productId,
    fromLocationId: loc,
    quantity: l.quantity,
    unitCost: l.unitCost,
  }));
  const move = await createStockMove(t, {
    type: 'ISSUE',
    date: date.toISOString().split('T')[0],
    memo: reference,
    lines: stockLines,
  });
  await postStockMoveInternal(t, move.id, date);
  return { ok: true };
}

async function postStockMoveInternal(tenantId: string, id: string, moveDate?: Date) {
  const move = await db.stockMove.findFirst({
    where: { id, tenantId: tenantId },
    include: { lines: true },
  });
  if (!move) throw new ApiError('Stock move not found', 404);
  if (move.isPosted) return move;

  await db.$transaction(async (tx) => {
    for (const line of move.lines) {
      const qty = Number(line.quantity);
      if (line.fromLocationId) {
        await tx.stockBalance.upsert({
          where: { tenantId_productId_locationId: { tenantId: tenantId, productId: line.productId, locationId: line.fromLocationId } },
          update: { qtyOnHand: { decrement: new Decimal(qty) } },
          create: { tenantId: tenantId, productId: line.productId, locationId: line.fromLocationId, qtyOnHand: new Decimal(-qty) },
        });
      }
      if (line.toLocationId) {
        await tx.stockBalance.upsert({
          where: { tenantId_productId_locationId: { tenantId: tenantId, productId: line.productId, locationId: line.toLocationId } },
          update: { qtyOnHand: { increment: new Decimal(qty) } },
          create: { tenantId: tenantId, productId: line.productId, locationId: line.toLocationId, qtyOnHand: new Decimal(qty) },
        });
      }
    }
    await tx.stockMove.update({ where: { id }, data: { isPosted: true, postedAt: new Date() } });
  });

  // Accounting: journal entries for ADJUSTMENT, RECEIPT, ISSUE
  const date = moveDate ?? move.date;
  await createStockMoveJournalEntry(tenantId, move, date);
  return db.stockMove.findFirst({ where: { id }, include: { lines: true } });
}

async function createStockMoveJournalEntry(tenantId: string, move: { type: string; number: string; lines: { productId: string; fromLocationId: string | null; toLocationId: string | null; quantity: unknown; unitCost: unknown }[] }, date: Date) {
  const invAccount = await db.account.findFirst({ where: { tenantId, code: '1300' } });
  const cogsAccount = await db.account.findFirst({ where: { tenantId, accountType: 'EXPENSE', code: '5000' } }) ?? await db.account.findFirst({ where: { tenantId, accountType: 'EXPENSE' }, orderBy: { code: 'asc' } });
  const otherIncomeAccount = await db.account.findFirst({ where: { tenantId, code: '4200' } }) ?? await db.account.findFirst({ where: { tenantId, accountType: 'REVENUE' }, orderBy: { code: 'asc' } });
  const accruedAccount = await db.account.findFirst({ where: { tenantId, code: '2100' } });
  const fiscalYear = await db.fiscalYear.findFirst({ where: { tenantId, isLocked: false, startDate: { lte: date }, endDate: { gte: date } } });
  if (!invAccount || !fiscalYear) return;

  const lines: { accountId: string; debit: number; credit: number; memo: string }[] = [];
  let totalDr = 0;
  let totalCr = 0;

  const receiptCreditAccount = accruedAccount ?? otherIncomeAccount;

  for (const line of move.lines) {
    const qty = Number(line.quantity);
    const cost = Number(line.unitCost);
    const amount = Math.round(qty * cost * 100) / 100;
    if (amount <= 0) continue;

    if (move.type === 'ADJUSTMENT') {
      if (line.toLocationId && !line.fromLocationId) {
        lines.push({ accountId: invAccount.id, debit: amount, credit: 0, memo: `Stock adjustment IN: ${move.number}` });
        if (otherIncomeAccount) lines.push({ accountId: otherIncomeAccount.id, debit: 0, credit: amount, memo: `Stock adjustment IN: ${move.number}` });
      } else if (line.fromLocationId && !line.toLocationId) {
        if (cogsAccount) lines.push({ accountId: cogsAccount.id, debit: amount, credit: 0, memo: `Stock adjustment OUT: ${move.number}` });
        lines.push({ accountId: invAccount.id, debit: 0, credit: amount, memo: `Stock adjustment OUT: ${move.number}` });
      }
    } else if (move.type === 'RECEIPT') {
      lines.push({ accountId: invAccount.id, debit: amount, credit: 0, memo: `Stock receipt: ${move.number}` });
      if (receiptCreditAccount) lines.push({ accountId: receiptCreditAccount.id, debit: 0, credit: amount, memo: `Stock receipt: ${move.number}` });
    } else if (move.type === 'ISSUE') {
      if (cogsAccount) lines.push({ accountId: cogsAccount.id, debit: amount, credit: 0, memo: `COGS: ${move.number}` });
      lines.push({ accountId: invAccount.id, debit: 0, credit: amount, memo: `Stock issue: ${move.number}` });
    }
  }

  for (const l of lines) {
    totalDr += l.debit;
    totalCr += l.credit;
  }
  if (totalDr === 0 && totalCr === 0) return;
  if (Math.abs(totalDr - totalCr) > 0.01) return;

  await db.journalEntry.create({
    data: {
      tenantId,
      fiscalYearId: fiscalYear.id,
      date,
      reference: `SM:${move.number}`,
      memo: `Stock move ${move.number} (${move.type})`,
      isPosted: true,
      postedAt: new Date(),
      lines: {
        create: lines.map((l) => ({
          accountId: l.accountId,
          debit: new Decimal(l.debit),
          credit: new Decimal(l.credit),
          memo: l.memo,
        })),
      },
    },
  });
}

export async function postStockMove(tenantId: string | undefined, id: string) {
  const t = tid(tenantId);
  return postStockMoveInternal(t, id);
}

