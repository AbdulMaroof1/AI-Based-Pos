import { NextRequest, NextResponse } from 'next/server';
import {
  authenticate,
  requireTenant,
  requireActiveTrial,
  requireModuleAccess,
} from '@/lib/middleware';
import { getAccount, updateAccount } from '@/lib/services/accounting.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'ACCOUNTING');

    const result = await getAccount(tenantId === 'ALL' ? undefined : tenantId, params.id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'ACCOUNTING');

    const body = await req.json();
    const result = await updateAccount(tenantId === 'ALL' ? undefined : tenantId, params.id, body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
