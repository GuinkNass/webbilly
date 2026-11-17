import { NextRequest, NextResponse } from 'next/server';
import {
  extractInstagramPostImageUrl,
  validateImageUrl,
  extractInstagramHandleFromUrl
} from '@/lib/instagram-extractor';
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
 * ou no FS local como fallback, garantindo que URLs externas do Instagram ou Google Maps nunca expirem.
 */
async function uploadImageToStorage(
  imageUrl: string,
  folder: 'instagram' | 'google-maps',
  prefix: string,
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
    const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '') || 'item';
    const filePath = `${folder}/${cleanPrefix}/${Date.now()}-${index}.${ext}`;

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
      const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads', folder, cleanPrefix);
      await fs.ensureDir(publicUploadsDir);
      const localFileName = `${Date.now()}-${index}.${ext}`;
      await fs.writeFile(path.join(publicUploadsDir, localFileName), buffer);
      return `/uploads/${folder}/${cleanPrefix}/${localFileName}`;
    } catch {
      // 3. Fallback via proxyUrl seguro
      return `/api/studio/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    }
  } catch (err: any) {
    console.warn(`[Storage Upload] Falha ao processar foto ${index} em ${folder}/${prefix}:`, err?.message);
    return null;
  }
}

/**
 * Resolve a foto da Places API (New) a partir do photo.name (places/.../photos/...)
 * para uma URL de alta resolução válida (photoUri do googleusercontent ou Supabase permanente)
 */
async function resolveGooglePlacesPhoto(
  photoName: string,
  apiKey: string,
  cleanSlug: string,
  index: number,
  supabase: any
): Promise<string | null> {
  if (!photoName || !apiKey) return null;
  try {
    // 1. Tenta skipHttpRedirect=true para pegar o photoUri direto do Google CDN sem expor key
    const mediaUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1200&skipHttpRedirect=true&key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(mediaUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data?.photoUri && typeof data.photoUri === 'string') {
        const savedUrl = await uploadImageToStorage(data.photoUri, 'google-maps', cleanSlug, index, supabase);
        return savedUrl || data.photoUri;
      }
    }

    // 2. Fallback: baixa o binário via redirect e salva permanentemente no Supabase Storage
    const directMediaUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1200&key=${encodeURIComponent(apiKey)}`;
    const savedFallback = await uploadImageToStorage(directMediaUrl, 'google-maps', cleanSlug, index, supabase);
    if (savedFallback) return savedFallback;

    // 3. Fallback via image-proxy
    return `/api/studio/image-proxy?url=${encodeURIComponent(directMediaUrl)}`;
  } catch (err: any) {
    console.warn(`[Google Photo Resolve] Erro ao resolver foto ${photoName}:`, err?.message);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      placeId = '',
      websiteUri = '',
      website = '',
      instagramHandle = '',
      instagram = '',
      businessName = '',
      city = '',
      niche = '',
      query: customQuery = ''
    } = body;

    const APIFY_TOKEN = (process.env.APIFY_API_TOKEN || process.env.APIFY_TOKEN || '').trim();
    const SERPER_KEY = (process.env.SERPER_API_KEY || '').trim();
    const GOOGLE_API_KEY = (
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_PLACES_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      ''
    ).trim();
    const supabase = getSupabaseAdmin();

    const cleanSlug = (businessName || 'estabelecimento')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // -------------------------------------------------------------------------
    // 1. IDENTIFICAÇÃO DO HANDLE DO INSTAGRAM (@username)
    // -------------------------------------------------------------------------
    // Prioridade 1: Informado explicitamente no payload (instagramHandle ou instagram)
    let targetHandle = (instagramHandle || instagram || '')
      .replace(/^@/, '')
      .replace(/https?:\/\/(?:www\.)?instagram\.com\//i, '')
      .split('/')[0]
      .split('?')[0]
      .trim();

    // Prioridade 2: Extraído do websiteUri enviado no payload
    if (!targetHandle && (websiteUri || website)) {
      const handleFromSite = extractInstagramHandleFromUrl(websiteUri || website);
      if (handleFromSite) {
        targetHandle = handleFromSite;
      }
    }

    // Prioridade 3: Se o usuário digitou "@handle" ou uma URL no campo de busca personalizada
    if (!targetHandle && customQuery) {
      const handleFromQuery = extractInstagramHandleFromUrl(customQuery);
      if (handleFromQuery) {
        targetHandle = handleFromQuery;
      }
    }

    // Prioridade 4: Se ainda não temos o handle, busca automaticamente no Google/Serper
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
            const matchHandle = extractInstagramHandleFromUrl(link);
            if (matchHandle) {
              targetHandle = matchHandle;
              break;
            }
          }
        }
      } catch (err: any) {
        console.warn('[Buscar Fotos] Erro autodescoberta handle Instagram:', err?.message);
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

    // Coleção de tarefas assíncronas para execução paralela
    const asyncTasks: Promise<void>[] = [];
    let instaPromise: Promise<void> | null = null;
    let instaScraped = false;

    // Função para disparar a extração do Instagram via Apify
    const triggerApifyInstagram = (handle: string) => {
      if (!APIFY_TOKEN || !handle || instaScraped) return;
      instaScraped = true;
      instaPromise = (async () => {
        try {
          const apifyInstaUrl = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(
            APIFY_TOKEN
          )}&timeout=25`;

          const res = await fetch(apifyInstaUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              usernames: [handle],
              resultsLimit: 15
            }),
            signal: AbortSignal.timeout(26000),
            cache: 'no-store'
          });

          if (res.ok) {
            const items = await res.json().catch(() => []);
            if (Array.isArray(items) && items.length > 0) {
              const profile = items[0] || {};
              const instaUrls: string[] = [];

              if (profile.profilePicUrlHD) instaUrls.push(profile.profilePicUrlHD);
              else if (profile.profilePicUrl) instaUrls.push(profile.profilePicUrl);

              if (Array.isArray(profile.latestPosts)) {
                for (const post of profile.latestPosts) {
                  if (instaUrls.length >= 20) break;
                  if (post.displayUrl) instaUrls.push(post.displayUrl);
                  if (Array.isArray(post.images)) {
                    for (const sub of post.images) {
                      if (typeof sub === 'string' && sub.startsWith('http')) instaUrls.push(sub);
                    }
                  }
                }
              }

              const uniqueInstaUrls = Array.from(new Set(instaUrls)).slice(0, 15);

              const uploadSettled = await Promise.allSettled(
                uniqueInstaUrls.map((u, idx) =>
                  uploadImageToStorage(u, 'instagram', handle, idx, supabase)
                )
              );

              uploadSettled.forEach((r, idx) => {
                const finalUrl = r.status === 'fulfilled' && r.value ? r.value : uniqueInstaUrls[idx];
                if (finalUrl) {
                  addVerifiedPhoto(
                    finalUrl,
                    `${businessName || handle} (@${handle} Instagram HD)`,
                    'instagram',
                    finalUrl
                  );
                }
              });
            }
          }
        } catch (err: any) {
          console.warn('[Buscar Fotos] Erro Apify Instagram:', err?.message);
        }
      })();
    };

    // Se já conhecemos o handle do Instagram, inicia imediatamente em paralelo com a busca do Google
    if (targetHandle) {
      triggerApifyInstagram(targetHandle);
    }

    // -------------------------------------------------------------------------
    // PASSO A: GOOGLE PLACES API (NEW) OFICIAL (placeId ou searchText)
    // Extrai e resolve todas as photoUri reais da ficha oficial do Google
    // -------------------------------------------------------------------------
    if (GOOGLE_API_KEY && (placeId || businessName)) {
      asyncTasks.push(
        (async () => {
          try {
            let targetPlace: any = null;

            // Se recebemos placeId, consulta direto o detalhe do lugar
            if (placeId) {
              const detailRes = await fetch(
                `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
                {
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_API_KEY,
                    'X-Goog-FieldMask':
                      'id,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,photos,rating,userRatingCount,regularOpeningHours,reviews'
                  },
                  signal: AbortSignal.timeout(6000),
                  cache: 'no-store'
                }
              );
              if (detailRes.ok) {
                targetPlace = await detailRes.json().catch(() => null);
              }
            }

            // Se não encontrou por placeId, faz busca por texto
            if (!targetPlace && businessName) {
              const placesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Goog-Api-Key': GOOGLE_API_KEY,
                  'X-Goog-FieldMask':
                    'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.photos,places.rating,places.userRatingCount,places.regularOpeningHours,places.reviews'
                },
                body: JSON.stringify({
                  textQuery: `${businessName} em ${city}`,
                  languageCode: 'pt-BR',
                  maxResultCount: 2
                }),
                signal: AbortSignal.timeout(6000),
                cache: 'no-store'
              });

              if (placesRes.ok) {
                const pJson = await placesRes.json().catch(() => ({}));
                targetPlace = pJson.places?.[0] || null;
              }
            }

            if (targetPlace) {
              // Extrai @instagram diretamente do websiteUri da ficha se ainda não tivermos
              if (!targetHandle && targetPlace.websiteUri) {
                const discoveredHandle = extractInstagramHandleFromUrl(targetPlace.websiteUri);
                if (discoveredHandle) {
                  targetHandle = discoveredHandle;
                  triggerApifyInstagram(discoveredHandle);
                }
              }

              // Resolve todas as fotos de place.photos (até 10 fotos)
              if (Array.isArray(targetPlace.photos) && targetPlace.photos.length > 0) {
                const targetPhotos = targetPlace.photos.slice(0, 10);
                const placeTitle = targetPlace.displayName?.text || businessName;

                const photoPromises = targetPhotos.map((p: any, idx: number) => {
                  if (!p?.name) return Promise.resolve(null);
                  return resolveGooglePlacesPhoto(p.name, GOOGLE_API_KEY, cleanSlug, idx, supabase);
                });

                const resolved = await Promise.allSettled(photoPromises);
                resolved.forEach((r) => {
                  if (r.status === 'fulfilled' && r.value) {
                    addVerifiedPhoto(
                      r.value,
                      `${placeTitle} (Google Maps Oficial)`,
                      'google',
                      r.value
                    );
                  }
                });
              }
            }
          } catch (err: any) {
            console.warn('[Buscar Fotos] Erro Google Places Photos:', err?.message);
          }
        })()
      );
    }

    // -------------------------------------------------------------------------
    // PASSO B: APIFY GOOGLE MAPS CRAWLER (compass~crawler-google-places)
    // Galeria estendida do Google Maps (Fachada, Interior, Trabalhos)
    // -------------------------------------------------------------------------
    if (APIFY_TOKEN && businessName) {
      asyncTasks.push(
        (async () => {
          try {
            const apifyMapsUrl = `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token=${encodeURIComponent(
              APIFY_TOKEN
            )}&timeout=25`;

            const mapsQuery = city ? `${businessName} ${city}` : businessName;

            const res = await fetch(apifyMapsUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                searchStringsArray: [mapsQuery],
                maxCrawledPlacesPerSearch: 1,
                maxImages: 25
              }),
              signal: AbortSignal.timeout(26000),
              cache: 'no-store'
            });

            if (res.ok) {
              const items = await res.json().catch(() => []);
              if (Array.isArray(items) && items.length > 0) {
                const place = items[0] || {};

                // Se o crawler do Google Maps encontrar website com Instagram e ainda não temos o handle
                if (!targetHandle && (place.website || place.url)) {
                  const discovered = extractInstagramHandleFromUrl(place.website || place.url);
                  if (discovered) {
                    targetHandle = discovered;
                    triggerApifyInstagram(discovered);
                  }
                }

                const mapsUrls: string[] = [];
                if (Array.isArray(place.imageUrls)) {
                  for (const u of place.imageUrls) {
                    if (typeof u === 'string' && u.startsWith('http')) mapsUrls.push(u);
                  }
                }
                if (Array.isArray(place.images)) {
                  for (const img of place.images) {
                    if (typeof img === 'string' && img.startsWith('http')) {
                      mapsUrls.push(img);
                    } else if (img && typeof img === 'object') {
                      const u = img.imageUrl || img.url || img.link || img.thumbnail;
                      if (typeof u === 'string' && u.startsWith('http')) mapsUrls.push(u);
                    }
                  }
                }
                if (typeof place.imageUrl === 'string' && place.imageUrl.startsWith('http')) {
                  mapsUrls.push(place.imageUrl);
                }

                const uniqueMapsUrls = Array.from(new Set(mapsUrls)).slice(0, 20);
                const placeTitle = place.title || businessName;

                const uploadSettled = await Promise.allSettled(
                  uniqueMapsUrls.map((u, idx) =>
                    uploadImageToStorage(u, 'google-maps', cleanSlug, idx + 10, supabase)
                  )
                );

                uploadSettled.forEach((r, idx) => {
                  const finalUrl = r.status === 'fulfilled' && r.value ? r.value : uniqueMapsUrls[idx];
                  if (finalUrl) {
                    addVerifiedPhoto(
                      finalUrl,
                      `${placeTitle} (Google Maps Galeria)`,
                      'google',
                      finalUrl
                    );
                  }
                });
              }
            }
          } catch (err: any) {
            console.warn('[Buscar Fotos] Erro Apify Google Places Crawler:', err?.message);
          }
        })()
      );
    }

    // Executa as buscas oficiais do Google Maps em paralelo
    await Promise.allSettled(asyncTasks);

    // Aguarda o scraper do Instagram se ele foi disparado
    if (instaPromise) {
      await instaPromise;
    }

    // -------------------------------------------------------------------------
    // PASSO C: SERPER GOOGLE IMAGES (Caso ainda tenhamos menos de 6 fotos reais)
    // -------------------------------------------------------------------------
    if (verifiedPhotos.length < 6 && SERPER_KEY && businessName) {
      try {
        const serperRes = await fetch('https://google.serper.dev/images', {
          method: 'POST',
          headers: {
            'X-API-KEY': SERPER_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: `"${businessName}" "${city}"`,
            gl: 'br',
            hl: 'pt-br',
            num: 12
          }),
          signal: AbortSignal.timeout(5000),
          cache: 'no-store'
        });

        if (serperRes.ok) {
          const serperJson = await serperRes.json().catch(() => ({}));
          if (Array.isArray(serperJson.images)) {
            const rawCandidates = serperJson.images.map((img: any) => ({
              url: img.imageUrl || img.thumbnailUrl,
              title: img.title || `${businessName} (Google Fotos)`
            }));

            const valResults = await Promise.allSettled(
              rawCandidates.map(async (c: any) => {
                if (!c.url || typeof c.url !== 'string') return null;
                if (c.url.includes('.svg') || c.url.includes('favicon')) return null;
                const val = await validateImageUrl(c.url, 2500);
                if (val.valid) return c;
                return null;
              })
            );

            valResults.forEach((r) => {
              if (r.status === 'fulfilled' && r.value) {
                if (verifiedPhotos.length >= 25) return;
                const isInsta = r.value.url.includes('instagram') || r.value.url.includes('cdninstagram');
                addVerifiedPhoto(
                  r.value.url,
                  r.value.title,
                  isInsta ? 'instagram' : 'google'
                );
              }
            });
          }
        }
      } catch (err: any) {
        console.warn('[Buscar Fotos] Erro Serper fallback:', err?.message);
      }
    }

    // Regra Rígida: NUNCA adiciona Pixabay ou fotos genéricas na aba de Fotos Reais!
    return NextResponse.json({
      success: true,
      query: customQuery || `${businessName} ${city}`,
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
