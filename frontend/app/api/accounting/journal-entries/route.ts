import { NextRequest, NextResponse } from 'next/server';
import {
  authenticate,
  requireTenant,
  requireActiveTrial,
  requireModuleAccess,
} from '@/lib/middleware';
import {
  getJournalEntries,
  createJournalEntry,
} from '@/lib/services/accounting.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);
    await requireModuleAccess(user, 'ACCOUNTING');

    const url = new URL(req.url);
    const fiscalYearId = url.searchParams.get('fiscalYearId') || undefined;
    const result = await getJournalEntries(
      tenantId === 'ALL' ? undefined : tenantId,
      fiscalYearId,
    );
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
    await requireModuleAccess(user, 'ACCOUNTING');

    const body = await req.json();
    const result = await createJournalEntry(
      tenantId === 'ALL' ? undefined : tenantId,
      { ...body, date: new Date(body.date) },
    );
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
