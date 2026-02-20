import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/api/accounting/:path*',
    '/api/crm/:path*',
    '/api/sales/:path*',
    '/api/purchase/:path*',
    '/api/inventory/:path*',
    '/api/pos/:path*',
    '/api/hr/:path*',
    '/api/tenants/:path*',
    '/api/modules/:path*',
  ],
};

export default function middleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Missing or invalid authorization header' },
      { status: 401 },
    );
  }

  return NextResponse.next();
}
