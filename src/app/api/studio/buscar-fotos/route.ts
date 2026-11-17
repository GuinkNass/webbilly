import { NextRequest, NextResponse } from 'next/server';
import { extractInstagramPostImageUrl, validateImageUrl } from '@/lib/instagram-extractor';

export const dynamic = 'force-dynamic';
export const maxDuration = 45;

export interface RealPhotoItem {
  id: string;
  url: string;
  proxyUrl?: string;
  title: string;
  source: 'google' | 'instagram' | 'web';
  width?: number;
  height?: number;
}

// Acervo curado HD por nicho caso a web retorne poucas fotos válidas
const CURATED_NICHE_BACKUP: Record<string, Array<{ url: string; title: string }>> = {
  tattoo: [
    { url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=1200&auto=format&fit=crop&q=80', title: 'Tatuagem Autoral Fine Line' },
    { url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=1200&auto=format&fit=crop&q=80', title: 'Estúdio de Tatuagem Profissional' },
    { url: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=1200&auto=format&fit=crop&q=80', title: 'Aplicação de Piercing em Titânio' },
    { url: 'https://images.unsplash.com/photo-1590246814883-578336214150?w=1200&auto=format&fit=crop&q=80', title: 'Materiais Esterilizados e Biossegurança' },
    { url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=1200&auto=format&fit=crop&q=80', title: 'Arte Autoral na Pele' },
    { url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80', title: 'Ilustração e Criação de Projetos' }
  ],
  barbearia: [
    { url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&auto=format&fit=crop&q=80', title: 'Corte Tradicional e Navalha' },
    { url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80', title: 'Ambiente Vintage e Clássico' },
    { url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1200&auto=format&fit=crop&q=80', title: 'Barboterapia com Toalha Quente' },
    { url: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=1200&auto=format&fit=crop&q=80', title: 'Corte Degradê Fade Master' }
  ],
  gastronomia: [
    { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80', title: 'Prato Assinatura do Chef' },
    { url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop&q=80', title: 'Burger Artesanal Especial' },
    { url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80', title: 'Pizza Forno a Lenha' },
    { url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&auto=format&fit=crop&q=80', title: 'Combinado Sushi Especial' }
  ],
  clinica: [
    { url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&auto=format&fit=crop&q=80', title: 'Consultório Odontológico Moderno' },
    { url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&auto=format&fit=crop&q=80', title: 'Recepção e Atendimento Clínico' },
    { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80', title: 'Procedimentos Estéticos Avançados' }
  ]
};

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
    const PIXABAY_KEY = (process.env.PIXABAY_API_KEY || '').trim();

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

    // Lista de candidatos brutos a foto
    const rawCandidates: Array<{ url: string; title: string; source: 'google' | 'instagram' | 'web' }> = [];
    const seenRawUrls = new Set<string>();

    const addCandidate = (url: string, title: string, source: 'google' | 'instagram' | 'web') => {
      if (!url || typeof url !== 'string') return;
      const cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http')) return;

      const lower = cleanUrl.toLowerCase();
      // Descarta ícones, trackers, svgs, tiktok e páginas de login
      if (
        lower.includes('favicon') ||
        lower.includes('tracking') ||
        lower.includes('.svg') ||
        lower.includes('tiktok.com') ||
        lower.includes('/accounts/login') ||
        lower.includes('/login/') ||
        lower.endsWith('.html') ||
        lower.endsWith('.htm') ||
        lower.endsWith('.php')
      ) {
        return;
      }

      if (seenRawUrls.has(cleanUrl)) return;
      seenRawUrls.add(cleanUrl);

      rawCandidates.push({
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
              addCandidate(img.imageUrl || img.thumbnailUrl, img.title, src);
            });
          }
        }
      } catch (err: any) {
        console.warn('[Buscar Fotos] Erro Serper Images:', err.message);
      }
    }

    // -------------------------------------------------------------------------
    // 2. PROVEDOR: Google Places API Fotos Diretas
    // -------------------------------------------------------------------------
    if (GOOGLE_PLACES_KEY && rawCandidates.length < 8) {
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
            const photoPromises = targetPlace.photos.slice(0, 8).map(async (p: any) => {
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
                addCandidate(r.value, `${businessName} (Google Maps Oficial)`, 'google');
              }
            });
          }
        }
      } catch (err: any) {
        console.warn('[Buscar Fotos] Erro Places Photos:', err.message);
      }
    }

    // -------------------------------------------------------------------------
    // 3. PROVEDOR: Radar Web de Fotos Reais (DuckDuckGo Engine)
    // -------------------------------------------------------------------------
    if (rawCandidates.length < 15) {
      try {
        const queryVariants = [
          searchQuery,
          cleanInstagram ? `site:instagram.com ${cleanInstagram}` : `${businessName} ${niche} ${city}`
        ].filter(Boolean);

        for (const variant of queryVariants) {
          if (rawCandidates.length >= 25) break;

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
                    addCandidate(item.image, item.title, isInsta ? 'instagram' : 'web');
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

    // -------------------------------------------------------------------------
    // 4. PROVEDOR: Radar Web Bing Imagens
    // -------------------------------------------------------------------------
    if (rawCandidates.length < 20) {
      try {
        const bingQuery = cleanInstagram ? `${cleanInstagram} instagram ${businessName}` : `${businessName} ${city}`;
        const bingRes = await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(bingQuery)}&form=HDRSC2&first=1`, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
          },
          signal: AbortSignal.timeout(5000),
          cache: 'no-store'
        });

        if (bingRes.ok) {
          const html = await bingRes.text();
          const matches = [...html.matchAll(/murl&quot;:&quot;(https?:\/\/[^&]+)&quot;/g)].map((m) => m[1]);
          for (const rawImg of matches.slice(0, 20)) {
            if (rawCandidates.length >= 35) break;
            const isInsta = rawImg.includes('instagram') || rawImg.includes('fbcdn') || rawImg.includes('cdninstagram');
            addCandidate(rawImg, `${businessName} (Foto Oficial)`, isInsta ? 'instagram' : 'web');
          }
        }
      } catch (bingErr: any) {
        console.warn('[Buscar Fotos] Erro Bing Images Radar:', bingErr?.message);
      }
    }

    // -------------------------------------------------------------------------
    // 5. PROCESSAMENTO: Extração Real de Posts do Instagram (facebookexternalhit)
    // -------------------------------------------------------------------------
    const resolvedCandidates = await Promise.allSettled(
      rawCandidates.map(async (item) => {
        let finalUrl = item.url;
        // Se for URL de post/reel/tv do Instagram, extrai a imagem real og:image
        if (/(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\//i.test(item.url)) {
          const directImg = await extractInstagramPostImageUrl(item.url);
          if (directImg) {
            finalUrl = directImg;
          } else {
            // Se falhou em extrair o post do Instagram, descarta para não quebrar no frontend
            return null;
          }
        }
        return { ...item, url: finalUrl };
      })
    );

    const extractedCandidates = resolvedCandidates
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value !== null)
      .map((r) => r.value);

    // -------------------------------------------------------------------------
    // 6. FILTRO RÍGIDO: Validação Binária em Paralelo (Content-Type image/*)
    // -------------------------------------------------------------------------
    const validationResults = await Promise.allSettled(
      extractedCandidates.map(async (item) => {
        const val = await validateImageUrl(item.url, 2800);
        return { item, valid: val.valid };
      })
    );

    const verifiedPhotos: RealPhotoItem[] = [];
    const verifiedUrls = new Set<string>();

    for (const res of validationResults) {
      if (res.status === 'fulfilled' && res.value.valid) {
        const { item } = res.value;
        if (!verifiedUrls.has(item.url)) {
          verifiedUrls.add(item.url);
          verifiedPhotos.push({
            id: `photo_${verifiedPhotos.length + 1}_${Math.random().toString(36).substring(2, 7)}`,
            url: item.url,
            proxyUrl: `/api/studio/image-proxy?url=${encodeURIComponent(item.url)}`,
            title: item.title,
            source: item.source
          });
        }
      }
    }

    // -------------------------------------------------------------------------
    // 7. COMPLEMENTAÇÃO AUTOMÁTICA VIA PIXABAY / CURATED CASO FALTEM FOTOS
    // -------------------------------------------------------------------------
    if (verifiedPhotos.length < 12) {
      const nicheQuery = niche || businessName || 'comercio local';

      // Tenta Pixabay se houver chave configurada
      if (PIXABAY_KEY) {
        try {
          const pixEndpoint = `https://pixabay.com/api/?key=${encodeURIComponent(PIXABAY_KEY)}&q=${encodeURIComponent(nicheQuery)}&image_type=photo&per_page=15&safesearch=true&lang=pt`;
          const pixRes = await fetch(pixEndpoint, { signal: AbortSignal.timeout(4000) });
          if (pixRes.ok) {
            const pixData = await pixRes.json().catch(() => ({}));
            if (Array.isArray(pixData.hits)) {
              for (const hit of pixData.hits) {
                if (verifiedPhotos.length >= 20) break;
                const imgUrl = hit.largeImageURL || hit.webformatURL;
                if (imgUrl && !verifiedUrls.has(imgUrl)) {
                  verifiedUrls.add(imgUrl);
                  verifiedPhotos.push({
                    id: `pix_${hit.id || verifiedPhotos.length + 1}`,
                    url: imgUrl,
                    proxyUrl: `/api/studio/image-proxy?url=${encodeURIComponent(imgUrl)}`,
                    title: `${businessName} (Foto Conceitual HD)`,
                    source: 'web'
                  });
                }
              }
            }
          }
        } catch (pixErr: any) {
          console.warn('[Buscar Fotos] Erro Pixabay Backup:', pixErr?.message);
        }
      }

      // Se ainda faltar, adiciona fotos do Acervo Curado do Nicho
      if (verifiedPhotos.length < 12) {
        const lowerNiche = (niche || businessName).toLowerCase();
        let nicheCategory = 'tattoo';
        if (/barbe|barba|corte/i.test(lowerNiche)) nicheCategory = 'barbearia';
        else if (/restaurante|pizza|burger|comida|gourmet/i.test(lowerNiche)) nicheCategory = 'gastronomia';
        else if (/clinica|odonto|medico|estetic|saude/i.test(lowerNiche)) nicheCategory = 'clinica';

        const backupList = CURATED_NICHE_BACKUP[nicheCategory] || CURATED_NICHE_BACKUP.tattoo;
        for (const item of backupList) {
          if (verifiedPhotos.length >= 18) break;
          if (!verifiedUrls.has(item.url)) {
            verifiedUrls.add(item.url);
            verifiedPhotos.push({
              id: `curated_${verifiedPhotos.length + 1}`,
              url: item.url,
              proxyUrl: `/api/studio/image-proxy?url=${encodeURIComponent(item.url)}`,
              title: `${businessName} (${item.title})`,
              source: 'google'
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      query: searchQuery,
      total: verifiedPhotos.length,
      photos: verifiedPhotos
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
