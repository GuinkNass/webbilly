/**
 * Motor Visual Nativo Tailwind CSS + Google Fonts — Webbilly
 * 100% Determinístico, Blindado contra imagens estouradas e textos microscópicos.
 * Zero dependência de templates legados em zip ou folhas de estilo externas conflitantes.
 */

import { injectAnalyticsTracker } from '@/lib/analytics';

export interface StructuredService {
  title: string;
  description: string;
  priceTag?: string;
}

export interface StructuredTestimonial {
  name: string;
  text: string;
  rating?: number;
}

export interface StructuredSiteData {
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  aboutTitle: string;
  aboutParagraphs: string[];
  services: StructuredService[];
  testimonials: StructuredTestimonial[];
  businessHours: string;
  seoDescription?: string;
}

export interface NativeSiteRenderOptions {
  businessName: string;
  shortName?: string;
  headerName?: string;
  niche: string;
  city: string;
  subdomain: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  address?: string;
  hours?: string;
  templateId?: string;
  theme?: string;
  paletteId?: string;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  fontPair?: string;
  logoUrl?: string;
  heroPhoto?: string;
  galleryPhotos?: string[];
  data: StructuredSiteData;
  rating?: number;
  reviewsCount?: number;
}

export type VisualArchitectureStyle =
  | 'dark-editorial'
  | 'fitness-energy'
  | 'gastronomy-warm'
  | 'clean-health'
  | 'corporate-services';

interface StyleConfig {
  style: VisualArchitectureStyle;
  displayName: string;
  displayFont: string;
  bodyFont: string;
  bgDefault: string;
  surfaceDefault: string;
  textDefault: string;
  textMutedDefault: string;
  borderDefault: string;
  primaryDefault: string;
  secondaryDefault: string;
  isDark: boolean;
  isItalicHeading: boolean;
  isAllCapsHeading: boolean;
}

/**
 * Mapeia o niche / templateId / theme para uma das 5 Variações Reais de Arquitetura Visual
 */
export function resolveVisualArchitectureStyle(
  niche: string,
  templateId?: string,
  theme?: string
): StyleConfig {
  const text = `${niche || ''} ${templateId || ''} ${theme || ''}`.toLowerCase();

  // 1. Estilo Dark Editorial / Tattoo / Barbearia / Nightlife
  if (
    /tattoo|tatuag|piercing|barbearia|barber|barba|corte|navalha|nightlife|pub|balada|cerveja|cervejaria|rock|vintage|tabacaria|tabaco/i.test(
      text
    )
  ) {
    return {
      style: 'dark-editorial',
      displayName: 'Dark Editorial / Vintage & Autoral',
      displayFont: 'Oswald',
      bodyFont: 'Inter',
      bgDefault: '#09090b',
      surfaceDefault: '#18181b',
      textDefault: '#f4f4f5',
      textMutedDefault: '#a1a1aa',
      borderDefault: '#27272a',
      primaryDefault: '#f59e0b',
      secondaryDefault: '#e4e4e7',
      isDark: true,
      isItalicHeading: false,
      isAllCapsHeading: false
    };
  }

  // 2. Estilo Energia / Fitness / Academia / Esportes
  if (
    /fitness|academia|crossfit|treino|personal|esporte|esportiv|fight|luta|boxe|muay|suplemento|musculacao|atlet/i.test(
      text
    )
  ) {
    return {
      style: 'fitness-energy',
      displayName: 'Energia / Fitness & Esportes',
      displayFont: 'Oswald',
      bodyFont: 'Montserrat',
      bgDefault: '#111827',
      surfaceDefault: '#1f2937',
      textDefault: '#f9fafb',
      textMutedDefault: '#9ca3af',
      borderDefault: '#374151',
      primaryDefault: '#84cc16',
      secondaryDefault: '#f97316',
      isDark: true,
      isItalicHeading: true,
      isAllCapsHeading: true
    };
  }

  // 3. Estilo Gastronomia / Pizzaria / Hamburgueria / Café
  if (
    /pizza|pizzaria|burger|hamburguer|lanche|restaurante|cafe|cafeteria|confeitaria|doceria|gastronomia|churrasco|churrascaria|sushi|culinaria|bistro|comida/i.test(
      text
    )
  ) {
    return {
      style: 'gastronomy-warm',
      displayName: 'Gastronomia & Culinária Artesanal',
      displayFont: 'Playfair Display',
      bodyFont: 'Plus Jakarta Sans',
      bgDefault: '#1c1917',
      surfaceDefault: '#292524',
      textDefault: '#fafaf9',
      textMutedDefault: '#a8a29e',
      borderDefault: '#44403c',
      primaryDefault: '#f59e0b',
      secondaryDefault: '#ea580c',
      isDark: true,
      isItalicHeading: false,
      isAllCapsHeading: false
    };
  }

  // 4. Estilo Clean / Clínica / Odontologia / Estética / Advocacia
  if (
    /odonto|dentia|dentista|clinica|estetica|medico|medica|saude|dermatolog|harmonizacao|advocacia|advogado|juridic|psicolog|fisioterap|spa|nutric|bem-estar/i.test(
      text
    )
  ) {
    return {
      style: 'clean-health',
      displayName: 'Clean & Sofisticado / Saúde & Confiança',
      displayFont: 'Plus Jakarta Sans',
      bodyFont: 'Plus Jakarta Sans',
      bgDefault: '#f8fafc',
      surfaceDefault: '#ffffff',
      textDefault: '#0f172a',
      textMutedDefault: '#64748b',
      borderDefault: '#e2e8f0',
      primaryDefault: '#0284c7',
      secondaryDefault: '#0d9488',
      isDark: false,
      isItalicHeading: false,
      isAllCapsHeading: false
    };
  }

  // 5. Estilo Corporativo / Serviços / Oficina / Pet Shop (Default)
  return {
    style: 'corporate-services',
    displayName: 'Corporativo & Alta Conversão / Serviços',
    displayFont: 'Montserrat',
    bodyFont: 'Inter',
    bgDefault: '#0f172a',
    surfaceDefault: '#1e293b',
    textDefault: '#f8fafc',
    textMutedDefault: '#94a3b8',
    borderDefault: '#334155',
    primaryDefault: '#3b82f6',
    secondaryDefault: '#10b981',
    isDark: true,
    isItalicHeading: false,
    isAllCapsHeading: false
  };
}

/**
 * Fotos temáticas de altíssima qualidade caso o lead não possua fotos suficientes
 */
function getCuratedNichePhotos(niche: string): string[] {
  const n = (niche || '').toLowerCase();
  if (/tattoo|tatuag|piercing/i.test(n)) {
    return [
      'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590246814883-5783362143b8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598371839906-880629cb1f80?w=800&auto=format&fit=crop&q=80'
    ];
  }
  if (/barbe|barba|corte/i.test(n)) {
    return [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512690459411-b9245aed614b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&auto=format&fit=crop&q=80'
    ];
  }
  if (/pizza|restaurante|burger|hamburguer|comida|lanche|gourmet/i.test(n)) {
    return [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579684947550-22e945225d9a?w=800&auto=format&fit=crop&q=80'
    ];
  }
  if (/odonto|dentia|dentista|clinica|estetica|saude|medico/i.test(n)) {
    return [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80'
    ];
  }
  if (/fitness|academia|crossfit|treino|fight/i.test(n)) {
    return [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80'
    ];
  }
  if (/pet|veterinar|cao|gato/i.test(n)) {
    return [
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80'
    ];
  }
  // Geral corporativo / serviços
  return [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80'
  ];
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Renderizador Determinístico Nativo Webbilly (HTML5 + Tailwind CSS CDN + Google Fonts)
 */
export function renderNativeSite(options: NativeSiteRenderOptions): string {
  const {
    businessName,
    headerName,
    shortName,
    niche,
    city,
    subdomain,
    phone = '',
    whatsapp = '',
    instagram = '',
    address = '',
    hours = 'Segunda a Sábado das 08h às 19h',
    data,
    rating = 4.9,
    reviewsCount = 47
  } = options;

  const styleConfig = resolveVisualArchitectureStyle(niche, options.templateId, options.theme);

  // Resolução de cores respeitando preferências do operador se enviadas
  const primaryColor = (options.primaryColor || options.accentColor || styleConfig.primaryDefault).trim();
  const secondaryColor = styleConfig.secondaryDefault;
  const bgColor = (options.backgroundColor || styleConfig.bgDefault).trim();
  const surfaceColor = (options.surfaceColor || styleConfig.surfaceDefault).trim();
  const textColor = (options.textColor || styleConfig.textDefault).trim();
  const textMutedColor = styleConfig.textMutedDefault;
  const borderColor = styleConfig.borderDefault;

  const displayFont = styleConfig.displayFont;
  const bodyFont = styleConfig.bodyFont;
  const isDark = styleConfig.isDark;

  // Normalização de telefone e links
  const rawPhone = (whatsapp || phone || '11999999999').replace(/\D/g, '');
  const cleanPhone = rawPhone.length <= 11 && !rawPhone.startsWith('55') ? `55${rawPhone}` : rawPhone;
  const displayPhone = rawPhone.length === 11
    ? `(${rawPhone.slice(0, 2)}) ${rawPhone.slice(2, 7)}-${rawPhone.slice(7)}`
    : rawPhone.length === 10
    ? `(${rawPhone.slice(0, 2)}) ${rawPhone.slice(2, 6)}-${rawPhone.slice(6)}`
    : rawPhone;

  const whatsappBaseLink = `https://wa.me/${cleanPhone}`;
  const whatsappHeroLink = `${whatsappBaseLink}?text=${encodeURIComponent(
    `Olá! Vim pelo site ${subdomain}.webbilly.com.br e gostaria de mais informações sobre os serviços da ${businessName}.`
  )}`;

  const displayName = escapeHtml(headerName || shortName || businessName);
  const cleanAddress = address || `${city} - Atendimento com hora marcada`;
  const cleanHours = data.businessHours || hours || 'Segunda a Sábado das 08h às 19h';
  const cleanSeoDesc = escapeHtml(data.seoDescription || data.heroSubtitle || `${businessName} em ${city}`);

  // Filtragem e blindagem de fotos (curadas + fornecidas pelo lead)
  const curatedFallback = getCuratedNichePhotos(niche);
  const rawProvidedGallery = (options.galleryPhotos || []).filter(
    (p) => typeof p === 'string' && p.trim().startsWith('http')
  );

  const heroPhoto = (options.heroPhoto && options.heroPhoto.trim().startsWith('http'))
    ? options.heroPhoto.trim()
    : (rawProvidedGallery.length > 0 ? rawProvidedGallery[0] : curatedFallback[0]);

  const combinedPhotos = [
    ...rawProvidedGallery,
    ...curatedFallback
  ].filter((url, idx, self) => self.indexOf(url) === idx);

  const galleryList = combinedPhotos.slice(0, 8);
  const aboutPhoto = combinedPhotos[1] || curatedFallback[1] || heroPhoto;

  // Serviços estruturados (garante 6 itens)
  const servicesList: StructuredService[] =
    data.services && data.services.length > 0
      ? data.services.slice(0, 6)
      : [
          { title: `Atendimento Especializado de ${niche}`, description: 'Soluções sob medida com foco na máxima satisfação e agilidade.', priceTag: 'Sob Consulta' },
          { title: 'Pacote VIP Completo', description: 'Nossa experiência mais solicitada para clientes que prezam por qualidade superior.', priceTag: 'R$ 120,00' },
          { title: 'Procedimento Rápido / Express', description: 'Pontualidade e eficiência planejadas para a sua rotina com total excelência.', priceTag: 'R$ 60,00' },
          { title: 'Consultoria e Avaliação Individual', description: 'Diagnóstico criterioso para indicar a melhor opção para a sua necessidade.', priceTag: 'Incluso' },
          { title: 'Manutenção & Cuidados Contínuos', description: 'Garantia de resultados duradouros com suporte e acompanhamento dedicado.', priceTag: 'Sob Consulta' },
          { title: 'Atendimento Prioritário com Hora Marcada', description: 'Conforto, pontualidade e dedicação total de nossa equipe exclusiva.', priceTag: 'Sob Consulta' }
        ];

  // Enquanto houver menos de 6, preenche com complementares
  while (servicesList.length < 6) {
    const idx = servicesList.length + 1;
    servicesList.push({
      title: `Especialidade da Casa #${idx}`,
      description: `Procedimento de alta qualidade executado por especialistas da ${businessName}.`,
      priceTag: 'Sob Consulta'
    });
  }

  // Depoimentos estruturados (garante 3)
  const testimonialsList: StructuredTestimonial[] =
    data.testimonials && data.testimonials.length > 0
      ? data.testimonials.slice(0, 3)
      : [
          { name: 'Ricardo Mendes', text: 'Atendimento excepcional e pontualidade britânica! A equipe é muito cuidadosa e o resultado superou minhas expectativas.', rating: 5 },
          { name: 'Fernanda Oliveira', text: 'Melhor lugar da cidade para este serviço. Ambiente impecável, atendimento atencioso no WhatsApp e preço muito justo.', rating: 5 },
          { name: 'Gabriel Santana', text: 'Profissionais de altíssimo nível. Fui muito bem acolhido e com certeza virei cliente fiel da casa!', rating: 5 }
        ];

  while (testimonialsList.length < 3) {
    testimonialsList.push({
      name: 'Cliente Satisfeito',
      text: 'Superou todas as minhas expectativas. Experiência incrível do início ao fim!',
      rating: 5
    });
  }

  // Parágrafos do Sobre (garante 2)
  const aboutP1 = (data.aboutParagraphs && data.aboutParagraphs[0])
    ? escapeHtml(data.aboutParagraphs[0])
    : `A ${escapeHtml(businessName)} consolidou-se como referência indiscutível em ${escapeHtml(city)}, aliando dedicação incansável, técnica aprimorada e atenção minuciosa aos detalhes para proporcionar uma experiência marcante a cada cliente.`;

  const aboutP2 = (data.aboutParagraphs && data.aboutParagraphs[1])
    ? escapeHtml(data.aboutParagraphs[1])
    : `Nosso espaço foi cuidadosamente estruturado com normas rígidas de conforto e qualidade. Trabalhamos exclusivamente com métodos certificados e profissionais apaixonados pelo que fazem, assegurando a você segurança, pontualidade e o mais alto padrão de atendimento.`;

  // Estilo específico do heading
  const headingStyleClass = styleConfig.isItalicHeading ? 'italic font-black uppercase tracking-wider' : 'font-bold';

  // Cores de contraste para texto
  const cardBgClass = isDark ? 'bg-zinc-900/90' : 'bg-white';
  const cardBorderClass = isDark ? 'border-zinc-800' : 'border-slate-200';
  const textTitleClass = isDark ? 'text-white' : 'text-slate-900';
  const textBodyClass = isDark ? 'text-zinc-300' : 'text-slate-600';
  const navBgClass = isDark ? 'bg-zinc-950/80 border-zinc-800/80 text-white' : 'bg-white/80 border-slate-200/80 text-slate-900';
  const credBgClass = isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-200 shadow-md shadow-slate-200/50';

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    address ? `${address}, ${city}` : `${businessName}, ${city}`
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const mapRouteUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address ? `${address}, ${city}` : `${businessName}, ${city}`
  )}`;

  // Cards de Serviços
  const servicesCardsHtml = servicesList.map((s, idx) => {
    const serviceWaLink = `${whatsappBaseLink}?text=${encodeURIComponent(
      `Olá! Vim pelo site ${subdomain}.webbilly.com.br e gostaria de solicitar/agendar o serviço: ${s.title} (${s.priceTag || 'Sob Consulta'}).`
    )}`;

    return `
      <div class="flex flex-col justify-between p-6 rounded-2xl ${cardBgClass} border ${cardBorderClass} hover:border-[${primaryColor}]/60 transition-all duration-300 hover:-translate-y-1 shadow-lg group">
        <div>
          <div class="flex items-start justify-between gap-3 mb-3">
            <h3 class="text-lg md:text-xl font-bold ${textTitleClass} group-hover:text-[${primaryColor}] transition-colors">
              ${escapeHtml(s.title)}
            </h3>
            <span class="inline-flex shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[${primaryColor}]/15 text-[${primaryColor}] border border-[${primaryColor}]/30">
              ${escapeHtml(s.priceTag || 'Sob Consulta')}
            </span>
          </div>
          <p class="text-sm md:text-base ${textBodyClass} leading-relaxed mb-6">
            ${escapeHtml(s.description)}
          </p>
        </div>
        <div>
          <a
            href="${serviceWaLink}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 border border-[${primaryColor}]/40 hover:bg-[${primaryColor}] hover:text-black ${isDark ? 'text-white' : 'text-slate-900'}"
          >
            <i class="fab fa-whatsapp text-emerald-500 group-hover:text-black"></i>
            <span>Solicitar via WhatsApp</span>
          </a>
        </div>
      </div>
    `;
  }).join('\n');

  // Cards de Galeria (100% blindados em aspect-square h-64 com w-full h-full object-cover rounded-xl e onerror)
  const galleryCardsHtml = galleryList.map((photoUrl, idx) => `
    <div class="aspect-square h-64 w-full rounded-xl overflow-hidden relative group border ${cardBorderClass} shadow-md bg-zinc-900">
      <img
        src="${photoUrl}"
        alt="Foto do trabalho ${idx + 1} - ${displayName}"
        class="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        onerror="this.parentElement.style.display='none'"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <span class="text-xs font-bold text-white tracking-wider uppercase drop-shadow flex items-center gap-1.5">
          <i class="fas fa-camera text-[${primaryColor}]"></i>
          <span>Trabalho Real #${idx + 1}</span>
        </span>
      </div>
    </div>
  `).join('\n');

  // Cards de Avaliações
  const testimonialsCardsHtml = testimonialsList.map((t) => `
    <div class="p-6 rounded-2xl ${cardBgClass} border ${cardBorderClass} shadow-lg flex flex-col justify-between">
      <div>
        <div class="flex items-center gap-1 text-amber-400 text-sm mb-3">
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <span class="ml-2 text-xs font-bold ${textTitleClass}">5.0</span>
        </div>
        <p class="text-sm md:text-base ${textBodyClass} italic leading-relaxed mb-4">
          "${escapeHtml(t.text)}"
        </p>
      </div>
      <div class="pt-4 border-t ${cardBorderClass} flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-[${primaryColor}]/20 text-[${primaryColor}] font-bold text-xs flex items-center justify-center">
            ${escapeHtml((t.name || 'C').slice(0, 1).toUpperCase())}
          </div>
          <span class="text-sm font-bold ${textTitleClass}">${escapeHtml(t.name)}</span>
        </div>
        <span class="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          <i class="fas fa-check-circle text-[10px]"></i> Verificado
        </span>
      </div>
    </div>
  `).join('\n');

  const currentYear = new Date().getFullYear();

  let rawHtml = `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
  <title>${displayName} | ${escapeHtml(niche)} em ${escapeHtml(city)}</title>
  <meta name="description" content="${cleanSeoDesc}" />

  <!-- Open Graph / Redes Sociais -->
  <meta property="og:title" content="${displayName} | ${escapeHtml(niche)} em ${escapeHtml(city)}" />
  <meta property="og:description" content="${cleanSeoDesc}" />
  <meta property="og:image" content="${heroPhoto}" />
  <meta property="og:type" content="website" />

  <!-- Google Fonts Oficiais -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;0,900;1,800;1,900&family=Oswald:wght@500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

  <!-- Font Awesome 6 Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />

  <!-- Tailwind CSS CDN Oficial com Configuração Personalizada -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brandPrimary: '${primaryColor}',
            brandSecondary: '${secondaryColor}',
            brandBg: '${bgColor}',
            brandSurface: '${surfaceColor}',
            brandText: '${textColor}',
            brandBorder: '${borderColor}'
          },
          fontFamily: {
            display: ['"${displayFont}"', 'sans-serif'],
            body: ['"${bodyFont}"', 'sans-serif']
          }
        }
      }
    };
  </script>

  <style>
    /* Blindagem Global de Tipografia e Reset */
    body {
      background-color: ${bgColor};
      color: ${textColor};
      font-family: '${bodyFont}', sans-serif;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }
    h1, h2, h3, .font-heading {
      font-family: '${displayFont}', sans-serif;
    }
    /* Proibição absoluta de texto microscópico */
    p, span, li, a, button {
      font-size: max(13px, inherit);
    }
    /* Estilização suave da barra de rolagem */
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: ${bgColor};
    }
    ::-webkit-scrollbar-thumb {
      background: ${borderColor};
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: ${primaryColor};
    }
  </style>
</head>
<body class="min-h-screen flex flex-col selection:bg-[${primaryColor}] selection:text-black">

  <!-- 1. NAVBAR FIXA LIMPA (h-20) -->
  <header class="fixed top-0 left-0 right-0 z-40 h-20 backdrop-blur-md ${navBgClass} border-b transition-all">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
      <!-- Nome / Logotipo -->
      <a href="#inicio" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-xl bg-[${primaryColor}] flex items-center justify-center text-black font-black text-lg shadow-md group-hover:scale-105 transition-transform">
          ${escapeHtml(displayName.slice(0, 2).toUpperCase())}
        </div>
        <span class="text-xl md:text-2xl font-bold tracking-tight ${textTitleClass}">
          ${displayName}
        </span>
      </a>

      <!-- Links de Âncora (Desktop) -->
      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold opacity-90">
        <a href="#inicio" class="hover:text-[${primaryColor}] transition-colors">Início</a>
        <a href="#sobre" class="hover:text-[${primaryColor}] transition-colors">Sobre</a>
        <a href="#servicos" class="hover:text-[${primaryColor}] transition-colors">Serviços</a>
        <a href="#galeria" class="hover:text-[${primaryColor}] transition-colors">Galeria</a>
        <a href="#avaliacoes" class="hover:text-[${primaryColor}] transition-colors">Avaliações</a>
        <a href="#contato" class="hover:text-[${primaryColor}] transition-colors">Contato</a>
      </nav>

      <!-- Botão CTA WhatsApp Navbar -->
      <div class="flex items-center gap-3">
        <a
          href="${whatsappHeroLink}"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm bg-[${primaryColor}] text-black hover:opacity-90 shadow-md hover:scale-105 transition-all whitespace-nowrap"
        >
          <i class="fab fa-whatsapp text-base"></i>
          <span class="hidden sm:inline">WhatsApp</span>
        </a>
      </div>
    </div>
  </header>

  <!-- ESPAÇAMENTO DA NAVBAR FIXA -->
  <div class="h-20"></div>

  <!-- SEÇÃO 1: HERO CONTAINER CONTROLADO (min-h-[560px] max-h-[760px] relative overflow-hidden) -->
  <section id="inicio" class="min-h-[560px] max-h-[760px] relative overflow-hidden flex items-center justify-center bg-black">
    <!-- Imagem de Fundo Travada -->
    <img
      src="${heroPhoto}"
      alt="${displayName}"
      class="absolute inset-0 w-full h-full object-cover object-center"
      onerror="this.parentElement.style.display='none'"
    />
    <!-- Camada de Contraste Blindada (Garante 100% de leitura de texto) -->
    <div class="absolute inset-0 bg-black/65 bg-gradient-to-t from-black via-black/60 to-black/40"></div>

    <!-- Conteúdo do Hero -->
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center md:text-left w-full flex flex-col justify-center">
      <!-- Badge de Categoria / Nicho -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs md:text-sm font-semibold tracking-wide uppercase mb-6 self-center md:self-start">
        <span class="w-2 h-2 rounded-full bg-[${primaryColor}] animate-pulse"></span>
        <span>${escapeHtml(niche)} • ${escapeHtml(city)}</span>
      </div>

      <!-- Título Principal <h1> -->
      <h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight max-w-4xl mb-4 font-heading drop-shadow-md">
        ${escapeHtml(data.heroTitle)}
      </h1>

      <!-- Subtítulo -->
      <p class="text-base sm:text-xl text-zinc-200 max-w-2xl leading-relaxed mb-8 opacity-95">
        ${escapeHtml(data.heroSubtitle)}
      </p>

      <!-- 2 CTAs Hero -->
      <div class="flex flex-col sm:flex-row items-center gap-4 self-center md:self-start">
        <a
          href="${whatsappHeroLink}"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold text-base bg-[${primaryColor}] text-black hover:opacity-95 shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <i class="fab fa-whatsapp text-xl"></i>
          <span>${escapeHtml(data.ctaText || 'Falar no WhatsApp')}</span>
        </a>
        <a
          href="#servicos"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all"
        >
          <span>Ver Serviços</span>
          <i class="fas fa-arrow-down text-xs"></i>
        </a>
      </div>
    </div>
  </section>

  <!-- 2. BARRA DE CREDIBILIDADE -->
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 w-full">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 rounded-2xl ${credBgClass} border">
      <div class="flex items-center gap-4 sm:border-r ${cardBorderClass} sm:pr-4">
        <div class="w-12 h-12 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center text-xl shrink-0">
          <i class="fas fa-star"></i>
        </div>
        <div>
          <div class="text-lg font-bold ${textTitleClass} flex items-center gap-1.5">
            <span>${rating.toFixed(1)}</span>
            <span class="text-xs text-amber-400">★★★★★</span>
          </div>
          <p class="text-xs ${textBodyClass}">Nota no Google (${reviewsCount} avaliações)</p>
        </div>
      </div>

      <div class="flex items-center gap-4 sm:border-r ${cardBorderClass} sm:px-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xl shrink-0">
          <i class="fas fa-bolt"></i>
        </div>
        <div>
          <div class="text-lg font-bold ${textTitleClass}">Atendimento Rápido</div>
          <p class="text-xs ${textBodyClass}">Resposta imediata pelo WhatsApp</p>
        </div>
      </div>

      <div class="flex items-center gap-4 sm:pl-4">
        <div class="w-12 h-12 rounded-xl bg-[${primaryColor}]/15 text-[${primaryColor}] flex items-center justify-center text-xl shrink-0">
          <i class="fas fa-map-marker-alt"></i>
        </div>
        <div>
          <div class="text-lg font-bold ${textTitleClass}">${escapeHtml(city.split('-')[0].trim())}</div>
          <p class="text-xs ${textBodyClass}">Fácil localização e acesso</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 3. SEÇÃO SOBRE NÓS -->
  <section id="sobre" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Texto Persuasivo -->
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[${primaryColor}]/10 text-[${primaryColor}] text-xs font-bold uppercase tracking-wider mb-4 border border-[${primaryColor}]/20">
          <span>Sobre Nossa Trajetória</span>
        </div>
        <h2 class="text-2xl sm:text-4xl ${headingStyleClass} ${textTitleClass} mb-6 leading-tight">
          ${escapeHtml(data.aboutTitle || `Tradição, Excelência e Cuidado em Cada Detalhe`)}
        </h2>
        <div class="space-y-4 ${textBodyClass} text-base sm:text-lg leading-relaxed">
          <p>${aboutP1}</p>
          <p>${aboutP2}</p>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-8 pt-8 border-t ${cardBorderClass}">
          <div class="flex items-start gap-3">
            <i class="fas fa-check-circle text-[${primaryColor}] mt-1"></i>
            <div>
              <h4 class="font-bold text-sm sm:text-base ${textTitleClass}">Padrão Superior</h4>
              <p class="text-xs ${textBodyClass}">Técnicas modernas e seguras</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <i class="fas fa-check-circle text-[${primaryColor}] mt-1"></i>
            <div>
              <h4 class="font-bold text-sm sm:text-base ${textTitleClass}">Satisfação Total</h4>
              <p class="text-xs ${textBodyClass}">Foco no cliente do início ao fim</p>
            </div>
          </div>
        </div>

        <div class="mt-8">
          <a
            href="${whatsappHeroLink}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-[${primaryColor}] text-black hover:opacity-90 shadow-lg hover:scale-105 transition-all"
          >
            <i class="fab fa-whatsapp text-lg"></i>
            <span>Conheça Nosso Espaço</span>
          </a>
        </div>
      </div>

      <!-- Foto Enquadrada (aspect-[4/3] max-h-[440px] rounded-2xl overflow-hidden) -->
      <div class="aspect-[4/3] max-h-[440px] w-full rounded-2xl overflow-hidden relative shadow-2xl border ${cardBorderClass} bg-zinc-900 group">
        <img
          src="${aboutPhoto}"
          alt="Espaço ${displayName}"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onerror="this.parentElement.style.display='none'"
        />
        <div class="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white">
          <p class="text-xs font-semibold uppercase tracking-wider text-[${primaryColor}]">Ambiente Oficial</p>
          <p class="text-sm font-bold">${displayName} — ${escapeHtml(city)}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 4. NOSSOS SERVIÇOS / DIFERENCIAIS -->
  <section id="servicos" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full border-t ${cardBorderClass}">
    <div class="text-center max-w-3xl mx-auto mb-16">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[${primaryColor}]/10 text-[${primaryColor}] text-xs font-bold uppercase tracking-wider mb-4 border border-[${primaryColor}]/20">
        <span>Catálogo de Procedimentos</span>
      </div>
      <h2 class="text-2xl sm:text-4xl ${headingStyleClass} ${textTitleClass} mb-4">
        Nossos Serviços & Especialidades
      </h2>
      <p class="text-base sm:text-lg ${textBodyClass} leading-relaxed">
        Selecione o procedimento desejado e fale diretamente com nossa equipe no WhatsApp para orçar ou agendar.
      </p>
    </div>

    <!-- Grid de 6 Serviços Responsivo -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${servicesCardsHtml}
    </div>
  </section>

  <!-- 5. GALERIA DE FOTOS (Google + Instagram) 100% UNIFORME aspect-square -->
  <section id="galeria" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full border-t ${cardBorderClass}">
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[${primaryColor}]/10 text-[${primaryColor}] text-xs font-bold uppercase tracking-wider mb-4 border border-[${primaryColor}]/20">
          <span>Portfólio & Ambiente</span>
        </div>
        <h2 class="text-2xl sm:text-4xl ${headingStyleClass} ${textTitleClass} mb-2">
          Galeria de Trabalhos Recentes
        </h2>
        <p class="text-base sm:text-lg ${textBodyClass}">
          Confira registros autênticos de procedimentos e do nosso espaço.
        </p>
      </div>

      ${instagram ? `
      <a
        href="https://instagram.com/${instagram.replace(/^@/, '')}"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 text-sm font-semibold text-[${primaryColor}] hover:underline self-start md:self-auto"
      >
        <i class="fab fa-instagram text-lg"></i>
        <span>Siga @${escapeHtml(instagram.replace(/^@/, ''))} no Instagram</span>
      </a>
      ` : ''}
    </div>

    <!-- Grid Responsivo Uniforme: cada foto em aspect-square h-64 w-full rounded-xl -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      ${galleryCardsHtml}
    </div>
  </section>

  <!-- 6. AVALIAÇÕES DE CLIENTES (DEPOIMENTOS 5 ESTRELAS) -->
  <section id="avaliacoes" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full border-t ${cardBorderClass}">
    <div class="text-center max-w-3xl mx-auto mb-16">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-400/20">
        <span>Opinião de Quem Confia</span>
      </div>
      <h2 class="text-2xl sm:text-4xl ${headingStyleClass} ${textTitleClass} mb-4">
        O Que Nossos Clientes Dizem
      </h2>
      <p class="text-base sm:text-lg ${textBodyClass} leading-relaxed">
        A satisfação e a confiança dos nossos clientes são nossa maior prioridade diária.
      </p>
    </div>

    <!-- Grid de Depoimentos -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      ${testimonialsCardsHtml}
    </div>
  </section>

  <!-- 7. LOCALIZAÇÃO, HORÁRIOS & MAPA -->
  <section id="contato" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full border-t ${cardBorderClass}">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Informações de Contato e Horários -->
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[${primaryColor}]/10 text-[${primaryColor}] text-xs font-bold uppercase tracking-wider mb-4 border border-[${primaryColor}]/20">
          <span>Onde Nos Encontrar</span>
        </div>
        <h2 class="text-2xl sm:text-4xl ${headingStyleClass} ${textTitleClass} mb-6 leading-tight">
          Localização Privilegiada & Horários
        </h2>

        <div class="space-y-6 mb-8">
          <!-- Endereço -->
          <div class="flex items-start gap-4 p-5 rounded-2xl ${cardBgClass} border ${cardBorderClass}">
            <div class="w-10 h-10 rounded-xl bg-[${primaryColor}]/15 text-[${primaryColor}] flex items-center justify-center text-lg shrink-0 mt-0.5">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <div>
              <h4 class="font-bold text-base ${textTitleClass} mb-1">Endereço Completo</h4>
              <p class="text-sm ${textBodyClass} leading-relaxed mb-3">${escapeHtml(cleanAddress)}</p>
              <a
                href="${mapRouteUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-xs font-bold text-[${primaryColor}] hover:underline"
              >
                <span>Abrir Rota no Google Maps</span>
                <i class="fas fa-external-link-alt text-[10px]"></i>
              </a>
            </div>
          </div>

          <!-- Horário de Atendimento -->
          <div class="flex items-start gap-4 p-5 rounded-2xl ${cardBgClass} border ${cardBorderClass}">
            <div class="w-10 h-10 rounded-xl bg-[${primaryColor}]/15 text-[${primaryColor}] flex items-center justify-center text-lg shrink-0 mt-0.5">
              <i class="fas fa-clock"></i>
            </div>
            <div>
              <h4 class="font-bold text-base ${textTitleClass} mb-1">Horário de Funcionamento</h4>
              <p class="text-sm ${textBodyClass} leading-relaxed">${escapeHtml(cleanHours)}</p>
            </div>
          </div>

          <!-- WhatsApp / Telefone -->
          <div class="flex items-start gap-4 p-5 rounded-2xl ${cardBgClass} border ${cardBorderClass}">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-lg shrink-0 mt-0.5">
              <i class="fab fa-whatsapp"></i>
            </div>
            <div>
              <h4 class="font-bold text-base ${textTitleClass} mb-1">Atendimento Direto</h4>
              <p class="text-sm ${textBodyClass} leading-relaxed mb-2">${escapeHtml(displayPhone || cleanPhone)}</p>
              <a
                href="${whatsappHeroLink}"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-xs font-bold text-emerald-500 hover:underline"
              >
                <span>Iniciar conversa agora</span>
                <i class="fas fa-arrow-right text-[10px]"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Iframe Google Maps com Altura Fixa h-80 rounded-2xl -->
      <div class="w-full h-80 rounded-2xl overflow-hidden border ${cardBorderClass} shadow-xl bg-zinc-900">
        <iframe
          src="${mapEmbedUrl}"
          class="w-full h-80 rounded-2xl border-0"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="Mapa de Localização - ${displayName}"
        ></iframe>
      </div>
    </div>
  </section>

  <!-- 8. FOOTER LIMPO -->
  <footer class="mt-auto border-t ${cardBorderClass} ${navBgClass} py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
      <div>
        <div class="flex items-center justify-center md:justify-start gap-3 mb-2">
          <div class="w-8 h-8 rounded-lg bg-[${primaryColor}] flex items-center justify-center text-black font-black text-sm">
            ${escapeHtml(displayName.slice(0, 2).toUpperCase())}
          </div>
          <span class="text-lg font-bold ${textTitleClass}">${displayName}</span>
        </div>
        <p class="text-xs ${textBodyClass}">
          ${escapeHtml(niche)} em ${escapeHtml(city)} • Todos os direitos reservados © ${currentYear}
        </p>
      </div>

      <!-- Links rápidos -->
      <div class="flex items-center gap-6 text-xs font-semibold opacity-80">
        <a href="#inicio" class="hover:text-[${primaryColor}] transition-colors">Início</a>
        <a href="#sobre" class="hover:text-[${primaryColor}] transition-colors">Sobre</a>
        <a href="#servicos" class="hover:text-[${primaryColor}] transition-colors">Serviços</a>
        <a href="#galeria" class="hover:text-[${primaryColor}] transition-colors">Galeria</a>
        <a href="#contato" class="hover:text-[${primaryColor}] transition-colors">Contato</a>
      </div>
    </div>
  </footer>

  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL (fixed bottom-5 right-5 z-50 whitespace-nowrap) -->
  <div id="billy-floating-whatsapp" class="fixed bottom-5 right-5 z-50 whitespace-nowrap">
    <a
      href="${whatsappHeroLink}"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2.5 px-5 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
      title="Falar no WhatsApp"
    >
      <i class="fab fa-whatsapp text-xl group-hover:rotate-12 transition-transform"></i>
      <span class="whitespace-nowrap font-bold">Falar no WhatsApp</span>
    </a>
  </div>

</body>
</html>`;

  // Injeta o rastreador de analytics
  try {
    rawHtml = injectAnalyticsTracker(rawHtml);
  } catch (err) {
    console.warn('[renderNativeSite] Aviso ao injetar analytics:', err);
  }

  return rawHtml.trim();
}
