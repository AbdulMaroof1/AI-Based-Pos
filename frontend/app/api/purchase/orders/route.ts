import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireTenant, requireActiveTrial, requireModuleAccess } from '@/lib/middleware';
import { getPurchaseOrders, createPurchaseOrder } from '@/lib/services/purchase.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'PURCHASE');
    const url = new URL(req.url);
    const result = await getPurchaseOrders(tenantId === 'ALL' ? undefined : tenantId, {
      status: url.searchParams.get('status') || undefined,
      vendorId: url.searchParams.get('vendorId') || undefined,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) { return handleApiError(error); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'PURCHASE');
    const body = await req.json();
    const result = await createPurchaseOrder(tenantId === 'ALL' ? undefined : tenantId, body);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
