import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireTenant, requireActiveTrial } from '@/lib/middleware';
import { getTenant, updateTenant, deleteTenant } from '@/lib/services/tenant.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authenticate(req);
    requireTenant(user);
    await requireActiveTrial(user);

    const { id } = await params;
    const result = await getTenant(id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authenticate(req);
    requireTenant(user);
    await requireActiveTrial(user);

    const { id } = await params;
    const body = await req.json();
    const result = await updateTenant(id, body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authenticate(req);
    requireTenant(user);
    await requireActiveTrial(user);

    const { id } = await params;
    await deleteTenant(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
