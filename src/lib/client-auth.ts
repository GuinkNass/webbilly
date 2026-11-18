import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'billy-suite-super-secret-master-token-key-2026';
export const CLIENT_COOKIE_NAME = 'billy_client_token';

export interface ClientTokenPayload {
  clientAccountId: string;
  domainLogin: string;
  siteSlug: string;
  role: 'CLIENT';
}

export function signClientToken(payload: ClientTokenPayload, expiresIn: string = '30d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyClientToken(token: string): ClientTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.role === 'CLIENT' && decoded.clientAccountId) {
      return decoded as ClientTokenPayload;
    }
    return null;
  } catch (err) {
    return null;
  }
}

export async function getClientUserFromRequest(req?: NextRequest): Promise<ClientTokenPayload | null> {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(CLIENT_COOKIE_NAME)?.value;
    } catch {
      // Ignore if cookies context is not available
    }
  }

  if (!token) return null;
  return verifyClientToken(token);
}

export function setClientTokenCookie(res: NextResponse, token: string): void {
  res.cookies.set(CLIENT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 // 30 dias
  });
}

export function clearClientTokenCookie(res: NextResponse): void {
  res.cookies.set(CLIENT_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}
