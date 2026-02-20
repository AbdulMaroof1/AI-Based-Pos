import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware';
import { ensureNewModulesForAllTenants } from '@/lib/services/module-access.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

/**
 * POST /api/modules/sync-new
 * Syncs new modules (e.g. HR) to all existing tenants so they appear in the app launcher.
 * Call this once after adding a new module to enable it for all tenants.
 */
export async function POST(req: NextRequest) {
  try {
    await authenticate(req);
    await ensureNewModulesForAllTenants();
    return NextResponse.json({ success: true, message: 'New modules synced to all tenants' });
  } catch (error) {
    return handleApiError(error);
  }
}
