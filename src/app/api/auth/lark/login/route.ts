import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const appId = process.env.LARK_APP_ID;

    // Determina a redirectUri oficial
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const origin = host ? `${proto}://${host}` : req.nextUrl.origin;

    const redirectUri =
      process.env.NODE_ENV === 'production' && !host.includes('localhost')
        ? 'https://webbilly.com.br/api/auth/lark/callback'
        : `${origin}/api/auth/lark/callback`;

    if (!appId) {
      console.warn('[Lark Auth] LARK_APP_ID não configurado no ambiente.');
      return NextResponse.redirect(
        new URL('/operador/login?erro=lark_config_ausente', req.url)
      );
    }

    const authorizeUrl = `https://open.larksuite.com/open-apis/authen/v1/authorize?app_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=webbilly_operator`;

    return NextResponse.redirect(authorizeUrl);
  } catch (err: any) {
    console.error('[Lark Auth Login Error]:', err);
    return NextResponse.redirect(
      new URL('/operador/login?erro=lark_falha_inicializacao', req.url)
    );
  }
}
