import { type NextRequest, NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({ success: true });

    // Remove auth cookie
    return removeAuthCookie(response);
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
