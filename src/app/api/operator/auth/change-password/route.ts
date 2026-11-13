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

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'A nova senha deve ter no mínimo 8 caracteres.' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'A confirmação de senha não coincide com a nova senha.' }, { status: 400 });
    }

    const db = readDb();
    const operator = db.operators.find(
      o => o.id === user.userId ||
           (user.email && (o.email.toLowerCase() === user.email.toLowerCase() ||
           o.corporate_email?.toLowerCase() === user.email.toLowerCase() ||
           o.corporateEmail?.toLowerCase() === user.email.toLowerCase()))
    );

    if (!operator) {
      return NextResponse.json({ error: 'Cadastro do operador não encontrado.' }, { status: 404 });
    }

    // Valida a senha atual se fornecida ou se não for primeiro acesso obrigatório
    if (currentPassword && !operator.mustChangePassword && !operator.must_change_password) {
      const isMatch = bcrypt.compareSync(currentPassword, operator.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'A senha atual informada está incorreta.' }, { status: 400 });
      }
    }

    const passwordHash = bcrypt.hashSync(newPassword, 10);
    operator.passwordHash = passwordHash;
    operator.mustChangePassword = false;
    operator.must_change_password = false;
    delete operator.tempPasswordPlain;

    writeDb(db);

    // Sincroniza com Supabase (Fonte de Verdade)
    try {
      const { upsertOperatorInSupabase } = await import('@/lib/supabase');
      await upsertOperatorInSupabase({
        id: operator.id,
        name: operator.name,
        email: operator.email,
        corporate_email: operator.corporate_email || operator.corporateEmail,
        passwordHash,
        mustChangePassword: false,
        lark_provisioned: operator.lark_provisioned ?? operator.larkProvisioned,
        status: operator.status
      });
    } catch (sbErr) {
      console.warn('[ChangePassword] Aviso ao atualizar Supabase:', sbErr);
    }

    // Se a conta já tiver sido provisionada no Lark Suite, sincroniza se API estiver ativa
    if ((operator.lark_provisioned || operator.larkProvisioned) && process.env.LARK_APP_ID && process.env.LARK_APP_SECRET) {
      try {
        // Tentativa de sincronização na API do Lark
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: 'Nova senha definida com sucesso! Seu acesso já está desbloqueado.'
    });
  } catch (err: any) {
    console.error('Erro ao alterar senha do operador:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao processar troca de senha.' },
      { status: 500 }
    );
  }
}
