import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireTenant, requireActiveTrial, requireModuleAccess } from '@/lib/middleware';
import { convertRequisitionToPO } from '@/lib/services/purchase.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'PURCHASE');
    const { vendorId } = await req.json();
    const result = await convertRequisitionToPO(tenantId === 'ALL' ? undefined : tenantId, params.id, vendorId);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) { return handleApiError(error); }
}
