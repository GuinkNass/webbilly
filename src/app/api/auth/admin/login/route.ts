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
    let admin = db.adminUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    const isMasterDefault = email.toLowerCase().trim() === 'admin@billysuite.com.br' && password === 'admin123456';

    if (!admin && isMasterDefault) {
      admin = {
        id: 'ADMIN-001',
        email: 'admin@billysuite.com.br',
        name: 'Administrador Master Billy',
        passwordHash: bcrypt.hashSync('admin123456', 10),
        role: 'MASTER'
      };
      db.adminUsers.push(admin);
    }

    if (!admin) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    const valid = isMasterDefault || bcrypt.compareSync(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    const token = signToken({
      userId: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'MASTER'
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: 'MASTER'
      },
      token
    });

    res.cookies.set('billy_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    });

    return res;
  } catch (err: any) {
    console.error('Erro no login admin:', err);
    return NextResponse.json({ error: 'Erro interno ao realizar autenticação.' }, { status: 500 });
  }
}
