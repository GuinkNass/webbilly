import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { calculateOperatorGamification, getLeaderboard, isOperatorEligibleForAffiliates, maskOperatorName } from '@/lib/gamification';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== 'OPERATOR' && user.role !== 'MASTER')) {
      return NextResponse.json({ error: 'Acesso restrito ao Operador.' }, { status: 403 });
    }

    const db = readDb();
    let operator = db.operators.find(o => o.id === user.userId || o.email.toLowerCase() === user.email.toLowerCase());

    if (!operator && user.role === 'MASTER') {
      operator = db.operators.find(o => o.id === 'OP-0001') || db.operators[0];
    }

    if (!operator) {
      return NextResponse.json({ error: 'Operador não encontrado.' }, { status: 404 });
    }

    const license = db.licenses.find(l => l.serialToken === operator.serialToken);
    const mySales = db.sales.filter(s => s.operatorId === operator.id);

    // Assinaturas Recorrentes SaaS (R$ 29,90/mês com repasse de R$ 10,00/mês por cliente ativo)
    const mySubscriptions = (db.subscriptions || []).filter(
      sub => sub.operatorId === operator.id || sub.operatorToken === operator.serialToken || operator.id === 'OP-0001'
    );
    const activeSubscriptionsCount = mySubscriptions.filter(s => s.status === 'active').length;
    const operatorCommissionMonthly = db.adminSettings?.operatorCommissionMonthly ?? 10.0;
    const monthlyCommissionMRR = activeSubscriptionsCount * operatorCommissionMonthly;

    const totalSold = mySales.reduce((acc, s) => acc + (s.saleValue || 0), 0);
    const totalCommissions = mySales.reduce((acc, s) => acc + (s.commissionValue || 0), 0);
    const paidCommissions = mySales
      .filter(s => s.pixStatus === 'PAGO')
      .reduce((acc, s) => acc + (s.commissionValue || 0), 0);
    const pendingCommissions = mySales
      .filter(s => s.pixStatus === 'PENDENTE')
      .reduce((acc, s) => acc + (s.commissionValue || 0), 0);

    // Histórico de solicitações de repasse do operador
    const myPayoutRequests = (db.payoutRequests || []).filter(p => p.operatorId === operator.id);
    const sortedPayouts = [...myPayoutRequests].sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
    const lastPayout = sortedPayouts[0] || null;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const currentMonthRef = `${meses[currentMonth]} de ${currentYear}`;

    // Data de liberação do próximo mês (1º dia do mês seguinte)
    const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
    const nextUnlockFormatted = `01/${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}/${nextMonthDate.getFullYear()}`;
    const nextUnlockFull = `1º de ${meses[nextMonthDate.getMonth()]} de ${nextMonthDate.getFullYear()}`;

    // REGRA 1 & 2: Verifica se já realizou solicitação no mês atual
    const currentMonthPayout = sortedPayouts.find(p => {
      const d = new Date(p.requestedAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    const hasRequestedThisMonth = Boolean(currentMonthPayout);

    // REGRA 3: Cálculo de acúmulo de meses caso não tenha solicitado no(s) mês(es) anterior(es)
    let monthsAccumulated = 1;
    if (!hasRequestedThisMonth) {
      if (lastPayout) {
        const lastDate = new Date(lastPayout.requestedAt);
        const diff = (currentYear - lastDate.getFullYear()) * 12 + (currentMonth - lastDate.getMonth());
        monthsAccumulated = Math.max(1, diff);
      } else {
        const oldestSub = mySubscriptions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
        const oldestDate = oldestSub?.createdAt ? new Date(oldestSub.createdAt) : (operator.createdAt ? new Date(operator.createdAt) : now);
        const diff = (currentYear - oldestDate.getFullYear()) * 12 + (currentMonth - oldestDate.getMonth());
        monthsAccumulated = Math.max(1, diff);
      }
    }

    // REGRA 5: R$ 10,00 por plano vendido de R$ 29,90
    const planPrice = 29.90;
    const commissionPerPlan = operatorCommissionMonthly; // R$ 10,00
    const recurringCommission = activeSubscriptionsCount * commissionPerPlan * (hasRequestedThisMonth ? 1 : monthsAccumulated);
    const accumulatedBilling = activeSubscriptionsCount * planPrice * (hasRequestedThisMonth ? 1 : monthsAccumulated);

    // BILLY AFILIADOS: Dados do programa de indicação (5% sobre R$ 490,00 = R$ 24,50)
    const affiliateEligibility = isOperatorEligibleForAffiliates(operator, db, now);
    const myInvitedOperators = (db.operators || []).filter(o => o.referred_by_operator_id === operator.id);
    const allAffComms = Array.isArray(db.affiliateCommissions) ? db.affiliateCommissions : [];
    const myAffiliateCommissions = allAffComms.filter(ac => ac.affiliate_operator_id === operator.id);
    const availableAffiliateCommissions = myAffiliateCommissions.filter(ac => ac.payout_status === 'available');
    const availableAffiliateTotal = availableAffiliateCommissions.reduce((acc, ac) => acc + (Number(ac.commission_amount) || 24.50), 0);
    const totalAffiliateEarned = myAffiliateCommissions.reduce((acc, ac) => acc + (Number(ac.commission_amount) || 24.50), 0);

    const invitedList = myInvitedOperators.map(inv => {
      const invDomainSalesThisMonth = (db.sales || []).filter(s => {
        if (s.operatorId !== inv.id || s.pixStatus !== 'PAGO') return false;
        const d = new Date(s.createdAt);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth && ((s.saleValue && s.saleValue >= 400) || Boolean(s.domainRegistered));
      }).length;

      const commsFromInv = myAffiliateCommissions.filter(ac => ac.invited_operator_id === inv.id);
      const commsAmount = commsFromInv.reduce((acc, c) => acc + (Number(c.commission_amount) || 24.50), 0);

      return {
        id: inv.id,
        name: inv.name,
        displayName: maskOperatorName(inv.name),
        whatsapp: inv.whatsapp,
        status: inv.status,
        createdAt: inv.createdAt,
        isSellingThisMonth: invDomainSalesThisMonth > 0,
        monthlyDomainSales: invDomainSalesThisMonth,
        totalCommissionsGenerated: commsAmount
      };
    });

    const activeSellingThisMonth = invitedList.filter(i => i.isSellingThisMonth).length;
    const monthlyDomainSalesFromNetwork = invitedList.reduce((acc, i) => acc + i.monthlyDomainSales, 0);

    // Gráfico de Evolução (Últimos 6 meses)
    const shortMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const evolutionChart: Array<{
      month: string;
      monthRef: string;
      activeRecruits: number;
      domainSales: number;
      commissionAmount: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      const tYear = targetDate.getFullYear();
      const tMonth = targetDate.getMonth();
      const monthKey = `${tYear}-${String(tMonth + 1).padStart(2, '0')}`;
      const label = `${shortMonths[tMonth]}/${String(tYear).slice(-2)}`;

      const endOfTargetMonth = new Date(tYear, tMonth + 1, 0, 23, 59, 59);
      const recruitsUpToMonth = myInvitedOperators.filter(o => new Date(o.createdAt).getTime() <= endOfTargetMonth.getTime()).length;

      const monthComms = myAffiliateCommissions.filter(ac => ac.month_ref === monthKey);
      const domainSalesCount = monthComms.length;
      const commAmount = monthComms.reduce((acc, c) => acc + (Number(c.commission_amount) || 24.50), 0);

      evolutionChart.push({
        month: label,
        monthRef: monthKey,
        activeRecruits: recruitsUpToMonth,
        domainSales: domainSalesCount,
        commissionAmount: commAmount
      });
    }

    // Gamificação em tempo real: Medalha, Pontuação e Bônus de +20%
    const gamification = calculateOperatorGamification(operator, db, now, true);
    const medalBonusAmount = (gamification.hasMedalUpgradeBonus && gamification.medalUpgradeBonusAmount > 0) ? gamification.medalUpgradeBonusAmount : 0;

    const accumulatedRepasse = recurringCommission + pendingCommissions + availableAffiliateTotal + medalBonusAmount;

    const trainingModules = [
      {
        id: 'mod-1',
        title: 'Módulo 1: Instalação & Ativação do Billy Suite Desktop',
        duration: '06:45',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // player embed
        description: 'Aprenda a instalar o Billy Suite Desktop no Windows e ativar com o seu Token Serial oficial.',
        downloadAttachment: 'Guia_Primeiros_Passos_Billy.pdf'
      },
      {
        id: 'mod-2',
        title: 'Módulo 2: Garimpando Clientes Quentes no Google Maps',
        duration: '12:20',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Técnica de caça a nichos locais sem site ou com nota alta e sem presença online profissional.',
        downloadAttachment: 'Lista_Top_15_Nichos_Locais_Conversao.xlsx'
      },
      {
        id: 'mod-3',
        title: 'Módulo 3: Geração de Landing Page com IA em 60s',
        duration: '09:15',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Como gerar sites com design moderno, fotos reais e copy persuasiva com um único clique.',
        downloadAttachment: 'Checklist_Personalizacao_Express.pdf'
      },
      {
        id: 'mod-4',
        title: 'Módulo 4: Script de Abordagem WhatsApp e Fechamento no Pix',
        duration: '14:50',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        description: 'Copy testada e comprovada de envio de demonstração pronta e condução para o pagamento via Pix.',
        downloadAttachment: 'Script_WhatsApp_Alta_Conversao.docx'
      }
    ];

    // Gamificação em tempo real: Medalha, Pontuação e Bônus de +20%
    const { leaderboard } = getLeaderboard(db, operator.id, now);
    const myRankEntry = leaderboard.find(l => l.operatorId === operator.id);
    const myRank = myRankEntry?.rank || 1;

    return NextResponse.json({
      operator: {
        id: operator.id,
        name: operator.name,
        email: operator.email,
        whatsapp: operator.whatsapp,
        pixType: operator.pixType,
        pixKey: operator.pixKey,
        serialToken: operator.serialToken,
        status: operator.status,
        machineId: operator.machineId,
        osInfo: operator.osInfo,
        operatorIp: operator.operatorIp || null,
        detectedIp: (req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip')?.trim() || req.headers.get('cf-connecting-ip')?.trim() || '127.0.0.1'),
        lastSync: operator.lastSync,
        dailyLimit: operator.dailyLimit,
        todayGenerations: operator.todayGenerations,
        mustChangePassword: operator.mustChangePassword ?? false,
        corporate_email: operator.corporate_email || operator.corporateEmail || null,
        corporateEmail: operator.corporate_email || operator.corporateEmail || null,
        lark_provisioned: operator.lark_provisioned ?? operator.larkProvisioned ?? false,
        affiliate_enabled: Boolean(operator.affiliate_enabled),
        affiliate_code: operator.affiliate_code || null,
        referred_by_operator_id: operator.referred_by_operator_id || null
      },
      affiliates: {
        enabled: Boolean(operator.affiliate_enabled),
        code: operator.affiliate_code || null,
        inviteUrl: operator.affiliate_code ? `https://webbilly.com.br/?ref=${operator.affiliate_code}#trabalhe-aqui` : null,
        eligibility: affiliateEligibility,
        invitedOperators: invitedList,
        metrics: {
          totalInvited: invitedList.length,
          activeSellingThisMonth,
          monthlyDomainSalesFromNetwork,
          totalAffiliateEarned,
          availableAffiliateTotal
        },
        evolutionChart
      },
      gamification: {
        ...gamification,
        rank: myRank,
        totalOperators: leaderboard.length
      },
      isMaster: user.role === 'MASTER' || operator.email.toLowerCase() === 'admin@billysuite.com.br',
      license: license || null,
      stats: {
        salesCount: mySales.length,
        totalSold,
        totalCommissions,
        paidCommissions,
        pendingCommissions,
        commissionPerSale: db.adminSettings.commissionPerSale || 200,
        activeSubscriptionsCount,
        monthlyCommissionMRR,
        operatorCommissionMonthly
      },
      sales: mySales,
      subscriptions: mySubscriptions,
      payoutRequests: (db.payoutRequests || []).filter(p => p.operatorId === operator.id),
      payoutRules: {
        hasRequestedThisMonth,
        currentMonthPayout: currentMonthPayout || null,
        nextUnlockFormatted,
        nextUnlockFull,
        monthsAccumulated,
        accumulatedBilling,
        accumulatedRepasse,
        commissionPerPlan,
        planPrice,
        currentMonthRef,
        activePlansCount: activeSubscriptionsCount,
        lastPayout,
        breakdown: {
          recurring: recurringCommission,
          direct: pendingCommissions,
          medalBonus: medalBonusAmount,
          affiliates: availableAffiliateTotal,
          total: accumulatedRepasse
        }
      },
      trainingModules,
      installer: {
        version: 'v2.0.4',
        buildNumber: 'Build 13.11.2026-1458',
        releaseDate: '13/11/2026',
        releaseTime: '14:58',
        updatedAt: '13/11/2026 às 14:58',
        fileName: 'Billy-Suite-Setup.exe',
        fileSize: '345 MB',
        downloadUrl: '/downloads/Billy-Suite-Setup.exe',
        changelog: 'Cardápios em lote, OCR multimodal de imagens/PDF e leitura de Word (.docx) e TXT com transcrição cirúrgica de pratos e preços',
        highlights: [
          'Upload de documentos e cardápios múltiplos em lote (sem demora)',
          'Suporte total a Imagens (.png, .jpg), Word (.docx), TXT e PDF',
          'OCR multimodal com Gemini: extração fiel de pratos, categorias e preços',
          'Preenchimento cirúrgico nas seções de menu do template preservando CSS'
        ]
      },
      extension: {
        version: 'v1.0.2',
        buildNumber: 'Build 12.11.2026',
        releaseDate: '12/11/2026',
        updatedAt: '12/11/2026',
        fileName: 'Billy-Extensao-Chrome.zip',
        fileSize: '342 KB',
        downloadUrl: '/downloads/Billy-Extensao-Chrome.zip'
      }
    });
  } catch (err: any) {
    console.error('Erro no overview do operador:', err);
    return NextResponse.json({ error: 'Erro ao carregar dados do operador.' }, { status: 500 });
  }
}
