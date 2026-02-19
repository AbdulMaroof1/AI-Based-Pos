import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireTenant, requireActiveTrial } from '@/lib/middleware';
import { createBranch, getBranches } from '@/lib/services/tenant.service';
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
    const result = await getBranches(id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authenticate(req);
    requireTenant(user);
    await requireActiveTrial(user);

    const { id } = await params;
    const body = await req.json();
    const result = await createBranch({ ...body, tenantId: id });
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
