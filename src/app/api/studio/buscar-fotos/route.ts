import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export interface RealPhotoItem {
  id: string;
  url: string;
  title: string;
  source: 'google' | 'instagram' | 'web';
  width?: number;
  height?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      businessName = '',
      city = '',
      niche = '',
      instagram = '',
      query: customQuery = ''
    } = body;

    const SERPER_KEY = (process.env.SERPER_API_KEY || '').trim();
    const GOOGLE_PLACES_KEY = (process.env.GOOGLE_PLACES_API_KEY || '').trim();

    const cleanInstagram = (instagram || '').replace(/^@/, '').replace(/https?:\/\/(?:www\.)?instagram\.com\//i, '').trim();

    // Monta o termo de busca principal
    let searchQuery = customQuery.trim();
    if (!searchQuery) {
      if (cleanInstagram) {
        searchQuery = `${cleanInstagram} ${businessName} ${city}`.trim();
      } else {
        searchQuery = `${businessName} ${city} ${niche}`.trim() || 'Comércio Local';
      }
    }

    const photos: RealPhotoItem[] = [];
    const seenUrls = new Set<string>();

    const addPhoto = (url: string, title: string, source: 'google' | 'instagram' | 'web') => {
      if (!url || typeof url !== 'string') return;
      const cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http')) return;
      // Filtra ícones minúsculos ou trackers
      if (cleanUrl.includes('favicon') || cleanUrl.includes('tracking') || cleanUrl.includes('.svg')) return;
      if (seenUrls.has(cleanUrl)) return;
      seenUrls.add(cleanUrl);
      photos.push({
        id: `photo_${photos.length + 1}_${Math.random().toString(36).substring(2, 7)}`,
        url: cleanUrl,
        title: title || businessName || 'Foto do Estabelecimento',
        source
      });
    };

    // -------------------------------------------------------------------------
    // 1. PROVEDOR: Serper Images API (Google Imagens Real com Chave Oficial)
    // -------------------------------------------------------------------------
    if (SERPER_KEY) {
      try {
        console.log('[Buscar Fotos] Consultando Serper Images API para:', searchQuery);
        const serperRes = await fetch('https://google.serper.dev/images', {
          method: 'POST',
          headers: {
            'X-API-KEY': SERPER_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: searchQuery,
            gl: 'br',
            hl: 'pt-br',
            num: 20
          }),
          signal: AbortSignal.timeout(6000),
          cache: 'no-store'
        });

        if (serperRes.ok) {
          const serperJson = await serperRes.json().catch(() => ({}));
          if (Array.isArray(serperJson.images)) {
            serperJson.images.forEach((img: any) => {
              const src = img.source?.toLowerCase().includes('instagram') ? 'instagram' : 'google';
              addPhoto(img.imageUrl || img.thumbnailUrl, img.title, src);
            });
          }
        }
      } catch (err: any) {
        console.warn('[Buscar Fotos] Erro Serper Images:', err.message);
      }
    }

    // -------------------------------------------------------------------------
    // 2. PROVEDOR: Google Places API (New) Fotos Diretas (se chave válida)
    // -------------------------------------------------------------------------
    if (GOOGLE_PLACES_KEY && photos.length < 6) {
      try {
        const placesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_PLACES_KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.photos'
          },
          body: JSON.stringify({
            textQuery: `${businessName} em ${city}`,
            languageCode: 'pt-BR',
            maxResultCount: 2
          }),
          signal: AbortSignal.timeout(5000),
          cache: 'no-store'
        });

        if (placesRes.ok) {
          const pJson = await placesRes.json().catch(() => ({}));
          const targetPlace = pJson.places?.[0];
          if (Array.isArray(targetPlace?.photos)) {
            const photoPromises = targetPlace.photos.slice(0, 6).map(async (p: any) => {
              if (!p?.name) return null;
              try {
                const mediaRes = await fetch(
                  `https://places.googleapis.com/v1/${p.name}/media?maxWidthPx=1200&skipHttpRedirect=true&key=${GOOGLE_PLACES_KEY}`,
                  { signal: AbortSignal.timeout(4000), cache: 'no-store' }
                );
                if (mediaRes.ok) {
                  const mJson = await mediaRes.json().catch(() => ({}));
                  return mJson.photoUri || null;
                }
              } catch {}
              return null;
            });
            const resolved = await Promise.allSettled(photoPromises);
            resolved.forEach((r) => {
              if (r.status === 'fulfilled' && r.value) {
                addPhoto(r.value, `${businessName} (Google Maps Oficial)`, 'google');
              }
            });
          }
        }
      } catch (err: any) {
        console.warn('[Buscar Fotos] Erro Places Photos:', err.message);
      }
    }

    // -------------------------------------------------------------------------
    // 3. PROVEDOR: Radar Web de Fotos Reais (DuckDuckGo Engine - Sem Chaves)
    // -------------------------------------------------------------------------
    if (photos.length < 6) {
      try {
        const queryVariants = [
          searchQuery,
          cleanInstagram ? `site:instagram.com ${cleanInstagram}` : `${businessName} ${niche} ${city}`
        ].filter(Boolean);

        for (const variant of queryVariants) {
          if (photos.length >= 15) break;

          const tokenRes = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(variant)}`, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            signal: AbortSignal.timeout(4000),
            cache: 'no-store'
          });

          if (tokenRes.ok) {
            const html = await tokenRes.text();
            const vqdMatch = html.match(/vqd=["']?([0-9-]+)["']?/);
            const vqd = vqdMatch ? vqdMatch[1] : '';

            if (vqd) {
              const imgUrl = `https://duckduckgo.com/i.js?l=wt-wt&o=json&q=${encodeURIComponent(variant)}&vqd=${vqd}`;
              const imgRes = await fetch(imgUrl, {
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                signal: AbortSignal.timeout(5000),
                cache: 'no-store'
              });

              if (imgRes.ok) {
                const imgData = await imgRes.json().catch(() => ({}));
                if (Array.isArray(imgData.results)) {
                  imgData.results.slice(0, 15).forEach((item: any) => {
                    const isInsta = (item.url || item.image || '').includes('instagram') || (item.title || '').includes('Instagram');
                    addPhoto(item.image, item.title, isInsta ? 'instagram' : 'web');
                  });
                }
              }
            }
          }
        }
      } catch (err: any) {
        console.warn('[Buscar Fotos] Erro Web Radar:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      query: searchQuery,
      total: photos.length,
      photos
    });
  } catch (error: any) {
    console.error('[Buscar Fotos Fatal Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Erro ao buscar fotos do estabelecimento.',
        photos: []
      },
      { status: 500 }
    );
  }
}
