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
    let analytics = await getSiteAnalytics(domainToQuery);

    const isTestStudio =
      domainToQuery.includes('13-point-tattoo-e-piercing') ||
      account.site_slug === '13-point-tattoo-e-piercing' ||
      account.id === 'c1300000-0000-4000-a000-000000000013';

    if (isTestStudio && (!analytics || analytics.totalViews30d === 0)) {
      // 14 dias de estatísticas de demonstração com métricas solicitadas
      const demoDailyStats = [];
      const now = new Date();
      const dayViews = [18, 22, 27, 24, 31, 38, 29, 21, 25, 30, 26, 33, 41, 24];
      const dayWa = [2, 3, 4, 3, 4, 6, 4, 2, 3, 5, 3, 5, 7, 5];

      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const label = `${dd}/${mm}`;
        const idx = 13 - i;
        demoDailyStats.push({
          date: dateStr,
          label,
          views: dayViews[idx] || 20,
          uniques: Math.round((dayViews[idx] || 20) * 0.82),
          whatsapp: dayWa[idx] || 3
        });
      }

      analytics = {
        domain: domainToQuery,
        todayViews: 24,
        todayUniques: 19,
        todayWhatsapp: 5,
        totalViews30d: 342,
        totalUniques30d: 285,
        totalWhatsapp30d: 48,
        mobileViews30d: 267,
        desktopViews30d: 75,
        mobilePercent: 78,
        dailyStats: demoDailyStats,
        isDemo: true
      } as any;
    }

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
