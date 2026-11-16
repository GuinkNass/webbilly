import { NextRequest, NextResponse } from 'next/server';
import {
  listAsaasPayments,
  listAsaasSubscriptions,
  getAsaasCustomer,
  cancelAsaasPayment,
  cancelAsaasSubscription
} from '@/services/asaas';
import { getSupabaseAdmin } from '@/lib/supabase';
import { readDb, writeDb } from '@/lib/db';
import { setSlugSuspended } from '@/lib/site-storage';

export const dynamic = 'force-dynamic';

export interface EnrichedAsaasPayment {
  id: string;
  subscriptionId: string | null;
  customer: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCpfCnpj?: string;
  siteSlug?: string;
  subdomain?: string;
  customDomain?: string;
  value: number;
  netValue?: number;
  billingType: string;
  status: string;
  dueDate: string;
  dateCreated: string;
  paymentDate?: string | null;
  invoiceUrl: string;
  bankSlipUrl?: string | null;
  transactionReceiptUrl?: string | null;
  description?: string;
  externalReference?: string | null;
  isFirstInstallment: boolean;
}

/**
 * GET /api/admin/asaas-cobrancas
 * Consulta direta à API oficial do Asaas cruzando dados com Supabase e db.json
 */
export async function GET() {
  try {
    // 1. Consulta pagamentos e assinaturas oficiais no Asaas
    const [paymentsRes, subscriptionsRes] = await Promise.all([
      listAsaasPayments({ limit: 50 }),
      listAsaasSubscriptions({ limit: 50 })
    ]);

    const asaasPayments = paymentsRes.data || [];
    const asaasSubs = subscriptionsRes.data || [];

    // 2. Consulta registros de assinaturas e sites do Supabase
    let supaSubscriptions: any[] = [];
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (Array.isArray(data)) {
        supaSubscriptions = data;
      }
    } catch (e) {
      console.warn('[Asaas Cobrancas API] Falha ao consultar Supabase subscriptions:', e);
    }

    // 3. Fallback / complemento com db.json local
    const localDb = readDb();
    const localSubs = Array.isArray(localDb.subscriptions) ? localDb.subscriptions : [];

    // Cache temporário em memória para clientes Asaas
    const customerCache = new Map<string, any>();

    // 4. Enriquece cada cobrança do Asaas com cliente, subdomínio e meta
    const enrichedPayments: EnrichedAsaasPayment[] = [];

    for (const p of asaasPayments) {
      const extRef = (p.externalReference || '').trim();
      const pDesc = (p.description || '').trim();

      // Extrai slug de externalReference (ex: "lead_token|site_slug|operatorId|...") ou da descrição
      let extractedSlug: string | undefined;
      let extractedLead: string | undefined;

      if (extRef) {
        const parts = extRef.split('|');
        if (parts.length >= 2) {
          extractedLead = parts[0];
          extractedSlug = parts[1];
        }
      }

      if (!extractedSlug && pDesc) {
        const match = pDesc.match(/([a-z0-9-]+)\.webbilly\.com\.br/i);
        if (match && match[1]) {
          extractedSlug = match[1].toLowerCase();
        }
      }

      // Localiza no Supabase
      const matchedSupa = supaSubscriptions.find(s => {
        if (s.asaas_payment_id && s.asaas_payment_id === p.id) return true;
        if (p.subscription && s.asaas_subscription_id === p.subscription) return true;
        if (s.asaas_customer_id && s.asaas_customer_id === p.customer) return true;
        if (extractedSlug && s.site_slug === extractedSlug) return true;
        if (extractedLead && s.lead_token === extractedLead) return true;
        return false;
      });

      // Localiza no db.json local
      const matchedLocal = localSubs.find(s => {
        if ((s as any).asaasPaymentId === p.id || (s as any).asaas_payment_id === p.id) return true;
        if (p.subscription && (s.asaasSubscriptionId === p.subscription || (s as any).asaas_subscription_id === p.subscription)) return true;
        if (s.asaasCustomerId === p.customer || (s as any).asaas_customer_id === p.customer) return true;
        if (extractedSlug && s.siteSlug === extractedSlug) return true;
        if (extractedLead && s.leadToken === extractedLead) return true;
        return false;
      });

      const effectiveSlug = matchedSupa?.site_slug || matchedLocal?.siteSlug || extractedSlug || '';
      let clientName = matchedSupa?.client_name || matchedLocal?.clientName || '';
      let clientEmail = matchedSupa?.client_email || matchedLocal?.clientEmail || '';
      let clientPhone = matchedSupa?.client_phone || matchedLocal?.clientPhone || '';
      const customDomain = matchedSupa?.custom_domain || matchedLocal?.custom_domain;

      // Se não encontrou o nome do cliente no Supabase, consulta o cadastro do Asaas
      if (!clientName && p.customer) {
        if (!customerCache.has(p.customer)) {
          const custData = await getAsaasCustomer(p.customer);
          if (custData) {
            customerCache.set(p.customer, custData);
          }
        }
        const cachedCust = customerCache.get(p.customer);
        if (cachedCust) {
          clientName = cachedCust.name || clientName;
          clientEmail = cachedCust.email || clientEmail;
          clientPhone = cachedCust.mobilePhone || cachedCust.phone || clientPhone;
        }
      }

      if (!clientName) {
        clientName = effectiveSlug
          ? effectiveSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
          : 'Cliente Asaas';
      }

      const isFirstInstallment =
        extRef.includes('first_installment') ||
        pDesc.includes('1ª Mensalidade') ||
        pDesc.includes('1a Mensalidade') ||
        !p.subscription;

      enrichedPayments.push({
        id: p.id,
        subscriptionId: p.subscription || null,
        customer: p.customer,
        clientName,
        clientEmail: clientEmail || undefined,
        clientPhone: clientPhone || undefined,
        clientCpfCnpj: matchedSupa?.client_cpf_cnpj || undefined,
        siteSlug: effectiveSlug || undefined,
        subdomain: effectiveSlug ? `${effectiveSlug}.webbilly.com.br` : undefined,
        customDomain: customDomain || undefined,
        value: Number(p.value || 0),
        netValue: p.netValue ? Number(p.netValue) : undefined,
        billingType: p.billingType || 'UNDEFINED',
        status: p.status || 'PENDING',
        dueDate: p.dueDate || p.originalDueDate,
        dateCreated: p.dateCreated,
        paymentDate: p.paymentDate || p.clientPaymentDate || null,
        invoiceUrl: p.invoiceUrl || `https://www.asaas.com/i/${p.id}`,
        bankSlipUrl: p.bankSlipUrl || null,
        transactionReceiptUrl: p.transactionReceiptUrl || null,
        description: p.description,
        externalReference: p.externalReference || null,
        isFirstInstallment
      });
    }

    // Métricas para os cards de resumo
    const summary = {
      total: enrichedPayments.length,
      pending: enrichedPayments.filter(p => p.status === 'PENDING').length,
      received: enrichedPayments.filter(p => p.status === 'RECEIVED' || p.status === 'CONFIRMED').length,
      overdue: enrichedPayments.filter(p => p.status === 'OVERDUE').length,
      totalValue: enrichedPayments.reduce((acc, p) => acc + p.value, 0),
      pendingValue: enrichedPayments.filter(p => p.status === 'PENDING').reduce((acc, p) => acc + p.value, 0),
      receivedValue: enrichedPayments.filter(p => p.status === 'RECEIVED' || p.status === 'CONFIRMED').reduce((acc, p) => acc + p.value, 0),
      subscriptionsCount: asaasSubs.length
    };

    return NextResponse.json({
      success: true,
      payments: enrichedPayments,
      subscriptions: asaasSubs,
      summary
    });
  } catch (err: any) {
    console.error('[GET /api/admin/asaas-cobrancas Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao consultar cobranças no Asaas.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/asaas-cobrancas
 * Cancela cobrança avulsa e/ou assinatura no Asaas e atualiza o Supabase com 1 clique
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { paymentId, subscriptionId, siteSlug } = body;

    if (!paymentId && !subscriptionId) {
      return NextResponse.json(
        { error: 'paymentId ou subscriptionId é obrigatório para cancelamento.' },
        { status: 400 }
      );
    }

    let subCancelled = false;
    let payCancelled = false;

    // 1. Cancela assinatura no Asaas se informada
    if (subscriptionId) {
      subCancelled = await cancelAsaasSubscription(subscriptionId);
    }

    // 2. Cancela cobrança no Asaas se informada
    if (paymentId) {
      payCancelled = await cancelAsaasPayment(paymentId);
    }

    const nowIso = new Date().toISOString();

    // 3. Atualiza no Supabase
    try {
      const supabase = getSupabaseAdmin();
      let query = supabase.from('subscriptions').update({
        status: 'cancelled',
        site_status: 'cancelled',
        cancellation_reason: 'Cancelado manualmente via Painel Financeiro Asaas',
        cancelled_at: nowIso,
        updated_at: nowIso
      });

      if (paymentId && subscriptionId) {
        query = query.or(`asaas_payment_id.eq.${paymentId},asaas_subscription_id.eq.${subscriptionId}`);
      } else if (paymentId) {
        query = query.or(`asaas_payment_id.eq.${paymentId},id.eq.${paymentId}`);
      } else if (subscriptionId) {
        query = query.or(`asaas_subscription_id.eq.${subscriptionId},id.eq.${subscriptionId}`);
      }

      await query;

      if (siteSlug) {
        await supabase
          .from('sites')
          .update({
            status: 'cancelled',
            updated_at: nowIso
          })
          .eq('site_slug', siteSlug);
      }
    } catch (sbErr) {
      console.warn('[DELETE asaas-cobrancas] Erro Supabase:', sbErr);
    }

    // 4. Atualiza no db.json
    try {
      const db = readDb();
      if (Array.isArray(db.subscriptions)) {
        for (const s of db.subscriptions) {
          if (
            (paymentId && ((s as any).asaasPaymentId === paymentId || (s as any).asaas_payment_id === paymentId || s.id === paymentId)) ||
            (subscriptionId && (s.asaasSubscriptionId === subscriptionId || (s as any).asaas_subscription_id === subscriptionId || s.id === subscriptionId)) ||
            (siteSlug && s.siteSlug === siteSlug)
          ) {
            s.status = 'cancelled';
            s.siteStatus = 'cancelled';
            (s as any).site_status = 'cancelled';
            s.cancellationReason = 'Cancelado manualmente via Painel Financeiro Asaas';
            s.cancelledAt = nowIso;
            s.updatedAt = nowIso;
          }
        }
        writeDb(db);
      }
    } catch (dbErr) {
      console.warn('[DELETE asaas-cobrancas] Erro db.json:', dbErr);
    }

    // 5. Se houver slug, suspende no Edge Config
    if (siteSlug) {
      try {
        setSlugSuspended(siteSlug, true);
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: 'Cobrança cancelada com sucesso no Asaas e sistema.',
      details: { subCancelled, payCancelled }
    });
  } catch (err: any) {
    console.error('[DELETE /api/admin/asaas-cobrancas Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao cancelar cobrança no Asaas.' },
      { status: 500 }
    );
  }
}
