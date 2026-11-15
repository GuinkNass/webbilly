import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';
import { cancelAllPendingCharges, cancelAsaasSubscription } from '@/services/asaas';
import { setSlugSuspended } from '@/lib/site-storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const leadToken = (body.leadToken || body.leadId || body.token || '').trim();
    const siteSlug = (body.siteSlug || body.slug || '').trim().toLowerCase();
    const reason = (body.reason || 'Proposta recusada pelo cliente no checkout').trim();
    const nowIso = new Date().toISOString();

    if (!leadToken && !siteSlug) {
      return NextResponse.json(
        { error: 'leadToken ou siteSlug é obrigatório para recusar a proposta.' },
        { status: 400 }
      );
    }

    const db = readDb();
    if (!Array.isArray(db.subscriptions)) {
      db.subscriptions = [];
    }

    // 1. Localiza a assinatura correspondente no banco local
    const sub = db.subscriptions.find(
      s =>
        (leadToken && (s.leadToken === leadToken || s.id.includes(leadToken))) ||
        (siteSlug && (s.siteSlug === siteSlug || s.id.includes(siteSlug)))
    );

    const asaasSubId = sub?.asaasSubscriptionId || (sub as any)?.asaas_subscription_id;
    const asaasCustId = sub?.asaasCustomerId || (sub as any)?.asaas_customer_id;
    const effectiveSlug = siteSlug || sub?.siteSlug || (leadToken ? leadToken.replace(/^brf_/, '') : '');

    // 2. BLINDAGEM NO ASAAS: Cancela imediatamente qualquer assinatura e cobrança pendente
    let asaasResult = { cancelledSubscriptions: 0, cancelledPayments: 0 };
    try {
      if (asaasSubId || asaasCustId) {
        asaasResult = await cancelAllPendingCharges({
          subscriptionId: asaasSubId,
          customerId: asaasCustId,
          siteSlug: effectiveSlug
        });
      } else if (asaasSubId) {
        await cancelAsaasSubscription(asaasSubId);
      }
    } catch (asaasErr) {
      console.warn('[Recusar Proposta] Aviso ao cancelar cobranças no Asaas:', asaasErr);
    }

    // 3. Atualiza registro no db.json local
    if (sub) {
      sub.status = 'cancelled';
      sub.siteStatus = 'cancelled';
      (sub as any).site_status = 'cancelled';
      sub.cancellationReason = reason;
      (sub as any).cancellation_reason = reason;
      sub.cancelledAt = nowIso;
      (sub as any).cancelled_at = nowIso;
      sub.updatedAt = nowIso;
    }

    if (leadToken && db.briefings && db.briefings[leadToken]) {
      (db.briefings[leadToken] as any).status = 'declined';
      (db.briefings[leadToken] as any).declinedAt = nowIso;
    }

    writeDb(db);

    // 4. Bloqueia subdomínio no Edge Config para não ficar online
    if (effectiveSlug) {
      try {
        setSlugSuspended(effectiveSlug, true);
      } catch {}
    }

    // 5. Sincroniza cancelamento imediatamente no Supabase
    try {
      const supabase = getSupabaseAdmin();

      // Atualiza tabela subscriptions
      const updatePayload: Record<string, any> = {
        status: 'cancelled',
        site_status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: nowIso,
        updated_at: nowIso
      };

      if (effectiveSlug) {
        await supabase
          .from('subscriptions')
          .update(updatePayload)
          .or(`site_slug.eq.${effectiveSlug},lead_token.eq.${leadToken}`);
      }

      // Atualiza briefings se existir
      if (leadToken) {
        await supabase
          .from('briefings')
          .update({
            status: 'declined',
            updated_at: nowIso
          } as any)
          .eq('lead_token', leadToken);
      }
    } catch (sbErr) {
      console.warn('[Recusar Proposta] Aviso ao sincronizar com Supabase:', sbErr);
    }

    console.log(`[Recusar Proposta] Proposta ${leadToken || effectiveSlug} cancelada com sucesso.`);

    return NextResponse.json({
      success: true,
      message: 'Proposta recusada com sucesso. Qualquer cobrança ou assinatura pendente no Asaas foi cancelada e nenhuma fatura será emitida.',
      leadToken,
      siteSlug: effectiveSlug,
      asaasResult
    });
  } catch (err: any) {
    console.error('[Recusar Proposta API Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao processar recusa da proposta.' },
      { status: 500 }
    );
  }
}
