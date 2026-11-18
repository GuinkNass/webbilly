import { NextRequest, NextResponse } from 'next/server';
import { getClientUserFromRequest } from '@/lib/client-auth';
import { findClientAccountById, checkAndResetClientEdits } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const user = await getClientUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    let account = await findClientAccountById(user.clientAccountId);
    if (!account) {
      return NextResponse.json({ error: 'Conta não encontrada.' }, { status: 404 });
    }

    // Verifica e aplica ciclo de 30 dias de reset de alterações
    account = await checkAndResetClientEdits(account);

    return NextResponse.json({
      account: {
        id: account.id,
        businessName: account.business_name,
        domainLogin: account.domain_login,
        siteSlug: account.site_slug,
        email: account.email,
        phone: account.phone,
        planType: account.plan_type,
        status: account.status,
        monthlyEditsLimit: account.monthly_edits_limit,
        monthlyEditsUsed: account.monthly_edits_used,
        extraEditCredits: account.extra_edit_credits,
        editsResetAt: account.edits_reset_at,
        asaasCustomerId: account.asaas_customer_id,
        asaasSubscriptionId: account.asaas_subscription_id,
        createdAt: account.created_at
      }
    });
  } catch (err: any) {
    console.error('[Cliente Me API] Erro:', err);
    return NextResponse.json({ error: 'Erro interno ao consultar dados da conta.' }, { status: 500 });
  }
}
