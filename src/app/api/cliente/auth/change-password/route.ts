import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getClientUserFromRequest } from '@/lib/client-auth';
import { findClientAccountById, updateClientAccountPassword } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const user = await getClientUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Informe a senha atual e a nova senha.' },
        { status: 400 }
      );
    }

    if (String(newPassword).trim().length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    const account = await findClientAccountById(user.clientAccountId);
    if (!account) {
      return NextResponse.json({ error: 'Conta não encontrada.' }, { status: 404 });
    }

    let passwordMatch = false;
    if (account.password_hash) {
      try {
        passwordMatch = await bcrypt.compare(String(currentPassword).trim(), account.password_hash);
      } catch (_) {}
    }
    if (!passwordMatch && account.initial_password_plain) {
      passwordMatch = account.initial_password_plain.trim() === String(currentPassword).trim();
    }

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 });
    }

    const newHash = bcrypt.hashSync(String(newPassword).trim(), 10);
    await updateClientAccountPassword(account.id, newHash);

    return NextResponse.json({ success: true, message: 'Senha atualizada com sucesso!' });
  } catch (err: any) {
    console.error('[Cliente Change Password API] Erro:', err);
    return NextResponse.json({ error: 'Erro ao alterar senha.' }, { status: 500 });
  }
}
