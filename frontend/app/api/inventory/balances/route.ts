import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireTenant, requireActiveTrial, requireModuleAccess } from '@/lib/middleware';
import { getStockBalances } from '@/lib/services/inventory.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'INVENTORY');

    const url = new URL(req.url);
    const productId = url.searchParams.get('productId') || undefined;
    const warehouseId = url.searchParams.get('warehouseId') || undefined;
    const result = await getStockBalances(tenantId === 'ALL' ? undefined : tenantId, { productId, warehouseId });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

