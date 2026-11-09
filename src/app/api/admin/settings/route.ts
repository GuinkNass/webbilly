import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Master Admin.' }, { status: 403 });
    }

    const body = await req.json();
    const db = readDb();

    db.adminSettings = {
      ...db.adminSettings,
      geminiApiKey: body.geminiApiKey !== undefined ? body.geminiApiKey : db.adminSettings.geminiApiKey,
      geminiModel: body.geminiModel || db.adminSettings.geminiModel,
      cloudflareAccountId: body.cloudflareAccountId !== undefined ? body.cloudflareAccountId : db.adminSettings.cloudflareAccountId,
      cloudflareApiToken: body.cloudflareApiToken !== undefined ? body.cloudflareApiToken : db.adminSettings.cloudflareApiToken,
      vercelToken: body.vercelToken !== undefined ? body.vercelToken : db.adminSettings.vercelToken,
      mercadopagoAccessToken: body.mercadopagoAccessToken !== undefined ? body.mercadopagoAccessToken : db.adminSettings.mercadopagoAccessToken,
      mercadopagoPublicKey: body.mercadopagoPublicKey !== undefined ? body.mercadopagoPublicKey : db.adminSettings.mercadopagoPublicKey,
      monthlySubscriptionPrice: body.monthlySubscriptionPrice !== undefined ? Number(body.monthlySubscriptionPrice) : (db.adminSettings.monthlySubscriptionPrice || 29.90),
      operatorCommissionMonthly: body.operatorCommissionMonthly !== undefined ? Number(body.operatorCommissionMonthly) : (db.adminSettings.operatorCommissionMonthly || 10.00),
      pixGateway: body.pixGateway || db.adminSettings.pixGateway,
      pixGatewayKey: body.pixGatewayKey !== undefined ? body.pixGatewayKey : db.adminSettings.pixGatewayKey,
      defaultDailyLimit: Number(body.defaultDailyLimit) || db.adminSettings.defaultDailyLimit || 50,
      commissionPerSale: Number(body.commissionPerSale) || db.adminSettings.commissionPerSale || 200
    };

    writeDb(db);

    return NextResponse.json({
      success: true,
      message: 'Configurações de APIs e limites atualizadas com sucesso.',
      settings: db.adminSettings
    });
  } catch (err: any) {
    console.error('Erro ao salvar settings admin:', err);
    return NextResponse.json({ error: 'Erro ao salvar configurações.' }, { status: 500 });
  }
}
