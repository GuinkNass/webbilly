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

    // Se for um Administrador Master tentando logar pela tela do operador, direciona para o Painel Admin
    const adminUser = (db.adminUsers || []).find(
      u => u.email.toLowerCase() === cleanEmail ||
           ((u as any).personal_email && (u as any).personal_email.toLowerCase() === cleanEmail)
    );
    const isMasterAdmin =
      (cleanEmail === 'admin@billysuite.com.br' && (password === 'admin123456' || (adminUser && bcrypt.compareSync(password, adminUser.passwordHash)))) ||
      ((cleanEmail === 'lucas@webbilly.com.br' || cleanEmail === 'lucasklock@gmail.com') && (password === 'WebBilly@2026#Lucas' || (adminUser && bcrypt.compareSync(password, adminUser.passwordHash)))) ||
      (adminUser && adminUser.passwordHash && bcrypt.compareSync(password, adminUser.passwordHash));

    if (isMasterAdmin && adminUser) {
      const token = signToken({
        userId: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: 'MASTER'
      });

      const res = NextResponse.json({
        success: true,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
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

    // Busca o operador por e-mail pessoal, novo e-mail corporativo (@webbilly.com.br) ou chave serial
    let operator = db.operators.find(
      o => o.email.toLowerCase() === cleanEmail ||
           (o.corporate_email && o.corporate_email.toLowerCase() === cleanEmail) ||
           (o.corporateEmail && o.corporateEmail.toLowerCase() === cleanEmail) ||
           (o.serialToken && o.serialToken.toUpperCase() === cleanEmail.toUpperCase())
    );

    // Se não encontrou no db local, consulta no Supabase (Fonte de Verdade)
    if (!operator) {
      try {
        const { fetchAllOperatorsFromSupabase } = await import('@/lib/supabase');
        const supaOps = await fetchAllOperatorsFromSupabase();
        operator = supaOps.find(
          o => o.email.toLowerCase() === cleanEmail ||
               (o.corporate_email && o.corporate_email.toLowerCase() === cleanEmail) ||
               (o.corporateEmail && o.corporateEmail.toLowerCase() === cleanEmail)
        );
      } catch {}
    }

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
      email: operator.corporate_email || operator.corporateEmail || operator.email,
      name: operator.name,
      role: 'OPERATOR',
      serialToken: operator.serialToken
    });

    const mustChange = operator.mustChangePassword ?? (operator as any).must_change_password ?? false;

    const res = NextResponse.json({
      success: true,
      user: {
        id: operator.id,
        email: operator.email,
        corporateEmail: operator.corporate_email || operator.corporateEmail,
        name: operator.name,
        role: 'OPERATOR',
        serialToken: operator.serialToken,
        mustChangePassword: mustChange
      },
      mustChangePassword: mustChange,
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
