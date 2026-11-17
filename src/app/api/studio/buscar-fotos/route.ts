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
    const supabase = getSupabaseAdmin();

    const cleanSlug = (businessName || 'estabelecimento')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

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

    // Coleção de tarefas assíncronas para execução paralela de alta performance
    const asyncTasks: Promise<void>[] = [];

    // -------------------------------------------------------------------------
    // 1. PROVEDOR: APIFY GOOGLE MAPS CRAWLER (compass~crawler-google-places)
    // Extrai todas as fotos reais da galeria oficial do Google Maps (Fachada, Interior, Trabalhos)
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
                if (Array.isArray(place.photos)) {
                  for (const p of place.photos) {
                    if (typeof p === 'string' && p.startsWith('http')) mapsUrls.push(p);
                    else if (p && typeof p === 'object') {
                      const u = p.photoUrl || p.url || p.imageUrl;
                      if (typeof u === 'string' && u.startsWith('http')) mapsUrls.push(u);
                    }
                  }
                }

                const uniqueMapsUrls = Array.from(new Set(mapsUrls)).slice(0, 25);
                const placeTitle = place.title || businessName;

                // Salva permanentemente no Supabase Storage
                const uploadSettled = await Promise.allSettled(
                  uniqueMapsUrls.map((u, idx) =>
                    uploadImageToStorage(u, 'google-maps', cleanSlug, idx, supabase)
                  )
                );

                uploadSettled.forEach((r, idx) => {
                  const finalUrl = (r.status === 'fulfilled' && r.value) ? r.value : uniqueMapsUrls[idx];
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

    // -------------------------------------------------------------------------
    // 2. PROVEDOR: APIFY INSTAGRAM PROFILE SCRAPER (apify~instagram-profile-scraper)
    // Extrai as 12–15 fotos reais mais recentes do perfil oficial do estabelecimento
    // -------------------------------------------------------------------------
    if (APIFY_TOKEN && targetHandle) {
      asyncTasks.push(
        (async () => {
          try {
            const apifyInstaUrl = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${encodeURIComponent(
              APIFY_TOKEN
            )}&timeout=25`;

            const res = await fetch(apifyInstaUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                usernames: [targetHandle],
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
                    uploadImageToStorage(u, 'instagram', targetHandle, idx, supabase)
                  )
                );

                uploadSettled.forEach((r, idx) => {
                  const finalUrl = (r.status === 'fulfilled' && r.value) ? r.value : uniqueInstaUrls[idx];
                  if (finalUrl) {
                    addVerifiedPhoto(
                      finalUrl,
                      `${businessName || targetHandle} (@${targetHandle} Instagram HD)`,
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
        })()
      );
    }

    // -------------------------------------------------------------------------
    // 3. PROVEDOR: GOOGLE PLACES API (NEW) OFICIAL (places:searchText)
    // -------------------------------------------------------------------------
    if (GOOGLE_PLACES_KEY && businessName) {
      asyncTasks.push(
        (async () => {
          try {
            const placesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_PLACES_KEY,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.photos,places.websiteUri'
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
              const targetPlace = pJson.places?.[0];
              if (Array.isArray(targetPlace?.photos)) {
                const photoPromises = targetPlace.photos.slice(0, 10).map(async (p: any) => {
                  if (!p?.name) return null;
                  try {
                    const mediaRes = await fetch(
                      `https://places.googleapis.com/v1/${p.name}/media?maxWidthPx=1200&skipHttpRedirect=true&key=${GOOGLE_PLACES_KEY}`,
                      { signal: AbortSignal.timeout(5000), cache: 'no-store' }
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
                    addVerifiedPhoto(
                      r.value,
                      `${targetPlace.displayName?.text || businessName} (Google Maps Oficial)`,
                      'google'
                    );
                  }
                });
              }
            }
          } catch (err: any) {
            console.warn('[Buscar Fotos] Erro Places Photos:', err?.message);
          }
        })()
      );
    }

    // Aguarda todas as tarefas de coleta oficial em paralelo
    await Promise.allSettled(asyncTasks);

    // -------------------------------------------------------------------------
    // 4. RADAR ESPECÍFICO SERPER (Apenas fotos da própria empresa se houver poucas)
    // -------------------------------------------------------------------------
    if (verifiedPhotos.length < 8 && SERPER_KEY && businessName) {
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
    // As fotos conceituais ficam exclusivamente na aba "Banco Pixabay HD"

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
