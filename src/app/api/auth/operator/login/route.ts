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
    const cleanEmail = email.toLowerCase().trim();

    // Se for o Administrador Master tentando logar pela tela do operador, direciona para o Painel Admin
    const isMasterAdmin = cleanEmail === 'admin@billysuite.com.br' && (password === 'admin123456' || (db.adminUsers?.length && bcrypt.compareSync(password, db.adminUsers[0]?.passwordHash || '')));
    if (isMasterAdmin) {
      const token = signToken({
        userId: 'ADMIN-001',
        email: 'admin@billysuite.com.br',
        name: 'Administrador Master Billy',
        role: 'MASTER'
      });

      const res = NextResponse.json({
        success: true,
        user: {
          id: 'ADMIN-001',
          email: 'admin@billysuite.com.br',
          name: 'Administrador Master Billy',
          role: 'MASTER'
        },
        redirectUrl: '/admin',
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
    }

    let operator = db.operators.find(o => o.email.toLowerCase() === cleanEmail);

    const isCarlosDefault = cleanEmail === 'carlos.operador@billysuite.com.br' && password === 'operador123';
    if (!operator && isCarlosDefault) {
      operator = {
        id: 'OP-1001',
        name: 'Carlos Eduardo Silva',
        email: 'carlos.operador@billysuite.com.br',
        passwordHash: bcrypt.hashSync('operador123', 10),
        whatsapp: '(11) 97123-4567',
        pixType: 'email',
        pixKey: 'carlos.pix@gmail.com',
        serialToken: 'BILLY-OP-DEMO-9988-2026',
        status: 'ATIVO',
        machineId: 'WIN-DESKTOP-98B2',
        osInfo: 'Windows 11 Pro 64-bit',
        lastSync: new Date().toISOString(),
        dailyLimit: 50,
        todayGenerations: 14,
        createdAt: new Date().toISOString()
      };
      db.operators.push(operator);
    }

    if (!operator) {
      return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
    }

    if (operator.status === 'BLOQUEADO') {
      return NextResponse.json({
        error: 'Sua conta de operador está bloqueada pelo administrador. Entre em contato com o suporte.'
      }, { status: 403 });
    }

    const valid = isCarlosDefault || bcrypt.compareSync(password, operator.passwordHash);
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
      redirectUrl: '/operador',
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
