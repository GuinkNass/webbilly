import { NextRequest, NextResponse } from 'next/server';
import { extractInstagramPostImageUrl } from '@/lib/instagram-extractor';

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

    // Se for URL de post/reel/página do Instagram, tenta extrair a imagem og:image real
    if (/(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\//i.test(targetUrl)) {
      const extracted = await extractInstagramPostImageUrl(targetUrl);
      if (extracted) {
        targetUrl = extracted;
      }
    }

    const isMetaDomain =
      targetUrl.includes('instagram.com') ||
      targetUrl.includes('cdninstagram.com') ||
      targetUrl.includes('fbcdn.net');

    // Faz a requisição pelo servidor
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const userAgent = isMetaDomain
      ? 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

    const imageRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': isMetaDomain ? 'https://www.instagram.com/' : 'https://www.google.com/'
      },
      redirect: 'follow',
      signal: controller.signal,
      cache: 'no-store'
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (!imageRes || !imageRes.ok) {
      return new NextResponse('Imagem não encontrada na origem.', { status: 404 });
    }

    const contentType = (imageRes.headers.get('content-type') || '').toLowerCase();

    // Validação estrita: DEVE começar com image/
    if (!contentType.startsWith('image/')) {
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
