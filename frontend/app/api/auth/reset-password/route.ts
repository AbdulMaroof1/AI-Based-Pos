import { NextRequest, NextResponse } from 'next/server';
import { resetPassword } from '@/lib/services/auth.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Token and new password are required' },
        { status: 400 },
      );
    }
    await resetPassword(token, newPassword);
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
