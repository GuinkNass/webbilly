import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { readDb } from '@/lib/db';
import { sanitizeSlug, getSiteFromCloudStorage, renderPreparationHtml } from '@/lib/site-storage';
import { getSupabaseAdmin } from '@/lib/supabase';
import { injectAnalyticsTracker } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cleanSlug = sanitizeSlug(slug);

    if (!cleanSlug) {
      return new NextResponse('Subdomínio inválido.', { status: 400 });
    }

    // 1. Tenta carregar do Supabase Storage (Fonte de Verdade Persistente na Nuvem Vercel)
    const cloudSite = await getSiteFromCloudStorage(cleanSlug);

    // Se o site existe mas ainda NÃO foi publicado (está em rascunho / aguardando deploy)
    if (cloudSite && (!cloudSite.isPublished || cloudSite.status === 'draft')) {
      return new NextResponse(renderPreparationHtml(cloudSite.businessName || cleanSlug, cleanSlug), {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      });
    }

    // Se o site foi publicado e tem o HTML exato gerado no Studio
    if (cloudSite && cloudSite.isPublished && cloudSite.html) {
      return new NextResponse(injectAnalyticsTracker(cloudSite.html), {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      });
    }

    // 2. Tenta carregar do Supabase (tabela subscriptions)
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data: subRow } = await supabase
          .from('subscriptions')
          .select('*')
          .or(`site_slug.eq.${cleanSlug},id.eq.sub_${cleanSlug}`)
          .maybeSingle();

        if (subRow) {
          if (subRow.status === 'draft' || subRow.site_status === 'draft') {
            return new NextResponse(renderPreparationHtml(subRow.client_name || cleanSlug, cleanSlug), {
              status: 200,
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
              }
            });
          }
          if (subRow.html_content || subRow.html) {
            return new NextResponse(injectAnalyticsTracker(subRow.html_content || subRow.html), {
              status: 200,
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
              }
            });
          }
        }
      }
    } catch (sbErr) {
      console.warn('[Public Site Render] Erro Supabase:', sbErr);
    }

    // 3. Tenta carregar do arquivo em disco (public/generated-sites/[slug]/index.html)
    try {
      const diskPath = path.join(process.cwd(), 'public', 'generated-sites', cleanSlug, 'index.html');
      if (fs.existsSync(diskPath)) {
        const html = fs.readFileSync(diskPath, 'utf-8');
        return new NextResponse(injectAnalyticsTracker(html), {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
          }
        });
      }
    } catch (_) {}

    // 4. Tenta carregar do banco local (db.generatedSites)
    try {
      const db = readDb();
      if (db.generatedSites && db.generatedSites[cleanSlug]) {
        return new NextResponse(injectAnalyticsTracker(db.generatedSites[cleanSlug]), {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
          }
        });
      }
    } catch (_) {}

    // 5. Se o subdomínio não existe ou não foi publicado: exibe tela neutra de preparação
    return new NextResponse(renderPreparationHtml(cleanSlug, cleanSlug), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    });
  } catch (error: any) {
    console.error('[Public Site Render Error]', error);
    return new NextResponse('Erro interno ao renderizar página.', { status: 500 });
  }
}
