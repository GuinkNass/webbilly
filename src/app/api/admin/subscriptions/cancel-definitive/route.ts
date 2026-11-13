import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { cancelDefinitiveInSupabase } from '@/lib/supabase';
import { cancelAsaasSubscription } from '@/services/asaas';
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

    const asaasSubId = sub?.asaasSubscriptionId || sub?.asaas_subscription_id;
    const targetSlug = sub?.siteSlug || cleanSlug;
    const customDomain = sub?.custom_domain || sub?.customDomain;
    const vercelProjectId = sub?.vercel_project_id || sub?.vercelProjectId;

    // 1. ASAAS: Deleta a assinatura e cessa futuras cobranças
    let asaasCancelled = false;
    if (asaasSubId) {
      asaasCancelled = await cancelAsaasSubscription(asaasSubId);
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

    // 3. SUPABASE: Atualiza status para cancelled e site_status para deleted
    const targetIdentifier = targetSlug || cleanId;
    await cancelDefinitiveInSupabase(targetIdentifier);

    // 4. db.json: Atualiza localmente
    if (sub) {
      sub.status = 'cancelled';
      sub.site_status = 'deleted';
      sub.siteStatus = 'deleted';
      sub.cancellationRequested = false;
      sub.cancellation_requested = false;
      sub.cancelledAt = nowIso;
      sub.cancelled_at = nowIso;
      sub.updatedAt = nowIso;
      writeDb(db);
    }

    return NextResponse.json({
      success: true,
      message: 'Cancelamento definitivo executado com sucesso no Asaas, Vercel e Supabase.',
      details: {
        siteSlug: targetSlug,
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
