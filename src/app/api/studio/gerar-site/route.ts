import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { readDb, writeDb } from '@/lib/db';
import { sanitizeSlug, saveSiteToCloudStorage, persistSiteImages } from '@/lib/site-storage';
import { getSupabaseAdmin, upsertSubscriptionInSupabase } from '@/lib/supabase';
import { getPlatformPricing, formatBRL } from '@/lib/pricing';
import { renderNativeSite, StructuredSiteData, StructuredService, StructuredTestimonial } from '@/lib/native-site-renderer';
import { safeParseGeminiJson } from '@/lib/gemini-json';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * Inteligência Local Determinística por Nicho (Fallback em 0ms)
 * Retorna rigorosamente o schema do Gemini sem risco de falha
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
}): StructuredSiteData {
  const { businessName, niche, city, tagline, description, differentiators, hours } = params;
  const n = (niche || '').toLowerCase();
  const b = (businessName || '').toLowerCase();

  // Se o operador enviou serviços ou depoimentos manuais, prioriza-os
  const customServices: StructuredService[] = Array.isArray(params.services) && params.services.length > 0
    ? params.services.map((s: any) => ({
        title: s.name || s.title || 'Serviço Especializado',
        description: s.description || 'Execução com alto padrão de qualidade e materiais certificados.',
        priceTag: s.price || s.priceTag || 'Sob Consulta'
      }))
    : [];

  const customTestimonials: StructuredTestimonial[] = (
    (Array.isArray(params.reviews) && params.reviews.length > 0)
      ? params.reviews
      : (Array.isArray(params.testimonials) && params.testimonials.length > 0)
      ? params.testimonials
      : []
  ).map((t: any) => ({
    name: t.author || t.name || 'Cliente Verificado',
    text: t.text || 'Excelente atendimento! Profissionais super dedicados e atenciosos.',
    rating: typeof t.rating === 'number' ? t.rating : 5
  }));

  // 1. Tattoo / Piercing
  if (/tattoo|tatuag|piercing|ink/i.test(n) || /tattoo|tatuag|piercing|ink/i.test(b)) {
    return {
      heroTitle: tagline || `Arte Autoral, Biossegurança e Estilo Único em ${city}`,
      heroSubtitle: description || `No ${businessName}, transformamos ideias em arte viva na pele com máxima precisão, tintas importadas certificadas e piercings em titânio grau implante.`,
      ctaText: 'Orçar Projeto no WhatsApp',
      aboutTitle: 'Arte na Pele com Biossegurança e Identidade',
      aboutParagraphs: [
        `O ${businessName} foi concebido para ser um ambiente acolhedor, moderno e estritamente seguro em ${city}. Nossos artistas dominam técnicas autorais que vão do fine line delicado ao realismo detalhado.`,
        differentiators || `Seguimos rigorosamente todas as normas sanitárias da ANVISA, utilizando exclusivamente materiais 100% descartáveis e esterilização de padrão hospitalar para garantir sua tranquilidade e uma cicatrização perfeita.`
      ],
      services: customServices.length >= 6 ? customServices.slice(0, 6) : [
        ...customServices,
        { title: 'Tatuagem Autoral Exclusiva', description: 'Criação sob medida do seu desenho adaptado à sua anatomia corporal.', priceTag: 'Sob Consulta' },
        { title: 'Flash Tattoo / Fine Line', description: 'Traços finos, precisos e delicados com cicatrização suave.', priceTag: 'A partir de R$ 150,00' },
        { title: 'Aplicação de Piercing em Titânio', description: 'Perfuração com agulha americana e joalheria em titânio grau implante antialérgico.', priceTag: 'R$ 80,00' },
        { title: 'Reforma & Cobertura (Cover-up)', description: 'Restauração e camuflagem de tatuagens antigas com máxima precisão estética.', priceTag: 'Sob Consulta' },
        { title: 'Realismo & Sombreado', description: 'Projetos de grande porte com contraste profundo e riqueza de texturas.', priceTag: 'Sob Consulta' },
        { title: 'Consultoria e Troca de Joias', description: 'Avaliação da cicatrização e atualização para peças exclusivas de alta joalheria.', priceTag: 'R$ 40,00' }
      ].slice(0, 6),
      testimonials: customTestimonials.length >= 3 ? customTestimonials.slice(0, 3) : [
        { name: 'Camila Rocha', text: 'Traço finíssimo e cicatrização impecável! O estúdio é extremamente limpo e os artistas são muito cuidadosos.', rating: 5 },
        { name: 'Diego Navarro', text: 'Fechei meu antebraço e ficou surreal. O atendimento desde o primeiro contato no WhatsApp foi nota 10.', rating: 5 },
        { name: 'Beatriz Vasconcelos', text: 'Coloquei dois piercings de titânio, não doeu nada e a cicatrização foi perfeita. Recomendo de olhos fechados!', rating: 5 }
      ],
      businessHours: hours || 'Terça a Sábado das 10h às 20h',
      seoDescription: `${businessName} em ${city} - Estúdio de tatuagem autoral, fine line e aplicação de piercing em titânio com biossegurança ANVISA.`
    };
  }

  // 2. Barbearia
  if (/barbe|barba|corte|fade|navalha/i.test(n) || /barbe|barba|corte/i.test(b)) {
    return {
      heroTitle: tagline || `Estilo, Precisão e Navalha Afiada em ${city}`,
      heroSubtitle: description || `Na ${businessName}, você encontra mestres barbeiros, corte clássico e moderno, barboterapia relaxante e ambiente exclusivo com cerveja gelada.`,
      ctaText: 'Agendar Horário no WhatsApp',
      aboutTitle: 'Tradição & Excelência em Cada Corte',
      aboutParagraphs: [
        `A ${businessName} nasceu para resgatar a verdadeira essência da barbearia clássica aliada às técnicas mais inovadoras do mercado masculino em ${city}.`,
        differentiators || `Nosso espaço foi cuidadosamente planejado para ser seu refúgio de estilo, conforto e descontração, oferecendo toalha quente, navalha afiada e produtos de linha premium.`
      ],
      services: customServices.length >= 6 ? customServices.slice(0, 6) : [
        ...customServices,
        { title: 'Corte Degradê / Fade Master', description: 'Acabamento milimétrico na tesoura e máquina com finalização premium.', priceTag: 'R$ 55,00' },
        { title: 'Barboterapia com Toalha Quente', description: 'Esfoliação facial, hidratação profunda de fios e lâmina afiada.', priceTag: 'R$ 45,00' },
        { title: 'Combo Cabelo + Barba Completo', description: 'Nosso pacote mais pedido para um visual alinhado da cabeça aos pés.', priceTag: 'R$ 90,00' },
        { title: 'Pigmentação & Camuflagem de Fios', description: 'Disfarce natural de falhas e cabelos brancos com produtos especiais.', priceTag: 'R$ 40,00' },
        { title: 'Selagem Térmica Masculina', description: 'Alinhamento capilar com redução de volume e brilho natural.', priceTag: 'R$ 80,00' },
        { title: 'Penteado & Finalização VIP', description: 'Lavagem com massagem capilar e estilização para ocasiões especiais.', priceTag: 'R$ 35,00' }
      ].slice(0, 6),
      testimonials: customTestimonials.length >= 3 ? customTestimonials.slice(0, 3) : [
        { name: 'Rodrigo Silveira', text: 'Melhor barbearia da região! Atendimento impecável, corte perfeito e cerveja sempre gelada.', rating: 5 },
        { name: 'Lucas Martins', text: 'Pontualidade britânica e profissionais muito detalhistas. Não corto cabelo em outro lugar!', rating: 5 },
        { name: 'Felipe Alencar', text: 'A barboterapia é sensacional, saí completamente renovado. O ambiente é agradável demais.', rating: 5 }
      ],
      businessHours: hours || 'Segunda a Sábado das 09h às 20h',
      seoDescription: `${businessName} em ${city} - Barbearia completa com corte fade, barba na navalha, barboterapia e atendimento VIP com hora marcada.`
    };
  }

  // 3. Gastronomia / Pizzaria / Burger / Café
  if (/pizza|restaurante|burger|hamburguer|lanche|comida|gourmet|sushi|culinaria|cafe/i.test(n) || /pizza|burger|lanche/i.test(b)) {
    return {
      heroTitle: tagline || `Sabor Incomparável & Tradição Gastronômica em ${city}`,
      heroSubtitle: description || `Ingredientes selecionados, preparo artesanal e uma experiência gastronômica memorável para saborear no local ou receber quentinho no delivery.`,
      ctaText: 'Fazer Pedido no WhatsApp',
      aboutTitle: 'Nossa Paixão pela Autêntica Culinária',
      aboutParagraphs: [
        `Na ${businessName}, cada receita carrega dedicação e paixão. Priorizamos produtores locais e ingredientes frescos para levar sabor marcante e aconchego ao seu paladar.`,
        differentiators || `Seja em nosso salão acolhedor ou através da nossa entrega rápida e bem embalada, garantimos a você uma refeição preparada na hora com padrão de alta gastronomia.`
      ],
      services: customServices.length >= 6 ? customServices.slice(0, 6) : [
        ...customServices,
        { title: 'Prato Assinatura do Chef', description: 'Receita exclusiva com os melhores ingredientes da estação e tempero autoral.', priceTag: 'R$ 68,00' },
        { title: 'Combo Degustação Especial', description: 'Porção generosa para compartilhar acompanhada de entradas selecionadas.', priceTag: 'R$ 115,00' },
        { title: 'Especialidade da Casa', description: 'O clássico mais pedido pelos clientes com sabor inconfundível.', priceTag: 'R$ 54,00' },
        { title: 'Opção Vegetariana / Artesanal', description: 'Ingredientes frescos e combinações leves pensadas com carinho.', priceTag: 'R$ 48,00' },
        { title: 'Sobremesa Artesanal', description: 'Finalização doce perfeita preparada diariamente com textura equilibrada.', priceTag: 'R$ 26,00' },
        { title: 'Bebidas Selecionadas & Drinks', description: 'Sucos naturais, refrigerantes e carta de bebidas especiais.', priceTag: 'A partir de R$ 12,00' }
      ].slice(0, 6),
      testimonials: customTestimonials.length >= 3 ? customTestimonials.slice(0, 3) : [
        { name: 'Camila Fernandes', text: 'Comida maravilhosa, tempero no ponto certo e entrega super rápida. Nota 10!', rating: 5 },
        { name: 'Marcelo Castro', text: 'Ambiente aconchegante e comida deliciosa. O atendimento pelo WhatsApp foi super atencioso.', rating: 5 },
        { name: 'Juliana Prado', text: 'Pratos bem servidos e ingredientes de primeira qualidade. Virou o favorito da família toda!', rating: 5 }
      ],
      businessHours: hours || 'Terça a Domingo das 18h às 23h30',
      seoDescription: `${businessName} em ${city} - Cardápio artesanal, delivery rápido e os melhores pratos preparados com ingredientes selecionados.`
    };
  }

  // 4. Odonto / Clínica / Estética / Saúde
  if (/odonto|dentia|dentista|clinica|médic|medico|saude|estetic|dermatolog/i.test(n) || /odonto|clinica|estetic/i.test(b)) {
    return {
      heroTitle: tagline || `Saúde, Tecnologia e Cuidado Humanizado em ${city}`,
      heroSubtitle: description || `Tratamentos modernos com profissionais especialistas, estrutura de ponta e foco no seu bem-estar, autoestima e qualidade de vida.`,
      ctaText: 'Agendar Consulta no WhatsApp',
      aboutTitle: 'Compromisso com a Sua Saúde e Bem-Estar',
      aboutParagraphs: [
        `A ${businessName} reúne profissionais especializados e dedicados a um atendimento ético, acolhedor e individualizado em ${city}.`,
        differentiators || `Nossa clínica conta com infraestrutura moderna, equipamentos avançados e biossegurança rigorosa para proporcionar tratamentos confortáveis e resultados de alta precisão.`
      ],
      services: customServices.length >= 6 ? customServices.slice(0, 6) : [
        ...customServices,
        { title: 'Avaliação Clínica Completa', description: 'Diagnóstico detalhado com planejamento sob medida para o seu caso.', priceTag: 'Sob Consulta' },
        { title: 'Procedimento Estético Avançado', description: 'Tecnologia moderna para rejuvenescimento com naturalidade e harmonia.', priceTag: 'Sob Consulta' },
        { title: 'Tratamento Preventivo & Check-up', description: 'Acompanhamento periódico para manter sua saúde sempre protegida.', priceTag: 'Sob Consulta' },
        { title: 'Atendimento Rápido para Desconfortos', description: 'Acolhimento imediato para alívio seguro e resolução eficaz.', priceTag: 'Sob Consulta' },
        { title: 'Procedimento Restaurador de Ponta', description: 'Materiais de última geração com alta durabilidade e acabamento estético.', priceTag: 'Sob Consulta' },
        { title: 'Manutenção e Acompanhamento VIP', description: 'Suporte continuado para preservar os resultados alcançados.', priceTag: 'Incluso' }
      ].slice(0, 6),
      testimonials: customTestimonials.length >= 3 ? customTestimonials.slice(0, 3) : [
        { name: 'Patrícia Souza', text: 'Equipe maravilhosa! Explicaram cada detalhe com muita paciência e o resultado foi impecável.', rating: 5 },
        { name: 'Eduardo Ribeiro', text: 'Clínica moderna e muito limpa. Atendimento pontual e sem dor. Recomendo muito!', rating: 5 },
        { name: 'Renata Lima', text: 'Perdi o receio de ir a consultas graças ao carinho e acolhimento dessa equipe excelente.', rating: 5 }
      ],
      businessHours: hours || 'Segunda a Sexta das 08h às 19h | Sábado das 08h às 13h',
      seoDescription: `${businessName} em ${city} - Atendimento especializado, estrutura moderna e tratamentos com tecnologia de ponta.`
    };
  }

  // 5. Fallback Comercial Geral / Corporativo / Serviços
  return {
    heroTitle: tagline || `Excelência, Tradição e Confiança em ${city}`,
    heroSubtitle: description || `Na ${businessName}, unimos compromisso com resultados e atendimento personalizado para entregar as melhores soluções para você e sua família.`,
    ctaText: 'Falar no WhatsApp',
    aboutTitle: 'Compromisso com o Mais Alto Padrão de Qualidade',
    aboutParagraphs: [
      `Com atuação de destaque em ${city}, a ${businessName} se consolidou pela seriedade, pontualidade rigorosa e transparência em cada projeto executado.`,
      differentiators || `Contamos com equipe altamente qualificada e processos certificados para superar suas expectativas, oferecendo soluções ágeis e atendimento dedicado antes, durante e após a contratação.`
    ],
    services: customServices.length >= 6 ? customServices.slice(0, 6) : [
      ...customServices,
      { title: `Serviço Especializado de ${niche}`, description: 'Atendimento de alto nível com métodos certificados e garantia de satisfação.', priceTag: 'Sob Consulta' },
      { title: 'Solução Completa Personalizada', description: 'Planejamento sob medida para atender perfeitamente sua necessidade específica.', priceTag: 'Sob Consulta' },
      { title: 'Atendimento Ágil / Express', description: 'Prioridade e rapidez para resolver sua demanda com máxima precisão.', priceTag: 'Sob Consulta' },
      { title: 'Consultoria e Avaliação Técnica', description: 'Diagnóstico transparente com orçamento detalhado sem surpresas.', priceTag: 'Incluso' },
      { title: 'Manutenção Preventiva & Suporte', description: 'Acompanhamento preventivo para garantir a máxima durabilidade do serviço.', priceTag: 'Sob Consulta' },
      { title: 'Garantia e Suporte Pós-Venda', description: 'Segurança total para você com suporte continuado sempre que precisar.', priceTag: 'Incluso' }
    ].slice(0, 6),
    testimonials: customTestimonials.length >= 3 ? customTestimonials.slice(0, 3) : [
      { name: 'Marcos Vinicius', text: 'Profissionais excelentes! Cumpriram exatamente o prazo combinado com qualidade nota 10.', rating: 5 },
      { name: 'Aline Barbosa', text: 'Preço justo e atendimento super transparente pelo WhatsApp. Voltarei a fazer negócio com certeza.', rating: 5 },
      { name: 'Thiago Mendes', text: 'Superaram todas as expectativas. Atendimento impecável do início ao fim!', rating: 5 }
    ],
    businessHours: hours || 'Segunda a Sábado das 08h às 18h',
    seoDescription: `${businessName} em ${city} - Soluções em ${niche} com alto padrão, pontualidade e orçamento rápido pelo WhatsApp.`
  };
}

/**
 * Chamada Cirúrgica ao Gemini para Geração de Copy Estruturada
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
  apiKey: string;
  model?: string;
}): Promise<StructuredSiteData | null> {
  const { apiKey } = params;
  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
  if (!cleanKey) return null;

  const models = [
    params.model || process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    'gemini-3.8-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ].filter(Boolean);

  const prompt = `Você é o redator publicitário de maior conversão do Brasil para comércio local.
Gere um JSON rigorosamente estruturado para o site oficial do negócio abaixo:

DADOS DO CLIENTE:
- Nome da Empresa: "${params.businessName}"
- Nicho / Especialidade: "${params.niche}"
- Cidade/Estado: "${params.city}"
- Diferenciais / Slogan: "${params.differentiators || params.tagline || ''}"
- Horário: "${params.hours || ''}"
- Endereço: "${params.address || ''}"
- Serviços cadastrados: ${JSON.stringify(params.services || [])}
- Avaliações reais: ${JSON.stringify(params.reviews || [])}
${params.uploadedText ? `- Extração de Cardápio/Texto OCR:\n"""${params.uploadedText.slice(0, 800)}"""` : ''}

REGRAS OBRIGATÓRIAS:
1. Adapte 100% dos textos para o nicho exato de "${params.niche}". NUNCA misture nichos.
2. aboutParagraphs DEVE conter exatamente 2 parágrafos persuasivos (entre 40 e 60 palavras cada).
3. services DEVE conter exatamente 6 itens com title, description e priceTag (ex: "R$ 60,00" ou "Sob Consulta").
4. testimonials DEVE conter exatamente 3 itens com name e text.
5. Retorne EXCLUSIVAMENTE o JSON estruturado:

{
  "heroTitle": "Título de alto impacto com máx 9 palavras",
  "heroSubtitle": "Subtítulo persuasivo destacando autoridade e benefício em até 26 palavras",
  "ctaText": "Texto de ação direta (ex: Agendar Horário no WhatsApp)",
  "aboutTitle": "Título atraente para a seção Sobre",
  "aboutParagraphs": [
    "Primeiro parágrafo detalhando trajetória e excelência local...",
    "Segundo parágrafo detalhando métodos, biossegurança/qualidade e acolhimento..."
  ],
  "services": [
    { "title": "Serviço 1", "description": "Breve explicação do serviço 1", "priceTag": "R$ XX,00 ou Sob Consulta" },
    { "title": "Serviço 2", "description": "Breve explicação do serviço 2", "priceTag": "R$ XX,00 ou Sob Consulta" },
    { "title": "Serviço 3", "description": "Breve explicação do serviço 3", "priceTag": "R$ XX,00 ou Sob Consulta" },
    { "title": "Serviço 4", "description": "Breve explicação do serviço 4", "priceTag": "R$ XX,00 ou Sob Consulta" },
    { "title": "Serviço 5", "description": "Breve explicação do serviço 5", "priceTag": "R$ XX,00 ou Sob Consulta" },
    { "title": "Serviço 6", "description": "Breve explicação do serviço 6", "priceTag": "R$ XX,00 ou Sob Consulta" }
  ],
  "testimonials": [
    { "name": "Nome do Cliente 1", "text": "Depoimento realista e elogioso..." },
    { "name": "Nome do Cliente 2", "text": "Depoimento realista e elogioso..." },
    { "name": "Nome do Cliente 3", "text": "Depoimento realista e elogioso..." }
  ],
  "businessHours": "${params.hours || 'Segunda a Sábado das 08h às 19h'}",
  "seoDescription": "Meta descrição atrativa de 140 a 160 caracteres para buscas no Google"
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
        const parsed = safeParseGeminiJson<StructuredSiteData | null>(rawJson, null);
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

    // 1. Persiste fotos temporárias externas do Google/Instagram no Supabase Storage permanente
    let finalHeroPhoto = heroPhoto;
    let finalGalleryPhotos = Array.isArray(galleryPhotos) ? galleryPhotos : [];
    try {
      const persisted = await persistSiteImages(heroPhoto, finalGalleryPhotos, cleanSlug);
      finalHeroPhoto = persisted.heroPhoto;
      finalGalleryPhotos = persisted.galleryPhotos;
    } catch (persistErr) {
      console.warn('[Studio Gerar Site] Falha ao persistir imagens no Supabase Storage:', persistErr);
    }

    // 2. Geração do JSON Estruturado (Gemini em ~2 a 4s com Fallback Local em 0ms)
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    let siteData: StructuredSiteData | null = null;
    let usedAi = false;
    let modelUsed: string | undefined;

    if (apiKey) {
      try {
        const preferredModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
        siteData = await callGeminiForStructuredSiteData({
          businessName,
          niche,
          city,
          tagline,
          description,
          differentiators,
          hours,
          address,
          services,
          reviews: reviews.length > 0 ? reviews : testimonials,
          uploadedText,
          apiKey,
          model: preferredModel
        });
        if (siteData) {
          usedAi = true;
          modelUsed = preferredModel;
        }
      } catch (geminiErr: any) {
        console.warn('[Studio Gerar Site] Aviso Gemini, acionando fallback local:', geminiErr?.message);
      }
    }

    if (!siteData) {
      siteData = generateNicheStructuredFallback({
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

    // 3. Renderização Nativa Tailwind CSS + Google Fonts (10ms determinístico, zero zip/cheerio)
    let generatedHtml: string;
    try {
      generatedHtml = renderNativeSite({
        businessName,
        shortName,
        headerName,
        niche,
        city,
        subdomain: cleanSlug,
        phone: rawPhone,
        whatsapp: cleanPhone,
        instagram,
        address,
        hours,
        templateId,
        theme,
        paletteId,
        primaryColor,
        accentColor,
        backgroundColor,
        surfaceColor,
        textColor,
        fontPair,
        logoUrl,
        heroPhoto: finalHeroPhoto,
        galleryPhotos: finalGalleryPhotos,
        data: siteData
      });
    } catch (renderErr: any) {
      console.error('[Studio Gerar Site] Erro no renderNativeSite:', renderErr);
      return NextResponse.json(
        { success: false, error: `Falha na renderização do site: ${renderErr?.message || 'Erro desconhecido'}` },
        { status: 500 }
      );
    }

    // 4. Grava no disco local apenas se não estiver em ambiente Vercel Serverless
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

    // 5. Salva no banco local db.json
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

    // 6. Salva no Supabase Storage e na tabela subscriptions como RASCUNHO
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

    // 7. Mensagem de Fechamento de Venda no WhatsApp
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
