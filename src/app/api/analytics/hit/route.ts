import { NextRequest, NextResponse } from 'next/server';
import { recordSiteHit } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

export async function POST(req: NextRequest) {
  try {
    const userAgent = req.headers.get('user-agent') || '';

    // Filtra bots, crawlers, spiders e emuladores headless
    if (
      /bot|crawler|spider|headless|lighthouse|pingdom|googlebot|bingbot|yandex|baiduspider|facebookexternalhit|slurp|facebookplatform|twitterbot|whatsapp/i.test(
        userAgent
      )
    ) {
      return NextResponse.json({ ok: false, ignored: 'bot' }, { headers: CORS_HEADERS });
    }

    // Lê o body (suporta application/json ou text/plain do sendBeacon)
    let body: any = {};
    try {
      const rawText = await req.text();
      body = JSON.parse(rawText);
    } catch (_) {
      return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400, headers: CORS_HEADERS });
    }

    const { domain, event, isUnique } = body;
    if (!domain || (event !== 'pageview' && event !== 'whatsapp_click')) {
      return NextResponse.json({ ok: false, error: 'Parâmetros incompletos' }, { status: 400, headers: CORS_HEADERS });
    }

    // Detecta se é mobile pelo User-Agent
    const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(userAgent);

    // Registra o hit de forma assíncrona/atômica
    await recordSiteHit({
      domain,
      event,
      isMobile,
      isUnique: Boolean(isUnique)
    });

    return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error('[Analytics Hit Error]:', err);
    return NextResponse.json({ ok: false, error: err?.message || 'Internal Error' }, { status: 500, headers: CORS_HEADERS });
  }
}
