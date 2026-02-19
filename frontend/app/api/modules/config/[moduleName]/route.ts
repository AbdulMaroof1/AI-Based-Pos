import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireActiveTrial } from '@/lib/middleware';
import { setModuleActive } from '@/lib/services/module-access.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ moduleName: string }> },
) {
  try {
    const user = await authenticate(req);
    await requireActiveTrial(user);

    const { moduleName } = await params;
    const { isActive } = await req.json();
    await setModuleActive(moduleName, isActive);
    return NextResponse.json({
      success: true,
      message: `Module ${moduleName} ${isActive ? 'enabled' : 'disabled'}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
