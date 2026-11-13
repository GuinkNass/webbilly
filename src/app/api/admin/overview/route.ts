import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { fetchCloudSuspendedSlugs, sanitizeSlug } from '@/lib/site-storage';
import { getLeaderboard } from '@/lib/gamification';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Master Admin.' }, { status: 403 });
    }

    const db = readDb();

    // Cálculo das métricas financeiras
    const totalSold = db.sales.reduce((acc, s) => acc + (s.saleValue || 0), 0);
    const totalCommissions = db.sales.reduce((acc, s) => acc + (s.commissionValue || 0), 0);
    const paidCommissions = db.sales
      .filter(s => s.pixStatus === 'PAGO')
      .reduce((acc, s) => acc + (s.commissionValue || 0), 0);
    const pendingCommissions = db.sales
      .filter(s => s.pixStatus === 'PENDENTE')
      .reduce((acc, s) => acc + (s.commissionValue || 0), 0);
    const netProfit = totalSold - totalCommissions;

    const pendingCandidatesCount = db.candidates.filter(c => c.status === 'PENDENTE').length;
    const activeOperatorsCount = db.operators.filter(o => o.status === 'ATIVO').length;
    const blockedOperatorsCount = db.operators.filter(o => o.status === 'BLOQUEADO').length;

    // Assinaturas e sites da plataforma sincronizados em tempo real com a nuvem (Fonte Única de Verdade)
    const cloudSuspended = await fetchCloudSuspendedSlugs();
    const rawSubs = Array.isArray(db.subscriptions) ? db.subscriptions : [];
    const subscriptions = rawSubs.map(s => {
      if (!s.siteSlug) return s;
      const clean = sanitizeSlug(s.siteSlug);
      const isSusp = cloudSuspended.has(clean);
      return {
        ...s,
        status: isSusp ? 'suspended' : (s.status === 'pending' ? 'pending' : 'active')
      };
    });
    const activeSubs = subscriptions.filter(s => s.status === 'active');
    const suspendedSubs = subscriptions.filter(s => s.status === 'suspended');
    const pendingSubs = subscriptions.filter(s => s.status === 'pending');

    const totalActiveSites = activeSubs.length;
    const currentMRR = activeSubs.reduce((acc, s) => acc + (s.monthlyPrice || 29.90), 0);
    const totalSuspendedSites = suspendedSubs.length;
    const totalPendingSites = pendingSubs.length;
    const delinquencyRate = subscriptions.length > 0 
      ? Math.round((totalSuspendedSites / subscriptions.length) * 100) 
      : 0;

    const monthlyOperatorCommission = activeSubs.reduce((acc, s) => acc + (s.commissionMonthly || 10.00), 0);

    // Resumo seguro de APIs
    const settings = db.adminSettings;

    // Ranking e gamificação dos operadores
    const { leaderboard } = getLeaderboard(db);

    // Auditoria e Ranking Billy Afiliados
    const commissions = Array.isArray(db.affiliateCommissions) ? db.affiliateCommissions : [];
    const currentMonthRef = new Date().toISOString().slice(0, 7);

    const affiliateSponsors = db.operators
      .filter(op => op.affiliate_enabled || commissions.some(c => c.affiliate_operator_id === op.id) || db.operators.some(sub => sub.referred_by_operator_id === op.id))
      .map(sponsor => {
        const recruits = db.operators.filter(sub => sub.referred_by_operator_id === sponsor.id);
        const sponsorCommissions = commissions.filter(c => c.affiliate_operator_id === sponsor.id);
        const monthCommissions = sponsorCommissions.filter(c => c.month_ref === currentMonthRef);

        const availableCommissions = sponsorCommissions.filter(c => c.payout_status === 'available').reduce((acc, c) => acc + (c.commission_amount || 24.50), 0);
        const requestedCommissions = sponsorCommissions.filter(c => c.payout_status === 'requested').reduce((acc, c) => acc + (c.commission_amount || 24.50), 0);
        const paidCommissionsAmount = sponsorCommissions.filter(c => c.payout_status === 'paid').reduce((acc, c) => acc + (c.commission_amount || 24.50), 0);
        const totalEarnedCommissions = sponsorCommissions.reduce((acc, c) => acc + (c.commission_amount || 24.50), 0);

        // Vendas de domínio dos recrutas
        const recruitIds = new Set(recruits.map(r => r.id));
        const recruitSales = db.sales.filter(s => recruitIds.has(s.operatorId));
        const activeRecruits = recruits.filter(r => recruitSales.some(s => s.operatorId === r.id));
        const activationRate = recruits.length > 0 ? Math.round((activeRecruits.length / recruits.length) * 100) : 0;

        const recruitsSellingThisMonth = recruits.filter(r => 
          recruitSales.some(s => s.operatorId === r.id && (s.createdAt || '').startsWith(currentMonthRef))
        );

        const monthlyNetworkDomainSales = recruitSales.filter(s => 
          (s.saleValue || 0) >= 450 && (s.createdAt || '').startsWith(currentMonthRef)
        ).length;

        return {
          sponsorId: sponsor.id,
          sponsorName: sponsor.name,
          sponsorEmail: sponsor.email,
          affiliateCode: sponsor.affiliate_code || `BILLY-${sponsor.id}`,
          affiliateEnabled: sponsor.affiliate_enabled ?? false,
          totalRecruits: recruits.length,
          activeRecruitsCount: activeRecruits.length,
          activationRate,
          recruitsSellingThisMonthCount: recruitsSellingThisMonth.length,
          monthlyNetworkDomainSales,
          monthlyCommissionTotal: monthCommissions.reduce((acc, c) => acc + (c.commission_amount || 24.50), 0),
          totalEarnedCommissions,
          availableCommissions,
          requestedCommissions,
          paidCommissionsAmount,
          recruits: recruits.map(r => ({
            id: r.id,
            name: r.name,
            email: r.email,
            createdAt: r.createdAt,
            totalSales: recruitSales.filter(s => s.operatorId === r.id).length
          }))
        };
      })
      .sort((a, b) => b.totalEarnedCommissions - a.totalEarnedCommissions || b.totalRecruits - a.totalRecruits);

    return NextResponse.json({
      metrics: {
        totalActiveSites,
        currentMRR,
        totalSuspendedSites,
        totalPendingSites,
        delinquencyRate,
        monthlyOperatorCommission,
        totalSubscriptionsCount: subscriptions.length,
        totalSold,
        totalCommissions,
        paidCommissions,
        pendingCommissions,
        netProfit,
        totalSalesCount: db.sales.length,
        pendingCandidatesCount,
        activeOperatorsCount,
        blockedOperatorsCount,
        totalAffiliateCommissions: commissions.reduce((acc, c) => acc + (c.commission_amount || 24.50), 0)
      },
      leaderboard,
      affiliateSponsors,
      subscriptions,
      candidates: db.candidates,
      operators: db.operators.map(op => {
        const lbItem = leaderboard.find(l => l.operatorId === op.id);
        const sponsor = op.referred_by_operator_id ? db.operators.find(p => p.id === op.referred_by_operator_id) : null;
        return {
          id: op.id,
          name: op.name,
          cpf: op.cpf || null,
          email: op.email,
          whatsapp: op.whatsapp,
          pixType: op.pixType,
          pixKey: op.pixKey,
          serialToken: op.serialToken,
          status: op.status,
          machineId: op.machineId,
          osInfo: op.osInfo,
          tempPasswordPlain: op.tempPasswordPlain || null,
          mustChangePassword: op.mustChangePassword ?? false,
          corporate_email: op.corporate_email || op.corporateEmail || null,
          corporateEmail: op.corporate_email || op.corporateEmail || null,
          lark_provisioned: op.lark_provisioned ?? op.larkProvisioned ?? false,
          affiliate_enabled: op.affiliate_enabled ?? false,
          affiliate_code: op.affiliate_code || null,
          referred_by_operator_id: op.referred_by_operator_id || null,
          referred_by_name: sponsor ? sponsor.name : null,
          lastSync: op.lastSync,
          dailyLimit: op.dailyLimit,
          todayGenerations: op.todayGenerations,
          createdAt: op.createdAt,
          rank: lbItem?.rank || null,
          rankingScore: lbItem?.rankingScore || 0,
          medal: lbItem?.medal || null,
          activeRecurringCount: lbItem?.activeRecurringCount || 0,
          monthlyDomainSalesCount: lbItem?.monthlyDomainSalesCount || 0,
          hasMedalUpgradeBonus: lbItem?.hasMedalUpgradeBonus ?? false,
          medalUpgradeBonusAmount: lbItem?.medalUpgradeBonusAmount || 0
        };
      }),
      licenses: db.licenses.map(lic => {
        const cleanSerial = (lic.serialToken || '').trim().toUpperCase();
        const op = db.operators.find(o => 
          ((o.serialToken || '').trim().toUpperCase() === cleanSerial) || 
          (lic.operatorId && o.id === lic.operatorId)
        );
        const sponsor = op?.referred_by_operator_id ? db.operators.find(p => p.id === op.referred_by_operator_id) : null;
        const resolvedEmail = op?.email || lic.operatorEmail || (lic as any).email || null;
        const resolvedName = op?.name || lic.operatorName || (lic.status === 'pending_activation' || lic.status === 'pending_onboarding' ? 'Aguardando Onboarding' : 'Não vinculado');
        const isActive = lic.status === 'active' || lic.status === 'ATIVO' || op?.status === 'ATIVO';

        return {
          ...lic,
          operatorName: resolvedName,
          operatorEmail: resolvedEmail,
          email: resolvedEmail,
          cpf: op?.cpf || (lic as any).cpf || null,
          whatsapp: op?.whatsapp || (lic as any).whatsapp || null,
          pixType: op?.pixType || (lic as any).pixType || null,
          pixKey: op?.pixKey || (lic as any).pixKey || null,
          tempPasswordPlain: op?.tempPasswordPlain || null,
          mustChangePassword: op?.mustChangePassword ?? false,
          corporate_email: op?.corporate_email || op?.corporateEmail || null,
          corporateEmail: op?.corporate_email || op?.corporateEmail || null,
          lark_provisioned: op?.lark_provisioned ?? op?.larkProvisioned ?? false,
          operatorId: op?.id || lic.operatorId || null,
          machineId: lic.machineId || op?.machineId || null,
          lastSync: lic.lastSync || op?.lastSync || null,
          status: isActive ? 'active' : lic.status,
          affiliate_enabled: op?.affiliate_enabled ?? false,
          affiliate_code: op?.affiliate_code || null,
          referred_by_operator_id: op?.referred_by_operator_id || null,
          referred_by_name: sponsor ? sponsor.name : null
        };
      }),
      sales: db.sales,
      settings: {
        geminiApiKey: settings.geminiApiKey,
        geminiModel: settings.geminiModel || 'gemini-3.8-flash',
        cloudflareAccountId: settings.cloudflareAccountId,
        cloudflareApiToken: settings.cloudflareApiToken,
        vercelToken: settings.vercelToken,
        mercadopagoAccessToken: settings.mercadopagoAccessToken || '',
        mercadopagoPublicKey: settings.mercadopagoPublicKey || '',
        monthlySubscriptionPrice: settings.monthlySubscriptionPrice || 29.90,
        operatorCommissionMonthly: settings.operatorCommissionMonthly || 10.00,
        pixGateway: settings.pixGateway,
        pixGatewayKey: settings.pixGatewayKey,
        defaultDailyLimit: settings.defaultDailyLimit,
        commissionPerSale: settings.commissionPerSale
      }
    });
  } catch (err: any) {
    console.error('Erro no overview admin:', err);
    return NextResponse.json({ error: 'Erro ao carregar dados do admin.' }, { status: 500 });
  }
}
