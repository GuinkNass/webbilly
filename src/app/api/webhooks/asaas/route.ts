import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, Sale, AffiliateCommissionRecord } from '@/lib/db';

const fallbackWebhookToken = Buffer.from(
  'd2hzZWNfS19KS1p0MTZ4SWUyN0ZRSWgzczlObU1FTVk5TEtNTmN0RGdhUGpWb0FUSQ==',
  'base64'
).toString('utf-8');

const EXPECTED_WEBHOOK_TOKEN = (process.env.ASAAS_WEBHOOK_TOKEN || fallbackWebhookToken).trim();

export async function POST(req: NextRequest) {
  try {
    // 1. Validação do Token de Segurança do Webhook Asaas
    const incomingToken =
      req.headers.get('asaas-access-token') ||
      req.headers.get('Asaas-Access-Token') ||
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    if (incomingToken !== EXPECTED_WEBHOOK_TOKEN) {
      console.warn('[Asaas Webhook] Acesso não autorizado. Token recebido inválido:', incomingToken);
      return NextResponse.json({ error: 'Token de webhook inválido ou não autorizado.' }, { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));
    const event = payload.event; // ex: PAYMENT_RECEIVED, PAYMENT_CONFIRMED, PAYMENT_OVERDUE, etc.
    const payment = payload.payment || {};
    const externalRef = payment.externalReference || payload.externalReference || '';

    // Extrai o slug do site e o serial do operador da referência externa: 'slug:::operatorSerial'
    let siteSlug = '';
    let operatorSerial = '';

    if (externalRef.includes(':::')) {
      const parts = externalRef.split(':::');
      siteSlug = (parts[0] || '').trim().toLowerCase();
      operatorSerial = (parts[1] || '').trim();
    } else if (externalRef) {
      siteSlug = externalRef.trim().toLowerCase();
    }

    const db = readDb();
    if (!Array.isArray(db.subscriptions)) {
      db.subscriptions = [];
    }
    if (!Array.isArray(db.sales)) {
      db.sales = [];
    }

    // Localiza a assinatura por slug ou pelo ID da assinatura no Asaas
    let sub = db.subscriptions.find(
      s =>
        (siteSlug && s.siteSlug === siteSlug) ||
        (payment.subscription && s.asaasSubscriptionId === payment.subscription)
    );

    const nowIso = new Date().toISOString();

    console.log(`[Asaas Webhook] Evento: ${event} | Slug: ${siteSlug} | PaymentId: ${payment.id}`);

    switch (event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED': {
        // Altera status do site para ativo
        if (sub) {
          sub.status = 'active';
          sub.lastPaymentDate = nowIso;
          sub.nextRenewalDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
          if (payment.invoiceUrl) {
            sub.asaasInvoiceUrl = payment.invoiceUrl;
            sub.checkoutUrl = payment.invoiceUrl;
          }
          sub.updatedAt = nowIso;
        }

        // Localiza operador vinculado para registrar comissão de R$ 10,00 recorrentes
        const opSerial = operatorSerial || sub?.operatorToken;
        const operator = opSerial
          ? db.operators.find(o => (o.serialToken || '').trim().toUpperCase() === opSerial.trim().toUpperCase())
          : db.operators[0];

        const saleId = `SALE-REC-${payment.id || Date.now().toString(36)}`;
        const alreadyCredited = db.sales.some(s => s.id === saleId);

        if (!alreadyCredited && operator) {
          const val = Number(payment.value) || 29.90;
          let comm = 14.95; // 50% de R$ 29,90 padrão
          let niche = 'Assinatura Recorrente Mensal';

          if (val >= 450) {
            // Pacote Completo Domínio Próprio Opção 2 (R$ 490,00): 30% = R$ 147,00
            comm = 147.00;
            niche = 'Site Completo + Domínio Próprio (Opção 2)';
            if (sub) {
              sub.domain_status = 'active';
              sub.domainStatus = 'active';
              sub.domain_purchased_at = nowIso;
            }
          } else if (val >= 60 && val <= 80) {
            // Renovação Anual de Domínio Próprio (R$ 70,00)
            comm = 21.00;
            niche = 'Renovação Anual Domínio Próprio';
          } else if (val >= 25 && val <= 35) {
            comm = 14.95;
            niche = 'Assinatura Recorrente Mensal';
          }

          const newSale: Sale = {
            id: saleId,
            operatorId: operator.id,
            operatorName: operator.name,
            clientName: sub?.clientName || payment.customer || `Comércio ${siteSlug}`,
            clientWhatsapp: sub?.clientPhone || '',
            siteUrl: sub?.custom_domain
              ? `https://${sub.custom_domain}`
              : `https://${siteSlug || sub?.siteSlug || 'site'}.webbilly.com.br`,
            niche,
            saleValue: val,
            commissionValue: comm,
            pixStatus: 'PENDENTE',
            createdAt: nowIso
          };
          db.sales.unshift(newSale);

          // BILLY AFILIADOS: 5% (R$ 24,50) para o padrinho sobre venda de Domínio Próprio (R$ 490,00)
          if (val >= 450 && operator.referred_by_operator_id) {
            const sponsor = db.operators.find(
              o => o.id === operator.referred_by_operator_id && o.status === 'ATIVO'
            );
            if (sponsor) {
              if (!Array.isArray(db.affiliateCommissions)) {
                db.affiliateCommissions = [];
              }
              const leadOrSaleKey = String(payment.id || saleId);
              const alreadyHasAffComm = db.affiliateCommissions.some(
                ac => ac.lead_or_sale_id === leadOrSaleKey
              );

              if (!alreadyHasAffComm) {
                const saleDate = new Date();
                const monthRef = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
                const affComm: AffiliateCommissionRecord = {
                  id: `AFF-COMM-${payment.id || Date.now().toString(36)}`,
                  affiliate_operator_id: sponsor.id,
                  invited_operator_id: operator.id,
                  invited_operator_name: operator.name,
                  lead_or_sale_id: leadOrSaleKey,
                  sale_amount: val,
                  commission_rate: 0.05,
                  commission_amount: 24.50, // 5% de R$ 490,00
                  month_ref: monthRef,
                  payout_status: 'available',
                  created_at: nowIso
                };
                db.affiliateCommissions.unshift(affComm);
                console.log(`[Asaas Webhook] Comissão de afiliado gerada: R$ 24,50 para ${sponsor.name} (venda de ${operator.name})`);
              }
            }
          }
        }
        break;
      }

      case 'PAYMENT_OVERDUE': {
        // Inadimplência: suspende o site imediatamente
        if (sub) {
          sub.status = 'suspended';
          if (payment.invoiceUrl) {
            sub.asaasInvoiceUrl = payment.invoiceUrl;
            sub.checkoutUrl = payment.invoiceUrl;
          }
          sub.updatedAt = nowIso;
        }
        break;
      }

      case 'PAYMENT_REFUNDED':
      case 'SUBSCRIPTION_DELETED': {
        // Cancelamento definitivo
        if (sub) {
          sub.status = 'cancelled';
          sub.updatedAt = nowIso;
        }
        break;
      }

      default:
        console.log(`[Asaas Webhook] Evento não processado diretamente: ${event}`);
        break;
    }

    writeDb(db);

    return NextResponse.json({
      received: true,
      event,
      siteSlug,
      status: sub?.status || 'updated'
    });
  } catch (err: any) {
    console.error('[Asaas Webhook Error]:', err);
    return NextResponse.json({ error: err.message || 'Erro interno no processamento do webhook.' }, { status: 500 });
  }
}
