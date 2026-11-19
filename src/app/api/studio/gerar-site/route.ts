import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { readDb, writeDb } from '@/lib/db';
import { sanitizeSlug, saveSiteToCloudStorage, persistSiteImages } from '@/lib/site-storage';
import { getSupabaseAdmin, upsertSubscriptionInSupabase } from '@/lib/supabase';
import { getPlatformPricing, formatBRL } from '@/lib/pricing';
import { safeParseGeminiJson } from '@/lib/gemini-json';
import { BusinessSiteData, SiteService, SiteTestimonial } from '@/types/site-template-data';
import { getTemplateBySlug, SiteTemplateEntry } from '@/components/site-templates/registry';
import { renderReactSite } from '@/lib/react-site-renderer';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

interface StructuredSiteCopy {
  heroTitle: string;
  heroSubtitle: string;
  ctaLabel: string;
  aboutTitle: string;
  aboutParagraphs: string[];
  aboutHighlights?: string[];
  services: Array<{ title: string; description: string; priceTag?: string }>;
  testimonials: Array<{ author: string; rating: number; text: string }>;
  seoDescription?: string;
}

/**
 * Inteligência Local Determinística por Nicho (Fallback em 0ms)
 * Respeita rigorosamente a trava anti-invenção (preços apenas se reais, depoimentos apenas se reais)
 */
function generateNicheStructuredFallback(params: {
  businessName: string;
  niche: string;
  city: string;
  tagline?: string;
  description?: string;
  differentiators?: string;
  hours?: string;
  services?: any[];
  reviews?: any[];
  testimonials?: any[];
}): StructuredSiteCopy {
  const { businessName, niche, city, tagline, description, differentiators, hours } = params;
  const n = (niche || '').toLowerCase();
  const b = (businessName || '').toLowerCase();

  // Se o operador enviou serviços reais, prioriza-os mantendo apenas preços reais
  const customServices = Array.isArray(params.services) && params.services.length > 0
    ? params.services.map((s: any) => ({
        title: s.name || s.title || 'Serviço Especializado',
        description: s.description || 'Execução com alto padrão de qualidade e materiais certificados.',
        priceTag: s.price || s.priceTag || undefined
      }))
    : [];

  // Se o operador/Google Places enviou avaliações reais, prioriza-as; se não, lista vazia
  const customTestimonials: Array<{ author: string; rating: number; text: string }> = (
    (Array.isArray(params.reviews) && params.reviews.length > 0)
      ? params.reviews
      : (Array.isArray(params.testimonials) && params.testimonials.length > 0)
      ? params.testimonials
      : []
  ).map((t: any) => ({
    author: t.author || t.name || 'Cliente Verificado',
    text: t.text || '',
    rating: typeof t.rating === 'number' ? t.rating : 5
  })).filter((t: any) => t.text.trim().length > 0);

  // 1. Tattoo / Piercing
  if (/tattoo|tatuag|piercing|ink/i.test(n) || /tattoo|tatuag|piercing|ink/i.test(b)) {
    return {
      heroTitle: tagline || `Arte Autoral, Biossegurança e Estilo Único em ${city}`,
      heroSubtitle: description || `No ${businessName}, transformamos ideias em arte viva na pele com máxima precisão, tintas importadas certificadas e piercings em titânio grau implante.`,
      ctaLabel: 'Orçar Projeto no WhatsApp',
      aboutTitle: 'Arte na Pele com Biossegurança e Identidade',
      aboutParagraphs: [
        `O ${businessName} foi concebido para ser um ambiente acolhedor, moderno e estritamente seguro em ${city}. Nossos artistas dominam técnicas autorais que vão do fine line delicado ao realismo detalhado.`,
        differentiators || `Seguimos rigorosamente todas as normas sanitárias da ANVISA, utilizando exclusivamente materiais 100% descartáveis e esterilização de padrão hospitalar para garantir sua tranquilidade e uma cicatrização perfeita.`
      ],
      aboutHighlights: [
        'Materiais 100% descartáveis e estéreis',
        'Joias em titânio grau implante antialérgico',
        'Atendimento com hora marcada e foco total',
        'Espaço certificado pelas normas da ANVISA'
      ],
      services: customServices.length >= 6 ? customServices.slice(0, 6) : [
        ...customServices,
        { title: 'Tatuagem Autoral Exclusiva', description: 'Criação sob medida do seu desenho adaptado à sua anatomia corporal.' },
        { title: 'Flash Tattoo & Fine Line', description: 'Traços finos, precisos e delicados com cicatrização suave.' },
        { title: 'Aplicação de Piercing em Titânio', description: 'Perfuração com agulha americana e joalheria em titânio grau implante antialérgico.' },
        { title: 'Reforma & Cobertura (Cover-up)', description: 'Restauração e camuflagem de tatuagens antigas com máxima precisão estética.' },
        { title: 'Realismo & Sombreado', description: 'Projetos de grande porte com contraste profundo e riqueza de texturas.' },
        { title: 'Consultoria e Troca de Joias', description: 'Avaliação da cicatrização e atualização para peças exclusivas de alta joalheria.' }
      ].slice(0, 6),
      testimonials: customTestimonials,
      seoDescription: `${businessName} em ${city} - Estúdio de tatuagem autoral, fine line e aplicação de piercing em titânio com biossegurança ANVISA.`
    };
  }

  // 2. Barbearia
  if (/barbe|barba|corte|fade|navalha/i.test(n) || /barbe|barba|corte/i.test(b)) {
    return {
      heroTitle: tagline || `Estilo, Precisão e Navalha Afiada em ${city}`,
      heroSubtitle: description || `Na ${businessName}, você encontra mestres barbeiros, corte clássico e moderno, barboterapia relaxante e ambiente exclusivo.`,
      ctaLabel: 'Agendar Horário no WhatsApp',
      aboutTitle: 'Tradição & Excelência em Cada Corte',
      aboutParagraphs: [
        `A ${businessName} nasceu para resgatar a verdadeira essência da barbearia clássica aliada às técnicas mais inovadoras do mercado masculino em ${city}.`,
        differentiators || `Nosso espaço foi cuidadosamente planejado para ser seu refúgio de estilo, conforto e descontração, oferecendo toalha quente, navalha afiada e produtos de linha premium.`
      ],
      aboutHighlights: [
        'Profissionais especializados em degradê e barba',
        'Barboterapia completa com toalha quente',
        'Ambiente climatizado e confortável',
        'Agendamento rápido e pontualidade'
      ],
      services: customServices.length >= 6 ? customServices.slice(0, 6) : [
        ...customServices,
        { title: 'Corte Degradê / Fade Master', description: 'Acabamento milimétrico na tesoura e máquina com finalização premium.' },
        { title: 'Barboterapia com Toalha Quente', description: 'Esfoliação facial, hidratação profunda de fios e lâmina afiada.' },
        { title: 'Combo Cabelo + Barba Completo', description: 'Nosso pacote mais pedido para um visual alinhado da cabeça aos pés.' },
        { title: 'Pigmentação & Camuflagem', description: 'Disfarce natural de falhas e fios brancos com produtos de alta fixação.' },
        { title: 'Selagem Térmica Masculina', description: 'Alinhamento capilar com redução de volume e brilho natural.' },
        { title: 'Penteado & Finalização VIP', description: 'Lavagem especial com massagem capilar e estilização para ocasiões especiais.' }
      ].slice(0, 6),
      testimonials: customTestimonials,
      seoDescription: `${businessName} em ${city} - Barbearia completa com corte fade, barba na navalha, barboterapia e atendimento VIP com hora marcada.`
    };
  }

  // 3. Gastronomia / Pizzaria / Burger / Café
  if (/pizza|restaurante|burger|hamburguer|lanche|comida|gourmet|sushi|culinaria|cafe/i.test(n) || /pizza|burger|lanche/i.test(b)) {
    return {
      heroTitle: tagline || `Sabor Incomparável & Tradição Gastronômica em ${city}`,
      heroSubtitle: description || `Ingredientes selecionados, preparo artesanal e uma experiência gastronômica memorável para saborear no local ou receber quentinho no delivery.`,
      ctaLabel: 'Fazer Pedido no WhatsApp',
      aboutTitle: 'Nossa Paixão pela Autêntica Culinária',
      aboutParagraphs: [
        `Na ${businessName}, cada receita carrega dedicação e paixão. Priorizamos produtores locais e ingredientes frescos para levar sabor marcante e aconchego ao seu paladar.`,
        differentiators || `Seja em nosso salão acolhedor ou através da nossa entrega rápida e bem embalada, garantimos a você uma refeição preparada na hora com padrão de alta gastronomia.`
      ],
      aboutHighlights: [
        'Ingredientes frescos e de alta procedência',
        'Receitas autorais e preparo artesanal',
        'Embalagens térmicas seguras para delivery',
        'Cardápio variado com opções para toda a família'
      ],
      services: customServices.length >= 6 ? customServices.slice(0, 6) : [
        ...customServices,
        { title: 'Prato Assinatura da Casa', description: 'Receita exclusiva com os melhores ingredientes da estação e tempero autoral.' },
        { title: 'Combo Degustação Especial', description: 'Porção generosa para compartilhar acompanhada de entradas selecionadas.' },
        { title: 'Especialidade Tradicional', description: 'O clássico mais pedido pelos clientes com sabor inconfundível.' },
        { title: 'Opção Artesanal Leve', description: 'Ingredientes frescos e combinações pensadas com equilíbrio e sabor.' },
        { title: 'Sobremesa Artesanal', description: 'Finalização doce perfeita preparada diariamente com textura equilibrada.' },
        { title: 'Bebidas e Drinks Especiais', description: 'Sucos naturais, refrigerantes e opções exclusivas para harmonizar.' }
      ].slice(0, 6),
      testimonials: customTestimonials,
      seoDescription: `${businessName} em ${city} - Cardápio artesanal, delivery rápido e os melhores pratos preparados com ingredientes selecionados.`
    };
  }

  // 4. Odonto / Clínica / Estética / Saúde
  if (/odonto|dentia|dentista|clinica|médic|medico|saude|estetic|dermatolog/i.test(n) || /odonto|clinica|estetic/i.test(b)) {
    return {
      heroTitle: tagline || `Saúde, Tecnologia e Cuidado Humanizado em ${city}`,
      heroSubtitle: description || `Tratamentos modernos com profissionais especialistas, estrutura de ponta e foco no seu bem-estar, autoestima e qualidade de vida.`,
      ctaLabel: 'Agendar Consulta no WhatsApp',
      aboutTitle: 'Compromisso com a Sua Saúde e Bem-Estar',
      aboutParagraphs: [
        `A ${businessName} reúne profissionais especializados e dedicados a um atendimento ético, acolhedor e individualizado em ${city}.`,
        differentiators || `Nossa clínica conta com infraestrutura moderna, equipamentos avançados e biossegurança rigorosa para proporcionar tratamentos confortáveis e resultados de alta precisão.`
      ],
      aboutHighlights: [
        'Equipe multidisciplinar especializada',
        'Equipamentos modernos e alta precisão',
        'Atendimento humanizado e sem dor',
        'Biossegurança rigorosa em todos os procedimentos'
      ],
      services: customServices.length >= 6 ? customServices.slice(0, 6) : [
        ...customServices,
        { title: 'Avaliação Clínica Completa', description: 'Diagnóstico detalhado com planejamento sob medida para o seu caso.' },
        { title: 'Procedimento Estético Avançado', description: 'Tecnologia moderna para rejuvenescimento com naturalidade e harmonia.' },
        { title: 'Tratamento Preventivo & Check-up', description: 'Acompanhamento periódico para manter sua saúde sempre protegida.' },
        { title: 'Atendimento Rápido para Urgências', description: 'Acolhimento imediato para alívio seguro e resolução eficaz.' },
        { title: 'Procedimento Restaurador de Ponta', description: 'Materiais de última geração com alta durabilidade e acabamento estético.' },
        { title: 'Manutenção e Acompanhamento', description: 'Suporte continuado para preservar os resultados alcançados.' }
      ].slice(0, 6),
      testimonials: customTestimonials,
      seoDescription: `${businessName} em ${city} - Atendimento especializado, estrutura moderna e tratamentos com tecnologia de ponta.`
    };
  }

  // 5. Fallback Comercial Geral / Corporativo / Serviços
  return {
    heroTitle: tagline || `Excelência, Tradição e Confiança em ${city}`,
    heroSubtitle: description || `Na ${businessName}, unimos compromisso com resultados e atendimento personalizado para entregar as melhores soluções para você e sua família.`,
    ctaLabel: 'Falar no WhatsApp',
    aboutTitle: 'Compromisso com o Mais Alto Padrão de Qualidade',
    aboutParagraphs: [
      `Com atuação de destaque em ${city}, a ${businessName} se consolidou pela seriedade, pontualidade rigorosa e transparência em cada projeto executado.`,
      differentiators || `Contamos com equipe altamente qualificada e processos certificados para superar suas expectativas, oferecendo soluções ágeis e atendimento dedicado antes, durante e após a contratação.`
    ],
    aboutHighlights: [
      'Profissionais experientes e certificados',
      'Orçamento transparente e sem surpresas',
      'Pontualidade rigorosa em todas as entregas',
      'Garantia de qualidade e suporte dedicado'
    ],
    services: customServices.length >= 6 ? customServices.slice(0, 6) : [
      ...customServices,
      { title: `Serviço Especializado de ${niche}`, description: 'Atendimento de alto nível com métodos certificados e garantia de satisfação.' },
      { title: 'Solução Completa Personalizada', description: 'Planejamento sob medida para atender perfeitamente sua necessidade específica.' },
      { title: 'Atendimento Ágil / Express', description: 'Prioridade e rapidez para resolver sua demanda com máxima precisão.' },
      { title: 'Consultoria e Avaliação Técnica', description: 'Diagnóstico transparente com detalhamento minucioso do serviço.' },
      { title: 'Manutenção Preventiva & Suporte', description: 'Acompanhamento preventivo para garantir a máxima durabilidade do serviço.' },
      { title: 'Garantia e Suporte Pós-Venda', description: 'Segurança total para você com suporte continuado sempre que precisar.' }
    ].slice(0, 6),
    testimonials: customTestimonials,
    seoDescription: `${businessName} em ${city} - Soluções em ${niche} com alto padrão, pontualidade e orçamento rápido pelo WhatsApp.`
  };
}

/**
 * Chamada Cirúrgica ao Gemini para Geração de Copy com Trava Anti-Invenção
 */
async function callGeminiForStructuredSiteData(params: {
  businessName: string;
  niche: string;
  city: string;
  tagline?: string;
  description?: string;
  differentiators?: string;
  hours?: string;
  address?: string;
  services?: any[];
  reviews?: any[];
  uploadedText?: string;
  templateEntry: SiteTemplateEntry;
  apiKey: string;
  model?: string;
}): Promise<StructuredSiteCopy | null> {
  const { apiKey, templateEntry } = params;
  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
  if (!cleanKey) return null;

  const models = [
    params.model || process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    'gemini-3.8-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ].filter(Boolean);

  const prompt = `Você é um redator publicitário de alta conversão para comércio local brasileiro.
Gere a copy estruturada do site oficial para o comércio abaixo, estritamente alinhada aos dados reais fornecidos.

DADOS REAIS DO COMÉRCIO:
- Nome da Empresa: "${params.businessName}"
- Nicho / Ramo de Atuação: "${params.niche}"
- Cidade/Região: "${params.city}"
- Slogan / Diferenciais Reais: "${params.differentiators || params.tagline || ''}"
- Horário Real de Atendimento: "${params.hours || ''}"
- Endereço Real: "${params.address || ''}"
- Serviços Cadastrados (Dados Reais): ${JSON.stringify(params.services || [])}
- Avaliações Reais de Clientes (Google Places): ${JSON.stringify(params.reviews || [])}
${params.uploadedText ? `- Extração de Cardápio / OCR:\n"""${params.uploadedText.slice(0, 800)}"""` : ''}

ESTILO VISUAL DO TEMPLATE:
- Nome do Template: "${templateEntry.name}" (${templateEntry.category})
- Modo Visual: "${templateEntry.blueprint.styleMode}"
- Tipografia: ${templateEntry.blueprint.typography.headingFont} (títulos) + ${templateEntry.blueprint.typography.bodyFont} (corpo)

⚠️ REGRAS ANTI-INVENÇÃO RIGOROSAS (VIOLAÇÃO PROIBIDA):
1. NUNCA INVENTE PREÇOS: Se os serviços cadastrados não incluírem preços reais ou se não constarem no OCR, omita o campo priceTag (NÃO crie "R$ XX,00" inventados!).
2. NUNCA INVENTE DEPOIMENTOS: Use exclusivamente as avaliações reais de clientes fornecidas acima. Se o array de avaliações reais estiver vazio, retorne testimonials como array vazio []! O componente React oculta automaticamente a seção de depoimentos quando vazia.
3. NUNCA INVENTE ANOS DE FUNDAÇÃO, PRÊMIOS OU CERTIFICAÇÕES FICTÍCIAS: Destaque apenas a dedicação, qualidade técnica, atendimento acolhedor e padrões reais da categoria.
4. NUNCA INVENTE ENDEREÇOS: Use apenas a cidade informada ("${params.city}") e o endereço real se fornecido.
5. Adapte a copy 100% para o nicho de "${params.niche}" com linguagem brasileira natural, profissional e de alta conversão.

Retorne EXCLUSIVAMENTE o JSON estruturado:
{
  "heroTitle": "Título de alto impacto com máx 9 palavras",
  "heroSubtitle": "Subtítulo persuasivo com autoridade e benefício em até 25 palavras",
  "ctaLabel": "Texto do botão de ação (ex: Agendar Horário no WhatsApp, Fazer Pedido no WhatsApp)",
  "aboutTitle": "Título para a seção Sobre Nós",
  "aboutParagraphs": [
    "Primeiro parágrafo de 40 a 60 palavras...",
    "Segundo parágrafo de 40 a 60 palavras..."
  ],
  "aboutHighlights": [
    "Destaque real 1",
    "Destaque real 2",
    "Destaque real 3",
    "Destaque real 4"
  ],
  "services": [
    { "title": "Nome do Serviço", "description": "Descrição clara e objetiva do serviço", "priceTag": "Preço real se houver (opcional)" }
  ],
  "testimonials": [
    { "author": "Nome do autor da avaliação real", "rating": 5, "text": "Texto da avaliação real" }
  ],
  "seoDescription": "Meta descrição de 140 a 160 caracteres para buscas no Google"
}`;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.25,
            responseMimeType: 'application/json',
            maxOutputTokens: 8192
          }
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (!res.ok) continue;

      const data = await res.json();
      const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawJson) {
        const parsed = safeParseGeminiJson<StructuredSiteCopy | null>(rawJson, null);
        if (parsed && parsed.heroTitle && Array.isArray(parsed.services)) {
          return parsed;
        }
      }
    } catch (err: any) {
      console.warn(`[Gemini Structured Data] Modelo ${model} falhou ou expirou:`, err?.message);
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      businessName,
      shortName = '',
      headerName = '',
      niche = 'Barbearia',
      city = 'São Paulo - SP',
      phone,
      whatsapp,
      subdomain,
      tagline,
      description,
      theme = 'dark-neon',
      templateId = 'barbearia-crop-vintage',
      accentColor = '#84cc16',
      primaryColor,
      backgroundColor,
      surfaceColor,
      textColor,
      fontPair,
      paletteId,
      logoUrl = '',
      heroPhoto = '',
      galleryPhotos = [],
      services = [],
      features = [],
      faqs = [],
      testimonials = [],
      reviews = [],
      hours = 'Segunda a Sábado das 08h às 19h',
      address = '',
      instagram = '',
      differentiators = '',
      toneOfVoice = 'comercial',
      uploadedText = '',
      operatorId = 'OP-BILLY-01',
      operatorName = 'Operador Oficial'
    } = body;

    if (!businessName || !subdomain) {
      return NextResponse.json(
        { success: false, error: 'Nome da empresa e subdomínio são obrigatórios.' },
        { status: 400 }
      );
    }

    const cleanSlug = sanitizeSlug(subdomain);
    if (!cleanSlug) {
      return NextResponse.json(
        { success: false, error: 'Subdomínio inválido. Use apenas letras e números.' },
        { status: 400 }
      );
    }

    const rawPhone = (whatsapp || phone || '11999999999').replace(/\D/g, '');
    const cleanPhone = rawPhone.length <= 11 && !rawPhone.startsWith('55') ? `55${rawPhone}` : rawPhone;
    const phoneDisplay = phone || (whatsapp ? whatsapp.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3') : '(11) 99999-9999');

    // 1. Obtém o template React tipado correspondente
    const templateEntry = getTemplateBySlug(templateId);

    // 2. Persiste fotos temporárias externas do Google/Instagram no Supabase Storage permanente
    let finalHeroPhoto = heroPhoto;
    let finalGalleryPhotos = Array.isArray(galleryPhotos) ? galleryPhotos : [];
    try {
      const persisted = await persistSiteImages(heroPhoto, finalGalleryPhotos, cleanSlug);
      finalHeroPhoto = persisted.heroPhoto;
      finalGalleryPhotos = persisted.galleryPhotos;
    } catch (persistErr) {
      console.warn('[Studio Gerar Site] Falha ao persistir imagens no Supabase Storage:', persistErr);
    }

    // 3. Geração da Copy Estruturada (Gemini em ~2 a 4s com Fallback Local em 0ms)
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    let siteCopy: StructuredSiteCopy | null = null;
    let usedAi = false;
    let modelUsed: string | undefined;

    const realReviewsInput = (Array.isArray(reviews) && reviews.length > 0)
      ? reviews
      : (Array.isArray(testimonials) && testimonials.length > 0 ? testimonials : []);

    if (apiKey) {
      try {
        const preferredModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
        siteCopy = await callGeminiForStructuredSiteData({
          businessName,
          niche,
          city,
          tagline,
          description,
          differentiators,
          hours,
          address,
          services,
          reviews: realReviewsInput,
          uploadedText,
          templateEntry,
          apiKey,
          model: preferredModel
        });
        if (siteCopy) {
          usedAi = true;
          modelUsed = preferredModel;
        }
      } catch (geminiErr: any) {
        console.warn('[Studio Gerar Site] Aviso Gemini, acionando fallback local:', geminiErr?.message);
      }
    }

    if (!siteCopy) {
      siteCopy = generateNicheStructuredFallback({
        businessName,
        niche,
        city,
        tagline,
        description,
        differentiators,
        hours,
        services,
        reviews,
        testimonials
      });
    }

    // 4. Monta o contrato estrito BusinessSiteData com dados reais e blindagem total
    const galleryItems = finalGalleryPhotos.map((url: string, idx: number) => ({
      url,
      alt: `${businessName} - Trabalho ${idx + 1}`
    }));

    // Depoimentos reais ou array vazio [] (componente esconde automaticamente se vazio)
    const finalTestimonials: SiteTestimonial[] = (siteCopy.testimonials || []).map((t: any) => ({
      author: t.author || t.name || 'Cliente Verificado',
      rating: typeof t.rating === 'number' ? Math.min(5, Math.max(1, t.rating)) : 5,
      text: t.text || ''
    })).filter((t: any) => t.text.trim().length > 0);

    const businessSiteData: BusinessSiteData = {
      brandName: businessName,
      niche,
      palette: {
        primary: primaryColor || accentColor || templateEntry.blueprint.defaultPalette.primary,
        secondary: templateEntry.blueprint.defaultPalette.secondary,
        background: backgroundColor || templateEntry.blueprint.defaultPalette.background,
        surface: surfaceColor || templateEntry.blueprint.defaultPalette.surface,
        text: textColor || templateEntry.blueprint.defaultPalette.text
      },
      hero: {
        title: siteCopy.heroTitle,
        subtitle: siteCopy.heroSubtitle,
        ctaLabel: siteCopy.ctaLabel || 'Falar no WhatsApp',
        backgroundImage: finalHeroPhoto || templateEntry.blueprint.thumbnail
      },
      about: {
        title: siteCopy.aboutTitle,
        paragraphs: siteCopy.aboutParagraphs,
        image: finalGalleryPhotos[0] || finalHeroPhoto || templateEntry.blueprint.thumbnail,
        highlights: siteCopy.aboutHighlights && siteCopy.aboutHighlights.length > 0
          ? siteCopy.aboutHighlights
          : [
              'Atendimento ágil pelo WhatsApp',
              'Padrão de qualidade certificado',
              'Localização de fácil acesso',
              'Compromisso com sua satisfação'
            ]
      },
      services: (siteCopy.services || []).map((s: any) => ({
        title: s.title,
        description: s.description,
        priceTag: s.priceTag && !s.priceTag.toLowerCase().includes('inventad') && s.priceTag !== 'Sob Consulta'
          ? s.priceTag
          : undefined
      })),
      gallery: galleryItems,
      testimonials: finalTestimonials,
      contact: {
        whatsappUrl: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Olá! Vim pelo site oficial da ${businessName} e gostaria de informações.`)}`,
        phoneDisplay: phoneDisplay,
        address: address ? `${address}, ${city}` : (city ? `${city}` : undefined),
        mapsUrl: address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}`)}` : undefined,
        mapsEmbedUrl: address ? `https://maps.google.com/maps?q=${encodeURIComponent(`${address}, ${city}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed` : undefined,
        hours: hours ? [hours] : ['Segunda a Sábado das 08h às 19h']
      },
      seo: {
        title: `${businessName} | ${niche} em ${city}`,
        description: siteCopy.seoDescription || `${businessName} em ${city} - Conheça nossos serviços de ${niche} com atendimento de excelência e orçamento rápido pelo WhatsApp.`
      }
    };

    // 5. Renderização Server-Side Estática (react-dom/server + Tailwind + Google Fonts)
    let generatedHtml: string;
    try {
      generatedHtml = renderReactSite({
        data: businessSiteData,
        templateSlug: templateId
      });
    } catch (renderErr: any) {
      console.error('[Studio Gerar Site] Erro no renderReactSite:', renderErr);
      return NextResponse.json(
        { success: false, error: `Falha na renderização do site: ${renderErr?.message || 'Erro desconhecido'}` },
        { status: 500 }
      );
    }

    // 6. Grava no disco local apenas se não estiver em ambiente Vercel Serverless
    try {
      if (!process.env.VERCEL) {
        const siteDir = path.join(process.cwd(), 'public', 'generated-sites', cleanSlug);
        if (!fs.existsSync(siteDir)) {
          fs.mkdirSync(siteDir, { recursive: true });
        }
        fs.writeFileSync(path.join(siteDir, 'index.html'), generatedHtml, 'utf-8');
      }
    } catch (fsErr) {
      console.warn('[Studio Gerar Site] Aviso gravação em disco:', fsErr);
    }

    // 7. Salva no banco local db.json
    const leadToken = `lead_${cleanSlug}_${Date.now().toString(36)}`;
    try {
      const db = readDb();
      if (!db.generatedSites) db.generatedSites = {};
      db.generatedSites[cleanSlug] = generatedHtml;

      if (!db.demos) db.demos = {};
      db.demos[leadToken] = {
        leadToken,
        title: businessName,
        category: niche,
        deployedUrl: `/api/public/site/${cleanSlug}/render`,
        phone: rawPhone,
        instagram,
        html: generatedHtml,
        updatedAt: new Date().toISOString()
      };

      const pricing = await getPlatformPricing();
      const monthlyPrice = pricing.monthly_plan_price;

      if (!Array.isArray(db.subscriptions)) {
        db.subscriptions = [];
      }

      const existingSubIdx = db.subscriptions.findIndex((s) => s.siteSlug === cleanSlug);
      const subRecord = {
        id: `sub_${cleanSlug}`,
        siteSlug: cleanSlug,
        clientName: businessName,
        clientPhone: rawPhone,
        clientEmail: `${cleanSlug}@webbilly.com.br`,
        operatorToken: operatorId,
        operatorName: operatorName,
        monthlyPrice: monthlyPrice,
        status: 'draft' as const,
        site_status: 'draft',
        deployedUrl: `/api/public/site/${cleanSlug}/render`,
        checkoutUrl: `/proposta/${leadToken}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        leadToken
      };

      if (existingSubIdx >= 0) {
        db.subscriptions[existingSubIdx] = { ...db.subscriptions[existingSubIdx], ...subRecord };
      } else {
        db.subscriptions.unshift(subRecord);
      }

      writeDb(db);
    } catch (dbErr) {
      console.warn('[Studio Gerar Site] Aviso db.json:', dbErr);
    }

    // 8. Salva no Supabase Storage e na tabela subscriptions como RASCUNHO
    await saveSiteToCloudStorage(cleanSlug, generatedHtml, {
      businessName,
      niche,
      city,
      isPublished: false,
      status: 'draft'
    });

    const pricing = await getPlatformPricing();
    const monthlyPrice = pricing.monthly_plan_price;
    const formattedMonthly = formatBRL(monthlyPrice);

    const subRecord = {
      id: `sub_${cleanSlug}`,
      siteSlug: cleanSlug,
      clientName: businessName,
      clientPhone: rawPhone,
      clientEmail: `${cleanSlug}@webbilly.com.br`,
      operatorId: operatorId,
      operatorToken: operatorId,
      operatorName: operatorName,
      monthlyPrice: monthlyPrice,
      status: 'draft' as const,
      site_status: 'draft',
      deployedUrl: `/api/public/site/${cleanSlug}/render`,
      checkoutUrl: `/proposta/${leadToken}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      leadToken
    };

    try {
      await upsertSubscriptionInSupabase(subRecord);
    } catch (supaErr) {
      console.warn('[Studio Gerar Site] Erro ao sincronizar com Supabase:', supaErr);
    }

    // 9. Mensagem de Fechamento de Venda no WhatsApp
    const siteUrl = `https://${cleanSlug}.webbilly.com.br`;
    const proposalUrl = `https://webbilly.com.br/proposta/${leadToken}`;

    const whatsappMessage = `Olá, tudo bem? Sou da equipe da Webbilly e temos uma novidade exclusiva para a *${businessName}*!

Tomamos a iniciativa de criar uma demonstração profissional do site oficial de vocês, adaptado para celulares e pronto para receber clientes do Google:

${siteUrl}

Hoje a maioria das pessoas pesquisa antes no Google ao procurar por ${niche} em ${city}. Ter esse endereço no ar passa muito mais autoridade imediata e ajuda a fechar agendamentos pelo WhatsApp.

Como a página já está montada, preparamos uma condição especial de lançamento por apenas ${formattedMonthly}/mês, sem taxa de criação e sem fidelidade:

${proposalUrl}

O que achou do visual que preparamos para vocês? Se quiser tirar qualquer dúvida ou ativar hoje mesmo, é só me responder por aqui!`;

    return NextResponse.json({
      success: true,
      slug: cleanSlug,
      html: generatedHtml,
      usedAi,
      modelUsed,
      subdomainUrl: siteUrl,
      previewUrl: `/api/public/site/${cleanSlug}/render`,
      proposalUrl,
      leadToken,
      whatsappMessage,
      isPublished: false,
      isDeployed: false
    });
  } catch (error: any) {
    console.error('[Studio Gerar Site] Erro inesperado:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Falha ao processar a geração do site.' },
      { status: 500 }
    );
  }
}
