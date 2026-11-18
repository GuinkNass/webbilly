import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { listSiteEditRequests, updateSiteEditRequestStatus } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const requests = await listSiteEditRequests({
      operatorId: user.role === 'OPERATOR' ? user.userId : undefined
    });

    return NextResponse.json({ requests });
  } catch (err: any) {
    console.error('[Operador Solicitacoes GET] Erro:', err);
    return NextResponse.json({ error: 'Erro ao listar solicitações.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { id, status, operatorNotes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID e status são obrigatórios.' }, { status: 400 });
    }

    const ok = await updateSiteEditRequestStatus(id, status, operatorNotes);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    console.error('[Operador Solicitacoes PATCH] Erro:', err);
    return NextResponse.json({ error: 'Erro ao atualizar solicitação.' }, { status: 500 });
  }
}
