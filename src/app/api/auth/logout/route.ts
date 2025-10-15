import { NextRequest, NextResponse } from 'next/server';

// إجبار Node Runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({ ok: true, success: true });
    
    // Clear the auth cookie
    response.cookies.set('firebase-auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error: any) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { ok: false, error: error?.message ?? 'حدث خطأ أثناء تسجيل الخروج' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}



