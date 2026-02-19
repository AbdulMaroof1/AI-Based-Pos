import { NextRequest, NextResponse } from 'next/server';
import { requestOtp } from '@/lib/services/auth.service';
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
    await requestOtp(email);
    return NextResponse.json({
      success: true,
      data: { message: 'Verification code sent to your email' },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
