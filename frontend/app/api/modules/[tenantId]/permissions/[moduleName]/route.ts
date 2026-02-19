import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireActiveTrial } from '@/lib/middleware';
import { updateModulePermission } from '@/lib/services/module-access.service';
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
    const body = await req.json();
    const result = await updateModulePermission(tenantId, moduleName, body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
