// BILLY SUITE — DOM TEMPLATE COMPILER (Cheerio + JSON Estruturado)
// Substituição Cirúrgica de Imagens, Eliminação de Lorem Ipsum e Contraste Blindado

import * as cheerio from 'cheerio';
import { safeParseGeminiJson } from './gemini-json';

export interface StructuredSiteJson {
  brandName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaPrimary: string;
  aboutTitle: string;
  aboutText: string;
  services: Array<{ name: string; description: string; price: string }>;
  testimonials: Array<{ author: string; role: string; text: string }>;
  address: string;
  hours: string;
  phoneDisplay: string;
  instagram?: string;
  whatsappLink: string;
}

export interface SiteCompilerOptions {
  businessName: string;
  niche?: string;
  city?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  address?: string;
  hours?: string;
  tagline?: string;
  description?: string;
  heroPhoto?: string;
  galleryPhotos?: string[];
  services?: Array<{ name: string; price: string; description?: string }>;
  reviews?: Array<{ author: string; rating?: number; text: string }>;
  subdomain?: string;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
}

/**
 * Fotos temáticas de altíssima resolução para fallback caso o usuário não envie fotos
 */
const NICHE_FALLBACK_PHOTOS: Record<string, string[]> = {
  tatuagem: [
    'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1562962230-16e4623d36e6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590246814883-57833641b317?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?auto=format&fit=crop&w=1200&q=80'
  ],
  barbearia: [
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80'
  ],
  gastronomia: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80'
  ],
  estetica: [
    'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512290900672-1f55b9e0f666?auto=format&fit=crop&w=1200&q=80'
  ],
  padrao: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
  ]
};

function getNichePhotos(niche?: string): string[] {
  const n = (niche || '').toLowerCase();
  if (n.includes('tatto') || n.includes('piercing')) return NICHE_FALLBACK_PHOTOS.tatuagem;
  if (n.includes('barb') || n.includes('corte') || n.includes('cabelo')) return NICHE_FALLBACK_PHOTOS.barbearia;
  if (n.includes('pizz') || n.includes('restaurante') || n.includes('burger') || n.includes('comida') || n.includes('gastro')) return NICHE_FALLBACK_PHOTOS.gastronomia;
  if (n.includes('estet') || n.includes('beleza') || n.includes('unha') || n.includes('lash') || n.includes('spa')) return NICHE_FALLBACK_PHOTOS.estetica;
  return NICHE_FALLBACK_PHOTOS.padrao;
}

/**
 * Retorna o JSON determinístico padrão caso a IA não esteja configurada ou demore
 */
export function getDefaultStructuredJson(input: SiteCompilerOptions): StructuredSiteJson {
  const brand = (input.businessName || 'Empresa Oficial').trim();
  const niche = (input.niche || 'Comércio Local').trim();
  const city = (input.city || 'São Paulo - SP').trim();
  const phone = (input.phone || input.whatsapp || '(11) 99999-9999').trim();
  const rawPhone = (input.whatsapp || input.phone || '11999999999').replace(/\D/g, '');
  const cleanPhone = rawPhone.length <= 11 && !rawPhone.startsWith('55') ? `55${rawPhone}` : rawPhone;
  const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Olá! Vim pelo site oficial e gostaria de agendar um horário com a equipe ${brand}.`
  )}`;

  const isTattoo = /tatto|piercing/i.test(niche) || /tatto|piercing/i.test(brand);
  const isBarber = /barb|cabelo/i.test(niche) || /barb/i.test(brand);

  if (isTattoo) {
    return {
      brandName: brand,
      tagline: 'Estúdio de Tatuagem & Body Piercing',
      heroTitle: 'Sua História Marcada com Realismo, Arte e Precisão',
      heroSubtitle: 'Artistas especializados em realismo, black & gray, fine line e aplicação de piercing com joias em titânio e máxima biossegurança.',
      ctaPrimary: 'Agendar pelo WhatsApp',
      aboutTitle: `Sobre a ${brand}`,
      aboutText: `Na ${brand}, transformamos ideias em arte autoral de alta qualidade. Nosso estúdio conta com estrutura moderna, esterilização hospitalar e profissionais experientes para proporcionar um atendimento seguro, acolhedor e exclusivo.`,
      services: [
        { name: 'Tatuagem Realista & Black and Grey', description: 'Trabalhos detalhados com profundidade, sombras suaves e acabamento impressionante.', price: 'Sob Consulta' },
        { name: 'Fine Line & Traço Fino Delicado', description: 'Linhas precisas, caligrafias e ilustrações minimalistas com cicatrização impecável.', price: 'Sob Consulta' },
        { name: 'Body Piercing & Microdermal', description: 'Aplicação estéril com agulhas descartáveis americanas e joalheria em titânio grau implante.', price: 'A partir de R$ 90,00' },
        { name: 'Cobertura & Reforma (Cover-up)', description: 'Restauração e cobertura estratégica de tatuagens antigas com projeto sob medida.', price: 'Sob Consulta' }
      ],
      testimonials: [
        { author: 'Guilherme Santos', role: 'Cliente Google Avaliações', text: 'Melhor estúdio da região! O traço do tatuador é absurdo de fino e a higiene do local passa 100% de confiança.' },
        { author: 'Beatriz Almeida', role: 'Cliente Verificada', text: 'Coloquei dois piercings de titânio, não doeu nada e a cicatrização foi perfeita. Recomendo de olhos fechados!' },
        { author: 'Lucas Martins', role: 'Cliente Google', text: 'Fiz um fechamento de braço realista sensacional. Atendimento nota 10 do início ao fim.' }
      ],
      address: input.address || `${city} - Atendimento presencial com hora marcada`,
      hours: input.hours || 'Segunda a Sábado das 10h às 20h',
      phoneDisplay: phone,
      instagram: input.instagram,
      whatsappLink
    };
  }

  if (isBarber) {
    return {
      brandName: brand,
      tagline: 'Barbearia Tradicional & Cuidados Masculinos',
      heroTitle: 'Cortes Clássicos, Barboterapia e Estilo Impecável',
      heroSubtitle: 'A combinação perfeita entre a barbearia tradicional e o conforto contemporâneo. Profissionais premiados e cerveja gelada.',
      ctaPrimary: 'Agendar Horário no WhatsApp',
      aboutTitle: `A Tradição da ${brand}`,
      aboutText: `A ${brand} nasceu para oferecer muito mais do que um corte de cabelo: proporcionamos um momento de pausa, cuidado e alinhamento visual de alto padrão em um ambiente acolhedor.`,
      services: [
        { name: 'Corte Tradicional & Fade Degradê', description: 'Técnicas com tesoura e navalha alinhadas ao seu estilo.', price: 'R$ 55,00' },
        { name: 'Barboterapia com Toalha Quente', description: 'Barbear clássico com óleos essenciais e toalha quente relaxante.', price: 'R$ 45,00' },
        { name: 'Combo Completo Cabelo + Barba', description: 'A experiência completa da casa com acabamento refinado.', price: 'R$ 90,00' },
        { name: 'Pigmentação & Camuflagem de Barba', description: 'Alinhamento visual uniforme com aspecto natural.', price: 'R$ 40,00' }
      ],
      testimonials: [
        { author: 'Rodrigo Ferreira', role: 'Cliente Google Avaliações', text: 'Ambiente sensacional, atendimento pontual e o melhor degradê que já fiz.' },
        { author: 'Marcelo Lima', role: 'Cliente Verificado', text: 'Barboterapia impecável, toalha quente e massagem facial top demais.' },
        { author: 'Thiago Nogueira', role: 'Cliente Google', text: 'Virei cliente fiel há mais de um ano. Pontualidade e precisão garantidas.' }
      ],
      address: input.address || `${city} - Fácil acesso e estacionamento`,
      hours: input.hours || 'Segunda a Sábado das 09h às 20h',
      phoneDisplay: phone,
      instagram: input.instagram,
      whatsappLink
    };
  }

  return {
    brandName: brand,
    tagline: `${niche} de Alto Padrão em ${city}`,
    heroTitle: `Excelência, Confiança e Atendimento Exclusivo na ${brand}`,
    heroSubtitle: `Soluções completas com profissionais certificados, estrutura moderna e foco absoluto na sua satisfação e bem-estar.`,
    ctaPrimary: 'Falar Diretamente no WhatsApp',
    aboutTitle: `Conheça a ${brand}`,
    aboutText: `Com ampla experiência em ${niche}, a ${brand} tem como compromisso atender cada cliente de maneira personalizada, oferecendo transparência, eficiência e resultados garantidos.`,
    services: [
      { name: `Serviço Especializado de ${niche}`, description: 'Execução técnica de primeira linha com equipamentos modernos.', price: 'Sob Consulta' },
      { name: 'Atendimento Personalizado Premium', description: 'Diagnóstico detalhado para entregar a melhor solução para sua necessidade.', price: 'A partir de R$ 150,00' },
      { name: 'Pacote Completo Signature', description: 'Máxima comodidade, agilidade e garantia estendida de satisfação.', price: 'Consulte Condições' },
      { name: 'Consultoria e Avaliação Inicial', description: 'Orientação clara e transparente sem compromisso.', price: 'Gratuito' }
    ],
    testimonials: [
      { author: 'Fernanda Ribeiro', role: 'Cliente Google Avaliações', text: 'Atendimento nota 10! Superou todas as minhas expectativas em rapidez e qualidade.' },
      { author: 'Carlos Eduardo', role: 'Cliente Verificado', text: 'Profissionais honestos, preço justo e serviço impecável. Recomendo para todos!' },
      { author: 'Juliana Costa', role: 'Cliente Google', text: 'Empresa séria e comprometida. Certamente voltarei a fazer negócios!' }
    ],
    address: input.address || `${city} - Atendimento de excelência`,
    hours: input.hours || 'Segunda a Sábado das 08h às 19h',
    phoneDisplay: phone,
    instagram: input.instagram,
    whatsappLink
  };
}

/**
 * PASSO 1: Gera APENAS o JSON estruturado curto via Gemini (2 a 4 segundos)
 */
export async function generateStructuredJsonCopy(
  input: SiteCompilerOptions,
  apiKey?: string,
  preferredModel?: string
): Promise<StructuredSiteJson> {
  const fallback = getDefaultStructuredJson(input);
  const cleanKey = (apiKey || process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');

  if (!cleanKey) {
    return fallback;
  }

  const models = [
    preferredModel || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ].filter(Boolean);

  const prompt = `Você é um redator sênior de conversão.
Gere APENAS um JSON válido (sem markdown, sem \`\`\`json, sem explicações antes ou depois) com dados de alta conversão em Português do Brasil para o seguinte estabelecimento:

Nome: "${input.businessName}"
Nicho: "${input.niche || 'Comércio Local'}"
Cidade: "${input.city || 'São Paulo - SP'}"
Endereço: "${input.address || ''}"
Horário: "${input.hours || 'Segunda a Sábado das 08h às 19h'}"
Telefone: "${input.phone || input.whatsapp || ''}"
Instagram: "${input.instagram || ''}"

ESTRUTURA EXATA DO JSON:
{
  "brandName": "${input.businessName}",
  "tagline": "Frase curta (máx 5 palavras)",
  "heroTitle": "Título altamente magnético e comercial em PT-BR",
  "heroSubtitle": "Subtítulo explicando o diferencial e autoridade (1 a 2 frases)",
  "ctaPrimary": "Agendar pelo WhatsApp",
  "aboutTitle": "Sobre o Estúdio",
  "aboutText": "Apresentação cativante contando a história, tradição e biossegurança/qualidade (2 a 3 parágrafos fluídos)",
  "services": [
    { "name": "Serviço 1", "description": "Descrição curta e atraente", "price": "A partir de R$ ..." },
    { "name": "Serviço 2", "description": "Descrição curta e atraente", "price": "Sob Consulta" },
    { "name": "Serviço 3", "description": "Descrição curta e atraente", "price": "A partir de R$ ..." },
    { "name": "Serviço 4", "description": "Descrição curta e atraente", "price": "Sob Consulta" }
  ],
  "testimonials": [
    { "author": "Nome do Cliente 1", "role": "Cliente Google", "text": "Depoimento realista e elogioso." },
    { "author": "Nome do Cliente 2", "role": "Cliente Verificado", "text": "Depoimento realista sobre pontualidade e satisfação." },
    { "author": "Nome do Cliente 3", "role": "Cliente Google", "text": "Recomendação calorosa." }
  ],
  "address": "${input.address || input.city}",
  "hours": "${input.hours || 'Segunda a Sábado das 08h às 19h'}",
  "phoneDisplay": "${input.phone || input.whatsapp || '(11) 99999-9999'}"
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
            temperature: 0.3,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json'
          }
        }),
        signal: AbortSignal.timeout(6000)
      });

      if (res.ok) {
        const data = await res.json();
        const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = safeParseGeminiJson<any>(rawJson, null);

        if (parsed && (parsed.heroTitle || parsed.brandName)) {
          return {
            brandName: parsed.brandName || fallback.brandName,
            tagline: parsed.tagline || fallback.tagline,
            heroTitle: parsed.heroTitle || fallback.heroTitle,
            heroSubtitle: parsed.heroSubtitle || fallback.heroSubtitle,
            ctaPrimary: parsed.ctaPrimary || fallback.ctaPrimary,
            aboutTitle: parsed.aboutTitle || fallback.aboutTitle,
            aboutText: parsed.aboutText || fallback.aboutText,
            services: Array.isArray(parsed.services) && parsed.services.length > 0 ? parsed.services : fallback.services,
            testimonials: Array.isArray(parsed.testimonials) && parsed.testimonials.length > 0 ? parsed.testimonials : fallback.testimonials,
            address: parsed.address || fallback.address,
            hours: parsed.hours || fallback.hours,
            phoneDisplay: parsed.phoneDisplay || fallback.phoneDisplay,
            instagram: input.instagram || fallback.instagram,
            whatsappLink: fallback.whatsappLink
          };
        }
      }
    } catch (_) {}
  }

  return fallback;
}

/**
 * PASSO 2: Parser DOM Cirúrgico com Cheerio
 * Substitui imagens quebradas, elimina 100% do Lorem Ipsum, injeta contraste blindado e monta o site completo
 */
export function compileTemplateWithCheerio(
  rawHtml: string,
  data: StructuredSiteJson,
  options: SiteCompilerOptions
): string {
  // 1. Coleta o pool de fotos válidas
  const userPhotos = [
    options.heroPhoto,
    ...(options.galleryPhotos || [])
  ].filter((p): p is string => typeof p === 'string' && p.trim().startsWith('http'));

  const nichePhotos = getNichePhotos(options.niche);
  const photoPool = userPhotos.length > 0 ? userPhotos : nichePhotos;

  let imgCounter = 0;
  let bgCounter = 0;

  // 2. Carrega no Cheerio
  const $ = cheerio.load(rawHtml);

  // 3. Substituição de Tokens legados no HTML antes do DOM se existirem
  $('title').text(`${data.brandName} | ${data.tagline}`);
  $('meta[name="description"]').attr('content', `${data.heroSubtitle} - ${data.brandName}`);

  // 4. Substituição de Backgrounds no CSS inline (style="...")
  $('[style]').each((_, el) => {
    let style = $(el).attr('style') || '';
    if (/url\s*\(/i.test(style)) {
      style = style.replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi, (fullMatch, url) => {
        // Preserva fontes
        if (/\.(?:woff2?|ttf|eot|otf)\b/i.test(url)) {
          return fullMatch;
        }
        // Preserva imagens já absolutas válidas (exceto placeholders)
        const isPlaceholder = /placehold|1920x|1200x|800x|dummyimage|example\.com/i.test(url);
        const isRelative = !/^(?:https?:|data:)/i.test(url);
        if (isRelative || isPlaceholder) {
          const photo = photoPool[bgCounter % photoPool.length];
          bgCounter++;
          return `url('${photo}')`;
        }
        return fullMatch;
      });
      $(el).attr('style', style);
    }
  });

  // 4b. Elementos com data-background, data-bg, data-jarallax-image, data-src
  $('[data-background], [data-bg], [data-jarallax-image], [data-src]').each((_, el) => {
    const $el = $(el);
    const photo = photoPool[bgCounter % photoPool.length];
    bgCounter++;

    if ($el.attr('data-background')) $el.attr('data-background', photo);
    if ($el.attr('data-bg')) $el.attr('data-bg', photo);
    if ($el.attr('data-jarallax-image')) $el.attr('data-jarallax-image', photo);
    if ($el.attr('data-src')) $el.attr('data-src', photo);

    // Garante style inline com a imagem caso o script JS não execute
    const currentStyle = $el.attr('style') || '';
    if (!/background-image/i.test(currentStyle)) {
      $el.css({
        'background-image': `url('${photo}')`,
        'background-size': 'cover',
        'background-position': 'center'
      });
    }
  });

  // 5. Substituição de Backgrounds nas tags <style>
  $('style').each((_, el) => {
    let css = $(el).html() || '';
    if (/url\s*\(/i.test(css)) {
      css = css.replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi, (fullMatch, url) => {
        // Preserva fontes web
        if (/\.(?:woff2?|ttf|eot|otf)\b/i.test(url)) {
          return fullMatch;
        }
        // Substitui URLs relativas ou placeholders
        const isPlaceholder = /placehold|1920x|1200x|800x|dummyimage|example\.com/i.test(url);
        const isRelative = !/^(?:https?:|data:)/i.test(url);
        if (isRelative || isPlaceholder) {
          const photo = photoPool[bgCounter % photoPool.length];
          bgCounter++;
          return `url('${photo}')`;
        }
        return fullMatch;
      });
      $(el).html(css);
    }
  });

  // 6. Substituição de todas as tags <img>
  $('img').each((_, el) => {
    const $img = $(el);
    const src = ($img.attr('src') || '').trim();

    // Preserva ícones SVG minúsculos ou data URIs
    if (src.endsWith('.svg') || src.startsWith('data:image/svg')) {
      return;
    }

    // Se for logo do template ou estiver dentro da navbar/logo
    const isLogo =
      /logo/i.test(src) ||
      /logo/i.test($img.attr('class') || '') ||
      /logo/i.test($img.attr('id') || '') ||
      $img.closest('.navbar-brand, #logo, .logo, .site-logo, header a').length > 0;

    if (isLogo) {
      // Substitui por um logo tipográfico limpo e expressivo
      $img.replaceWith(
        `<span class="billy-brand-logo-text">${data.brandName}</span>`
      );
      return;
    }

    // Se a imagem for relativa ou for placeholder, troca por foto real
    const isPlaceholder = /placehold|1920x|1200x|800x|dummyimage|example\.com/i.test(src);
    const isRelative = !/^(?:https?:|data:)/i.test(src);

    if (isRelative || isPlaceholder || !src) {
      const photo = photoPool[imgCounter % photoPool.length];
      imgCounter++;

      $img.attr('src', photo);
      $img.removeAttr('srcset');
      $img.removeAttr('width');
      $img.removeAttr('height');
      $img.addClass('billy-injected-img');
      $img.attr('onerror', "this.style.display='none'");
      $img.css('object-fit', 'cover');
    }
  });

  // 7. Garante Marca Tipográfica nos Contêineres de Logo caso estejam vazios ou truncados
  $('#logo, .navbar-brand, .logo, .site-logo, header .logo').each((_, el) => {
    const $el = $(el);
    if (!$el.find('.billy-brand-logo-text').length && !$el.text().includes(data.brandName)) {
      $el.html(`<span class="billy-brand-logo-text">${data.brandName}</span>`);
    }
    // Remove restrições de corte e overflow
    $el.css({
      'width': 'auto',
      'max-width': 'none',
      'height': 'auto',
      'overflow': 'visible'
    });
  });

  // 7b. Remove marcas d'água de templates antigos (ex: blaxcut barbershop watermark)
  $('.wm, .wm-carousel, [class*="watermark"]').each((_, el) => {
    $(el).remove();
  });

  // 8. Injeção no Hero: Título Principal e Subtítulo
  const $heroH1 = $('h1').first();
  if ($heroH1.length) {
    $heroH1.text(data.heroTitle);
    const $heroP = $heroH1.closest('div, section, header').find('p').first();
    if ($heroP.length) {
      $heroP.text(data.heroSubtitle);
    }
  }

  // 9. Links de CTA para o WhatsApp
  $('a').each((_, el) => {
    const $a = $(el);
    const href = ($a.attr('href') || '').toLowerCase();
    const text = $a.text().trim().toLowerCase();

    const isCta =
      $a.hasClass('btn') ||
      $a.hasClass('btn-primary') ||
      $a.hasClass('button') ||
      /btn|cta|button/i.test($a.attr('class') || '') ||
      /agend|contat|orcament|whatsapp|book|appoint|contact|read more|get in touch|saiba mais/i.test(text) ||
      href === '#' ||
      href.includes('contact');

    if (isCta) {
      $a.attr('href', data.whatsappLink);
      $a.attr('target', '_blank');
      $a.attr('rel', 'noopener noreferrer');

      if (/book|appoint|read more|learn more|contact|buy/i.test(text)) {
        $a.text(data.ctaPrimary || 'Agendar pelo WhatsApp');
      }
    }
  });

  // 9b. Tradução dos Menus de Navegação (Inglês -> Português)
  $('nav a, .navbar-nav a, #mainmenu a, .menu a, .nav-item').each((_, el) => {
    const $a = $(el);
    const text = $a.text().trim();
    const map: Record<string, string> = {
      'home': 'Início',
      'what we do': 'Serviços',
      'services': 'Serviços',
      'our services': 'Nossos Serviços',
      'our works': 'Trabalhos',
      'works': 'Trabalhos',
      'portfolio': 'Portfólio',
      'the team': 'Equipe',
      'team': 'Equipe',
      'about us': 'Sobre Nós',
      'about': 'Sobre Nós',
      'blog': 'Diferenciais',
      'news': 'Diferenciais',
      'contact': 'Contato',
      'contact us': 'Fale Conosco',
      'book now': 'Agendar Horário',
      'check it': 'Conhecer Mais',
      'read more': 'Saiba Mais'
    };
    const key = text.toLowerCase().replace(/\s*\(current\)\s*$/, '').trim();
    if (map[key]) {
      $a.text(map[key]);
    }
  });

  // 10. Seção Sobre (About Us)
  const $aboutSection = $('section, div').filter((_, el) => {
    const idOrClass = `${$(el).attr('id') || ''} ${$(el).attr('class') || ''}`.toLowerCase();
    return idOrClass.includes('about') || idOrClass.includes('sobre');
  }).first();

  if ($aboutSection.length) {
    const $aboutHeading = $aboutSection.find('h2, h3').first();
    if ($aboutHeading.length) $aboutHeading.text(data.aboutTitle);
    const $aboutParagraph = $aboutSection.find('p').first();
    if ($aboutParagraph.length) $aboutParagraph.text(data.aboutText);
  }

  // 11. Cards de Serviços & Preços
  const $serviceItems = $('[class*="service-item"], [class*="pricing-item"], [class*="menu-item"], .service, .pricing-box');
  if ($serviceItems.length > 0 && data.services.length > 0) {
    $serviceItems.each((idx, el) => {
      const s = data.services[idx % data.services.length];
      if (s) {
        const $h = $(el).find('h3, h4, h5').first();
        if ($h.length) $h.text(s.name);
        const $desc = $(el).find('p').first();
        if ($desc.length) $desc.text(s.description);
        const $price = $(el).find('[class*="price"], .amount, span.price').first();
        if ($price.length) $price.text(s.price);
      }
    });
  }

  // 12. Depoimentos / Avaliações
  const $reviewItems = $('[class*="testimonial-item"], [class*="review-item"], [class*="feedback-item"], .testimonial');
  if ($reviewItems.length > 0 && data.testimonials.length > 0) {
    $reviewItems.each((idx, el) => {
      const t = data.testimonials[idx % data.testimonials.length];
      if (t) {
        const $quote = $(el).find('p, blockquote').first();
        if ($quote.length) $quote.text(`"${t.text}"`);
        const $author = $(el).find('h4, h5, .author, .name').first();
        if ($author.length) $author.text(t.author);
        const $role = $(el).find('span, .role, .title').first();
        if ($role.length) $role.text(t.role);
      }
    });
  }

  // 13. Endereço, Horário e Contatos
  $('address, .address, [class*="address"]').each((_, el) => {
    $(el).text(data.address);
  });
  $('[class*="hours"], .working-hours, [class*="opening"]').each((_, el) => {
    $(el).text(data.hours);
  });

  // 14. FILTRO ANTI-LOREM IPSUM E ANTI-TEXTOS EM LATIM (Obrigatório)
  const loremRegex = /\b(lorem|ipsum|dolor|amet|consectetur|adipiscing|elit|aliquam|vivamus|pellentesque|vestibulum|suspendisse|curabitur|nulla|facilisi|integer|tincidunt|morbi|fringilla|lobortis|imperdiet|egestas|volutpat|scelerisque|iaculis|pharetra|rhoncus|eleifend|sagittis|convallis|tristique|dapibus|pretium|fermentum|duis|odio|nullam|porta|cursus|ultricies|rutrum|molestie|venenatis|suscipit|laoreet|sodales|senectus|netus|habitant|malesuada|fames|vulputate|blandit)\b/i;
  const oldDateRegex = /\b(02\.03\.2018|201[0-9]|202[0-3])\b/g;

  // Remove blocos e seções de blog fictícios que contenham artigos de templates legados
  $('#blog, section[id*="blog"], [class*="blog"], [class*="news"], [class*="post-item"], .latest-news').each((_, el) => {
    $(el).remove();
  });
  $('a[href="#blog"], a[href*="blog"]').remove();

  // Varre nós de texto e substitui qualquer ocorrência de latim
  $('h1, h2, h3, h4, h5, h6, p, span, li, a, blockquote').each((_, el) => {
    const $el = $(el);
    const tagName = (el.tagName || '').toLowerCase();

    // Se o elemento contiver tags filhas como blocos ou parágrafos, trata os filhos
    if ($el.children('p, h1, h2, h3, h4, h5, h6, div, span').length > 0 && /^(a|div|section|li)$/.test(tagName)) {
      return;
    }

    const text = $el.text();

    if (loremRegex.test(text)) {
      if (/^h[1-6]$/.test(tagName)) {
        $el.text('Excelência, Tradição & Procedimentos Especializados');
      } else if (tagName === 'p') {
        $el.text(
          data.aboutText ||
          `Na ${data.brandName}, oferecemos serviços com atendimento exclusivo, estrutura moderna e foco absoluto na sua total satisfação e bem-estar.`
        );
      } else {
        $el.text('Qualidade e Atendimento de Alto Padrão');
      }
    }

    // Elimina datas antigas de templates legados (ex: 02.03.2018)
    if (oldDateRegex.test(text)) {
      $el.text(text.replace(oldDateRegex, new Date().getFullYear().toString()));
    }
  });

  // 15. Rodapé: Copyright Atualizado e Limpeza de Preloaders
  const currentYear = new Date().getFullYear();
  $('*').each((_, el) => {
    const t = $(el).text();
    if ((t.includes('©') || t.includes('Copyright') || t.includes('All Rights Reserved')) && $(el).children().length === 0) {
      $(el).html(`© ${currentYear} <strong>${data.brandName}</strong>. Todos os direitos reservados.`);
    }
  });

  // Limpeza de classes de loading do <body> e remoção física de preloader bloqueantes
  $('body').removeClass('has-loading-screen loading is-loading preload');
  $('#preloader, .preloader, .preloader-cover, .preloader-wrap, .loader-wrap, .loader-wrapper, #loader-wrapper, #loader, .loader, #de-loader, .loading-screen, #loading, #loading-area, #loading-center, #loading-center-absolute, .images-preloader, #handle-preloader, .cube-loader, #cube-loader, .page-loader, .spinner-wrapper, .pace, [class*="preloader"], [class*="loading-screen"], [id*="preloader"]').remove();

  // 16. Injeção do CSS de Fixes de Contraste, Preloader, Background e WhatsApp no <head>
  const fixesCss = `
<style id="billy-render-fixes">
  /* 0. BLINDAGEM DE BACKGROUND IMAGE (Sem repetição em mosaico, preenchimento total e centralizado) */
  [style*="background-image"], [style*="background:"],
  header, .hero, .banner, .slider, .intro-section,
  [class*="hero"], [class*="banner"], [class*="slider"], [class*="bg-cover"],
  .ts-background-image, .jarallax, [data-bg-img], section:first-of-type {
    background-repeat: no-repeat !important;
    background-size: cover !important;
    background-position: center center !important;
  }

  /* 1. CONTRASTE E VISIBILIDADE BLINDADA NO HERO & SEÇÕES (Nunca texto preto em fundo preto) */
  body {
    color: #f4f4f5 !important;
    background-color: #090d14 !important;
  }
  h1, h2, h3, h4, h5, h6, .font-heading, .hero__title {
    color: #ffffff !important;
  }
  p, li, .lead, .subtitle, .description {
    color: #f4f4f5 !important;
  }
  .accent-bg, .btn-primary, [class*="badge-"] {
    color: #09090b !important;
  }
  .accent-bg h1, .accent-bg h2, .accent-bg h3, .accent-bg p, .accent-bg span {
    color: #09090b !important;
  }

  header, .hero, .banner, .slider, .intro-section,
  [class*="hero"], [class*="banner"], [class*="slider"],
  section:first-of-type {
    background-color: #121212 !important;
    position: relative !important;
  }
  header::before, .hero::before, .banner::before,
  [class*="hero"]::before, [class*="banner"]::before, [class*="slider"]::before {
    content: "" !important;
    position: absolute !important;
    inset: 0 !important;
    background: linear-gradient(rgba(0,0,0,0.60), rgba(0,0,0,0.72)) !important;
    pointer-events: none !important;
    z-index: 1 !important;
  }
  header > *, .hero > *, .banner > *,
  [class*="hero"] > *, [class*="banner"] > *, [class*="slider"] > * {
    position: relative !important;
    z-index: 2 !important;
  }

  /* 2. LOGO TIPOGRÁFICO ELEGANTE E NATIVO */
  .billy-brand-logo-text {
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
    font-size: 1.25rem !important;
    font-weight: 800 !important;
    letter-spacing: -0.02em !important;
    text-transform: uppercase !important;
    color: #ffffff !important;
    display: inline-block !important;
    line-height: 1.2 !important;
    white-space: nowrap !important;
    text-decoration: none !important;
  }
  #logo, .logo, .site-logo, .navbar-brand {
    width: auto !important;
    max-width: none !important;
    height: auto !important;
    overflow: visible !important;
    display: inline-flex !important;
    align-items: center !important;
  }

  /* 3. NEUTRALIZAÇÃO TOTAL DE PRELOADERS E SPLASH SCREENS TRAVADOS */
  #preloader, .preloader, .preloader-cover, .preloader-wrap, .loader-wrap, .loader-wrapper,
  #loader-wrapper, #loader, .loader, #de-loader, .loading-screen, #loading, #loading-area,
  #loading-center, #loading-center-absolute, .images-preloader, #handle-preloader,
  .cube-loader, #cube-loader, .page-loader, .spinner-wrapper, .pace,
  [class*="preloader"], [class*="loading-screen"], [id*="preloader"] {
    display: none !important;
    opacity: 0 !important;
    pointer-events: none !important;
    visibility: hidden !important;
    z-index: -9999 !important;
    height: 0 !important;
    width: 0 !important;
  }

  /* 4. FORÇAR VISIBILIDADE IMEDIATA DE ELEMENTOS ANIMADOS E HERO */
  [data-aos], .wow, .reveal, .animated, .hero__title, .hero__link {
    opacity: 1 !important;
    transform: none !important;
    visibility: visible !important;
    animation: none !important;
    transition: none !important;
  }

  body.has-loading-screen, body.loading, body.is-loading, body.preload {
    opacity: 1 !important;
    visibility: visible !important;
  }
  body.has-loading-screen .navbar,
  body.has-loading-screen .hero__link,
  body.has-loading-screen h1,
  body.has-loading-screen h1 .hero__title {
    opacity: 1 !important;
    color: #ffffff !important;
    visibility: visible !important;
  }
  body.has-loading-screen h1 .hero__title:before {
    display: none !important;
  }

  html, body {
    overflow: auto !important;
    overflow-x: hidden !important;
    opacity: 1 !important;
    visibility: visible !important;
    height: auto !important;
  }

  /* 5. BLINDAGEM DE IMAGENS */
  .billy-injected-img {
    object-fit: cover !important;
  }

  /* 6. BOTÃO FLUTUANTE DE WHATSAPP (Largura automática, sem quebra de texto, padding nobre) */
  #billy-floating-whatsapp, #billy-floating-whatsapp a, a[href*="wa.me"], a[href*="whatsapp"].fixed, a.fixed[href*="whatsapp"] {
    white-space: nowrap !important;
    max-width: none !important;
    width: auto !important;
    overflow: visible !important;
  }
  #billy-floating-whatsapp a {
    padding: 12px 20px !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 8px !important;
    line-height: 1 !important;
    border-radius: 9999px !important;
  }
  #billy-floating-whatsapp span, a[href*="whatsapp"] span {
    display: inline !important;
    white-space: nowrap !important;
    overflow: visible !important;
  }
</style>
`;

  if ($('head').length) {
    $('head').append(fixesCss);
  } else {
    $('body').prepend(fixesCss);
  }

  // 17. Botão Flutuante de WhatsApp Oficial Billy
  if (!$('#billy-floating-whatsapp').length && !$('a[href*="whatsapp"]').filter('.fixed').length) {
    const floatingWhatsApp = `
<div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
  <a href="${data.whatsappLink}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 20px; background: #25D366; color: #ffffff; border-radius: 9999px; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap !important; width: auto !important; max-width: none !important; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" title="Fale conosco no WhatsApp">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink: 0;">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
    <span style="display: inline !important; white-space: nowrap !important;">Falar no WhatsApp</span>
  </a>
</div>
`;
    $('body').append(floatingWhatsApp);
  }

  return $.html();
}
