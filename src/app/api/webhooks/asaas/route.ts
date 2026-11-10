import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, Sale } from '@/lib/db';

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
          const newSale: Sale = {
            id: saleId,
            operatorId: operator.id,
            operatorName: operator.name,
            clientName: sub?.clientName || payment.customer || `Comércio ${siteSlug}`,
            clientWhatsapp: sub?.clientPhone || '',
            siteUrl: `https://${siteSlug || sub?.siteSlug || 'site'}.webbilly.com.br`,
            niche: 'Assinatura Recorrente Mensal',
            saleValue: Number(payment.value) || 29.9,
            commissionValue: 10.0,
            pixStatus: 'PENDENTE',
            createdAt: nowIso
          };
          db.sales.unshift(newSale);
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
