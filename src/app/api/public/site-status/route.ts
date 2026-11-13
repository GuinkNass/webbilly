import { NextRequest, NextResponse } from 'next/server';
import { fetchCloudSuspendedSlugs, sanitizeSlug, resolveSiteBySlug } from '@/lib/site-storage';
import { fetchSiteFromSupabase, fetchAllOperatorsFromSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSlug = searchParams.get('slug') || '';
    const slug = sanitizeSlug(rawSlug);

    if (!slug) {
      return NextResponse.json({ error: 'Slug obrigatório' }, { status: 400 });
    }

    const cloudSuspended = await fetchCloudSuspendedSlugs();
    const isSuspended = cloudSuspended.has(slug);

    let operatorInfo: { name: string; corporateEmail: string } | null = null;
    try {
      const supabaseSite = await fetchSiteFromSupabase(slug);
      const site = supabaseSite || (await resolveSiteBySlug(slug));
      if (site) {
        const allOps = await fetchAllOperatorsFromSupabase();
        const op = allOps.find(o =>
          ((site as any).operatorId && o.id === (site as any).operatorId) ||
          (site.operatorToken && (o.serialToken || '').trim().toUpperCase() === site.operatorToken.trim().toUpperCase())
        );
        if (op) {
          operatorInfo = {
            name: op.name,
            corporateEmail: op.corporate_email || op.corporateEmail || op.email || 'contato@webbilly.com.br'
          };
        }
      }
    } catch (e) {
      // Falha não-bloqueante
    }

    return new NextResponse(
      JSON.stringify({
        slug,
        status: isSuspended ? 'suspended' : 'active',
        isSuspended,
        operator: operatorInfo,
        timestamp: Date.now()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
