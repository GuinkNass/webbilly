import { NextRequest, NextResponse } from 'next/server';
import { sanitizeSlug } from '@/lib/site-storage';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export interface LeadBusiness {
  id: string;
  name: string;
  niche: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  website: string | null;
  rating: number;
  reviewsCount: number;
  hasOwnWebsite: boolean;
  isHighOpportunity: boolean;
  opportunityReason: string;
  suggestedSlug: string;
  instagram?: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const niche = (body.niche || body.categoria || '').trim();
    const city = (body.city || body.cidade || '').trim();
    const query = (body.query || `${niche} em ${city}`).trim();

    if (!query) {
      return NextResponse.json(
        { error: 'Informe um nicho/categoria e uma cidade para prospectar.' },
        { status: 400 }
      );
    }

    const SERPER_KEY = process.env.SERPER_API_KEY || process.env.SERPER_KEY;
    const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.PLACES_API_KEY;

    let rawPlaces: any[] = [];
    let providerUsed = 'none';

    // 1. Provedor 1: Serper Places API
    if (SERPER_KEY) {
      try {
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
          const sJson = await serperRes.json();
          if (Array.isArray(sJson.places)) {
            rawPlaces = sJson.places.map((p: any) => ({
              id: p.cid || `serper_${Math.random().toString(36).substring(2, 9)}`,
              name: p.title || p.name || 'Comércio Local',
              address: p.address || `${city || 'Brasil'}`,
              phone: p.phoneNumber || p.phone || '',
              website: p.website || null,
              rating: Number(p.rating || 0),
              reviewsCount: Number(p.ratingCount || p.reviews || 0),
              category: p.category || niche || 'Comércio Local'
            }));
            providerUsed = 'serper';
          }
        }
      } catch (sErr) {
        console.warn('[Studio Leads] Erro Serper:', sErr);
      }
    }

    // 2. Provedor 2: Google Places API (New)
    if (rawPlaces.length === 0 && PLACES_KEY) {
      try {
        const placesRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': PLACES_KEY,
            'X-Goog-FieldMask':
              'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.primaryTypeDisplayName'
          },
          body: JSON.stringify({
            textQuery: query,
            languageCode: 'pt-BR',
            maxResultCount: 20
          }),
          cache: 'no-store'
        });

        if (placesRes.ok) {
          const pJson = await placesRes.json();
          if (Array.isArray(pJson.places)) {
            rawPlaces = pJson.places.map((p: any) => ({
              id: p.id || `places_${Math.random().toString(36).substring(2, 9)}`,
              name: p.displayName?.text || 'Comércio Local',
              address: p.formattedAddress || `${city || 'Brasil'}`,
              phone: p.nationalPhoneNumber || p.internationalPhoneNumber || '',
              website: p.websiteUri || null,
              rating: Number(p.rating || 0),
              reviewsCount: Number(p.userRatingCount || 0),
              category: p.primaryTypeDisplayName?.text || niche || 'Comércio Local'
            }));
            providerUsed = 'google_places';
          }
        }
      } catch (pErr) {
        console.warn('[Studio Leads] Erro Google Places:', pErr);
      }
    }

    // 3. Processamento & Classificação de Oportunidades
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
        rawWeb.includes('google.com/maps') ||
        rawWeb.includes('negocio.site');

      const hasOwnWebsite = Boolean(rawWeb && !isSocialOrAggregator);
      const isHighOpportunity = !hasOwnWebsite;

      let opportunityReason = 'Possui website próprio';
      if (!rawWeb) {
        opportunityReason = 'Sem website cadastrado no Google Maps';
      } else if (rawWeb.includes('instagram.com')) {
        opportunityReason = 'Usa apenas perfil de Instagram';
      } else if (rawWeb.includes('linktr.ee')) {
        opportunityReason = 'Usa apenas agregador Linktree';
      } else if (rawWeb.includes('wa.me') || rawWeb.includes('whatsapp.com')) {
        opportunityReason = 'Usa apenas link direto de WhatsApp';
      } else if (isSocialOrAggregator) {
        opportunityReason = 'Não possui landing page profissional própria';
      }

      let cleanSlug = sanitizeSlug(item.name);
      if (!cleanSlug || cleanSlug.length < 3) {
        cleanSlug = sanitizeSlug(`${item.name}-${city || 'sp'}`);
      }
      if (!cleanSlug) cleanSlug = `comercio-${idx + 1}`;

      return {
        id: item.id || `lead_${cleanSlug}_${idx}`,
        name: item.name,
        niche: item.category || niche || 'Comércio',
        city: city || 'Brasil',
        address: item.address,
        phone: item.phone,
        whatsapp: cleanPhone,
        website: item.website,
        rating: item.rating,
        reviewsCount: item.reviewsCount,
        hasOwnWebsite,
        isHighOpportunity,
        opportunityReason,
        suggestedSlug: cleanSlug,
        instagram: rawWeb.includes('instagram.com') ? rawWeb.split('instagram.com/')[1]?.split('/')[0] : undefined
      };
    });

    // Ordena priorizando empresas sem site próprio (alta conversão) e com mais avaliações
    leads.sort((a, b) => {
      if (a.isHighOpportunity && !b.isHighOpportunity) return -1;
      if (!a.isHighOpportunity && b.isHighOpportunity) return 1;
      return b.reviewsCount - a.reviewsCount;
    });

    const hasExternalApi = providerUsed !== 'none';

    return NextResponse.json({
      success: true,
      query,
      providerUsed,
      hasExternalApi,
      totalFound: leads.length,
      highOpportunityCount: leads.filter(l => l.isHighOpportunity).length,
      leads,
      message: hasExternalApi
        ? `${leads.length} comércios encontrados para "${query}".`
        : 'Chaves SERPER_API_KEY ou GOOGLE_PLACES_API_KEY não configuradas no .env. Utilize a inclusão manual rápida abaixo ou configure as chaves na Vercel.'
    });

  } catch (err: any) {
    console.error('[Studio Buscar Leads] Erro fatal:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao prospectar comércios na nuvem.' },
      { status: 500 }
    );
  }
}
