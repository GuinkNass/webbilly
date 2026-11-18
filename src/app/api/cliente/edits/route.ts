import { NextRequest, NextResponse } from 'next/server';
import { getClientUserFromRequest } from '@/lib/client-auth';
import {
  findClientAccountById,
  listSiteEditRequests,
  createSiteEditRequest,
  consumeClientAccountEdit,
  checkAndResetClientEdits
} from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const user = await getClientUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const requests = await listSiteEditRequests({ clientAccountId: user.clientAccountId });
    return NextResponse.json({ requests });
  } catch (err: any) {
    console.error('[Cliente Edits GET] Erro:', err);
    return NextResponse.json({ error: 'Erro ao listar solicitações de alteração.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getClientUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    let account = await findClientAccountById(user.clientAccountId);
    if (!account) {
      return NextResponse.json({ error: 'Conta não encontrada.' }, { status: 404 });
    }

    account = await checkAndResetClientEdits(account);

    const body = await req.json().catch(() => ({}));
    const { title, description, photos } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Por favor, informe o título e a descrição detalhada das alterações desejadas.' },
        { status: 400 }
      );
    }

    // Tenta debitar cota mensal ou crédito extra
    const consumeRes = await consumeClientAccountEdit(account.id);
    if (!consumeRes.success) {
      return NextResponse.json(
        {
          error: consumeRes.message,
          needsExtraCredit: true,
          remainingMonthly: 0,
          remainingExtra: account.extra_edit_credits || 0
        },
        { status: 403 }
      );
    }

    const newRequest = await createSiteEditRequest({
      client_account_id: account.id,
      site_slug: account.site_slug,
      operator_id: account.operator_id,
      title: String(title).trim(),
      description: String(description).trim(),
      photos: Array.isArray(photos) ? photos : [],
      status: 'enviada',
      is_extra_credit: consumeRes.type === 'extra'
    });

    return NextResponse.json({
      success: true,
      request: newRequest,
      creditType: consumeRes.type,
      remainingMonthly: consumeRes.remainingMonthly,
      remainingExtra: consumeRes.remainingExtra
    });
  } catch (err: any) {
    console.error('[Cliente Edits POST] Erro:', err);
    return NextResponse.json({ error: 'Erro ao registrar solicitação de alteração.' }, { status: 500 });
  }
}
