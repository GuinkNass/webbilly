import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Tenta headers comuns em ambientes de proxy/Vercel/Cloudflare
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfIp = req.headers.get('cf-connecting-ip');

    let ip = '127.0.0.1';

    if (forwardedFor) {
      // Pega o primeiro IP caso venha uma lista separada por vírgulas
      ip = forwardedFor.split(',')[0].trim();
    } else if (realIp) {
      ip = realIp.trim();
    } else if (cfIp) {
      ip = cfIp.trim();
    }

    // Se for localhost IPv6, converte para 127.0.0.1
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      ip = '127.0.0.1';
    }

    return NextResponse.json({
      success: true,
      ip,
      validationUrl: 'https://meuip.com.br',
      whitelistSettingsUrl: 'https://rclubbr.webpropanel.com/settings/pro-suite/api-settings',
      message: 'IP detectado com sucesso.'
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Erro ao detectar IP público.', ip: '127.0.0.1' },
      { status: 500 }
    );
  }
}
