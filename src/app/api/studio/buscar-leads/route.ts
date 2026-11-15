import { NextRequest, NextResponse } from 'next/server';
import { sanitizeSlug } from '@/lib/site-storage';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export interface LeadBusiness {
  id: string;
  name: string;
  niche: string;
  category: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  website: string | null;
  rating: number;
  reviews: number;
  reviewsCount: number;
  hasWebsite: boolean;
  hasOwnWebsite: boolean;
  isHighOpportunity: boolean;
  opportunity: 'HOT_NO_WEBSITE' | 'HAS_WEBSITE';
  opportunityReason: string;
  suggestedSlug: string;
  instagram?: string;
  photos?: string[];
  hours?: string;
  openingHours?: string;
  realReviews?: Array<{ author: string; rating: number; text: string }>;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { niche = 'Barbearia', city = 'São Paulo - SP' } = body;

    const query = `${niche.trim()} em ${city.trim()}`;
    const GOOGLE_PLACES_KEY = (process.env.GOOGLE_PLACES_API_KEY || '').trim();
    const SERPER_KEY = (process.env.SERPER_API_KEY || '').trim();

    let rawPlaces: any[] = [];
    let providerUsed = '';
    let providerLabel = '';
    let googleError: string | null = null;
    let serperError: string | null = null;

    // -----------------------------------------------------------------------
    // PROVEDOR 1: Google Places API (New)
    // -----------------------------------------------------------------------
    if (GOOGLE_PLACES_KEY) {
      try {
        console.log('[Studio Leads] Consultando Google Places API (New) para:', query);
        const placesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_PLACES_KEY,
            'X-Goog-FieldMask':
              'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.primaryTypeDisplayName,places.photos,places.regularOpeningHours,places.reviews'
          },
          body: JSON.stringify({
            textQuery: query,
            languageCode: 'pt-BR',
            regionCode: 'BR',
            maxResultCount: 20
          }),
          cache: 'no-store'
        });

        const placesJson = await placesRes.json().catch(() => ({}));

        if (!placesRes.ok || placesJson.error) {
          googleError = placesJson.error?.message || `Google Places retornou status ${placesRes.status}`;
          console.warn('[Studio Leads] Google Places API retornou erro:', googleError);
        } else if (Array.isArray(placesJson.places) && placesJson.places.length > 0) {
          // Resolve fotos reais, horários e avaliações do Google Places
          rawPlaces = await Promise.all(
            placesJson.places.map(async (p: any) => {
              // 1. Fotos reais em alta resolução (maxWidthPx=1200) com skipHttpRedirect=true (extrai photoUri do googleusercontent)
              let resolvedPhotos: string[] = [];
              if (Array.isArray(p.photos) && p.photos.length > 0 && GOOGLE_PLACES_KEY) {
                const targetPhotos = p.photos.slice(0, 6);
                const photoPromises = targetPhotos.map(async (photoObj: any) => {
                  if (!photoObj?.name) return null;
                  try {
                    const mediaUrl = `https://places.googleapis.com/v1/${photoObj.name}/media?maxWidthPx=1200&skipHttpRedirect=true&key=${GOOGLE_PLACES_KEY}`;
                    const mediaRes = await fetch(mediaUrl, {
                      headers: { Accept: 'application/json' },
                      signal: AbortSignal.timeout(4000),
                      cache: 'no-store'
                    });
                    if (!mediaRes.ok) return null;
                    const mediaJson = await mediaRes.json().catch(() => ({}));
                    return mediaJson.photoUri || null;
                  } catch {
                    return null;
                  }
                });
                const resolved = await Promise.allSettled(photoPromises);
                resolvedPhotos = resolved
                  .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled' && Boolean(r.value))
                  .map((r) => r.value);
              }

              // 2. Horários reais de funcionamento
              let formattedHours = '';
              if (p.regularOpeningHours?.weekdayDescriptions && Array.isArray(p.regularOpeningHours.weekdayDescriptions)) {
                formattedHours = p.regularOpeningHours.weekdayDescriptions.join(' | ');
              }

              // 3. Avaliações reais (até 3 depoimentos reais para o site)
              let formattedReviews: Array<{ author: string; rating: number; text: string }> = [];
              if (Array.isArray(p.reviews)) {
                formattedReviews = p.reviews
                  .slice(0, 3)
                  .map((rev: any) => ({
                    author: rev.authorAttribution?.displayName || 'Cliente Verificado',
                    rating: Number(rev.rating || 5),
                    text: rev.text?.text || rev.originalText?.text || ''
                  }))
                  .filter((r: any) => r.text && r.text.length > 5);
              }

              return {
                id: p.id || `places_${Math.random().toString(36).substring(2, 9)}`,
                name: p.displayName?.text || p.displayName || 'Comércio Local',
                address: p.formattedAddress || `${city}`,
                phone: p.nationalPhoneNumber || p.internationalPhoneNumber || '',
                website: p.websiteUri || null,
                rating: Number(p.rating || 5.0),
                reviewsCount: Number(p.userRatingCount || 0),
                category: p.primaryTypeDisplayName?.text || niche || 'Comércio Local',
                photos: resolvedPhotos,
                hours: formattedHours,
                openingHours: formattedHours,
                realReviews: formattedReviews
              };
            })
          );
          providerUsed = 'google_places';
          providerLabel = 'Google Places API (New)';
        }
      } catch (err: any) {
        googleError = err.message || 'Falha de conexão com Google Places API';
        console.warn('[Studio Leads] Exceção Google Places:', err);
      }
    }

    // -----------------------------------------------------------------------
    // PROVEDOR 2: Serper Places API
    // -----------------------------------------------------------------------
    if (rawPlaces.length === 0 && SERPER_KEY) {
      try {
        console.log('[Studio Leads] Consultando Serper Places API para:', query);
        const serperRes = await fetch('https://google.serper.dev/places', {
          method: 'POST',
          headers: {
            'X-API-KEY': SERPER_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            q: query,
            gl: 'br',
            hl: 'pt-br',
            num: 20
          }),
          cache: 'no-store'
        });

        if (serperRes.ok) {
          const sJson = await serperRes.json().catch(() => ({}));
          if (Array.isArray(sJson.places) && sJson.places.length > 0) {
            rawPlaces = sJson.places.map((p: any) => {
              const serperPhotos = [p.imageUrl, p.thumbnailUrl].filter(Boolean);
              return {
                id: p.cid || `serper_${Math.random().toString(36).substring(2, 9)}`,
                name: p.title || p.name || 'Comércio Local',
                address: p.address || `${city}`,
                phone: p.phoneNumber || p.phone || '',
                website: p.website || null,
                rating: Number(p.rating || 5.0),
                reviewsCount: Number(p.ratingCount || p.reviews || 0),
                category: p.category || niche || 'Comércio Local',
                photos: serperPhotos,
                hours: '',
                openingHours: '',
                realReviews: []
              };
            });
            providerUsed = 'serper';
            providerLabel = 'Google Maps (via Serper)';
          }
        } else {
          const sErr = await serperRes.json().catch(() => ({}));
          serperError = sErr.message || `Serper retornou status ${serperRes.status}`;
        }
      } catch (err: any) {
        serperError = err.message || 'Erro de conexão com Serper';
        console.warn('[Studio Leads] Erro Serper:', err);
      }
    }

    // -----------------------------------------------------------------------
    // PROVEDOR 3: OpenStreetMap Radar Inteligente (Comércios Reais em Cascata)
    // -----------------------------------------------------------------------
    if (rawPlaces.length === 0) {
      try {
        console.log('[Studio Leads] Consultando OpenStreetMap Radar para:', `${niche} ${city}`);

        // Limpeza e normalização do Nicho e Cidade
        const cleanCity = city
          .replace(/[,/-]\s*[A-Z]{2}\b/gi, '')
          .replace(/\bbrasil\b/gi, '')
          .trim();
        const cleanNiche = niche
          .replace(/^(est[uú]dio|studio|loja|cl[ií]nica|clinica|sal[aã]o|salao|oficina|espa[cç]o)\s+(de\s+)?/gi, '')
          .trim();

        // Lista de variantes de busca em cascata
        const searchVariants: string[] = [
          `${cleanNiche} ${cleanCity}`,
          `${niche} ${cleanCity}`,
          `${cleanNiche} ${city}`
        ];

        // Sinônimos inteligentes para nichos comuns no Brasil
        if (/tattoo/i.test(cleanNiche)) searchVariants.push(`tatuagem ${cleanCity}`);
        if (/tatuagem/i.test(cleanNiche)) searchVariants.push(`tattoo ${cleanCity}`);
        if (/barbe/i.test(cleanNiche)) searchVariants.push(`barbearia ${cleanCity}`, `barbeiro ${cleanCity}`);
        if (/pizza/i.test(cleanNiche)) searchVariants.push(`pizzaria ${cleanCity}`);
        if (/lanche|burger/i.test(cleanNiche)) searchVariants.push(`hamburgueria ${cleanCity}`, `lanchonete ${cleanCity}`);
        if (/oficina|mec[aâ]nic/i.test(cleanNiche)) searchVariants.push(`oficina mecânica ${cleanCity}`, `autocenter ${cleanCity}`);
        if (/dente|odont/i.test(cleanNiche)) searchVariants.push(`odontologia ${cleanCity}`, `dentista ${cleanCity}`);
        if (/est[eé]tic|beleza/i.test(cleanNiche)) searchVariants.push(`estética ${cleanCity}`, `salão de beleza ${cleanCity}`);

        for (const variant of searchVariants) {
          if (rawPlaces.length >= 12) break;

          const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(variant)}&format=json&extratags=1&addressdetails=1&limit=20`;
          const osmRes = await fetch(osmUrl, {
            headers: {
              'User-Agent': 'WebbillyStudio/2.0 (contato@webbilly.com.br)',
              'Accept-Language': 'pt-BR,pt;q=0.9'
            },
            cache: 'no-store'
          });

          if (osmRes.ok) {
            const osmJson = await osmRes.json().catch(() => []);
            if (Array.isArray(osmJson) && osmJson.length > 0) {
              const validOsmPlaces = osmJson.filter((item: any) => {
                const name = item.name || (item.display_name ? item.display_name.split(',')[0].trim() : '');
                const lower = name.toLowerCase();
                // Descarta nomes que sejam apenas nomes de vias
                return (
                  name &&
                  name.length >= 3 &&
                  !lower.startsWith('rua ') &&
                  !lower.startsWith('avenida ') &&
                  !lower.startsWith('rodovia ') &&
                  !lower.startsWith('travessa ') &&
                  !lower.startsWith('alameda ')
                );
              });

              for (const item of validOsmPlaces) {
                const rawName = item.name || item.display_name.split(',')[0].trim();
                // Evita duplicatas pelo nome
                if (rawPlaces.some((p) => p.name.toLowerCase() === rawName.toLowerCase())) continue;

                const addr = item.address || {};
                const street = addr.road ? `${addr.road}${addr.house_number ? `, nº ${addr.house_number}` : ''}` : '';
                const neighborhood = addr.suburb || addr.neighbourhood || addr.city_district || '';
                const itemCity = addr.city || addr.town || addr.municipality || cleanCity;
                const fullAddr = [street, neighborhood, itemCity].filter(Boolean).join(' - ') || item.display_name;

                // Telefone e Website REAIS extraídos do OpenStreetMap
                const tags = item.extratags || {};
                const realPhone = tags.phone || tags['contact:phone'] || tags['contact:whatsapp'] || tags['phone:mobile'] || '';
                const realWebsite = tags.website || tags['contact:website'] || null;

                rawPlaces.push({
                  id: `osm_${item.place_id || Math.random().toString(36).substring(2, 9)}`,
                  name: rawName,
                  address: fullAddr,
                  phone: realPhone,
                  website: realWebsite,
                  rating: 5.0,
                  reviewsCount: realPhone ? 1 : 0,
                  category: niche || 'Comércio Local'
                });
              }

              if (rawPlaces.length > 0) {
                providerUsed = 'osm';
                providerLabel = 'OpenStreetMap Radar';
              }
            }
          }
        }
      } catch (err: any) {
        console.warn('[Studio Leads] Erro OSM:', err);
      }
    }

    // Formata o aviso do Google Places de forma amigável e explicativa
    let formattedGoogleNotice: string | null = null;
    if (googleError) {
      if (/api key not valid/i.test(googleError)) {
        formattedGoogleNotice =
          'Aviso Google Places: A chave em GOOGLE_PLACES_API_KEY no painel da Vercel é inválida para a "Places API (New)" do Google Cloud. Utilizando o provedor alternativo para buscar comércios reais.';
      } else {
        formattedGoogleNotice = `Aviso Google Places: ${googleError}. Provedor alternativo ativo.`;
      }
    }

    // -----------------------------------------------------------------------
    // REGRA DE OURO: PROIBIDO GERAR DADOS FALSOS / MOCKADOS
    // Se nenhum comércio real foi encontrado, retorne array vazio com aviso claro.
    // -----------------------------------------------------------------------
    if (rawPlaces.length === 0) {
      let aviso = `Nenhum comércio real encontrado para "${niche}" em "${city}".`;
      if (!GOOGLE_PLACES_KEY && !SERPER_KEY) {
        aviso += ' Dica: Configure GOOGLE_PLACES_API_KEY ou SERPER_API_KEY no painel da Vercel para busca completa em tempo real.';
      } else if (googleError) {
        aviso += ` (Google Places: ${googleError})`;
      }

      return NextResponse.json({
        success: true,
        leads: [],
        provider: 'none',
        message: aviso,
        googleNotice: formattedGoogleNotice || googleError || serperError || null
      });
    }

    // -----------------------------------------------------------------------
    // PROCESSAMENTO, CLASSIFICAÇÃO & HIGIENE DOS LEADS REAIS
    // -----------------------------------------------------------------------
    const leads: LeadBusiness[] = rawPlaces.map((item, idx) => {
      const cleanPhone = (item.phone || '').replace(/\D/g, '');
      const rawWeb = (item.website || '').toLowerCase().trim();

      const isSocialOrAggregator =
        !rawWeb ||
        rawWeb.includes('instagram.com') ||
        rawWeb.includes('facebook.com') ||
        rawWeb.includes('linktr.ee') ||
        rawWeb.includes('wa.me') ||
        rawWeb.includes('whatsapp.com') ||
        rawWeb.includes('cardapio.menu') ||
        rawWeb.includes('ifood.com.br') ||
        rawWeb.includes('glovo.com') ||
        rawWeb.includes('ubereats.com');

      const hasOwnWebsite = Boolean(rawWeb && !isSocialOrAggregator);
      const isHighOpportunity = !hasOwnWebsite;

      const suggestedSlug = sanitizeSlug(item.name || `empresa-${idx + 1}`);

      let oppReason = '🔥 Não possui site próprio indexado no Google. Alta oportunidade!';
      if (rawWeb.includes('instagram.com')) {
        oppReason = '📱 Usa apenas perfil do Instagram como link. Grande potencial para Landing Page oficial!';
      } else if (rawWeb.includes('linktr.ee') || rawWeb.includes('wa.me')) {
        oppReason = '🔗 Usa apenas agregador de links/WhatsApp. Falta autoridade profissional!';
      } else if (hasOwnWebsite) {
        oppReason = '🌐 Já possui website registrado.';
      }

      return {
        id: item.id || `lead_${idx + 1}`,
        name: item.name,
        niche: item.category || niche,
        category: item.category || niche,
        city: city,
        address: item.address,
        phone: item.phone,
        whatsapp: cleanPhone,
        website: item.website,
        rating: item.rating || 5.0,
        reviews: item.reviewsCount || 0,
        reviewsCount: item.reviewsCount || 0,
        hasWebsite: Boolean(item.website),
        hasOwnWebsite,
        isHighOpportunity,
        opportunity: isHighOpportunity ? 'HOT_NO_WEBSITE' : 'HAS_WEBSITE',
        opportunityReason: oppReason,
        suggestedSlug,
        photos: Array.isArray(item.photos) ? item.photos : [],
        hours: item.hours || item.openingHours || '',
        openingHours: item.hours || item.openingHours || '',
        realReviews: Array.isArray(item.realReviews) ? item.realReviews : []
      };
    });

    // Ordena priorizando quem não tem site próprio (maior oportunidade de venda)
    leads.sort((a, b) => {
      if (a.isHighOpportunity && !b.isHighOpportunity) return -1;
      if (!a.isHighOpportunity && b.isHighOpportunity) return 1;
      return b.reviewsCount - a.reviewsCount;
    });

    const activeGoogleNotice =
      providerUsed === 'google_places' || providerUsed === 'serper'
        ? null
        : formattedGoogleNotice;

    return NextResponse.json({
      success: true,
      query,
      provider: providerLabel,
      total: leads.length,
      hotCount: leads.filter((l) => l.isHighOpportunity).length,
      googleNotice: activeGoogleNotice,
      message: `${leads.length} comércios reais encontrados via ${providerLabel}.`,
      leads
    });
  } catch (error: any) {
    console.error('[Studio Buscar Leads Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Erro inesperado ao buscar leads comerciais.',
        leads: []
      },
      { status: 500 }
    );
  }
}
