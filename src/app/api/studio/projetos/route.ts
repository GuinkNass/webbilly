import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { readDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || 'operator';
    const operatorId = searchParams.get('operatorId') || '';
    const supabaseAdmin = getSupabaseAdmin();

    const projects: Array<{
      id: string;
      slug: string;
      name: string;
      niche: string;
      city?: string;
      phone?: string;
      whatsapp?: string;
      subdomainUrl: string;
      previewUrl: string;
      proposalUrl: string;
      leadToken?: string;
      status: string;
      createdAt: string;
      operatorId?: string;
    }> = [];

    // 1. Fetch from Supabase sites / subscriptions if available
    if (supabaseAdmin) {
      try {
        let query = supabaseAdmin
          .from('sites')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (role !== 'admin' && operatorId) {
          query = query.eq('operator_id', operatorId);
        }

        const { data: supaSites } = await query;
        if (Array.isArray(supaSites) && supaSites.length > 0) {
          for (const s of supaSites) {
            const slug = s.subdomain || s.slug || s.id;
            projects.push({
              id: s.id,
              slug,
              name: s.business_name || s.name || slug,
              niche: s.niche || 'Geral',
              city: s.city || '',
              phone: s.phone || s.whatsapp || '',
              whatsapp: s.whatsapp || s.phone || '',
              subdomainUrl: `https://${slug}.webbilly.com.br`,
              previewUrl: `/api/public/site/${slug}/render`,
              proposalUrl: `https://webbilly.com.br/proposta/${s.lead_token || s.id}`,
              leadToken: s.lead_token || s.id,
              status: s.status || 'published',
              createdAt: s.created_at || new Date().toISOString(),
              operatorId: s.operator_id,
            });
          }
        }
      } catch (err) {
        console.warn('[Studio Projetos] Error querying Supabase sites:', err);
      }
    }

    // 2. Fetch from local db subscriptions
    try {
      const db = readDb();
      const subscriptions = db.subscriptions || [];
      for (const sub of subscriptions) {
        const slug = sub.siteSlug;
        if (slug && !projects.find((p) => p.slug === slug)) {
          if (
            role === 'admin' ||
            !operatorId ||
            sub.operatorToken === operatorId ||
            sub.operatorName === operatorId
          ) {
            projects.push({
              id: sub.id || slug,
              slug,
              name: sub.clientName || slug,
              niche: 'Comércio Local',
              city: '',
              phone: sub.clientPhone || '',
              whatsapp: sub.clientPhone || '',
              subdomainUrl: `https://${slug}.webbilly.com.br`,
              previewUrl: `/api/public/site/${slug}/render`,
              proposalUrl: `https://webbilly.com.br/proposta/${sub.leadToken || sub.id || slug}`,
              leadToken: sub.leadToken || sub.id || slug,
              status: sub.status || 'active',
              createdAt: sub.createdAt || new Date().toISOString(),
              operatorId: sub.operatorToken,
            });
          }
        }
      }
    } catch (err) {
      console.warn('[Studio Projetos] Error reading local db subscriptions:', err);
    }

    return NextResponse.json({
      success: true,
      total: projects.length,
      projects,
    });
  } catch (error: any) {
    console.error('[Studio Projetos] Erro inesperado:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao carregar projetos do estúdio' },
      { status: 500 }
    );
  }
}
