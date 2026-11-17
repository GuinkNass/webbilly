import { NextRequest, NextResponse } from 'next/server';
import { extractInstagramPostImageUrl, validateImageUrl } from '@/lib/instagram-extractor';
import { getSupabaseAdmin } from '@/lib/supabase';
import fs from 'fs-extra';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

let siteAssetsBucketCreated = false;

async function ensureSiteAssetsBucket(supabase: any) {
  if (!supabase || siteAssetsBucketCreated) return;
  try {
    await supabase.storage.createBucket('site-assets', { public: true });
  } catch (_) {}
  siteAssetsBucketCreated = true;
}

/**
 * Faz download da imagem externa e salva de forma permanente no Supabase Storage (bucket 'site-assets')
 * ou no FS local como fallback, garantindo que o token de CDN do Instagram nunca expire.
 */
async function uploadImageToStorage(
  imageUrl: string,
  handle: string,
  index: number,
  supabase: any
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    if (!contentType.toLowerCase().startsWith('image/')) return null;

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length < 2000) return null; // descarta imagens vazias ou trackers

    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const cleanHandle = handle.replace(/[^a-zA-Z0-9_-]/g, '') || 'perfil';
    const filePath = `instagram/${cleanHandle}/${Date.now()}-${index}.${ext}`;

    // 1. Upload no Supabase Storage
    if (supabase) {
      await ensureSiteAssetsBucket(supabase);
      const { data, error } = await supabase.storage.from('site-assets').upload(filePath, buffer, {
        contentType,
        upsert: true
      });
      if (!error && data) {
        const { data: pubData } = supabase.storage.from('site-assets').getPublicUrl(filePath);
        if (pubData?.publicUrl) {
          return pubData.publicUrl;
        }
      }
    }

    // 2. Fallback FS local caso o Supabase não esteja conectado
    try {
      const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'instagram', cleanHandle);
      await fs.ensureDir(publicUploadsDir);
      const localFileName = `${Date.now()}-${index}.${ext}`;
      await fs.writeFile(path.join(publicUploadsDir, localFileName), buffer);
      return `/uploads/instagram/${cleanHandle}/${localFileName}`;
    } catch {
      // 3. Fallback via proxyUrl seguro
      return `/api/studio/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    }
  } catch (err: any) {
    console.warn(`[Apify Upload] Falha ao processar foto ${index} de @${handle}:`, err?.message);
    return null;
  }
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

    const APIFY_TOKEN = (process.env.APIFY_API_TOKEN || process.env.APIFY_TOKEN || '').trim();
    const SERPER_KEY = (process.env.SERPER_API_KEY || '').trim();
    const GOOGLE_PLACES_KEY = (process.env.GOOGLE_PLACES_API_KEY || '').trim();
    const PIXABAY_KEY = (process.env.PIXABAY_API_KEY || '').trim();
    const supabase = getSupabaseAdmin();

    // -------------------------------------------------------------------------
    // IDENTIFICAÇÃO DO HANDLE DO INSTAGRAM (@username)
    // -------------------------------------------------------------------------
    let targetHandle = (instagram || '')
      .replace(/^@/, '')
      .replace(/https?:\/\/(?:www\.)?instagram\.com\//i, '')
      .split('/')[0]
      .split('?')[0]
      .trim();

    // Se o usuário digitou "@handle" ou uma URL no campo de busca personalizada
    if (!targetHandle && customQuery) {
      const atMatch = customQuery.match(/@([a-zA-Z0-9._]{2,30})/);
      if (atMatch) {
        targetHandle = atMatch[1];
      } else {
        const urlMatch = customQuery.match(/(?:instagram\.com)\/([a-zA-Z0-9._]{2,30})/i);
        if (urlMatch) {
          targetHandle = urlMatch[1];
        }
      }
    }

    // Se ainda não temos o handle, busca automaticamente no Google/Serper o perfil do comércio
    if (!targetHandle && SERPER_KEY && businessName) {
      try {
        const discoRes = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': SERPER_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: `site:instagram.com "${businessName}" ${city}`,
            gl: 'br',
            hl: 'pt-br',
            num: 5
          }),
          signal: AbortSignal.timeout(4000),
          cache: 'no-store'
        });

        if (discoRes.ok) {
          const discoJson = await discoRes.json().catch(() => ({}));
          const organic = discoJson.organic || [];
          for (const org of organic) {
            const link = org.link || '';
            const match = link.match(/(?:instagram\.com)\/([a-zA-Z0-9._]{2,30})\/?$/i);
            if (
              match &&
              !['p', 'reel', 'tv', 'explore', 'stories', 'direct', 'accounts', 'tags'].includes(
                match[1].toLowerCase()
              )
            ) {
              targetHandle = match[1];
              break;
            }
          }
        }
      } catch (err: any) {
        console.warn('[Buscar Fotos] Erro autodescoberta handle Instagram:', err?.message);
      }
    }

    // Termo de busca genérico para provedores auxiliares
    let searchQuery = customQuery.trim();
    if (!searchQuery) {
      if (targetHandle) {
        searchQuery = `${targetHandle} ${businessName} ${city}`.trim();
      } else {
        searchQuery = `${businessName} ${city} ${niche}`.trim() || 'Comércio Local';
      }
    }

    const verifiedPhotos: RealPhotoItem[] = [];
    const seenUrls = new Set<string>();

    const addVerifiedPhoto = (
      url: string,
      title: string,
      source: 'google' | 'instagram' | 'web',
      proxyUrl?: string
    ) => {
      if (!url || typeof url !== 'string') return;
      const cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http') && !cleanUrl.startsWith('/uploads')) return;
      if (seenUrls.has(cleanUrl)) return;
      seenUrls.add(cleanUrl);

      verifiedPhotos.push({
        id: `photo_${verifiedPhotos.length + 1}_${Math.random().toString(36).substring(2, 7)}`,
        url: cleanUrl,
        proxyUrl: proxyUrl || (cleanUrl.startsWith('/uploads') ? cleanUrl : `/api/studio/image-proxy?url=${encodeURIComponent(cleanUrl)}`),
        title: title || businessName || 'Foto do Estabelecimento',
        source
      });
    };

    // -------------------------------------------------------------------------
    // 1. PROVEDOR PRINCIPAL: APIFY INSTAGRAM PROFILE SCRAPER COM PERSISTÊNCIA SUPABASE
    // -------------------------------------------------------------------------
    if (APIFY_TOKEN && targetHandle) {
      try {
        const apifyUrl = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(
          APIFY_TOKEN
        )}&timeout=25`;

        const apifyRes = await fetch(apifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            usernames: [targetHandle],
            resultsLimit: 12
          }),
          signal: AbortSignal.timeout(26000),
          cache: 'no-store'
        });

        if (apifyRes.ok) {
          const items = await apifyRes.json().catch(() => []);
          if (Array.isArray(items) && items.length > 0) {
            const profile = items[0] || {};
            const rawApifyUrls: string[] = [];

            // Foto de perfil HD
            if (profile.profilePicUrlHD) {
              rawApifyUrls.push(profile.profilePicUrlHD);
            } else if (profile.profilePicUrl) {
              rawApifyUrls.push(profile.profilePicUrl);
            }

            // Posts recentes
            if (Array.isArray(profile.latestPosts)) {
              for (const post of profile.latestPosts) {
                if (rawApifyUrls.length >= 18) break;
                if (post.displayUrl) {
                  rawApifyUrls.push(post.displayUrl);
                }
                if (Array.isArray(post.images)) {
                  for (const subImg of post.images) {
                    if (typeof subImg === 'string' && subImg) {
                      rawApifyUrls.push(subImg);
                    }
                  }
                }
              }
            }

            // Deduplica e limita
            const uniqueApifyUrls = Array.from(new Set(rawApifyUrls)).slice(0, 16);

            // Upload em paralelo para o Supabase Storage
            const uploadSettled = await Promise.allSettled(
              uniqueApifyUrls.map((imgUrl, idx) =>
                uploadImageToStorage(imgUrl, targetHandle, idx, supabase)
              )
            );

            uploadSettled.forEach((res, idx) => {
              if (res.status === 'fulfilled' && res.value) {
                const finalStoredUrl = res.value;
                addVerifiedPhoto(
                  finalStoredUrl,
                  `${businessName || targetHandle} (@${targetHandle})`,
                  'instagram',
                  finalStoredUrl
                );
              }
            });
          }
        }
      } catch (apifyErr: any) {
        console.warn('[Buscar Fotos] Erro Apify Instagram Scraper:', apifyErr?.message);
      }
    }

    // -------------------------------------------------------------------------
    // 2. PROVEDOR: Google Places API Fotos Diretas Oficiais (se disponíveis)
    // -------------------------------------------------------------------------
    if (GOOGLE_PLACES_KEY && verifiedPhotos.length < 12) {
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
                addVerifiedPhoto(r.value, `${businessName} (Google Maps Oficial)`, 'google');
              }
            });
          }
        }
      } catch (err: any) {
        console.warn('[Buscar Fotos] Erro Places Photos:', err.message);
      }
    }

    // -------------------------------------------------------------------------
    // 3. RADAR DE FOTOS COMPLEMENTARES (Serper + DuckDuckGo + Bing)
    // -------------------------------------------------------------------------
    if (verifiedPhotos.length < 12) {
      const rawRadarCandidates: Array<{ url: string; title: string; source: 'google' | 'instagram' | 'web' }> = [];
      const seenRaw = new Set<string>();

      const addRawCandidate = (url: string, title: string, source: 'google' | 'instagram' | 'web') => {
        if (!url || typeof url !== 'string') return;
        const clean = url.trim();
        if (!clean.startsWith('http')) return;
        const lower = clean.toLowerCase();
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
        if (seenRaw.has(clean) || seenUrls.has(clean)) return;
        seenRaw.add(clean);
        rawRadarCandidates.push({ url: clean, title, source });
      };

      // Serper Images API
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
              num: 15
            }),
            signal: AbortSignal.timeout(5000),
            cache: 'no-store'
          });

          if (serperRes.ok) {
            const serperJson = await serperRes.json().catch(() => ({}));
            if (Array.isArray(serperJson.images)) {
              serperJson.images.forEach((img: any) => {
                const isInsta = img.source?.toLowerCase().includes('instagram');
                addRawCandidate(img.imageUrl || img.thumbnailUrl, img.title, isInsta ? 'instagram' : 'google');
              });
            }
          }
        } catch (err: any) {
          console.warn('[Buscar Fotos] Erro Serper Images Radar:', err?.message);
        }
      }

      // DuckDuckGo Radar
      if (rawRadarCandidates.length < 10) {
        try {
          const ddgQuery = targetHandle ? `site:instagram.com ${targetHandle}` : `${businessName} ${city}`;
          const tokenRes = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(ddgQuery)}`, {
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
              const imgUrl = `https://duckduckgo.com/i.js?l=wt-wt&o=json&q=${encodeURIComponent(ddgQuery)}&vqd=${vqd}`;
              const imgRes = await fetch(imgUrl, {
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                signal: AbortSignal.timeout(4000),
                cache: 'no-store'
              });

              if (imgRes.ok) {
                const imgData = await imgRes.json().catch(() => ({}));
                if (Array.isArray(imgData.results)) {
                  imgData.results.slice(0, 10).forEach((item: any) => {
                    const isInsta =
                      (item.url || item.image || '').includes('instagram') ||
                      (item.title || '').includes('Instagram');
                    addRawCandidate(item.image, item.title, isInsta ? 'instagram' : 'web');
                  });
                }
              }
            }
          }
        } catch (err: any) {
          console.warn('[Buscar Fotos] Erro Web Radar DDG:', err?.message);
        }
      }

      // Processamento e validação binária dos candidatos do radar
      const resolvedRadar = await Promise.allSettled(
        rawRadarCandidates.map(async (item) => {
          let finalUrl = item.url;
          if (/(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\//i.test(item.url)) {
            const directImg = await extractInstagramPostImageUrl(item.url);
            if (directImg) {
              finalUrl = directImg;
            } else {
              return null;
            }
          }
          const val = await validateImageUrl(finalUrl, 2500);
          if (val.valid) {
            return { ...item, url: finalUrl };
          }
          return null;
        })
      );

      for (const r of resolvedRadar) {
        if (r.status === 'fulfilled' && r.value) {
          if (verifiedPhotos.length >= 20) break;
          addVerifiedPhoto(r.value.url, r.value.title, r.value.source);
        }
      }
    }

    // -------------------------------------------------------------------------
    // 4. SMART FALLBACK: PIXABAY & ACERVO CURADO HD SE FALTAR FOTOS (< 8)
    // -------------------------------------------------------------------------
    if (verifiedPhotos.length < 8) {
      const nicheQuery = niche || businessName || 'comercio local';

      // Pixabay API se houver chave configurada
      if (PIXABAY_KEY) {
        try {
          const pixEndpoint = `https://pixabay.com/api/?key=${encodeURIComponent(
            PIXABAY_KEY
          )}&q=${encodeURIComponent(nicheQuery)}&image_type=photo&per_page=12&safesearch=true&lang=pt`;
          const pixRes = await fetch(pixEndpoint, { signal: AbortSignal.timeout(4000) });
          if (pixRes.ok) {
            const pixData = await pixRes.json().catch(() => ({}));
            if (Array.isArray(pixData.hits)) {
              for (const hit of pixData.hits) {
                if (verifiedPhotos.length >= 18) break;
                const imgUrl = hit.largeImageURL || hit.webformatURL;
                if (imgUrl) {
                  addVerifiedPhoto(imgUrl, `${businessName} (Foto Conceitual HD)`, 'web');
                }
              }
            }
          }
        } catch (pixErr: any) {
          console.warn('[Buscar Fotos] Erro Pixabay Backup:', pixErr?.message);
        }
      }

      // Acervo Curado do Nicho
      if (verifiedPhotos.length < 8) {
        const lowerNiche = (niche || businessName).toLowerCase();
        let nicheCategory = 'tattoo';
        if (/barbe|barba|corte/i.test(lowerNiche)) nicheCategory = 'barbearia';
        else if (/restaurante|pizza|burger|comida|gourmet/i.test(lowerNiche)) nicheCategory = 'gastronomia';
        else if (/clinica|odonto|medico|estetic|saude/i.test(lowerNiche)) nicheCategory = 'clinica';

        const backupList = CURATED_NICHE_BACKUP[nicheCategory] || CURATED_NICHE_BACKUP.tattoo;
        for (const item of backupList) {
          if (verifiedPhotos.length >= 16) break;
          addVerifiedPhoto(item.url, `${businessName} (${item.title})`, 'google');
        }
      }
    }

    return NextResponse.json({
      success: true,
      query: searchQuery,
      targetHandle: targetHandle || null,
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
