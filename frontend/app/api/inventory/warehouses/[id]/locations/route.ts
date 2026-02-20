import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireTenant, requireActiveTrial, requireModuleAccess } from '@/lib/middleware';
import { createLocation } from '@/lib/services/inventory.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'INVENTORY');

    const body = await req.json();
    const result = await createLocation(tenantId === 'ALL' ? undefined : tenantId, params.id, body);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

