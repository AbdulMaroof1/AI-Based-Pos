import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireTenant, requireActiveTrial, requireModuleAccess } from '@/lib/middleware';
import { createPosOrder } from '@/lib/services/pos.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'POS');

    const body = await req.json();
    const result = await createPosOrder(tenantId === 'ALL' ? undefined : tenantId, body.sessionId, { lines: body.lines });
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
