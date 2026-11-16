import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { cancelAllPendingCharges, cancelAsaasSubscription, cancelAsaasPayment } from '@/services/asaas';
import { getSupabaseAdmin } from '@/lib/supabase';
import { setSlugSuspended } from '@/lib/site-storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { subscriptionId, siteSlug, cancelAll } = body;
    const nowIso = new Date().toISOString();

    const db = readDb();
    if (!Array.isArray(db.subscriptions)) {
      db.subscriptions = [];
    }

    // Caso solicite cancelamento em lote de todas as pendências não pagas
    if (cancelAll) {
      const pendingSubs = db.subscriptions.filter(
        s => (s.status === 'pending' || s.status === 'awaiting_first_payment' || s.status === 'abandoned_checkout') && !s.lastPaymentDate
      );

      let totalCancelled = 0;
      for (const s of pendingSubs) {
        const asaasSubId = s.asaasSubscriptionId || (s as any).asaas_subscription_id;
        const asaasCustId = s.asaasCustomerId || (s as any).asaas_customer_id;
        const asaasPayId = (s as any).asaasPaymentId || (s as any).asaas_payment_id;

        if (asaasPayId) {
          await cancelAsaasPayment(asaasPayId);
        }
        if (asaasSubId || asaasCustId) {
          await cancelAllPendingCharges({
            subscriptionId: asaasSubId || undefined,
            customerId: asaasCustId || undefined,
            siteSlug: s.siteSlug
          });
        }
        s.status = 'cancelled';
        s.siteStatus = 'cancelled';
        (s as any).site_status = 'cancelled';
        s.cancellationReason = 'Limpeza administrativa de cobranças pendentes não pagas';
        s.cancelledAt = nowIso;
        s.updatedAt = nowIso;

        if (s.siteSlug) {
          try {
            setSlugSuspended(s.siteSlug, true);
          } catch {}
        }
        totalCancelled++;
      }

      writeDb(db);

      // Sincroniza em lote no Supabase
      try {
        const supabase = getSupabaseAdmin();
        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            site_status: 'cancelled',
            cancellation_reason: 'Limpeza administrativa de cobranças pendentes',
            cancelled_at: nowIso,
            updated_at: nowIso
          })
          .in('status', ['pending', 'awaiting_first_payment', 'abandoned_checkout']);
      } catch (sbErr) {
        console.warn('[Cancel Pending Batch] Aviso Supabase:', sbErr);
      }

      return NextResponse.json({
        success: true,
        message: `${totalCancelled} cobranças pendentes foram canceladas e limpas no Asaas.`,
        totalCancelled
      });
    }

    // Cancelamento individual
    if (!subscriptionId && !siteSlug) {
      return NextResponse.json(
        { error: 'subscriptionId ou siteSlug é obrigatório.' },
        { status: 400 }
      );
    }

    const cleanSlug = (siteSlug || '').toLowerCase().trim();
    const cleanId = (subscriptionId || '').trim();

    const sub = db.subscriptions.find(
      s =>
        (cleanId && s.id === cleanId) ||
        (cleanSlug && s.siteSlug === cleanSlug) ||
        (cleanId && (s.asaasSubscriptionId === cleanId || (s as any).asaas_subscription_id === cleanId))
    );

    let asaasSubId = sub?.asaasSubscriptionId || (sub as any)?.asaas_subscription_id || (cleanId.startsWith('sub_') ? cleanId : undefined);
    let asaasPayId = (sub as any)?.asaasPaymentId || (sub as any)?.asaas_payment_id || (cleanId.startsWith('pay_') ? cleanId : undefined);
    let asaasCustId = sub?.asaasCustomerId || (sub as any)?.asaas_customer_id;
    const targetSlug = sub?.siteSlug || cleanSlug;

    // Se faltar algum identificador, busca no Supabase
    if (!asaasSubId || !asaasPayId || !asaasCustId) {
      try {
        const supabase = getSupabaseAdmin();
        const { data: supaRows } = await supabase
          .from('subscriptions')
          .select('asaas_subscription_id, asaas_payment_id, asaas_customer_id')
          .or(`site_slug.eq.${targetSlug},id.eq.${cleanId}`)
          .limit(1);
        if (supaRows && supaRows.length > 0) {
          if (!asaasSubId) asaasSubId = supaRows[0].asaas_subscription_id;
          if (!asaasPayId) asaasPayId = supaRows[0].asaas_payment_id;
          if (!asaasCustId) asaasCustId = supaRows[0].asaas_customer_id;
        }
      } catch (e) {}
    }

    // Cancela no Asaas e expurga cobranças pendentes
    let asaasResult = { cancelledSubscriptions: 0, cancelledPayments: 0 };
    if (asaasPayId) {
      await cancelAsaasPayment(asaasPayId);
    }
    if (asaasSubId || asaasCustId) {
      asaasResult = await cancelAllPendingCharges({
        subscriptionId: asaasSubId || undefined,
        customerId: asaasCustId || undefined,
        siteSlug: targetSlug
      });
    } else if (asaasSubId) {
      await cancelAsaasSubscription(asaasSubId);
    }

    if (sub) {
      sub.status = 'cancelled';
      sub.siteStatus = 'cancelled';
      (sub as any).site_status = 'cancelled';
      sub.cancellationReason = 'Cobrança pendente cancelada pelo administrador (blindagem Asaas)';
      sub.cancelledAt = nowIso;
      sub.updatedAt = nowIso;
    }

    writeDb(db);

    if (targetSlug) {
      try {
        setSlugSuspended(targetSlug, true);
      } catch {}
    }

    // Sincroniza com o Supabase
    try {
      const supabase = getSupabaseAdmin();
      await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          site_status: 'cancelled',
          cancellation_reason: 'Cobrança pendente cancelada pelo administrador (blindagem Asaas)',
          cancelled_at: nowIso,
          updated_at: nowIso
        })
        .or(`site_slug.eq.${targetSlug},id.eq.${sub?.id || cleanId}`);
    } catch (sbErr) {
      console.warn('[Cancel Pending] Aviso Supabase:', sbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Cobrança pendente cancelada com sucesso no Asaas e sistema.',
      asaasResult,
      siteSlug: targetSlug
    });
  } catch (err: any) {
    console.error('[Cancel Pending Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao cancelar cobrança pendente.' },
      { status: 500 }
    );
  }
}
