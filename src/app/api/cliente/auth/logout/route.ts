import { NextResponse } from 'next/server';
import { clearClientTokenCookie } from '@/lib/client-auth';

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Sessão encerrada com sucesso.' });
  clearClientTokenCookie(res);
  return res;
}
