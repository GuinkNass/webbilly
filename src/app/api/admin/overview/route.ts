import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

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

    // Métricas do Novo Modelo SaaS Recorrente (R$ 29,90/mês)
    const subscriptions = Array.isArray(db.subscriptions) ? db.subscriptions : [];
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
        blockedOperatorsCount
      },
      subscriptions,
      candidates: db.candidates,
      operators: db.operators.map(op => ({
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
        lastSync: op.lastSync,
        dailyLimit: op.dailyLimit,
        todayGenerations: op.todayGenerations,
        createdAt: op.createdAt
      })),
      licenses: db.licenses.map(lic => {
        const cleanSerial = (lic.serialToken || '').trim().toUpperCase();
        const op = db.operators.find(o => 
          ((o.serialToken || '').trim().toUpperCase() === cleanSerial) || 
          (lic.operatorId && o.id === lic.operatorId)
        );
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
          machineId: lic.machineId || op?.machineId || null,
          lastSync: lic.lastSync || op?.lastSync || null,
          status: isActive ? 'active' : lic.status
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
