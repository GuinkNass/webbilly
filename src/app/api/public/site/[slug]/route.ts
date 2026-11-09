import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const cleanSlug = slug.toLowerCase().trim();

    const db = readDb();
    const subscriptions = Array.isArray(db.subscriptions) ? db.subscriptions : [];
    
    // Procura assinatura por slug ou leadToken
    let sub = subscriptions.find(s => s.siteSlug === cleanSlug || s.leadToken === cleanSlug);

    // Se não houver assinatura direta, procura se existe em demos
    const demo = db.demos ? Object.values(db.demos).find(d => 
      (d.leadToken && (d.leadToken === cleanSlug || d.leadToken.includes(cleanSlug))) ||
      (d.title && d.title.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanSlug.replace(/[^a-z0-9]/g, '')))
    ) : null;

    if (!sub && !demo) {
      return NextResponse.json({
        found: false,
        error: `Nenhum site localizado para o subdomínio '${cleanSlug}'.`
      }, { status: 404 });
    }

    const clientName = sub?.clientName || demo?.title || `Comércio ${cleanSlug}`;
    const status = sub?.status || 'active';
    const deployedUrl = sub?.deployedUrl || demo?.deployedUrl || null;
    const monthlyPrice = sub?.monthlyPrice || 29.90;
    const checkoutUrl = sub?.checkoutUrl || `/api/subscription/create-checkout?slug=${cleanSlug}`;
    const nextRenewalDate = sub?.nextRenewalDate || null;

    return NextResponse.json({
      found: true,
      siteSlug: cleanSlug,
      clientName,
      status, // 'active' | 'suspended' | 'pending'
      deployedUrl,
      monthlyPrice,
      checkoutUrl,
      nextRenewalDate,
      subscription: sub || null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
