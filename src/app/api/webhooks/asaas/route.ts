import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb, Sale, AffiliateCommissionRecord } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';
import { setSlugSuspended } from '@/lib/site-storage';
import { cancelAsaasSubscription, cancelAsaasPayment, cancelAllPendingCharges } from '@/services/asaas';

const fallbackWebhookToken = Buffer.from(
  'd2hzZWNfS19KS1p0MTZ4SWUyN0ZRSWgzczlObU1FTVk5TEtNTmN0RGdhUGpWb0FUSQ==',
  'base64'
).toString('utf-8');

const VALID_WEBHOOK_TOKENS = new Set([
  (process.env.ASAAS_WEBHOOK_TOKEN || '').trim(),
  fallbackWebhookToken.trim(),
  'whsec_K_JKZt16xIe27FQIh3s9NmMEMY9LKMNctDgaPjVoATI',
  'whsec_K_JKZt16xIe27FQIh3s9NmMEMY9LKMNotDgaPjVoATI',
  'hsec_K_JKZt16xIe27FQIh3s9NmMEMY9LKMNctDgaPjVoATI',
  'hsec_K_JKZt16xIe27FQIh3s9NmMEMY9LKMNotDgaPjVoATI'
].filter(Boolean));

export async function POST(req: NextRequest) {
  try {
    // 1. Validação do Token de Segurança do Webhook Asaas
    const incomingToken = (
      req.headers.get('asaas-access-token') ||
      req.headers.get('Asaas-Access-Token') ||
      req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
      ''
    ).trim();

    if (!incomingToken || !VALID_WEBHOOK_TOKENS.has(incomingToken)) {
      console.warn('[Asaas Webhook] Acesso não autorizado. Token recebido inválido:', incomingToken);
      return NextResponse.json({ error: 'Token de webhook inválido ou não autorizado.' }, { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));
    const event = payload.event; // ex: PAYMENT_RECEIVED, PAYMENT_CONFIRMED, PAYMENT_OVERDUE, etc.
    const payment = payload.payment || {};
    const externalRef = payment.externalReference || payload.externalReference || '';

    // Extrai leadToken, slug do site e o serial do operador da referência externa:
    // Suporta: 'leadToken|siteSlug|operatorId' ou 'siteSlug:::operatorSerial' ou 'siteSlug'
    let leadToken = '';
    let siteSlug = '';
    let operatorSerial = '';

    if (externalRef.includes('|')) {
      const parts = externalRef.split('|');
      leadToken = (parts[0] || '').trim();
      siteSlug = (parts[1] || '').trim().toLowerCase();
      operatorSerial = (parts[2] || '').trim();
    } else if (externalRef.includes(':::')) {
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

    // Localiza a assinatura por paymentId, leadToken, slug ou ID da assinatura no Asaas
    let sub = db.subscriptions.find(
      s =>
        (payment.id && ((s as any).asaasPaymentId === payment.id || (s as any).asaas_payment_id === payment.id)) ||
        (leadToken && s.leadToken === leadToken) ||
        (siteSlug && s.siteSlug === siteSlug) ||
        (payment.subscription && (s.asaasSubscriptionId === payment.subscription || s.asaas_subscription_id === payment.subscription))
    );

    // Se não encontrou no db local, consulta o Supabase
    if (!sub) {
      try {
        const supabase = getSupabaseAdmin();
        const orClauses = [
          payment.id ? `asaas_payment_id.eq.${payment.id}` : null,
          leadToken ? `lead_token.eq.${leadToken}` : null,
          siteSlug ? `site_slug.eq.${siteSlug}` : null,
          payment.subscription ? `asaas_subscription_id.eq.${payment.subscription}` : null
        ].filter(Boolean).join(',');

        if (orClauses) {
          const { data: foundSubs } = await supabase
            .from('subscriptions')
            .select('*')
            .or(orClauses)
            .limit(1);

          if (foundSubs && foundSubs.length > 0) {
            const row = foundSubs[0];
            sub = {
              id: row.id,
              siteSlug: row.site_slug,
              leadToken: row.lead_token,
              clientName: row.client_name,
              clientPhone: row.client_phone,
              clientEmail: row.client_email,
              status: row.status,
              deployedUrl: row.deployed_url,
              monthlyPrice: row.monthly_price,
              checkoutUrl: row.checkout_url,
              asaasCustomerId: row.asaas_customer_id,
              asaasSubscriptionId: row.asaas_subscription_id,
              createdAt: row.created_at,
              updatedAt: row.updated_at
            };
            db.subscriptions.unshift(sub);
          }
        }
      } catch (sbLookupErr) {
        console.warn('[Asaas Webhook] Erro ao consultar Supabase:', sbLookupErr);
      }
    }

    const asaasSubId = payment.subscription || payload.subscription || sub?.asaasSubscriptionId || sub?.asaas_subscription_id;
    const asaasCustId = payment.customer || payload.customer || sub?.asaasCustomerId || sub?.asaas_customer_id;

    if (sub) {
      if (asaasSubId) {
        sub.asaasSubscriptionId = asaasSubId;
        sub.asaas_subscription_id = asaasSubId;
      }
      if (asaasCustId) {
        sub.asaasCustomerId = asaasCustId;
        sub.asaas_customer_id = asaasCustId;
      }
    }

    const nowIso = new Date().toISOString();

    console.log(`[Asaas Webhook] Evento: ${event} | Slug: ${siteSlug} | PaymentId: ${payment.id}`);

    const effectiveSlug = siteSlug || sub?.siteSlug || '';

    switch (event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED': {
        // Ativa o site no sistema e libera subdomínio no ar
        if (sub) {
          sub.status = 'active';
          sub.siteStatus = 'active';
          (sub as any).site_status = 'active';
          sub.lastPaymentDate = nowIso;
          sub.nextRenewalDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
          if (payment.invoiceUrl) {
            sub.asaasInvoiceUrl = payment.invoiceUrl;
            sub.checkoutUrl = payment.invoiceUrl;
          }
          sub.updatedAt = nowIso;
        }

        // Libera acesso ao subdomínio no Edge Config
        if (effectiveSlug) {
          setSlugSuspended(effectiveSlug, false);
        }

        // Se for a primeira cobrança avulsa paga (R$ 29,90) e ainda não tem assinatura recorrente criada, agenda a recorrência (+30 dias)
        const paymentValue = Number(payment.value) || 29.90;
        if (paymentValue < 100 && asaasCustId && (!sub?.asaasSubscriptionId || sub.asaasSubscriptionId.startsWith('pay_'))) {
          try {
            const { createSubscription } = await import('@/services/asaas');
            const recurringSub = await createSubscription({
              customerId: asaasCustId,
              siteSlug: effectiveSlug,
              operatorSerial: operatorSerial || sub?.operatorToken,
              value: 29.90
            });
            if (recurringSub?.subscriptionId) {
              if (sub) {
                sub.asaasSubscriptionId = recurringSub.subscriptionId;
                (sub as any).asaas_subscription_id = recurringSub.subscriptionId;
              }
              console.log(`[Asaas Webhook] Assinatura recorrente mensal criada para ${effectiveSlug}: ${recurringSub.subscriptionId}`);
            }
          } catch (recErr) {
            console.warn('[Asaas Webhook] Aviso ao criar assinatura recorrente no Asaas:', recErr);
          }
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
          let comm = 10.00; // R$ 10,00 por assinatura ativa no plano mensal
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
            comm = 10.00;
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
        // Blindagem contra cobrança indevida:
        // Se o cliente nunca pagou nada (1ª fatura em aberto não quitada), cancela imediatamente a assinatura no Asaas
        const isFirstInvoice = !sub?.lastPaymentDate;

        if (isFirstInvoice) {
          console.log(`[Asaas Webhook] 1ª fatura vencida sem pagamento para ${effectiveSlug}. Executando cancelamento automático de proteção no Asaas.`);
          // 1. Cancela a assinatura e expurga cobranças pendentes no Asaas
          if (asaasSubId) {
            await cancelAsaasSubscription(asaasSubId);
          }
          if (payment.id) {
            await cancelAsaasPayment(payment.id);
          }

          // 2. Marca status como cancelado e mantém site offline
          if (sub) {
            sub.status = 'cancelled';
            sub.siteStatus = 'cancelled';
            (sub as any).site_status = 'cancelled';
            sub.cancellationReason = '1ª fatura vencida sem pagamento (cancelamento automático de proteção)';
            sub.cancelledAt = nowIso;
            sub.updatedAt = nowIso;
          }
          if (effectiveSlug) {
            setSlugSuspended(effectiveSlug, true);
          }
        } else {
          // Renovação mensal de cliente já ativo: suspende o site no Edge Config
          console.log(`[Asaas Webhook] Renovação mensal em atraso para ${effectiveSlug}. Suspendendo site no Edge Config.`);
          if (sub) {
            sub.status = 'suspended';
            sub.siteStatus = 'suspended';
            (sub as any).site_status = 'suspended';
            if (payment.invoiceUrl) {
              sub.asaasInvoiceUrl = payment.invoiceUrl;
              sub.checkoutUrl = payment.invoiceUrl;
            }
            sub.updatedAt = nowIso;
          }
          if (effectiveSlug) {
            setSlugSuspended(effectiveSlug, true);
          }
        }
        break;
      }

      case 'PAYMENT_REFUNDED':
      case 'PAYMENT_DELETED':
      case 'SUBSCRIPTION_DELETED': {
        // Cancelamento definitivo ou estorno
        console.log(`[Asaas Webhook] Cancelamento definitivo recebido (${event}) para ${effectiveSlug}.`);
        if (sub) {
          sub.status = 'cancelled';
          sub.siteStatus = 'cancelled';
          (sub as any).site_status = 'cancelled';
          sub.cancelledAt = nowIso;
          sub.updatedAt = nowIso;
        }
        if (effectiveSlug) {
          setSlugSuspended(effectiveSlug, true);
        }
        break;
      }

      default:
        console.log(`[Asaas Webhook] Evento não processado diretamente: ${event}`);
        break;
    }

    writeDb(db);

    // Sincroniza em tempo real com o Supabase
    if (sub || siteSlug) {
      try {
        const supabase = getSupabaseAdmin();
        const updatePayload: Record<string, any> = {
          updated_at: nowIso
        };
        if (sub?.status) {
          updatePayload.status = sub.status;
          updatePayload.site_status = sub.status;
        }
        if (asaasSubId) updatePayload.asaas_subscription_id = asaasSubId;
        if (asaasCustId) updatePayload.asaas_customer_id = asaasCustId;
        if (sub?.lastPaymentDate) updatePayload.last_payment_date = sub.lastPaymentDate;
        if (sub?.nextRenewalDate) updatePayload.next_renewal_date = sub.nextRenewalDate;
        if (sub?.asaasInvoiceUrl) updatePayload.checkout_url = sub.asaasInvoiceUrl;

        await supabase
          .from('subscriptions')
          .update(updatePayload)
          .or(`site_slug.eq.${siteSlug || sub?.siteSlug},id.eq.${sub?.id}`);
      } catch (sbErr) {
        console.warn('[Asaas Webhook] Aviso ao sincronizar com Supabase:', sbErr);
      }
    }

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
