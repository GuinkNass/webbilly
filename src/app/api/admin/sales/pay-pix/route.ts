import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Acesso restrito ao Master Admin.' }, { status: 403 });
    }

    const { saleId, pixProof } = await req.json();

    if (!saleId) {
      return NextResponse.json({ error: 'saleId é obrigatório.' }, { status: 400 });
    }

    const db = readDb();
    const sale = db.sales.find(s => s.id === saleId);

    if (!sale) {
      return NextResponse.json({ error: 'Venda não encontrada.' }, { status: 404 });
    }

    sale.pixStatus = 'PAGO';
    sale.pixPaidAt = new Date().toISOString();
    sale.pixProof = pixProof || `E2E-MANUAL-${Date.now().toString(36).toUpperCase()}`;

    writeDb(db);

    return NextResponse.json({
      success: true,
      message: `Comissão da venda ${sale.clientName} marcada como paga com sucesso via Pix!`,
      sale
    });
  } catch (err: any) {
    console.error('Erro ao pagar comissão Pix:', err);
    return NextResponse.json({ error: 'Erro ao registrar pagamento Pix.' }, { status: 500 });
  }
}
