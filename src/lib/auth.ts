import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'billy-suite-super-secret-master-token-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: 'MASTER' | 'OPERATOR';
  serialToken?: string;
}

export function signToken(payload: TokenPayload, expiresIn: string = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export async function getUserFromRequest(req?: NextRequest): Promise<TokenPayload | null> {
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
      token = cookieStore.get('billy_auth_token')?.value;
    } catch {
      // Ignore if cookies context is not available
    }
  }

  if (!token) return null;
  return verifyToken(token);
}
