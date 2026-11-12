import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, PayoutRequest } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { sendPayoutRequestEmail } from '@/lib/lark-mailer';
import { calculateOperatorGamification } from '@/lib/gamification';

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

    // Calcula o mês de referência atual (ex: "Novembro de 2026")
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const mesReferenciaBase = `${meses[currentMonth]} de ${currentYear}`;

    // Data de liberação do próximo mês (1º dia do mês seguinte)
    const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
    const nextUnlockFormatted = `01/${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}/${nextMonthDate.getFullYear()}`;
    const nextUnlockFull = `1º de ${meses[nextMonthDate.getMonth()]} de ${nextMonthDate.getFullYear()}`;

    if (!db.payoutRequests) {
      db.payoutRequests = [];
    }

    // REGRA 1 & 2: Apenas 1 solicitação por mês civil. Próxima liberação após o 1º dia do mês seguinte.
    const alreadyRequestedThisMonth = db.payoutRequests.find(p => {
      if (p.operatorId !== operator.id) return false;
      const d = new Date(p.requestedAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    if (alreadyRequestedThisMonth) {
      return NextResponse.json(
        {
          error: `Você já realizou a sua solicitação de repasse mensal referente a ${mesReferenciaBase}. Conforme o regulamento operacional, cada colaborador pode solicitar 1 repasse por mês civil. Sua próxima solicitação estará liberada a partir de ${nextUnlockFull} (${nextUnlockFormatted}).`
        },
        { status: 400 }
      );
    }

    // REGRA 3: Se não solicitou há mais de 1 mês, o saldo continua acumulando normalmente.
    const operatorPayouts = db.payoutRequests
      .filter(p => p.operatorId === operator.id)
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    const lastPayout = operatorPayouts[0] || null;

    const mySales = (db.sales || []).filter(s => s.operatorId === operator.id);
    const mySubscriptions = (db.subscriptions || []).filter(
      sub => sub.operatorId === operator.id || sub.operatorToken === operator.serialToken || (operator.id === 'OP-0001' && !sub.operatorId)
    );
    const activeSubs = mySubscriptions.filter(s => s.status === 'active');

    let monthsAccumulated = 1;
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

    // REGRA 5: Repasse fixo de R$ 10,00 a cada plano vendido/ativo de R$ 29,90/mês
    const operatorCommissionMonthly = db.adminSettings?.operatorCommissionMonthly ?? 10.0;
    const planPrice = 29.90;
    const activeSubsCount = activeSubs.length;

    // Vendas diretas pagas (se houver)
    const paidDirectSales = mySales.filter(s => s.pixStatus === 'PAGO');
    const directSalesTotal = paidDirectSales.reduce((acc, s) => acc + (s.saleValue || 0), 0);
    const directSalesCommission = paidDirectSales.reduce((acc, s) => acc + (s.commissionValue || (s.saleValue ? s.saleValue * 0.5 : 0)), 0);

    // Faturamento total e Repasse acumulado: R$ 10,00 por plano de R$ 29,90 por mês acumulado
    let valorTotalFaturado = (activeSubsCount * planPrice * monthsAccumulated) + directSalesTotal;
    let valorRepasse = (activeSubsCount * operatorCommissionMonthly * monthsAccumulated) + directSalesCommission;

    // Fallback se for operador novo com comissões pendentes acumuladas em vendas
    const pendingSales = mySales.filter(s => s.pixStatus === 'PENDENTE');
    if (valorRepasse <= 0 && pendingSales.length > 0) {
      valorTotalFaturado = pendingSales.reduce((acc, s) => acc + (s.saleValue || 0), 0);
      valorRepasse = pendingSales.reduce((acc, s) => acc + (s.commissionValue || 10.0), 0);
    }

    // Se ainda for zero mas houver assinaturas ativas
    if (valorRepasse <= 0 && activeSubsCount > 0) {
      valorTotalFaturado = activeSubsCount * planPrice * monthsAccumulated;
      valorRepasse = activeSubsCount * operatorCommissionMonthly * monthsAccumulated;
    }

    // REGRA DE GAMIFICAÇÃO: Bônus extra de +20% por Mudança / Conquista de Medalha no mês
    const gamification = calculateOperatorGamification(operator, db, now, true);
    let valorBonusMedalha = 0;
    if (gamification.hasMedalUpgradeBonus && gamification.medalUpgradeBonusAmount > 0) {
      valorBonusMedalha = gamification.medalUpgradeBonusAmount;
      valorRepasse += valorBonusMedalha;
      if (gamification.upgradeRecord) {
        gamification.upgradeRecord.payoutApplied = true;
      }
    }

    // BILLY AFILIADOS: 5% (R$ 24,50) sobre vendas de domínio dos convidados
    const allAffComms = Array.isArray(db.affiliateCommissions) ? db.affiliateCommissions : [];
    const availableAffiliateCommissions = allAffComms.filter(
      ac => ac.affiliate_operator_id === operator.id && ac.payout_status === 'available'
    );
    const valorAfiliados = availableAffiliateCommissions.reduce(
      (acc, ac) => acc + (Number(ac.commission_amount) || 24.50),
      0
    );
    if (valorAfiliados > 0) {
      valorRepasse += valorAfiliados;
      valorTotalFaturado += availableAffiliateCommissions.reduce(
        (acc, ac) => acc + (Number(ac.sale_amount) || 490.00),
        0
      );
    }

    if (valorRepasse <= 0) {
      return NextResponse.json(
        { error: 'Não há saldo disponível para repasse no momento (mínimo R$ 0,01).' },
        { status: 400 }
      );
    }

    const mesReferencia = monthsAccumulated > 1
      ? `${mesReferenciaBase} (Acumulado de ${monthsAccumulated} meses)`
      : mesReferenciaBase;

    // E-mail corporativo do operador (@webbilly.com.br)
    const corporateEmail = operator.email.toLowerCase().endsWith('@webbilly.com.br')
      ? operator.email.toLowerCase()
      : `${operator.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')}@webbilly.com.br`;

    const payoutId = `rep_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const totalVendasCount = paidDirectSales.length + activeSubs.length + availableAffiliateCommissions.length;

    // Atualiza status das comissões de afiliados para 'requested'
    availableAffiliateCommissions.forEach(ac => {
      ac.payout_status = 'requested';
      ac.payout_request_id = payoutId;
    });

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
          ...activeSubs.map(s => ({ cliente: s.clientName, plano: 'Assinatura R$ 29,90/mês', valor: s.monthlyPrice, data: s.createdAt })),
          ...(valorBonusMedalha > 0 ? [{ cliente: `Bônus Performance (+20% Conquista Medalha ${gamification.currentMedal.name})`, plano: 'Bônus Gamificação', valor: valorBonusMedalha, data: new Date().toISOString() }] : []),
          ...availableAffiliateCommissions.map(ac => ({
            cliente: `Billy Afiliados: Venda de ${ac.invited_operator_name || 'Convidado'} (Lead: ${ac.lead_or_sale_id})`,
            plano: 'Comissão Afiliado 5%',
            valor: Number(ac.commission_amount) || 24.50,
            data: ac.created_at
          }))
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
