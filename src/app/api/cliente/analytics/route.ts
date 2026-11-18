import { NextRequest, NextResponse } from 'next/server';
import { getClientUserFromRequest } from '@/lib/client-auth';
import { findClientAccountById } from '@/lib/supabase';
import { getSiteAnalytics } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getClientUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const account = await findClientAccountById(user.clientAccountId);
    if (!account) {
      return NextResponse.json({ error: 'Conta não encontrada.' }, { status: 404 });
    }

    const domainToQuery = account.domain_login || account.site_slug;
    const analytics = await getSiteAnalytics(domainToQuery);

    return NextResponse.json({
      success: true,
      domain: domainToQuery,
      analytics
    });
  } catch (err: any) {
    console.error('[API Cliente Analytics Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Erro ao carregar métricas de acesso.' },
      { status: 500 }
    );
  }
}
