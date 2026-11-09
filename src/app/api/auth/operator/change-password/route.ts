import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== 'OPERATOR' && user.role !== 'MASTER')) {
      return NextResponse.json({ error: 'Usuário não autenticado como operador.' }, { status: 401 });
    }

    const { newPassword, confirmPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'A confirmação de senha não confere.' }, { status: 400 });
    }

    const db = readDb();
    const operator = db.operators.find(o => o.id === user.userId || o.email.toLowerCase() === user.email.toLowerCase());

    if (!operator) {
      return NextResponse.json({ error: 'Cadastro do operador não encontrado.' }, { status: 404 });
    }

    const passwordHash = bcrypt.hashSync(newPassword, 10);
    operator.passwordHash = passwordHash;
    operator.mustChangePassword = false;
    delete operator.tempPasswordPlain;

    writeDb(db);

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso! Seu acesso definitivo está ativo.'
    });

  } catch (err: any) {
    console.error('Erro ao alterar senha do operador:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao atualizar senha.' },
      { status: 500 }
    );
  }
}
