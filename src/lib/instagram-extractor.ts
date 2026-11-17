/**
 * Utilitário para extração e validação de imagens do Instagram, Google e Web
 */

/**
 * Extrai o nome de usuário (@handle) limpo a partir de uma URL de perfil do Instagram
 * Suporta formatos:
 * - https://www.instagram.com/13pointtattoo/
 * - https://instagram.com/13pointtattoo?igsh=...
 * - instagram.com/13pointtattoo
 * - @13pointtattoo
 * Ignora rotas do sistema do Instagram (p, reel, explore, etc.)
 */
export function extractInstagramHandleFromUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  if (clean.startsWith('@')) {
    const handle = clean.replace(/^@+/, '').split('/')[0].split('?')[0].trim();
    return handle.length >= 2 ? handle : null;
  }
  const match = clean.match(/(?:instagram\.com|instagr\.am)\/([a-zA-Z0-9._]{2,30})/i);
  if (match) {
    const handle = match[1].toLowerCase();
    const reserved = ['p', 'reel', 'reels', 'tv', 'stories', 'explore', 'direct', 'accounts', 'tags', 'about', 'legal', 'help', 'developer'];
    if (!reserved.includes(handle)) {
      return match[1];
    }
  }
  return null;
}

/**
 * Extrai a URL real da imagem de alta resolução de um post ou reel do Instagram
 * utilizando o crawler oficial da Meta (facebookexternalhit/1.1)
 */
export async function extractInstagramPostImageUrl(url: string): Promise<string | null> {
  if (!url || typeof url !== 'string') return null;

  // Verifica se é um link de post, reel ou página do Instagram
  if (!/(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i.test(url)) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache'
      },
      redirect: 'follow',
      signal: controller.signal,
      cache: 'no-store'
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const html = await res.text();

    // Procura tags de meta imagem (og:image, twitter:image, og:image:secure_url)
    const ogMatch =
      html.match(/<meta\s+(?:property|name)=["'](?:og:image|og:image:secure_url|twitter:image)["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:image|og:image:secure_url|twitter:image)["']/i);

    if (ogMatch && ogMatch[1]) {
      // Decodifica entidades HTML como &amp; para &
      let directUrl = ogMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&#x26;/g, '&')
        .replace(/&#38;/g, '&')
        .trim();

      if (directUrl.startsWith('http')) {
        return directUrl;
      }
    }
  } catch (err: any) {
    // Falha silenciosa em caso de timeout
  }

  return null;
}

/**
 * Valida de forma rígida se uma URL responde HTTP 200/206 com Content-Type começando com image/
 * Descarta páginas HTML (404, 403, login do Instagram, TikTok, etc.)
 */
export async function validateImageUrl(url: string, timeoutMs: number = 3000): Promise<{ valid: boolean; contentType?: string }> {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return { valid: false };
  }

  // Descarta imediatamente URLs conhecidas de páginas e vídeos de redes sociais
  const lower = url.toLowerCase();
  if (
    lower.includes('tiktok.com') ||
    lower.includes('/accounts/login') ||
    lower.includes('/login/') ||
    lower.endsWith('.html') ||
    lower.endsWith('.htm') ||
    lower.endsWith('.php')
  ) {
    return { valid: false };
  }

  const isMetaDomain =
    lower.includes('instagram.com') ||
    lower.includes('cdninstagram.com') ||
    lower.includes('fbcdn.net');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Faz uma requisição GET com Range de 1KB para validar os cabeçalhos sem baixar a imagem inteira
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': isMetaDomain
          ? 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
          : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Range': 'bytes=0-1024',
        'Referer': 'https://www.google.com/'
      },
      redirect: 'follow',
      signal: controller.signal,
      cache: 'no-store'
    });

    clearTimeout(timeoutId);

    if (!res.ok && res.status !== 206) {
      return { valid: false };
    }

    const contentType = (res.headers.get('content-type') || '').toLowerCase();

    // Validação estrita: DEVE começar com image/
    if (contentType.startsWith('image/')) {
      return { valid: true, contentType };
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}
