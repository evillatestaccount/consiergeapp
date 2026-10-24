import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSessionFromRequest } from '@/lib/auth';

const REVALIDATION_TOKEN = process.env.REVALIDATION_TOKEN || 'secure-reval-token';

export async function GET(request: NextRequest) {
  return handleRevalidate(request);
}

export async function POST(request: NextRequest) {
  return handleRevalidate(request);
}

async function handleRevalidate(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  const token = searchParams.get('token') || searchParams.get('secret');

  // Verify either secret token OR active SuperAdmin session
  let isAuthorized = false;
  if (token && token === REVALIDATION_TOKEN) {
    isAuthorized = true;
  } else {
    const session = getSessionFromRequest(request);
    if (session && (session.role === 'SUPER_ADMIN' || session.role === 'EDITOR')) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Invalid revalidation token or unauthorized session' },
      { status: 401 }
    );
  }

  if (!path) {
    return NextResponse.json(
      { error: 'Missing path parameter to revalidate' },
      { status: 400 }
    );
  }

  try {
    revalidatePath(path);
    // Also revalidate homepage if listings changed
    revalidatePath('/');

    console.log(`[ISR] Successfully on-demand revalidated path: ${path}`);
    return NextResponse.json({
      revalidated: true,
      path,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[ISR] Revalidation error:', err);
    return NextResponse.json(
      { error: 'Error during on-demand revalidation', details: err.message },
      { status: 500 }
    );
  }
}
