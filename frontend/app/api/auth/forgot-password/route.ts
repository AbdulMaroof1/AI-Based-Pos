import { NextRequest, NextResponse } from 'next/server';
import { forgotPassword } from '@/lib/services/auth.service';
import { handleApiError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 },
      );
    }
    await forgotPassword(email);
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
