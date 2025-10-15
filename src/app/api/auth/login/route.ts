import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { isAdmin } from '@/lib/firebase/auth';

// إجبار Node Runtime
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // التعامل مع JSON parsing بشكل آمن
    const body = await request.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { ok: false, error: 'رمز المصادقة مطلوب' },
        { status: 400 }
      );
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Check if user is admin
    const user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
    };

    if (!isAdmin(user)) {
      return NextResponse.json(
        { ok: false, error: 'ليس لديك صلاحية للوصول إلى لوحة التحكم' },
        { status: 403 }
      );
    }

    // Create response with httpOnly cookie
    const response = NextResponse.json({ ok: true, success: true });
    
    // Set httpOnly cookie with the ID token
    response.cookies.set('firebase-auth-token', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { ok: false, error: error?.message ?? 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}



