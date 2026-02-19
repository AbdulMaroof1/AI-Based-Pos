import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message, statusCode: error.statusCode },
      { status: error.statusCode },
    );
  }

  console.error('Unexpected error:', error);
  return NextResponse.json(
    { success: false, error: 'Internal server error', statusCode: 500 },
    { status: 500 },
  );
}
