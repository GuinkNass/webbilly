import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== 'OPERATOR' && user.role !== 'MASTER')) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'A confirmação de senha não coincide com a nova senha.' }, { status: 400 });
    }

    const db = readDb();
    const operator = db.operators.find(o => o.id === user.userId || (user.email && o.email.toLowerCase() === user.email.toLowerCase()));

    if (!operator) {
      return NextResponse.json({ error: 'Cadastro do operador não encontrado.' }, { status: 404 });
    }

    // Valida a senha atual se fornecida ou se não for primeiro acesso obrigatório
    if (currentPassword) {
      const isMatch = bcrypt.compareSync(currentPassword, operator.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'A senha atual informada está incorreta.' }, { status: 400 });
      }
    }

    const passwordHash = bcrypt.hashSync(newPassword, 10);
    operator.passwordHash = passwordHash;
    operator.mustChangePassword = false;
    delete operator.tempPasswordPlain;

    writeDb(db);

    return NextResponse.json({
      success: true,
      message: 'Senha atualizada com sucesso! Seu novo acesso já está ativo.'
    });
  } catch (err: any) {
    console.error('Erro ao alterar senha do operador:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao processar troca de senha.' },
      { status: 500 }
    );
  }
}
