import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireActiveTrial } from '@/lib/middleware';
import { setupDefaultPermissionsForTenant } from '@/lib/services/module-access.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    await requireActiveTrial(user);

    const { tenantId, enabledBy } = await req.json();
    await setupDefaultPermissionsForTenant(tenantId, enabledBy);
    return NextResponse.json({
      success: true,
      message: 'Default modules enabled for tenant',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
