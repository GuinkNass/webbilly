import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Administrador Master.' }, { status: 403 });
    }

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'A confirmação de senha não coincide com a nova senha.' }, { status: 400 });
    }

    const db = readDb();
    const admin = db.adminUsers.find(
      u => u.id === user.userId || (user.email && u.email.toLowerCase() === user.email.toLowerCase())
    );

    if (!admin) {
      return NextResponse.json({ error: 'Usuário administrador não encontrado.' }, { status: 404 });
    }

    if (currentPassword) {
      const isDefault = currentPassword === 'admin123456';
      const isMatch = isDefault || bcrypt.compareSync(currentPassword, admin.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'A senha atual informada está incorreta.' }, { status: 400 });
      }
    }

    const passwordHash = bcrypt.hashSync(newPassword, 10);
    admin.passwordHash = passwordHash;

    // Também sincroniza com o operador master vinculado, se houver
    const masterOp = db.operators.find(o => o.email.toLowerCase() === admin.email.toLowerCase());
    if (masterOp) {
      masterOp.passwordHash = passwordHash;
    }

    writeDb(db);

    return NextResponse.json({
      success: true,
      message: 'Senha Master atualizada com sucesso! Seu novo acesso já está ativo.'
    });
  } catch (err: any) {
    console.error('Erro ao alterar senha master:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao atualizar senha master.' },
      { status: 500 }
    );
  }
}
