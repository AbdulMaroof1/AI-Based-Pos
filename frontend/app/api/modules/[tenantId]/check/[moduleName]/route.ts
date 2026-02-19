import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireActiveTrial } from '@/lib/middleware';
import { isModuleEnabled } from '@/lib/services/module-access.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantId: string; moduleName: string }> },
) {
  try {
    const user = await authenticate(req);
    await requireActiveTrial(user);

    const { tenantId, moduleName } = await params;
    const enabled = await isModuleEnabled(tenantId, moduleName);
    return NextResponse.json({
      success: true,
      data: { tenantId, moduleName, isEnabled: enabled },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
