import { NextRequest, NextResponse } from 'next/server';
import { getUsers } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authCheck = requireAuth(request, ['SUPER_ADMIN']);
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const users = await getUsers();
    // Exclude password hashes
    const sanitized = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
    return NextResponse.json({ success: true, count: sanitized.length, users: sanitized });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
