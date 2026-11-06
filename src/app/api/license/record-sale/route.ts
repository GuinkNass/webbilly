import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, Sale } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serialToken, machineId, clientName, clientWhatsapp, siteUrl, niche, saleValue } = body;

    if (!serialToken || !clientName) {
      return NextResponse.json({ error: 'Dados incompletos da venda.' }, { status: 400 });
    }

    const db = readDb();
    const license = db.licenses.find(l => l.serialToken.toUpperCase() === serialToken.trim().toUpperCase());
    const operator = db.operators.find(o => o.serialToken.toUpperCase() === serialToken.trim().toUpperCase());

    if (!license || !operator || license.status === 'BLOQUEADO') {
      return NextResponse.json({ error: 'Licença inválida ou bloqueada.' }, { status: 403 });
    }

    const commissionValue = db.adminSettings.commissionPerSale || 200;
    const finalSaleValue = Number(saleValue) || 600;

    const newSale: Sale = {
      id: `SALE-${Date.now().toString(36).toUpperCase()}`,
      operatorId: operator.id,
      operatorName: operator.name,
      clientName: clientName.trim(),
      clientWhatsapp: (clientWhatsapp || '').trim(),
      siteUrl: (siteUrl || '').trim(),
      niche: niche || 'Geral',
      saleValue: finalSaleValue,
      commissionValue,
      pixStatus: 'PENDENTE',
      createdAt: new Date().toISOString()
    };

    db.sales.unshift(newSale);
    writeDb(db);

    return NextResponse.json({
      success: true,
      message: `Venda para ${clientName} registrada com sucesso! Comissão de R$ ${commissionValue} atribuída.`,
      sale: newSale
    });
  } catch (err: any) {
    console.error('Erro ao registrar venda:', err);
    return NextResponse.json({ error: 'Erro ao registrar venda.' }, { status: 500 });
  }
}
