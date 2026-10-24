import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { AuthSession, Role, User } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-escortvilla-vip-concierge-2026';
export const TOKEN_COOKIE_NAME = 'escortvilla_token';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: AuthSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession;
  } catch (err) {
    return null;
  }
}

export function getSessionFromRequest(request: NextRequest): AuthSession | null {
  // Check cookie first (supports new escortvilla_token and legacy aura_token)
  const cookie = request.cookies.get(TOKEN_COOKIE_NAME)?.value || request.cookies.get('aura_token')?.value;
  if (cookie) {
    const session = verifyToken(cookie);
    if (session) return session;
  }

  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  return null;
}

export function requireAuth(
  request: NextRequest,
  allowedRoles?: Role[]
): { session: AuthSession } | { errorResponse: NextResponse } {
  const session = getSessionFromRequest(request);

  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Unauthorized: Authentication token is required' },
        { status: 401 }
      ),
    };
  }

  if (session.status !== 'ACTIVE') {
    return {
      errorResponse: NextResponse.json(
        { error: 'Account pending SuperAdmin activation or suspended' },
        { status: 403 }
      ),
    };
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Forbidden: Insufficient privileges for this operation' },
        { status: 403 }
      ),
    };
  }

  return { session };
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: TOKEN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: TOKEN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
