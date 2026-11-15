import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { readDb, writeDb } from '@/lib/db';
import { sanitizeSlug } from '@/lib/site-storage';

export const dynamic = 'force-dynamic';

const LEGACY_STORES_TO_IGNORE = [
  'shopee',
  'shein',
  'renner',
  'pichau',
  'kabum',
  'eletroclub',
  'magazine luiza',
  'magalu',
  'amazon',
  'aliexpress',
  'mercado livre',
  'mercadolivre'
];

function isLegacyStore(nameOrSlug: string): boolean {
  const clean = (nameOrSlug || '').toLowerCase().trim();
  // Se for apenas número (ex: "1", "2", "14")
  if (/^\d+$/.test(clean)) return true;
  return LEGACY_STORES_TO_IGNORE.some((store) => clean.includes(store));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || 'operator';
    const operatorId = searchParams.get('operatorId') || '';
    const supabaseAdmin = getSupabaseAdmin();

    const projectMap = new Map<string, any>();

    // 1. Busca sites reais do Webbilly na tabela 'subscriptions' do Supabase
    if (supabaseAdmin) {
      try {
        let subQuery = supabaseAdmin
          .from('subscriptions')
          .select('*')
          .order('created_at', { ascending: false });

        if (role !== 'admin' && operatorId) {
          subQuery = subQuery.or(`operator_id.eq.${operatorId},operator_token.eq.${operatorId}`);
        }

        const { data: supaSubs } = await subQuery;
        if (Array.isArray(supaSubs)) {
          for (const sub of supaSubs) {
            const rawSlug = sub.site_slug || sub.siteSlug || sub.subdomain || sub.id;
            const clean = sanitizeSlug(rawSlug);
            if (!clean || isLegacyStore(clean) || isLegacyStore(sub.client_name || '')) continue;

            projectMap.set(clean, {
              id: sub.id,
              slug: clean,
              name: sub.client_name || sub.clientName || clean,
              niche: sub.niche || 'Comércio Local',
              city: sub.city || '',
              phone: sub.client_phone || sub.clientPhone || '',
              whatsapp: sub.client_phone || sub.clientPhone || '',
              subdomainUrl: `https://${clean}.webbilly.com.br`,
              previewUrl: `/api/public/site/${clean}/render`,
              proposalUrl: `https://webbilly.com.br/proposta/${sub.lead_token || sub.id}`,
              leadToken: sub.lead_token || sub.id,
              status: sub.status || 'published',
              createdAt: sub.created_at || new Date().toISOString(),
              operatorId: sub.operator_id || sub.operator_token
            });
          }
        }
      } catch (err) {
        console.warn('[Studio Projetos] Aviso ao consultar subscriptions Supabase:', err);
      }
    }

    // 2. Busca sites na tabela 'sites' do Supabase (FILTRANDO RIGOROSAMENTE APENAS WEBBILLY)
    if (supabaseAdmin) {
      try {
        let sitesQuery = supabaseAdmin
          .from('sites')
          .select('*')
          .order('created_at', { ascending: false });

        if (role !== 'admin' && operatorId) {
          sitesQuery = sitesQuery.eq('operator_id', operatorId);
        }

        const { data: supaSites } = await sitesQuery;
        if (Array.isArray(supaSites)) {
          for (const s of supaSites) {
            const rawSlug = s.subdomain || s.slug || s.id;
            const clean = sanitizeSlug(rawSlug);
            const name = s.business_name || s.name || clean;

            // FILTRO RIGOROSO:
            // 1. Ignora se for apenas número (ex: "14")
            // 2. Ignora lojas legadas de e-commerce (Shopee, Shein, Renner, Pichau, etc.)
            // 3. Exige que tenha sido gerado pelo Webbilly (html_content ou operator_id ou slug alfanumérico com hífen)
            if (!clean || isLegacyStore(clean) || isLegacyStore(name)) continue;

            if (!projectMap.has(clean)) {
              projectMap.set(clean, {
                id: s.id,
                slug: clean,
                name,
                niche: s.niche || 'Comércio Local',
                city: s.city || '',
                phone: s.phone || s.whatsapp || '',
                whatsapp: s.whatsapp || s.phone || '',
                subdomainUrl: `https://${clean}.webbilly.com.br`,
                previewUrl: `/api/public/site/${clean}/render`,
                proposalUrl: `https://webbilly.com.br/proposta/${s.lead_token || s.id}`,
                leadToken: s.lead_token || s.id,
                status: s.status || 'published',
                createdAt: s.created_at || new Date().toISOString(),
                operatorId: s.operator_id
              });
            }
          }
        }
      } catch (err) {
        console.warn('[Studio Projetos] Aviso ao consultar sites Supabase:', err);
      }
    }

    // 3. Mescla com db local (db.subscriptions e db.demos)
    try {
      const db = readDb();
      const subscriptions = db.subscriptions || [];
      for (const sub of subscriptions) {
        const clean = sanitizeSlug(sub.siteSlug);
        if (!clean || isLegacyStore(clean) || isLegacyStore(sub.clientName || '')) continue;

        if (!projectMap.has(clean)) {
          if (
            role === 'admin' ||
            !operatorId ||
            sub.operatorToken === operatorId ||
            sub.operatorName === operatorId
          ) {
            projectMap.set(clean, {
              id: sub.id || clean,
              slug: clean,
              name: sub.clientName || clean,
              niche: 'Comércio Local',
              city: '',
              phone: sub.clientPhone || '',
              whatsapp: sub.clientPhone || '',
              subdomainUrl: `https://${clean}.webbilly.com.br`,
              previewUrl: `/api/public/site/${clean}/render`,
              proposalUrl: `https://webbilly.com.br/proposta/${sub.leadToken || sub.id || clean}`,
              leadToken: sub.leadToken || sub.id || clean,
              status: sub.status || 'active',
              createdAt: sub.createdAt || new Date().toISOString(),
              operatorId: sub.operatorToken
            });
          }
        }
      }
    } catch (_) {}

    const sortedProjects = Array.from(projectMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      total: sortedProjects.length,
      projects: sortedProjects
    });
  } catch (error: any) {
    console.error('[Studio Projetos GET Error]', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Falha ao listar projetos.', projects: [] },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/studio/projetos
 * Permite excluir rascunhos de testes e sites com 1 clique
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let slug = searchParams.get('slug') || searchParams.get('id');

    if (!slug) {
      const body = await req.json().catch(() => ({}));
      slug = body.slug || body.id;
    }

    const cleanSlug = sanitizeSlug(slug || '');
    if (!cleanSlug) {
      return NextResponse.json({ success: false, error: 'Subdomínio ou ID é obrigatório.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Exclui do Supabase
    if (supabase) {
      try {
        await supabase.from('sites').delete().or(`id.eq.${cleanSlug},subdomain.eq.${cleanSlug},slug.eq.${cleanSlug}`);
        await supabase.from('subscriptions').delete().or(`id.eq.sub_${cleanSlug},site_slug.eq.${cleanSlug}`);
      } catch (sbErr) {
        console.warn('[Studio Projetos DELETE] Aviso Supabase:', sbErr);
      }
    }

    // 2. Exclui do db.json local
    try {
      const db = readDb();
      if (db.generatedSites) delete db.generatedSites[cleanSlug];
      if (Array.isArray(db.subscriptions)) {
        db.subscriptions = db.subscriptions.filter((s) => s.siteSlug !== cleanSlug && s.id !== `sub_${cleanSlug}`);
      }
      writeDb(db);
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `Site ${cleanSlug} excluído com sucesso do histórico.`
    });
  } catch (error: any) {
    console.error('[Studio Projetos DELETE Error]', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao excluir projeto.' },
      { status: 500 }
    );
  }
}
