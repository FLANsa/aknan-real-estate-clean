import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { isAdmin } from '@/lib/firebase/auth';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'رمز المصادقة مطلوب' },
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
        { error: 'ليس لديك صلاحية للوصول إلى لوحة التحكم' },
        { status: 403 }
      );
    }

    // Create response with httpOnly cookie
    const response = NextResponse.json({ success: true });
    
    // Set httpOnly cookie with the ID token
    response.cookies.set('firebase-auth-token', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}


