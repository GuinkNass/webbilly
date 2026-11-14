import { NextRequest, NextResponse } from 'next/server';
import { readDb, AdminUser } from '@/lib/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    const db = readDb();
    const adminUsers = Array.isArray(db.adminUsers) ? db.adminUsers : [];
    let admin: AdminUser | undefined = adminUsers.find(
      u => (u.email || '').toLowerCase().trim() === cleanEmail ||
           ((u as any).personal_email || '').toLowerCase().trim() === cleanEmail
    );

    const isMasterDefault = cleanEmail === 'admin@billysuite.com.br' && password === 'admin123456';
    const isLucasDefault =
      (cleanEmail === 'lucas@webbilly.com.br' || cleanEmail === 'lucasklock@gmail.com') &&
      password === 'WebBilly@2026#Lucas';

    if (!admin && isMasterDefault) {
      const defaultAdmin: AdminUser = {
        id: 'ADMIN-001',
        email: 'admin@billysuite.com.br',
        name: 'Administrador Master Billy',
        passwordHash: bcrypt.hashSync('admin123456', 10),
        role: 'MASTER'
      };
      if (!Array.isArray(db.adminUsers)) db.adminUsers = [];
      db.adminUsers.push(defaultAdmin);
      admin = defaultAdmin;
    }

    if (!admin && isLucasDefault) {
      const defaultLucas: AdminUser = {
        id: 'ADMIN-002',
        email: 'lucas@webbilly.com.br',
        personal_email: 'lucasklock@gmail.com',
        name: 'Lucas Klock',
        passwordHash: bcrypt.hashSync('WebBilly@2026#Lucas', 10),
        role: 'MASTER',
        is_partner: true,
        status: 'active'
      };
      if (!Array.isArray(db.adminUsers)) db.adminUsers = [];
      db.adminUsers.push(defaultLucas);
      admin = defaultLucas;
    }

    if (!admin) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    const valid =
      isMasterDefault ||
      isLucasDefault ||
      (admin.passwordHash && bcrypt.compareSync(password, admin.passwordHash));

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
        role: 'MASTER',
        is_partner: (admin as any).is_partner ?? false
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
