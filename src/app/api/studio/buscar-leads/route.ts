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
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.primaryTypeDisplayName'
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
          rawPlaces = placesJson.places.map((p: any) => ({
            id: p.id || `places_${Math.random().toString(36).substring(2, 9)}`,
            name: p.displayName?.text || p.displayName || 'Comércio Local',
            address: p.formattedAddress || `${city}`,
            phone: p.nationalPhoneNumber || p.internationalPhoneNumber || '',
            website: p.websiteUri || null,
            rating: Number(p.rating || 5.0),
            reviewsCount: Number(p.userRatingCount || 0),
            category: p.primaryTypeDisplayName?.text || niche || 'Comércio Local'
          }));
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
            rawPlaces = sJson.places.map((p: any) => ({
              id: p.cid || `serper_${Math.random().toString(36).substring(2, 9)}`,
              name: p.title || p.name || 'Comércio Local',
              address: p.address || `${city}`,
              phone: p.phoneNumber || p.phone || '',
              website: p.website || null,
              rating: Number(p.rating || 5.0),
              reviewsCount: Number(p.ratingCount || p.reviews || 0),
              category: p.category || niche || 'Comércio Local'
            }));
            providerUsed = 'serper';
            providerLabel = 'Serper Places API';
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
    // PROVEDOR 3: OpenStreetMap Real (Nominatim com extratags reais)
    // -----------------------------------------------------------------------
    if (rawPlaces.length === 0) {
      try {
        console.log('[Studio Leads] Consultando OpenStreetMap (Nominatim) para:', `${niche} ${city}`);
        const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${niche} ${city}`)}&format=json&extratags=1&addressdetails=1&limit=25`;
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
            // Filtra estabelecimentos reais que possuam nome
            const validOsmPlaces = osmJson.filter((item: any) => {
              const name = item.name || (item.display_name ? item.display_name.split(',')[0].trim() : '');
              return name && name.length >= 3 && !name.toLowerCase().includes('rodovia') && !name.toLowerCase().includes('avenida');
            });

            if (validOsmPlaces.length > 0) {
              rawPlaces = validOsmPlaces.map((item: any, idx: number) => {
                const addr = item.address || {};
                const rawName = item.name || item.display_name.split(',')[0].trim();
                const street = addr.road ? `${addr.road}${addr.house_number ? `, nº ${addr.house_number}` : ''}` : '';
                const neighborhood = addr.suburb || addr.neighbourhood || addr.city_district || '';
                const fullAddr = [street, neighborhood, city].filter(Boolean).join(' - ') || item.display_name;

                // Telefone e Website REAIS extraídos do OpenStreetMap
                const tags = item.extratags || {};
                const realPhone = tags.phone || tags['contact:phone'] || tags['contact:whatsapp'] || tags['phone:mobile'] || '';
                const realWebsite = tags.website || tags['contact:website'] || null;

                return {
                  id: `osm_${item.place_id || idx}`,
                  name: rawName,
                  address: fullAddr,
                  phone: realPhone,
                  website: realWebsite,
                  rating: 5.0,
                  reviewsCount: 0,
                  category: niche || 'Comércio Local'
                };
              });
              providerUsed = 'osm';
              providerLabel = 'OpenStreetMap (Comércios Reais OSM)';
            }
          }
        }
      } catch (err: any) {
        console.warn('[Studio Leads] Erro OSM:', err);
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
        aviso += ` (Aviso Google Places: ${googleError})`;
      }

      return NextResponse.json({
        success: true,
        leads: [],
        provider: 'none',
        message: aviso,
        googleNotice: googleError || serperError || null
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
        suggestedSlug
      };
    });

    // Ordena priorizando quem não tem site próprio (maior oportunidade de venda)
    leads.sort((a, b) => {
      if (a.isHighOpportunity && !b.isHighOpportunity) return -1;
      if (!a.isHighOpportunity && b.isHighOpportunity) return 1;
      return b.reviewsCount - a.reviewsCount;
    });

    return NextResponse.json({
      success: true,
      query,
      provider: providerLabel,
      total: leads.length,
      hotCount: leads.filter((l) => l.isHighOpportunity).length,
      googleNotice: googleError,
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
