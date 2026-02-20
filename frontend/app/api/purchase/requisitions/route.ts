import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireTenant, requireActiveTrial, requireModuleAccess } from '@/lib/middleware';
import { getRequisitions, createRequisition } from '@/lib/services/purchase.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'PURCHASE');
    const url = new URL(req.url);
    const result = await getRequisitions(tenantId === 'ALL' ? undefined : tenantId, { status: url.searchParams.get('status') || undefined });
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
    const result = await createRequisition(tenantId === 'ALL' ? undefined : tenantId, body);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
