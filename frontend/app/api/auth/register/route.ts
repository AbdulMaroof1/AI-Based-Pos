import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/lib/services/auth.service';
import { handleApiError } from '@/lib/errors';
import { UserRole } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, role, tenantId, branchId } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const result = await register({
      email,
      password,
      firstName,
      lastName,
      role: role || UserRole.ADMIN,
      tenantId,
      branchId,
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
