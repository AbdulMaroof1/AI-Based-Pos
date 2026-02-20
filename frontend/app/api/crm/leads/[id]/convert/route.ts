import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireTenant, requireActiveTrial, requireModuleAccess } from '@/lib/middleware';
import { convertLeadToCustomer } from '@/lib/services/crm.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'CRM');

    const body = await req.json().catch(() => ({}));
    const result = await convertLeadToCustomer(tenantId === 'ALL' ? undefined : tenantId, params.id, body);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
