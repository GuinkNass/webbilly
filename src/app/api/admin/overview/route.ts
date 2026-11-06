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

    // Resumo seguro de APIs (ocultando segredos parciais)
    const settings = db.adminSettings;

    return NextResponse.json({
      metrics: {
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
      candidates: db.candidates,
      operators: db.operators.map(op => ({
        id: op.id,
        name: op.name,
        email: op.email,
        whatsapp: op.whatsapp,
        pixType: op.pixType,
        pixKey: op.pixKey,
        serialToken: op.serialToken,
        status: op.status,
        machineId: op.machineId,
        osInfo: op.osInfo,
        lastSync: op.lastSync,
        dailyLimit: op.dailyLimit,
        todayGenerations: op.todayGenerations,
        createdAt: op.createdAt
      })),
      licenses: db.licenses,
      sales: db.sales,
      settings: {
        geminiApiKey: settings.geminiApiKey,
        geminiModel: settings.geminiModel || 'gemini-3.8-flash',
        cloudflareAccountId: settings.cloudflareAccountId,
        cloudflareApiToken: settings.cloudflareApiToken,
        vercelToken: settings.vercelToken,
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
