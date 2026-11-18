import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserFromRequest } from '@/lib/auth';
import { toggleClientAccountStatus, updateClientAccountPassword } from '@/lib/supabase';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Admin Master.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { status, newPassword } = body;

    if (status) {
      await toggleClientAccountStatus(id, status);
    }

    if (newPassword) {
      const hash = bcrypt.hashSync(String(newPassword).trim(), 10);
      await updateClientAccountPassword(id, hash);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Admin Client Accounts PATCH] Erro:', err);
    return NextResponse.json({ error: 'Erro ao atualizar conta.' }, { status: 500 });
  }
}
