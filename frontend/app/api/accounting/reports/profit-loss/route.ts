import { NextRequest, NextResponse } from 'next/server';
import {
  authenticate,
  requireTenant,
  requireActiveTrial,
  requireModuleAccess,
} from '@/lib/middleware';
import { getProfitAndLoss } from '@/lib/services/accounting.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'ACCOUNTING');

    const url = new URL(req.url);
    const fiscalYearId = url.searchParams.get('fiscalYearId');
    if (!fiscalYearId) {
      return NextResponse.json(
        { success: false, error: 'fiscalYearId is required' },
        { status: 400 },
      );
    }

    const result = await getProfitAndLoss(tenantId === 'ALL' ? undefined : tenantId, fiscalYearId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
