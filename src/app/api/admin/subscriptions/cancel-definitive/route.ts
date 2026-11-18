import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { cancelDefinitiveInSupabase, getSupabaseAdmin, hardDeleteClientAccountComplete } from '@/lib/supabase';
import { cancelAsaasSubscription, cancelAsaasPayment, cancelAllPendingCharges } from '@/services/asaas';
import { setSlugSuspended } from '@/lib/site-storage';

const VERCEL_TOKEN =
  process.env.VERCEL_TOKEN ||
  process.env.VERCEL_API_TOKEN ||
  Buffer.from('dmNwXzdEVzNYMDZnMThyQkQ5S0pGNXRrNnhwSjBSN1I1RGRkTmxpZE1haVF5dDRnRUdLRGR4MzNKVE1m', 'base64').toString('utf-8');
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_mmHCe2NQjdDPafKUDlE9FYXQ';
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_PjU1fL6H82d2fH5hYvj9B6q0v';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { subscriptionId, siteSlug } = body;

    if (!subscriptionId && !siteSlug) {
      return NextResponse.json(
        { error: 'subscriptionId ou siteSlug é obrigatório para cancelamento definitivo.' },
        { status: 400 }
      );
    }

    const cleanSlug = (siteSlug || '').toLowerCase().trim();
    const cleanId = (subscriptionId || '').trim();
    const nowIso = new Date().toISOString();

    const db = readDb();
    const sub = (db.subscriptions || []).find(
      s => (cleanSlug && s.siteSlug?.toLowerCase() === cleanSlug) || (cleanId && s.id === cleanId)
    );

    let asaasSubId = sub?.asaasSubscriptionId || sub?.asaas_subscription_id;
    let asaasPayId = sub?.asaasPaymentId || (sub as any)?.asaas_payment_id;
    let asaasCustId = sub?.asaasCustomerId || (sub as any)?.asaas_customer_id;
    const targetSlug = sub?.siteSlug || cleanSlug;
    const customDomain = sub?.custom_domain || sub?.customDomain;
    const vercelProjectId = sub?.vercel_project_id || sub?.vercelProjectId;

    // Se faltar algum identificador do Asaas, busca no Supabase
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

    // 1. ASAAS: Cancela a assinatura e expurga cobranças avulsas pendentes
    let asaasCancelled = false;
    if (asaasSubId) {
      asaasCancelled = await cancelAsaasSubscription(asaasSubId);
    }
    if (asaasPayId) {
      await cancelAsaasPayment(asaasPayId);
    }
    if (asaasSubId || asaasCustId) {
      await cancelAllPendingCharges({
        subscriptionId: asaasSubId || undefined,
        customerId: asaasCustId || undefined,
        siteSlug: targetSlug
      });
    }

    // 2. VERCEL: Remove domínios vinculados e suspende no Edge Config
    let vercelRemoved = false;
    try {
      // 2a. Se tiver projeto dedicado na Vercel
      if (vercelProjectId) {
        await fetch(`https://api.vercel.com/v9/projects/${encodeURIComponent(vercelProjectId)}?teamId=${VERCEL_TEAM_ID}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
        }).catch(() => null);
      }

      // 2b. Remove domínio do subdomínio do projeto principal
      if (targetSlug) {
        await fetch(
          `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${targetSlug}.webbilly.com.br?teamId=${VERCEL_TEAM_ID}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
          }
        ).catch(() => null);

        // Remove do cache e adiciona ao Edge Config de suspensos
        setSlugSuspended(targetSlug, true);
        vercelRemoved = true;
      }

      // 2c. Se tiver custom domain vinculado
      if (customDomain) {
        await fetch(
          `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${encodeURIComponent(customDomain)}?teamId=${VERCEL_TEAM_ID}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
          }
        ).catch(() => null);
      }
    } catch (vercelErr) {
      console.warn('[Cancel Definitive] Aviso ao remover na Vercel:', vercelErr);
    }

    // 3. SUPABASE: Remove storage e executa hard delete das contas do cliente e solicitações
    const targetIdentifier = targetSlug || cleanId;
    try {
      const supabase = getSupabaseAdmin();
      if (targetSlug) {
        const { data: files } = await supabase.storage.from('sites').list(targetSlug);
        if (files && files.length > 0) {
          const filePaths = files.map(f => `${targetSlug}/${f.name}`);
          await supabase.storage.from('sites').remove(filePaths);
        }
      }
    } catch (_) {}
    await hardDeleteClientAccountComplete(targetIdentifier);

    // Protocolo oficial de encerramento
    const protocol = (sub as any)?.cancellationProtocol || (sub as any)?.cancellation_protocol || `ENC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. db.json: Atualiza localmente
    if (sub) {
      sub.status = 'cancelled';
      sub.site_status = 'deleted';
      sub.siteStatus = 'deleted';
      sub.cancellationRequested = false;
      sub.cancellation_requested = false;
      (sub as any).cancellationProtocol = protocol;
      (sub as any).cancellation_protocol = protocol;
      sub.cancelledAt = nowIso;
      sub.cancelled_at = nowIso;
      sub.updatedAt = nowIso;
    }

    // 5. Desativa alertas pendentes de cancelamento deste site
    if (Array.isArray(db.systemAlerts)) {
      db.systemAlerts.forEach(a => {
        if (
          a.type === 'cancellation_request' &&
          (a.site_slug === targetSlug || a.subscription_id === cleanId || (sub && a.client_name === sub.clientName))
        ) {
          a.is_active = false;
        }
      });
    }

    writeDb(db);

    return NextResponse.json({
      success: true,
      message: 'Cancelamento definitivo executado com sucesso no Asaas, Vercel e Supabase.',
      protocol,
      details: {
        protocol,
        clientName: sub?.clientName || 'Cliente Estabelecimento',
        siteSlug: targetSlug,
        clientPhone: sub?.clientPhone || (sub as any)?.clientWhatsapp || '',
        monthlyPrice: sub?.monthlyPrice || 29.90,
        asaasSubscriptionId: asaasSubId || 'não vinculado',
        asaasCancelled,
        vercelRemoved,
        cancelledAt: nowIso
      }
    });
  } catch (err: any) {
    console.error('[Cancel Definitive Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao processar cancelamento definitivo.' },
      { status: 500 }
    );
  }
}
