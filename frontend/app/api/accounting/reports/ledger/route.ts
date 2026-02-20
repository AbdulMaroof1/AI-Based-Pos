import { NextRequest, NextResponse } from 'next/server';
import {
  authenticate,
  requireTenant,
  requireActiveTrial,
  requireModuleAccess,
} from '@/lib/middleware';
import { getLedger } from '@/lib/services/accounting.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'ACCOUNTING');

    const url = new URL(req.url);
    const result = await getLedger(tenantId === 'ALL' ? undefined : tenantId, {
      accountId: url.searchParams.get('accountId') || undefined,
      fiscalYearId: url.searchParams.get('fiscalYearId') || undefined,
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
