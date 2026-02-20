import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireTenant, requireActiveTrial, requireModuleAccess } from '@/lib/middleware';
import { getAttendance, upsertAttendance, bulkUpsertAttendance } from '@/lib/services/hr.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'HR');
    const url = new URL(req.url);
    const result = await getAttendance(tenantId === 'ALL' ? undefined : tenantId, {
      employeeId: url.searchParams.get('employeeId') || undefined,
      from: url.searchParams.get('from') || undefined,
      to: url.searchParams.get('to') || undefined,
      status: url.searchParams.get('status') || undefined,
    });
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
    await requireModuleAccess(user, 'HR');
    const body = await req.json();
    if (body.date && Array.isArray(body.records)) {
      const result = await bulkUpsertAttendance(tenantId === 'ALL' ? undefined : tenantId, body.date, body.records);
      return NextResponse.json({ success: true, data: result }, { status: 201 });
    }
    const result = await upsertAttendance(tenantId === 'ALL' ? undefined : tenantId, body);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
