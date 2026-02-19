import { NextRequest, NextResponse } from 'next/server';
import { setupAccount } from '@/lib/services/auth.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const setupToken = req.headers.get('x-setup-token');
    if (!setupToken) {
      return NextResponse.json(
        { success: false, error: 'Setup token required' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const result = await setupAccount(body, setupToken);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
