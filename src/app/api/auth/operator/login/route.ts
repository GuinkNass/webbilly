import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const db = readDb();
    const operator = db.operators.find(o => o.email.toLowerCase() === email.toLowerCase().trim());

    if (!operator) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    if (operator.status === 'BLOQUEADO') {
      return NextResponse.json({
        error: 'Sua conta de operador está bloqueada pelo administrador. Entre em contato com o suporte.'
      }, { status: 403 });
    }

    const valid = bcrypt.compareSync(password, operator.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    const token = signToken({
      userId: operator.id,
      email: operator.email,
      name: operator.name,
      role: 'OPERATOR',
      serialToken: operator.serialToken
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: operator.id,
        email: operator.email,
        name: operator.name,
        role: 'OPERATOR',
        serialToken: operator.serialToken
      },
      token
    });

    res.cookies.set('billy_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return res;
  } catch (err: any) {
    console.error('Erro no login operador:', err);
    return NextResponse.json({ error: 'Erro interno ao realizar autenticação.' }, { status: 500 });
  }
}
