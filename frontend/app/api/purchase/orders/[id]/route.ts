import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireTenant, requireActiveTrial, requireModuleAccess } from '@/lib/middleware';
import { getPurchaseOrder, updatePOStatus } from '@/lib/services/purchase.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'PURCHASE');
    const result = await getPurchaseOrder(tenantId === 'ALL' ? undefined : tenantId, params.id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) { return handleApiError(error); }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'PURCHASE');
    const { status } = await req.json();
    const result = await updatePOStatus(tenantId === 'ALL' ? undefined : tenantId, params.id, status);
    return NextResponse.json({ success: true, data: result });
  } catch (error) { return handleApiError(error); }
}
