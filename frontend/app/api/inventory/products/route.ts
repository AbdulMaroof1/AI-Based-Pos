import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireTenant, requireActiveTrial, requireModuleAccess } from '@/lib/middleware';
import { createProduct, getProducts } from '@/lib/services/inventory.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'INVENTORY');

    const url = new URL(req.url);
    const search = url.searchParams.get('search') || undefined;
    const result = await getProducts(tenantId === 'ALL' ? undefined : tenantId, search);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'INVENTORY');

    const body = await req.json();
    const result = await createProduct(tenantId === 'ALL' ? undefined : tenantId, body);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

