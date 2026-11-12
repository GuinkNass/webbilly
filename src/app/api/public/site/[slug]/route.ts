import { NextRequest, NextResponse } from 'next/server';
import { resolveSiteBySlug, persistSite, sanitizeSlug } from '@/lib/site-storage';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cleanSlug = sanitizeSlug(slug);

    const site = await resolveSiteBySlug(cleanSlug);

    if (!site) {
      return NextResponse.json({
        found: false,
        error: `Nenhum site localizado para o subdomínio '${cleanSlug}'.`
      }, { status: 404 });
    }

    return NextResponse.json({
      found: true,
      siteSlug: site.siteSlug,
      clientName: site.clientName,
      status: site.status, // 'active' | 'suspended' | 'pending'
      deployedUrl: site.deployedUrl,
      monthlyPrice: site.monthlyPrice,
      checkoutUrl: site.checkoutUrl,
      nextRenewalDate: site.nextRenewalDate || null,
      lastPaymentDate: site.lastPaymentDate || null,
      subscription: site
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cleanSlug = sanitizeSlug(slug);
    const body = await req.json().catch(() => ({}));

    const saved = await persistSite({
      ...body,
      siteSlug: cleanSlug
    });

    return NextResponse.json({
      success: true,
      site: saved
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
