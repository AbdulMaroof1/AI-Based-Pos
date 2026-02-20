import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireTenant, requireActiveTrial } from '@/lib/middleware';
import { getLinkedJournalEntry } from '@/lib/services/purchase.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    const tenantId = requireTenant(user);
    await requireActiveTrial(user);

    const url = new URL(req.url);
    const reference = url.searchParams.get('reference');
    if (!reference) return NextResponse.json({ success: true, data: null });

    const result = await getLinkedJournalEntry(tenantId === 'ALL' ? undefined : tenantId, reference);
    return NextResponse.json({ success: true, data: result });
  } catch (error) { return handleApiError(error); }
}
