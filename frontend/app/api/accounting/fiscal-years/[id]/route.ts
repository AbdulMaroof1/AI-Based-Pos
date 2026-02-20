import { NextRequest, NextResponse } from 'next/server';
import {
  authenticate,
  requireTenant,
  requireActiveTrial,
  requireModuleAccess,
} from '@/lib/middleware';
import { getFiscalYear } from '@/lib/services/accounting.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'ACCOUNTING');

    const result = await getFiscalYear(tenantId === 'ALL' ? undefined : tenantId, params.id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
