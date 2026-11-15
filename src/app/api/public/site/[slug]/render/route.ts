import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { readDb } from '@/lib/db';
import { sanitizeSlug } from '@/lib/site-storage';
import { getSupabaseAdmin } from '@/lib/supabase';
import { buildSiteHtml } from '@/lib/billy-desktop-port/generator';

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

    // 1. Tenta carregar do Supabase (Fonte de Verdade Persistente na Nuvem Vercel)
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        // Tenta na tabela 'sites'
        const { data: siteRow } = await supabase
          .from('sites')
          .select('*')
          .or(`subdomain.eq.${cleanSlug},id.eq.${cleanSlug},slug.eq.${cleanSlug}`)
          .maybeSingle();

        if (siteRow && (siteRow.html_content || siteRow.html || siteRow.content)) {
          const html = siteRow.html_content || siteRow.html || siteRow.content;
          return new NextResponse(html, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
            }
          });
        }

        // Tenta na tabela 'subscriptions'
        const { data: subRow } = await supabase
          .from('subscriptions')
          .select('*')
          .or(`site_slug.eq.${cleanSlug},id.eq.sub_${cleanSlug}`)
          .maybeSingle();

        if (subRow && (subRow.html_content || subRow.html || subRow.content)) {
          const html = subRow.html_content || subRow.html || subRow.content;
          return new NextResponse(html, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
            }
          });
        }
      }
    } catch (sbErr) {
      console.warn('[Public Site Render] Erro Supabase:', sbErr);
    }

    // 2. Tenta carregar do arquivo em disco (public/generated-sites/[slug]/index.html)
    try {
      const diskPath = path.join(process.cwd(), 'public', 'generated-sites', cleanSlug, 'index.html');
      if (fs.existsSync(diskPath)) {
        const html = fs.readFileSync(diskPath, 'utf-8');
        return new NextResponse(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
          }
        });
      }
    } catch (_) {}

    // 3. Tenta carregar do banco local (db.generatedSites ou db.demos)
    try {
      const db = readDb();
      if (db.generatedSites && db.generatedSites[cleanSlug]) {
        return new NextResponse(db.generatedSites[cleanSlug], {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
          }
        });
      }

      if (db.demos) {
        for (const k of Object.keys(db.demos)) {
          const d = db.demos[k];
          if ((d.leadToken === cleanSlug || d.deployedUrl?.includes(cleanSlug)) && (d as any).html) {
            return new NextResponse((d as any).html, {
              status: 200,
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
              }
            });
          }
        }
      }
    } catch (_) {}

    // 4. Se o site foi cadastrado mas o HTML não foi gerado, compila na hora sem travar
    const formattedTitle = cleanSlug
      .split('-')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const fallbackSite = await buildSiteHtml({
      businessName: formattedTitle,
      niche: 'Comércio Local',
      city: 'São Paulo - SP',
      subdomain: cleanSlug
    });

    return new NextResponse(fallbackSite.html, {
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
