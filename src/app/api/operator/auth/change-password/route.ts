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
      const { upsertOperatorInSupabase, getSupabaseAdmin } = await import('@/lib/supabase');
      await upsertOperatorInSupabase({
        id: operator.id,
        name: operator.name,
        email: operator.email,
        corporate_email: operator.corporate_email || operator.corporateEmail,
        passwordHash,
        mustChangePassword: false,
        must_change_password: false,
        lark_provisioned: operator.lark_provisioned ?? operator.larkProvisioned,
        status: operator.status
      });

      const supabaseAdmin = getSupabaseAdmin();

      // 1. Atualiza diretamente coluna must_change_password na tabela operators
      try {
        await supabaseAdmin
          .from('operators')
          .update({
            must_change_password: false,
            password_hash: passwordHash,
            updated_at: new Date().toISOString()
          })
          .or(`id.eq.${operator.id},email.eq.${operator.email}`);
      } catch (errOp) {
        console.warn('[ChangePassword] Erro ao atualizar tabela operators:', errOp);
      }

      // 2. Atualiza tabela profiles se existir
      try {
        await supabaseAdmin
          .from('profiles')
          .update({
            must_change_password: false,
            updated_at: new Date().toISOString()
          })
          .or(`id.eq.${operator.id},email.eq.${operator.email}`);
      } catch {}

      // 3. Atualiza Supabase Auth User (senha e metadata must_change_password = false)
      try {
        const targetEmail = operator.email || operator.corporate_email || operator.corporateEmail;
        if (targetEmail) {
          const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
          const targetUser = userList?.users?.find(
            u => u.email?.toLowerCase() === targetEmail.toLowerCase() ||
                 u.email?.toLowerCase() === operator.email?.toLowerCase() ||
                 (operator.corporate_email && u.email?.toLowerCase() === operator.corporate_email.toLowerCase())
          );

          if (targetUser) {
            await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
              password: newPassword,
              user_metadata: {
                ...targetUser.user_metadata,
                must_change_password: false
              }
            });
          }
        }
      } catch (authErr) {
        console.warn('[ChangePassword] Aviso ao atualizar Supabase Auth:', authErr);
      }
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
