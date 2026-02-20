import { NextRequest, NextResponse } from 'next/server';
import {
  authenticate,
  requireTenant,
  requireActiveTrial,
  requireModuleAccess,
} from '@/lib/middleware';
import { lockFiscalYear, unlockFiscalYear } from '@/lib/services/accounting.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'ACCOUNTING');

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'lock';
    const tid = tenantId === 'ALL' ? undefined : tenantId;

    const result = action === 'unlock'
      ? await unlockFiscalYear(tid, params.id)
      : await lockFiscalYear(tid, params.id);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
