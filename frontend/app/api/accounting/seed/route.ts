import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireTenant, requireActiveTrial, requireModuleAccess } from '@/lib/middleware';
import { seedStarterAccounts } from '@/lib/services/accounting.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'ACCOUNTING');

    const result = await seedStarterAccounts(tenantId === 'ALL' ? undefined : tenantId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
