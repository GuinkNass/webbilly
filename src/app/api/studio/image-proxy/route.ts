import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get('url');

    if (!rawUrl) {
      return new NextResponse('URL de imagem não informada.', { status: 400 });
    }

    let targetUrl: string;
    try {
      targetUrl = decodeURIComponent(rawUrl).trim();
    } catch {
      targetUrl = rawUrl.trim();
    }

    // Valida que é uma URL HTTP/HTTPS válida
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      return new NextResponse('Protocolo de imagem inválido.', { status: 400 });
    }

    // Faz a requisição pelo servidor sem enviar o Referer do Webbilly
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const imageRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      },
      redirect: 'follow',
      signal: controller.signal,
      cache: 'no-store'
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (!imageRes || !imageRes.ok) {
      return new NextResponse('Imagem não encontrada na origem.', { status: 404 });
    }

    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';

    // Se a resposta retornou HTML (ex: página de login ou erro disfarçado), trata como 404
    if (contentType.includes('text/html') || contentType.includes('application/json')) {
      return new NextResponse('Resposta não é uma imagem válida.', { status: 404 });
    }

    const arrayBuffer = await imageRes.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      }
    });
  } catch (error: any) {
    console.warn('[Image Proxy Error]:', error?.message || error);
    return new NextResponse('Erro ao carregar imagem.', { status: 404 });
  }
}
