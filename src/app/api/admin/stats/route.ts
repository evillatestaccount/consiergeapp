import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authCheck = requireAuth(request, ['SUPER_ADMIN', 'EDITOR']);
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
