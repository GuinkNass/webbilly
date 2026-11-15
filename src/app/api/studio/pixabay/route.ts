import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface PixabayImage {
  id: string | number;
  previewUrl: string;
  largeUrl: string;
  tags: string;
  user?: string;
}

// Acervo curado de alta resolução para fallback caso a API externa não esteja configurada
const CURATED_FALLBACK_COLLECTION: PixabayImage[] = [
  // Barbearia & Beleza Masculina
  {
    id: 'barb-01',
    previewUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&auto=format&fit=crop&q=80',
    tags: 'barbearia, corte, cabelo, barba, barbeiro, masculino, navalha',
    user: 'Studio Barber'
  },
  {
    id: 'barb-02',
    previewUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1600&auto=format&fit=crop&q=80',
    tags: 'barbearia, espaço, cadeira, vintage, clássico, salão',
    user: 'Vintage Hair'
  },
  {
    id: 'barb-03',
    previewUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1600&auto=format&fit=crop&q=80',
    tags: 'barba, toalha quente, barbearia, tratamento, cuidados',
    user: 'Grooming Pro'
  },
  // Estética, Spa & Salão Feminino
  {
    id: 'est-01',
    previewUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&auto=format&fit=crop&q=80',
    tags: 'estética, beleza, pele, tratamento facial, clínica, spa',
    user: 'Beauty Clinic'
  },
  {
    id: 'est-02',
    previewUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1600&auto=format&fit=crop&q=80',
    tags: 'massagem, massoterapia, relaxamento, bem-estar, spa, estética',
    user: 'Wellness Spa'
  },
  {
    id: 'est-03',
    previewUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1600&auto=format&fit=crop&q=80',
    tags: 'salão de beleza, maquiagem, cabelo, sobrancelha, estética',
    user: 'Glamour Studio'
  },
  // Gastronomia, Restaurante, Hamburgueria & Pizzaria
  {
    id: 'gast-01',
    previewUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&auto=format&fit=crop&q=80',
    tags: 'restaurante, prato, culinária, gastronomia, jantar, chef',
    user: 'Gourmet Chef'
  },
  {
    id: 'gast-02',
    previewUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1600&auto=format&fit=crop&q=80',
    tags: 'hamburguer, burger, batata frita, lanche, artesanal, comida',
    user: 'Burger Craft'
  },
  {
    id: 'gast-03',
    previewUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&auto=format&fit=crop&q=80',
    tags: 'pizza, pizzaria, queijo, forno a lenha, massa, italiana',
    user: 'Pizza Napoletana'
  },
  {
    id: 'gast-04',
    previewUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1600&auto=format&fit=crop&q=80',
    tags: 'sushi, japonês, culinária oriental, salmão, sashimi, temaki',
    user: 'Sushi Master'
  },
  // Saúde, Odontologia & Clínicas
  {
    id: 'sau-01',
    previewUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1600&auto=format&fit=crop&q=80',
    tags: 'dentista, odontologia, dente, sorriso, clínica dentária, saúde',
    user: 'Dental Care'
  },
  {
    id: 'sau-02',
    previewUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&auto=format&fit=crop&q=80',
    tags: 'médico, clínica, consultório, saúde, consulta, hospital',
    user: 'Medical Center'
  },
  // Automotivo, Mecânica & Lava Rápido
  {
    id: 'auto-01',
    previewUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1600&auto=format&fit=crop&q=80',
    tags: 'carro, oficina mecânica, mecânico, manutenção, motor, automotivo',
    user: 'Auto Detail'
  },
  {
    id: 'auto-02',
    previewUrl: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1600&auto=format&fit=crop&q=80',
    tags: 'lava rápido, polimento, vitrificação, detailing, carro, limpeza',
    user: 'Auto Wash'
  },
  // Pet Shop & Veterinária
  {
    id: 'pet-01',
    previewUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1600&auto=format&fit=crop&q=80',
    tags: 'pet shop, cachorro, banho e tosa, veterinária, animais, gato',
    user: 'Pet Lover'
  },
  {
    id: 'pet-02',
    previewUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1600&auto=format&fit=crop&q=80',
    tags: 'veterinário, clínica veterinária, cão, gato, cuidado pet',
    user: 'Vet Clinic'
  },
  // Tatuagem & Body Art
  {
    id: 'tat-01',
    previewUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=1600&auto=format&fit=crop&q=80',
    tags: 'tatuagem, tattoo, estúdio de tatuagem, tinta, arte na pele, piercing',
    user: 'Tattoo Artist'
  },
  // Negócios, Advocacia, Contabilidade & Imobiliária
  {
    id: 'neg-01',
    previewUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80',
    tags: 'escritório, advocacia, advogado, contabilidade, consultoria, negócios',
    user: 'Corporate Office'
  },
  {
    id: 'neg-02',
    previewUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=80',
    largeUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&auto=format&fit=crop&q=80',
    tags: 'imobiliária, corretor de imóveis, casa, apartamento, compra, venda',
    user: 'Real Estate'
  }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();
    const perPage = parseInt(searchParams.get('perPage') || '24', 10);
    const apiKey = (process.env.PIXABAY_API_KEY || '').trim();

    // 1. Se possuir chave do Pixabay, consulta a API oficial
    if (apiKey) {
      try {
        const endpoint = `https://pixabay.com/api/?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query || 'business')}&image_type=photo&per_page=${perPage}&safesearch=true&lang=pt`;
        const res = await fetch(endpoint, { next: { revalidate: 3600 } });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.hits) && data.hits.length > 0) {
            const images = data.hits.map((hit: any) => ({
              id: hit.id,
              previewUrl: hit.webformatURL,
              largeUrl: hit.largeImageURL,
              tags: hit.tags,
              user: hit.user,
              likes: hit.likes
            }));
            return NextResponse.json({
              success: true,
              images,
              total: data.totalHits || images.length,
              fromFallback: false
            });
          }
        }
      } catch (pixErr) {
        console.warn('[API Pixabay] Falha ao consultar Pixabay API, usando acervo curado:', pixErr);
      }
    }

    // 2. Fallback Inteligente baseado em Tags e Palavras-chave
    let filtered = CURATED_FALLBACK_COLLECTION;
    if (query) {
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      const matches = CURATED_FALLBACK_COLLECTION.filter((img) =>
        terms.some((term) => img.tags.toLowerCase().includes(term))
      );
      if (matches.length > 0) {
        filtered = matches;
      }
    }

    return NextResponse.json({
      success: true,
      images: filtered,
      total: filtered.length,
      fromFallback: true,
      message: apiKey
        ? 'Resultados obtidos com fallback curado.'
        : 'Exibindo acervo curado em alta resolução da Billy Suite.'
    });
  } catch (error: any) {
    console.error('[API Pixabay] Erro inesperado:', error);
    return NextResponse.json({
      success: true,
      images: CURATED_FALLBACK_COLLECTION.slice(0, 12),
      total: 12,
      fromFallback: true
    });
  }
}
