import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { readDb } from '@/lib/db';
import { sanitizeSlug } from '@/lib/site-storage';
import { getSupabaseAdmin } from '@/lib/supabase';

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

    // 1. Tenta carregar do arquivo em disco (public/generated-sites/[slug]/index.html)
    try {
      const diskPath = path.join(process.cwd(), 'public', 'generated-sites', cleanSlug, 'index.html');
      if (fs.existsSync(diskPath)) {
        const html = fs.readFileSync(diskPath, 'utf-8');
        return new NextResponse(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=60, s-maxage=300'
          }
        });
      }
    } catch (_) {}

    // 2. Tenta carregar do banco local (db.generatedSites ou db.demos)
    try {
      const db = readDb();
      if (db.generatedSites && db.generatedSites[cleanSlug]) {
        return new NextResponse(db.generatedSites[cleanSlug], {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=60, s-maxage=300'
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
                'Cache-Control': 'public, max-age=60, s-maxage=300'
              }
            });
          }
        }
      }
    } catch (_) {}

    // 3. Tenta carregar do Supabase (tabela 'sites' ou 'subscriptions')
    try {
      const supabase = getSupabaseAdmin();
      const { data: siteRow } = await supabase
        .from('sites')
        .select('*')
        .or(`slug.eq.${cleanSlug},id.eq.${cleanSlug}`)
        .maybeSingle();

      if (siteRow && (siteRow.html || siteRow.content || siteRow.html_content)) {
        const html = siteRow.html || siteRow.content || siteRow.html_content;
        return new NextResponse(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=60, s-maxage=300'
          }
        });
      }
    } catch (_) {}

    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Site em Construção — Webbilly</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-[#07090e] text-white flex items-center justify-center min-h-screen p-6 text-center">
        <div class="max-w-md bg-[#0e121a] border border-white/10 p-8 rounded-2xl shadow-2xl">
          <div class="w-12 h-12 bg-[#84cc16]/20 text-[#84cc16] rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">W</div>
          <h1 class="text-xl font-bold mb-2">Site em Preparação</h1>
          <p class="text-xs text-zinc-400 mb-6">O subdomínio <code class="text-[#84cc16]">${cleanSlug}.webbilly.com.br</code> está reservado na plataforma Webbilly e aguarda a finalização de publicação.</p>
          <a href="https://webbilly.com.br" class="px-4 py-2 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] text-slate-950 font-bold text-xs transition inline-block">Conhecer a Webbilly</a>
        </div>
      </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (err: any) {
    return new NextResponse(`Erro ao renderizar site: ${err.message}`, { status: 500 });
  }
}
