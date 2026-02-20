import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireTenant, requireActiveTrial, requireModuleAccess } from '@/lib/middleware';
import { getOpenSession, openSession } from '@/lib/services/pos.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'POS');

    const session = await getOpenSession(tenantId === 'ALL' ? undefined : tenantId);
    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'POS');

    const body = await req.json();
    const result = await openSession(tenantId === 'ALL' ? undefined : tenantId, {
      startingCash: body.startingCash ?? 0,
      openedBy: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email,
    });
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
