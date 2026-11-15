import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getSiteFromCloudStorage, formatSlugToTitle } from '@/lib/site-storage';

function extractSlugFromLeadToken(token: string): string {
  if (!token) return '';
  let s = token.trim().toLowerCase();
  s = s.replace(/^lead_/, '').replace(/^brf_/, '').replace(/^sub_/, '');
  s = s.replace(/_[a-z0-9]{4,14}$/i, '');
  return s.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leadToken: string }> }
) {
  try {
    const { leadToken } = await params;
    const cleanToken = (leadToken || '').trim();
    const candidateSlug = extractSlugFromLeadToken(cleanToken);

    const db = readDb();
    const briefing = db.briefings?.[cleanToken];
    const demo = db.demos?.[cleanToken];

    // Localiza assinatura prévia no db local
    let sub = (db.subscriptions || []).find(
      s =>
        s.leadToken === cleanToken ||
        (candidateSlug && s.siteSlug === candidateSlug) ||
        s.siteSlug === cleanToken
    );

    // Tenta complementar com o Supabase se necessário
    let supaSub: any = null;
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .or(`lead_token.eq.${cleanToken},site_slug.eq.${candidateSlug || cleanToken},id.eq.${cleanToken}`)
        .limit(1);
      if (data && data.length > 0) {
        supaSub = data[0];
      }
    } catch (e) {
      // ignore
    }

    // Tenta carregar dados do Cloud Storage se ainda não temos o título
    let cloudData = null;
    if (candidateSlug) {
      try {
        cloudData = await getSiteFromCloudStorage(candidateSlug);
      } catch (e) {
        // ignore
      }
    }

    const resolvedSlug =
      sub?.siteSlug ||
      supaSub?.site_slug ||
      cloudData?.slug ||
      candidateSlug ||
      'site';

    let title =
      demo?.title ||
      sub?.clientName ||
      supaSub?.client_name ||
      cloudData?.businessName ||
      briefing?.title;

    if (!title || title.trim().toLowerCase() === 'empresa parceira') {
      title = resolvedSlug && resolvedSlug !== 'site'
        ? formatSlugToTitle(resolvedSlug)
        : 'Sua Empresa';
    }

    const category =
      demo?.category ||
      cloudData?.niche ||
      briefing?.category ||
      'Comércio Local';

    const phone =
      demo?.phone ||
      sub?.clientPhone ||
      supaSub?.client_phone ||
      briefing?.phone ||
      '';

    const isDeclined =
      briefing?.status === 'declined' ||
      briefing?.status === 'RECUSADO' ||
      sub?.status === 'cancelled' ||
      supaSub?.status === 'cancelled';

    const suggestedDomain = resolvedSlug
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    const domains = [
      { domain: `${suggestedDomain}.com.br`, available: true, price: 'R$ 40,00/ano' },
      { domain: `${suggestedDomain}oficial.com.br`, available: true, price: 'R$ 40,00/ano' }
    ];

    const pixKey = db.adminSettings?.pixGatewayKey || 'pix@billysuite.com.br';
    const pixName = 'BILLY SUITE';
    const pixCity = 'SAO PAULO';
    const amount = 490;
    const txid = `PROPOSTA${cleanToken.slice(0, 16).toUpperCase()}`;

    // Payload básico Copia e Cola Pix
    const pixPayload = `00020126580014BR.GOV.BCB.PIX0136${pixKey}520400005303986540${amount.toFixed(2)}5802BR5911${pixName}6009${pixCity}62170513${txid}6304ABCD`;

    const asaasCheckoutUrl =
      sub?.asaasInvoiceUrl ||
      supaSub?.checkout_url ||
      sub?.checkoutUrl ||
      `/api/asaas/create-checkout?leadToken=${encodeURIComponent(cleanToken)}&slug=${encodeURIComponent(resolvedSlug)}`;

    const acceptedTermsAt =
      sub?.accepted_terms_at ||
      supaSub?.accepted_terms_at ||
      (briefing as any)?.accepted_terms_at ||
      null;

    return NextResponse.json({
      success: true,
      leadToken: cleanToken,
      slug: resolvedSlug,
      isDeclined,
      lead: {
        title,
        category,
        phone,
        suggestedPrice: amount,
        subdomain: `${resolvedSlug}.webbilly.com.br`,
        accepted_terms_at: acceptedTermsAt
      },
      domains,
      subscription: {
        status: sub?.status || supaSub?.status || 'pending',
        monthlyPrice: sub?.monthlyPrice || supaSub?.monthly_price || 29.90,
        checkoutUrl: asaasCheckoutUrl
      },
      pix: {
        key: pixKey,
        name: pixName,
        city: pixCity,
        amount,
        txid,
        payload: pixPayload,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixPayload)}`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erro ao carregar proposta' },
      { status: 500 }
    );
  }
}
