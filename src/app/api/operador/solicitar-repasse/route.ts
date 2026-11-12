import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, PayoutRequest } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { sendPayoutRequestEmail } from '@/lib/lark-mailer';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== 'OPERATOR' && user.role !== 'MASTER')) {
      return NextResponse.json({ error: 'Acesso restrito ao operador autenticado.' }, { status: 401 });
    }

    const db = readDb();
    let operator = db.operators.find(o => o.id === user.userId || o.email.toLowerCase() === user.email.toLowerCase());

    if (!operator && user.role === 'MASTER') {
      operator = db.operators.find(o => o.id === 'OP-0001') || db.operators[0];
    }

    if (!operator) {
      return NextResponse.json({ error: 'Operador não encontrado.' }, { status: 404 });
    }

    // Calcula o mês de referência atual (ex: "Novembro / 2026")
    const now = new Date();
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const mesReferencia = `${meses[now.getMonth()]} / ${now.getFullYear()}`;

    // Recalcula diretamente no backend a partir das vendas e assinaturas do operador para evitar manipulação
    const mySales = (db.sales || []).filter(s => s.operatorId === operator.id);
    const mySubscriptions = (db.subscriptions || []).filter(
      sub => sub.operatorId === operator.id || sub.operatorToken === operator.serialToken || (operator.id === 'OP-0001' && !sub.operatorId)
    );

    const activeSubs = mySubscriptions.filter(s => s.status === 'active');
    const operatorCommissionMonthly = db.adminSettings?.operatorCommissionMonthly ?? 10.0;
    const monthlySubsCommission = activeSubs.length * operatorCommissionMonthly;

    // Vendas diretas pagas
    const paidDirectSales = mySales.filter(s => s.pixStatus === 'PAGO');
    const directSalesTotal = paidDirectSales.reduce((acc, s) => acc + (s.saleValue || 0), 0);
    const directSalesCommission = paidDirectSales.reduce((acc, s) => acc + (s.commissionValue || (s.saleValue ? s.saleValue * 0.5 : 0)), 0);

    // Faturamento total e Repasse líquido (50%)
    let valorTotalFaturado = directSalesTotal + (activeSubs.length * 29.90);
    let valorRepasse = directSalesCommission + monthlySubsCommission;

    // Fallback se for operador ativo demonstrativo com comissões pendentes acumuladas
    const pendingSales = mySales.filter(s => s.pixStatus === 'PENDENTE');
    if (valorRepasse <= 0 && pendingSales.length > 0) {
      valorTotalFaturado = pendingSales.reduce((acc, s) => acc + (s.saleValue || 0), 0);
      valorRepasse = pendingSales.reduce((acc, s) => acc + (s.commissionValue || (s.saleValue ? s.saleValue * 0.5 : 0)), 0);
    }

    // Se ainda for zero mas houver assinaturas ativas
    if (valorRepasse <= 0 && activeSubs.length > 0) {
      valorTotalFaturado = activeSubs.length * 29.90;
      valorRepasse = (valorTotalFaturado * 0.5);
    }

    if (valorRepasse <= 0) {
      return NextResponse.json(
        { error: 'Não há saldo disponível para repasse neste período (mínimo R$ 0,01).' },
        { status: 400 }
      );
    }

    if (!db.payoutRequests) {
      db.payoutRequests = [];
    }

    // Verifica se já existe solicitação pendente para o mesmo período
    const existingPending = db.payoutRequests.find(
      p => p.operatorId === operator.id && p.mesReferencia === mesReferencia && p.status === 'PENDENTE'
    );
    if (existingPending) {
      return NextResponse.json(
        { error: `Já existe uma solicitação de repasse pendente para ${mesReferencia}. Aguarde o processamento do comprovante.` },
        { status: 400 }
      );
    }

    // E-mail corporativo do operador (@webbilly.com.br)
    const corporateEmail = operator.email.toLowerCase().endsWith('@webbilly.com.br')
      ? operator.email.toLowerCase()
      : `${operator.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')}@webbilly.com.br`;

    const payoutId = `rep_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const totalVendasCount = paidDirectSales.length + activeSubs.length;

    const newPayoutRequest: PayoutRequest = {
      id: payoutId,
      operatorId: operator.id,
      operatorName: operator.name,
      corporateEmail,
      mesReferencia,
      vendasCount: totalVendasCount || 1,
      valorTotalFaturado,
      valorRepasse,
      chavePix: operator.pixKey || 'Não cadastrada',
      tipoPix: operator.pixType || 'cpf',
      status: 'PENDENTE',
      requestedAt: new Date().toISOString()
    };

    db.payoutRequests.unshift(newPayoutRequest);
    writeDb(db);

    // Dispara e-mail executivo para financeiro@webbilly.com.br via Lark SMTP
    try {
      await sendPayoutRequestEmail({
        operadorNome: operator.name,
        operadorId: operator.id,
        operadorEmailCorporativo: corporateEmail,
        operadorWhatsapp: operator.whatsapp,
        mesReferencia,
        vendasCount: totalVendasCount || 1,
        valorTotalFaturado,
        valorRepasse,
        chavePix: operator.pixKey || 'Não cadastrada',
        tipoPix: operator.pixType || 'cpf',
        vendasResumo: [
          ...paidDirectSales.map(s => ({ cliente: s.clientName || 'Cliente Direto', plano: 'Site Definitivo', valor: s.saleValue, data: s.createdAt })),
          ...activeSubs.map(s => ({ cliente: s.clientName, plano: 'Assinatura R$ 29,90/mês', valor: s.monthlyPrice, data: s.createdAt }))
        ]
      });
      console.log(`[Repasse API] Solicitação de repasse de ${operator.name} enviada para financeiro@webbilly.com.br`);
    } catch (mailErr: any) {
      console.error('[Repasse API] Erro ao enviar e-mail ao financeiro:', mailErr?.message || mailErr);
    }

    return NextResponse.json({
      success: true,
      payoutRequest: newPayoutRequest,
      message: `Solicitação de repasse de R$ ${valorRepasse.toFixed(2).replace('.', ',')} enviada com sucesso ao departamento financeiro!`
    });
  } catch (error: any) {
    console.error('[Repasse API] Erro interno:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro ao processar solicitação de repasse.' },
      { status: 500 }
    );
  }
}
