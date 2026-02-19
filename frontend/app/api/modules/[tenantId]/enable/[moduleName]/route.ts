import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireActiveTrial } from '@/lib/middleware';
import { enableModule } from '@/lib/services/module-access.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; moduleName: string }> },
) {
  try {
    const user = await authenticate(req);
    await requireActiveTrial(user);

    const { tenantId, moduleName } = await params;
    const body = await req.json().catch(() => ({}));
    await enableModule(tenantId, moduleName, body?.enabledBy);
    return NextResponse.json({
      success: true,
      message: `Module ${moduleName} enabled for tenant ${tenantId}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
