import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db';
import { comparePassword, setAuthCookie, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or credentials' },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or credentials' },
        { status: 401 }
      );
    }

    if (user.status === 'PENDING_APPROVAL') {
      return NextResponse.json(
        { error: 'Account pending SuperAdmin activation. You will receive an email once approved.' },
        { status: 403 }
      );
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact directory management.' },
        { status: 403 }
      );
    }

    const sessionPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const token = signToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      redirectUrl: user.role === 'SUPER_ADMIN' ? '/admin/super' : '/admin/editor',
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
