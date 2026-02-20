import { db } from '@/lib/db';
import { ApiError } from '@/lib/errors';
import { Decimal } from '@prisma/client/runtime/library';

function tid(tenantId: string | undefined): string {
  if (!tenantId) throw new ApiError('Company context required', 403);
  return tenantId;
}

async function nextOrderNum(tenantId: string): Promise<string> {
  const count = await db.posOrder.count({ where: { tenantId } });
  return `POS-${String(count + 1).padStart(5, '0')}`;
}

// ===================== SESSIONS =====================

export async function getOpenSession(tenantId: string | undefined) {
  const t = tid(tenantId);
  return db.posSession.findFirst({
    where: { tenantId: t, status: 'OPEN' },
    orderBy: { openedAt: 'desc' },
    include: {
      orders: { where: { status: { not: 'CANCELLED' } }, include: { lines: true } },
    },
  });
}

export async function openSession(
  tenantId: string | undefined,
  data: { branchId?: string; startingCash?: number; openedBy: string },
) {
  const t = tid(tenantId);
  const existing = await db.posSession.findFirst({ where: { tenantId: t, status: 'OPEN' } });
  if (existing) throw new ApiError('A session is already open. Close it first.', 400);

  return db.posSession.create({
    data: {
      tenantId: t,
      branchId: data.branchId || null,
      openedBy: data.openedBy,
      startingCash: new Decimal(data.startingCash ?? 0),
      status: 'OPEN',
    },
  });
}

export async function closeSession(
  tenantId: string | undefined,
  sessionId: string,
  data: { closingCash: number },
) {
  const t = tid(tenantId);
  const session = await db.posSession.findFirst({ where: { id: sessionId, tenantId: t } });
  if (!session) throw new ApiError('Session not found', 404);
  if (session.status === 'CLOSED') throw new ApiError('Session already closed', 400);

  const pending = await db.posOrder.count({ where: { sessionId, status: 'PENDING' } });
  if (pending > 0) throw new ApiError(`Close or complete ${pending} pending order(s) first`, 400);

  return db.posSession.update({
    where: { id: sessionId },
    data: { status: 'CLOSED', closedAt: new Date(), closingCash: new Decimal(data.closingCash) },
  });
}

// ===================== ORDERS =====================

export async function createPosOrder(
  tenantId: string | undefined,
  sessionId: string,
  data: { lines: { productId?: string; description: string; quantity: number; unitPrice: number }[] },
) {
  const t = tid(tenantId);
  const session = await db.posSession.findFirst({ where: { id: sessionId, tenantId: t } });
  if (!session) throw new ApiError('Session not found', 404);
  if (session.status !== 'OPEN') throw new ApiError('Session is closed', 400);

  if (!data.lines?.length) throw new ApiError('At least one line required', 400);

  const subtotal = data.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const taxAmount = 0;
  const total = subtotal + taxAmount;

  const number = await nextOrderNum(t);

  return db.posOrder.create({
    data: {
      tenantId: t,
      sessionId,
      branchId: session.branchId,
      number,
      subtotal: new Decimal(subtotal),
      taxRate: new Decimal(0),
      taxAmount: new Decimal(taxAmount),
      total: new Decimal(total),
      lines: {
        create: data.lines.map((l) => ({
          productId: l.productId || null,
          description: l.description,
          quantity: new Decimal(l.quantity),
          unitPrice: new Decimal(l.unitPrice),
          amount: new Decimal(l.quantity * l.unitPrice),
        })),
      },
    },
    include: { lines: { include: { product: { select: { id: true, sku: true, name: true } } } } },
  });
}

export async function completePosOrder(tenantId: string | undefined, orderId: string) {
  const t = tid(tenantId);
  const order = await db.posOrder.findFirst({
    where: { id: orderId, tenantId: t },
    include: { lines: { include: { product: { select: { id: true, type: true, standardCost: true } } } } },
  });
  if (!order) throw new ApiError('Order not found', 404);
  if (order.status === 'PAID') throw new ApiError('Order already completed', 400);
  if (order.status === 'CANCELLED') throw new ApiError('Order is cancelled', 400);

  const updated = await db.posOrder.update({
    where: { id: orderId },
    data: { status: 'PAID', paidAmount: order.total },
  });

  // Inventory: decrease stock for STOCK product lines
  const stockLines = order.lines
    .filter((l) => l.productId && l.product?.type === 'STOCK')
    .map((l) => ({
      productId: l.productId!,
      quantity: Number(l.quantity),
      unitCost: Number(l.product?.standardCost ?? 0),
    }));
  if (stockLines.length) {
    try {
      const { issueSalesFromStock } = await import('@/lib/services/inventory.service');
      await issueSalesFromStock(t, stockLines, order.date, `POS:${order.number}`);
    } catch (err) {
      console.error('[POS] Failed to decrease inventory:', err);
    }
  }

  return updated;
}

export async function cancelPosOrder(tenantId: string | undefined, orderId: string) {
  const t = tid(tenantId);
  const order = await db.posOrder.findFirst({ where: { id: orderId, tenantId: t } });
  if (!order) throw new ApiError('Order not found', 404);
  if (order.status === 'PAID') throw new ApiError('Cannot cancel completed order', 400);
  if (order.status === 'CANCELLED') throw new ApiError('Order already cancelled', 400);

  return db.posOrder.update({
    where: { id: orderId },
    data: { status: 'CANCELLED' },
  });
}
