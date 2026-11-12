import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { isOperatorEligibleForAffiliates, generateAffiliateCode } from '@/lib/gamification';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== 'OPERATOR' && user.role !== 'MASTER')) {
      return NextResponse.json({ error: 'Acesso restrito a operadores autenticados.' }, { status: 401 });
    }

    const db = readDb();
    let operator = db.operators.find(o => o.id === user.userId || o.email.toLowerCase() === user.email.toLowerCase());

    if (!operator && user.role === 'MASTER') {
      operator = db.operators.find(o => o.id === 'OP-0001') || db.operators[0];
    }

    if (!operator) {
      return NextResponse.json({ error: 'Operador não encontrado.' }, { status: 404 });
    }

    // Se já estiver ativado, retorna o código existente
    if (operator.affiliate_enabled && operator.affiliate_code) {
      const inviteUrl = `https://webbilly.com.br/?ref=${operator.affiliate_code}#trabalhe-aqui`;
      return NextResponse.json({
        success: true,
        message: 'O programa Billy Afiliados já está ativo para sua conta!',
        affiliate_code: operator.affiliate_code,
        invite_url: inviteUrl
      });
    }

    // Verifica a elegibilidade (Bronze mínimo: 10 recorrentes + 1 domínio)
    const eligibility = isOperatorEligibleForAffiliates(operator, db, new Date());
    if (!eligibility.isEligible) {
      return NextResponse.json(
        {
          error: `Para ativar o programa Billy Afiliados e ganhar 5% sobre vendas de convidados, é necessário atingir no mínimo o Nível Bronze (10 assinantes ativos e 1 venda de domínio no mês). Faltam: ${eligibility.recurringNeededForBronze} assinante(s) e ${eligibility.domainNeededForBronze} venda(s) de domínio.`,
          eligibility
        },
        { status: 403 }
      );
    }

    // Gera código exclusivo e único
    let code = generateAffiliateCode(operator.name, operator.id);
    while (db.operators.some(o => o.affiliate_code === code && o.id !== operator?.id)) {
      code = `${generateAffiliateCode(operator.name, operator.id)}-${Math.floor(10 + Math.random() * 90)}`;
    }

    operator.affiliate_enabled = true;
    operator.affiliate_code = code;

    writeDb(db);

    const inviteUrl = `https://webbilly.com.br/?ref=${code}#trabalhe-aqui`;

    return NextResponse.json({
      success: true,
      message: 'Parabéns! O programa Billy Afiliados foi ativado com sucesso!',
      affiliate_code: code,
      invite_url: inviteUrl,
      commission_rate: 0.05,
      commission_per_sale: 24.50
    });
  } catch (error: any) {
    console.error('[Ativar Afiliados] Erro:', error);
    return NextResponse.json({ error: error?.message || 'Erro ao ativar Billy Afiliados.' }, { status: 500 });
  }
}
