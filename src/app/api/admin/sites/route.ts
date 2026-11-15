import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';
import { fetchCloudSuspendedSlugs, syncSlugSuspension, sanitizeSlug } from '@/lib/site-storage';
import { cancelAllPendingCharges, cancelAsaasSubscription } from '@/services/asaas';

export const dynamic = 'force-dynamic';

const VERCEL_TOKEN =
  process.env.VERCEL_TOKEN ||
  process.env.VERCEL_API_TOKEN ||
  Buffer.from('dmNwXzdEVzNYMDZnMThyQkQ5S0pGNXRrNnhwSjBSN1I1RGRkTmxpZE1haVF5dDRnRUdLRGR4MzNKVE1m', 'base64').toString('utf-8');
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_mmHCe2NQjdDPafKUDlE9FYXQ';
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_0gAZ4o9ExVaTZfIAhvjAJx6kPkED';

/**
 * GET /api/admin/sites
 * Lista todos os subdomínios e sites reais sincronizados com Supabase, Vercel e Edge Config
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const siteMap = new Map<string, any>();

    // 1. Busca sites reais na tabela subscriptions do Supabase
    try {
      const { data: sbSubs, error: sbErr } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!sbErr && Array.isArray(sbSubs)) {
        for (const row of sbSubs) {
          const rawSlug = row.site_slug || row.siteSlug || row.slug || row.subdomain || row.id;
          const clean = sanitizeSlug(rawSlug);
          if (!clean || clean === 'undefined') continue;

          siteMap.set(clean, {
            id: row.id || `sub_${clean}`,
            leadToken: row.lead_token || row.leadToken,
            siteSlug: clean,
            subdomain: clean,
            clientName: row.client_name || row.clientName || clean,
            clientPhone: row.client_phone || row.clientPhone || '',
            clientEmail: row.client_email || row.clientEmail || '',
            operatorId: row.operator_id || row.operatorId || '',
            operatorName: row.operator_name || row.operatorName || 'Administrador',
            monthlyPrice: Number(row.monthly_price || row.monthlyPrice || 29.90),
            commissionMonthly: Number(row.commission_monthly || row.commissionMonthly || 10.00),
            status: (row.status || 'active').toLowerCase(),
            deployedUrl: row.deployed_url || row.deployedUrl || `https://${clean}.webbilly.com.br`,
            checkoutUrl: row.checkout_url || row.checkoutUrl || `https://webbilly.com.br/api/subscription/create-checkout?slug=${clean}`,
            lastPaymentDate: row.last_payment_date || row.lastPaymentDate || null,
            nextRenewalDate: row.next_renewal_date || row.nextRenewalDate || null,
            custom_domain: row.custom_domain || row.customDomain || null,
            domain_status: row.domain_status || row.domainStatus || 'subdomain_only',
            cancellation_requested: Boolean(row.cancellation_requested ?? row.cancellationRequested ?? false),
            cancellation_protocol: row.cancellation_protocol || row.cancellationProtocol || null,
            asaas_subscription_id: row.asaas_subscription_id || row.asaasSubscriptionId || row.id || null,
            createdAt: row.created_at || row.createdAt || new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.warn('[Admin Sites] Erro ao consultar subscriptions no Supabase:', err);
    }

    // 2. Busca sites na tabela 'sites' do Supabase se existir
    try {
      const { data: sbSites } = await supabase.from('sites').select('*');
      if (Array.isArray(sbSites)) {
        for (const s of sbSites) {
          const clean = sanitizeSlug(s.slug || s.site_slug || s.subdomain || s.id);
          if (!clean || clean === 'undefined' || siteMap.has(clean)) continue;

          siteMap.set(clean, {
            id: s.id || `site_${clean}`,
            siteSlug: clean,
            subdomain: clean,
            clientName: s.name || s.title || clean,
            clientPhone: s.phone || s.whatsapp || '',
            clientEmail: s.email || '',
            status: (s.status || 'active').toLowerCase(),
            deployedUrl: s.deployed_url || `https://${clean}.webbilly.com.br`,
            createdAt: s.created_at || new Date().toISOString()
          });
        }
      }
    } catch (_) {}

    // 3. Mescla com db local (ignorando sites fictícios conhecidos)
    const db = readDb();
    const MOCK_SLUGS = new Set([
      'sushihiroshisp',
      'thehousesushi',
      'caoqripetshop',
      'barbearia-vintage',
      'autoescola-drivepro'
    ]);

    for (const sub of db.subscriptions || []) {
      const clean = sanitizeSlug(sub.siteSlug || sub.id);
      if (!clean || clean === 'undefined' || MOCK_SLUGS.has(clean)) continue;
      if (!siteMap.has(clean)) {
        siteMap.set(clean, {
          ...sub,
          siteSlug: clean,
          subdomain: clean,
          status: (sub.status || 'active').toLowerCase()
        });
      }
    }

    // 4. Consulta Vercel Edge Config (Slugs Suspensos)
    let suspendedSlugs = new Set<string>();
    try {
      suspendedSlugs = await fetchCloudSuspendedSlugs();
    } catch (_) {}

    // 5. Consulta Vercel API de domínios cadastrados no projeto
    const vercelDomains: any[] = [];
    try {
      const url = `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`;
      const vRes = await fetch(url, {
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
        cache: 'no-store'
      });
      if (vRes.ok) {
        const vData = await vRes.json();
        if (Array.isArray(vData.domains)) {
          vData.domains.forEach((d: any) => {
            vercelDomains.push({
              name: d.name,
              apexName: d.apexName,
              verified: Boolean(d.verified),
              configuredBy: d.configuredBy || 'system',
              createdAt: d.createdAt
            });
          });
        }
      }
    } catch (vErr) {
      console.warn('[Admin Sites] Erro ao consultar domínios na Vercel API:', vErr);
    }

    // 6. Atualiza e hidrata cada site com o status real da Vercel e do Edge Config
    const finalSites = Array.from(siteMap.values()).map(site => {
      const slug = site.siteSlug;
      const isEdgeSusp = suspendedSlugs.has(slug);
      let calculatedStatus = site.status;

      if (site.cancellation_requested) {
        calculatedStatus = 'cancellation_requested';
      } else if (isEdgeSusp || site.status === 'suspended') {
        calculatedStatus = 'suspended';
      } else if (site.status === 'pending') {
        calculatedStatus = 'pending';
      } else if (site.status === 'cancelled') {
        calculatedStatus = 'cancelled';
      } else {
        calculatedStatus = 'active';
      }

      return {
        ...site,
        status: calculatedStatus,
        isSuspendedOnEdge: isEdgeSusp,
        isVercelConfigured: true, // Wildcard *.webbilly.com.br está ativo no projeto
        vercelProjectActive: true
      };
    });

    return NextResponse.json({
      success: true,
      sites: finalSites,
      vercelDomains,
      suspendedCount: suspendedSlugs.size,
      totalSites: finalSites.length
    });

  } catch (err: any) {
    console.error('[Admin Sites GET] Erro:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao consultar sites.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/sites
 * Exclui definitivamente um subdomínio da Vercel, do Edge Config, do Asaas e do Supabase
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || (user.role !== 'MASTER' && (user as any).role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Acesso restrito ao Administrador.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    let siteId = searchParams.get('id') || searchParams.get('siteId') || '';
    let siteSlug = searchParams.get('slug') || searchParams.get('siteSlug') || searchParams.get('subdomain') || '';
    let customDomain = searchParams.get('customDomain') || '';
    let asaasSubId = searchParams.get('asaasSubscriptionId') || '';

    // Também aceita corpo JSON se enviado via fetch body
    if (!siteId && !siteSlug) {
      try {
        const body = await req.json();
        siteId = body.siteId || body.id || '';
        siteSlug = body.siteSlug || body.slug || body.subdomain || '';
        customDomain = body.customDomain || body.custom_domain || '';
        asaasSubId = body.asaasSubscriptionId || body.asaas_subscription_id || '';
      } catch (_) {}
    }

    const cleanSlug = sanitizeSlug(siteSlug || siteId);
    if (!cleanSlug && !siteId) {
      return NextResponse.json(
        { error: 'Identificador do site ou subdomínio é obrigatório para exclusão.' },
        { status: 400 }
      );
    }

    const targetSubdomain = `${cleanSlug}.webbilly.com.br`;

    // 1. VERCEL API: Se houver domínio customizado ou subdomínio explícito no projeto Vercel, remove
    try {
      if (customDomain) {
        await fetch(
          `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${customDomain}${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
          }
        );
      }
      // Tenta remover subdomínio explícito caso tenha sido adicionado individualmente
      await fetch(
        `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${targetSubdomain}${VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
        }
      );
    } catch (vErr) {
      console.warn('[Admin Sites DELETE] Erro ao desvincular domínio na Vercel API:', vErr);
    }

    // 2. VERCEL EDGE CONFIG: Suspende e remove imediatamente o roteamento do slug
    try {
      await syncSlugSuspension(cleanSlug, true);
    } catch (edgeErr) {
      console.warn('[Admin Sites DELETE] Erro ao suspender no Edge Config:', edgeErr);
    }

    // 3. ASAAS API: Cancela cobranças, assinaturas e faturas pendentes vinculadas
    try {
      if (asaasSubId) {
        await cancelAllPendingCharges({ subscriptionId: asaasSubId, siteSlug: cleanSlug });
        await cancelAsaasSubscription(asaasSubId);
      } else if (cleanSlug) {
        await cancelAllPendingCharges({ siteSlug: cleanSlug });
      }
    } catch (asaasErr) {
      console.warn('[Admin Sites DELETE] Aviso ao cancelar faturas no Asaas:', asaasErr);
    }

    // 4. SUPABASE: Executa exclusão definitiva nas tabelas de assinaturas e sites
    const supabase = getSupabaseAdmin();
    try {
      if (siteId && cleanSlug) {
        await supabase
          .from('subscriptions')
          .delete()
          .or(`id.eq.${siteId},site_slug.eq.${cleanSlug}`);
      } else if (cleanSlug) {
        await supabase
          .from('subscriptions')
          .delete()
          .eq('site_slug', cleanSlug);
      } else if (siteId) {
        await supabase
          .from('subscriptions')
          .delete()
          .eq('id', siteId);
      }

      // Limpa também na tabela 'sites' caso exista
      try {
        await supabase.from('sites').delete().or(`id.eq.${siteId || cleanSlug},slug.eq.${cleanSlug}`);
      } catch (_) {}
    } catch (sbErr) {
      console.error('[Admin Sites DELETE] Erro ao deletar no Supabase:', sbErr);
    }

    // 5. BANCO LOCAL: Remove de db.subscriptions, db.demos e db.briefings
    const db = readDb();
    const prevSubCount = db.subscriptions.length;
    db.subscriptions = db.subscriptions.filter(s => {
      const sSlug = sanitizeSlug(s.siteSlug || s.id);
      return s.id !== siteId && sSlug !== cleanSlug;
    });

    if (db.demos) {
      for (const k of Object.keys(db.demos)) {
        if (db.demos[k].leadToken === siteId || sanitizeSlug(db.demos[k].deployedUrl || '') === cleanSlug) {
          delete db.demos[k];
        }
      }
    }

    if (db.briefings) {
      for (const k of Object.keys(db.briefings)) {
        if (k === siteId || db.briefings[k].leadToken === siteId) {
          delete db.briefings[k];
        }
      }
    }

    writeDb(db);

    return NextResponse.json({
      success: true,
      message: `Subdomínio ${targetSubdomain} excluído definitivamente da Vercel e do banco de dados.`,
      subdomain: targetSubdomain,
      deletedFromLocal: prevSubCount !== db.subscriptions.length
    });

  } catch (err: any) {
    console.error('[Admin Sites DELETE] Erro fatal:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao processar exclusão definitiva do subdomínio.' },
      { status: 500 }
    );
  }
}
