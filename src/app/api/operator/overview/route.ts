import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

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
    const accumulatedBilling = activeSubscriptionsCount * planPrice * (hasRequestedThisMonth ? 1 : monthsAccumulated);
    const accumulatedRepasse = (activeSubscriptionsCount * commissionPerPlan * (hasRequestedThisMonth ? 1 : monthsAccumulated)) + pendingCommissions;

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
        mustChangePassword: operator.mustChangePassword ?? false
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
        lastPayout
      },
      trainingModules,
      installer: {
        version: '2.0.4',
        releaseDate: '2026-11-07',
        fileName: 'Billy-Suite-Setup.exe',
        fileSize: '348 MB',
        downloadUrl: '/downloads/Billy-Suite-Setup.exe'
      }
    });
  } catch (err: any) {
    console.error('Erro no overview do operador:', err);
    return NextResponse.json({ error: 'Erro ao carregar dados do operador.' }, { status: 500 });
  }
}
