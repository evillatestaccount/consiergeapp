import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { sendAdminNewEditorAlert } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, agencyOrBio } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await createUser({
      name,
      email,
      passwordHash,
      role: 'EDITOR',
      status: 'PENDING_APPROVAL',
    });

    // Send automated notification email to SuperAdmin
    await sendAdminNewEditorAlert({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      agencyOrBio,
    });

    return NextResponse.json({
      success: true,
      message: 'Account pending SuperAdmin activation. Our management team will review your application shortly.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
