import { SiteGenerationInput, ServiceItem, FaqItem, ReviewItem } from '../billy-desktop-port/generator';

export type TemplateArchetype =
  | 'vintage-navalha'
  | 'moderno-neon'
  | 'editorial-luxo'
  | 'estetica-spa'
  | 'odontologia-clinica'
  | 'medico-clinica'
  | 'gastronomia-gourmet'
  | 'sushi-oriental'
  | 'bistro-luxo'
  | 'rustico-pub-burger'
  | 'irish-pub'
  | 'confeitaria-cafe'
  | 'cafeteria-especial'
  | 'petshop-veterinaria'
  | 'autoescola-drivepro'
  | 'industrial-serralheria'
  | 'b2b-corporativo'
  | 'comercial-vibrante'
  | 'tattoo-dark'
  | 'editorial-minimalista';

export function resolveTemplateArchetype(templateId?: string): TemplateArchetype {
  const t = (templateId || '').toLowerCase().trim();
  if (t.includes('crop') || t === 'barbearia') return 'vintage-navalha';
  if (t.includes('barberon')) return 'moderno-neon';
  if (t.includes('hair') || t.includes('salon')) return 'editorial-luxo';
  if (t.includes('pureglow') || t === 'estetica') return 'estetica-spa';
  if (t.includes('dentia') || t.includes('odonto')) return 'odontologia-clinica';
  if (t.includes('medical') || t.includes('medico') || t.includes('clinica')) return 'medico-clinica';
  if (t.includes('foores') || t === 'gastronomia' || t.includes('gourmet')) return 'gastronomia-gourmet';
  if (t.includes('sumi') || t.includes('sushi') || t.includes('japones')) return 'sushi-oriental';
  if (t.includes('elroyale') || t.includes('bistro-luxo')) return 'bistro-luxo';
  if (t.includes('oldstory') || t.includes('burger') || t.includes('hamburgueria')) return 'rustico-pub-burger';
  if (t.includes('tavern') || t.includes('irish') || t.includes('pub')) return 'irish-pub';
  if (t.includes('granny') || t.includes('confeitaria') || t.includes('doceria')) return 'confeitaria-cafe';
  if (t.includes('cafezone') || t.includes('coffee') || t.includes('cafeteria')) return 'cafeteria-especial';
  if (t.includes('petly') || t === 'petshop' || t.includes('veterinaria')) return 'petshop-veterinaria';
  if (t.includes('drivepro') || t === 'autoescola') return 'autoescola-drivepro';
  if (t.includes('welbim') || t.includes('serralheria') || t.includes('solda')) return 'industrial-serralheria';
  if (t.includes('consultoria') || t.includes('fo') || t.includes('advocacia')) return 'b2b-corporativo';
  if (t.includes('vibrant') || t.includes('comercio') || t.includes('comercial')) return 'comercial-vibrante';
  if (t.includes('portfolio') || t.includes('dark') || t.includes('tattoo')) return 'tattoo-dark';
  if (t.includes('minimal') || t.includes('arquitetura') || t.includes('studio')) return 'editorial-minimalista';

  return 'moderno-neon';
}

interface CommonData {
  heroImg: string;
  gallery: string[];
  services: ServiceItem[];
  faqs: FaqItem[];
  reviews: ReviewItem[];
  cleanPhone: string;
  whatsappLink: string;
  slogan: string;
  about: string;
  accent: string;
  headerName: string;
}

export function formatHeaderName(businessName: string, shortName?: string): string {
  if (shortName && shortName.trim()) {
    return shortName.trim();
  }
  let clean = (businessName || '').trim();
  if (clean.includes(' - ')) {
    clean = clean.split(' - ')[0].trim();
  } else if (clean.includes(' | ')) {
    clean = clean.split(' | ')[0].trim();
  }
  if (clean.length > 26) {
    const parts = clean.split(/\s+/);
    if (parts.length > 3) {
      clean = parts.slice(0, 3).join(' ');
    }
  }
  return clean || businessName || 'Comércio Local';
}

function prepareCommonData(input: SiteGenerationInput, defaultAccent: string): CommonData {
  const headerName = formatHeaderName(input.businessName, input.shortName || input.headerName);
  const rawPhone = (input.whatsapp || input.phone || '11999999999').replace(/\D/g, '');
  const cleanPhone = rawPhone.length <= 11 && !rawPhone.startsWith('55') ? `55${rawPhone}` : rawPhone;
  const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Olá! Vim pelo site ${input.subdomain}.webbilly.com.br e gostaria de mais informações sobre os serviços da ${input.businessName}.`
  )}`;

  const validGallery = (input.galleryPhotos || []).filter(
    (p) => typeof p === 'string' && p.trim().startsWith('http')
  );

  const heroImg =
    input.heroPhoto && input.heroPhoto.trim().startsWith('http')
      ? input.heroPhoto.trim()
      : validGallery.length > 0
      ? validGallery[0]
      : 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80';

  const gallery = validGallery.length > 0 ? validGallery : [heroImg];

  const services =
    input.services && input.services.length > 0
      ? input.services
      : [
          { name: `Serviço Especializado de ${input.niche}`, price: 'R$ 70,00', description: 'Atendimento de excelência com materiais e produtos de primeira linha.' },
          { name: 'Combo Completo Signature', price: 'R$ 130,00', description: 'O serviço mais pedido da casa com máxima comodidade e acabamento refinado.' },
          { name: 'Atendimento Rápido / Express', price: 'R$ 50,00', description: 'Pontualidade e precisão ideal para a sua rotina.' },
          { name: 'Avaliação & Consultoria Personalizada', price: 'Sob Consulta', description: 'Análise individual detalhada para identificar a melhor solução.' }
        ];

  const faqs =
    input.faqs && input.faqs.length > 0
      ? input.faqs
      : [
          { question: 'Como faço para agendar um horário ou pedir um orçamento?', answer: 'É imediato! Basta clicar em qualquer botão de WhatsApp nesta página para falar diretamente com nossa equipe.' },
          { question: 'Quais são as formas de pagamento aceitas?', answer: 'Aceitamos Pix instantâneo, dinheiro e todos os cartões de crédito e débito com parcelamento facilitado.' },
          { question: 'Onde o estabelecimento está localizado?', answer: `${input.address || `Estamos estrategicamente localizados em ${input.city}, com fácil acesso e estacionamento no entorno.`}` }
        ];

  const reviews =
    input.reviews && input.reviews.length > 0
      ? input.reviews
      : [
          { author: 'Guilherme Siqueira', rating: 5, text: 'Espaço fantástico! Profissionais altamente capacitados, pontualidade e resultado impecável. Recomendo muito!' },
          { author: 'Camila Fernandes', rating: 5, text: 'Melhor atendimento de toda a cidade! Superou todas as expectativas com muito carinho e competência.' },
          { author: 'Rodrigo Medeiros', rating: 5, text: 'Estrutura impecável e preço justo. Virei cliente fiel!' }
        ];

  const slogan = input.tagline || `Excelência e Referência em ${input.niche} em ${input.city}`;
  const about = input.description || `Na ${input.businessName}, dedicamos paixão, conhecimento técnico e atenção rigorosa a cada detalhe para proporcionar uma experiência marcante em ${input.niche}. Nosso compromisso é entregar resultados consistentes com atendimento humano e acolhedor.`;

  const accent = (input.accentColor || defaultAccent).trim();

  return { heroImg, gallery, services, faqs, reviews, cleanPhone, whatsappLink, slogan, about, accent, headerName };
}

function renderGalleryGrid(gallery: string[], roundedClass: string = 'rounded-2xl', aspectClass: string = 'aspect-square'): string {
  if (gallery.length === 0) return '';
  return `
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      ${gallery.map((img, i) => `
        <div class="group relative ${aspectClass} ${roundedClass} overflow-hidden border border-white/[0.08] shadow-lg transition-transform duration-300 hover:-translate-y-1">
          <img src="${img}" alt="Galeria ${i + 1}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.style.display='none'">
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <span class="text-[10px] font-mono uppercase tracking-wider text-white font-bold">Foto Oficial #${i + 1}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderFloatingWhatsapp(whatsappLink: string, bgStyle: string = 'background: #25D366;'): string {
  return `
  <!-- Botão Flutuante de WhatsApp Oficial -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; ${bgStyle} color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>
  `;
}

// =========================================================================
// 1. ARCHETYPE: VINTAGE NAVALHA & TRADIÇÃO (BarberCrop / Madeira Nobre)
// =========================================================================
function renderVintageNavalha(input: SiteGenerationInput): string {
  const data = prepareCommonData(input, '#b45309');
  return `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${input.businessName} — Barbearia Tradicional & Navalha | ${input.city}</title>
  <meta name="description" content="${data.slogan}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background: #0c0a08; color: #fbf7ee; }
    h1, h2, h3, .font-serif-vintage { font-family: 'Cinzel', serif; }
    .font-sub-vintage { font-family: 'Playfair Display', serif; }
    .vintage-border { border-color: rgba(180, 83, 9, 0.4); }
    .dotted-leader { flex: 1; border-bottom: 2px dotted rgba(217, 119, 6, 0.4); margin: 0 12px; height: 14px; }
  </style>
</head>
<body class="antialiased selection:bg-[#b45309] selection:text-white">

  <!-- Top Bar Vintage -->
  <div class="bg-[#17120d] border-b border-[#b45309]/30 text-xs font-semibold py-2.5 px-4 text-center text-[#d97706] tracking-widest uppercase">
    <span>★ Tradição, Navalha Afiada & Cerveja Gelada em ${input.city} ★</span>
  </div>

  <!-- Header Ornamental -->
  <header class="bg-[#0c0a08]/95 backdrop-blur-md border-b border-[#b45309]/30 sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-24 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg border-2 border-[#b45309] flex items-center justify-center text-[#d97706] text-2xl font-bold bg-[#17120d] shadow-lg">
          ✂
        </div>
        <div>
          <span class="font-serif-vintage text-xl font-black text-[#fef3c7] tracking-wider block truncate max-w-[240px] sm:max-w-[320px]" title="${input.businessName}">${data.headerName}</span>
          <span class="text-[10px] uppercase font-mono tracking-widest text-[#d97706] font-bold block">Barbearia Clássica</span>
        </div>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-zinc-300 font-semibold font-serif-vintage">
        <a href="#inicio" class="hover:text-[#d97706] transition">Início</a>
        <a href="#cortes" class="hover:text-[#d97706] transition">Tabela de Cortes</a>
        <a href="#galeria" class="hover:text-[#d97706] transition">Trabalhos</a>
        <a href="#sobre" class="hover:text-[#d97706] transition">Tradição</a>
      </nav>

      <a href="${data.whatsappLink}" target="_blank" rel="noopener noreferrer" class="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-[#d97706] to-[#b45309] hover:brightness-110 transition shadow-lg flex items-center gap-2 cursor-pointer font-serif-vintage">
        <i class="fa-brands fa-whatsapp text-sm"></i>
        <span>Agendar Cadeira</span>
      </a>
    </div>
  </header>

  <!-- Hero Monumental Clássico -->
  <section id="inicio" class="relative pt-24 pb-20 sm:pt-36 sm:pb-32 overflow-hidden flex items-center min-h-[85vh]">
    <div class="absolute inset-0 z-0">
      <img src="${data.heroImg}" alt="${input.businessName}" class="w-full h-full object-cover brightness-[0.25] sepia-[0.3]" onerror="this.style.display='none'">
      <div class="absolute inset-0 bg-gradient-to-t from-[#0c0a08] via-[#0c0a08]/80 to-transparent"></div>
    </div>

    <div class="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-6">
      <div class="inline-block p-1 border border-[#b45309]/50 rounded-full">
        <div class="px-5 py-1.5 rounded-full bg-[#1c140d] text-[#fef3c7] text-xs uppercase tracking-widest font-mono font-bold">
          💈 O Padrão Ouro do Cavalheiro em ${input.city}
        </div>
      </div>

      <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black text-[#fef3c7] tracking-wider leading-tight font-serif-vintage uppercase">
        ${input.businessName}
      </h1>

      <p class="text-lg sm:text-xl text-[#e7d8bf] font-sub-vintage italic max-w-2xl mx-auto leading-relaxed">
        "${data.slogan}"
      </p>

      <div class="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="${data.whatsappLink}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-8 py-4 rounded-lg font-black text-sm uppercase tracking-widest text-black bg-[#d97706] hover:bg-[#b45309] hover:text-white transition shadow-2xl font-serif-vintage flex items-center justify-center gap-2">
          <i class="fa-brands fa-whatsapp text-lg"></i>
          <span>Agendar Horário no WhatsApp</span>
        </a>
        <a href="#cortes" class="w-full sm:w-auto px-8 py-4 rounded-lg font-bold text-sm uppercase tracking-widest text-[#fef3c7] border border-[#b45309]/60 hover:bg-[#b45309]/20 transition font-serif-vintage">
          Ver Tabela de Serviços
        </a>
      </div>
    </div>
  </section>

  <!-- Cardápio / Tabela de Preços com Dotted Leaders Clássicos -->
  <section id="cortes" class="py-24 bg-[#140f0b] border-y border-[#b45309]/30">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
      <div class="text-center space-y-3">
        <span class="text-xs font-mono uppercase tracking-widest text-[#d97706] font-bold block">Menu do Cavalheiro</span>
        <h2 class="text-3xl sm:text-4xl font-black text-[#fef3c7] font-serif-vintage">Cortes, Barba & Cuidados</h2>
        <div class="w-24 h-1 bg-[#b45309] mx-auto mt-2"></div>
      </div>

      <div class="bg-[#0c0a08] border-2 border-[#b45309]/40 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-6">
        ${data.services.map((s, idx) => `
          <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-4 border-b border-[#b45309]/15">
            <div class="flex items-baseline w-full">
              <span class="font-serif-vintage text-base sm:text-lg font-bold text-[#fef3c7]">${s.name}</span>
              <span class="dotted-leader hidden sm:block"></span>
              <span class="font-mono text-base sm:text-lg font-black text-[#d97706] ml-auto shrink-0">${s.price}</span>
            </div>
            ${s.description ? `<p class="text-xs text-[#b8a78d] mt-1 sm:mt-0 italic">${s.description}</p>` : ''}
          </div>
        `).join('')}
      </div>

      <div class="text-center pt-2">
        <a href="${data.whatsappLink}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#d97706] hover:bg-[#b45309] text-black hover:text-white font-bold text-xs uppercase tracking-widest font-serif-vintage transition shadow-lg">
          <i class="fa-brands fa-whatsapp text-sm"></i>
          <span>Garantir Vaga no WhatsApp</span>
        </a>
      </div>
    </div>
  </section>

  <!-- Galeria com Moldura Clássica -->
  <section id="galeria" class="py-24 max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
    <div class="text-center space-y-2">
      <span class="text-xs font-mono uppercase tracking-widest text-[#d97706] font-bold block">Galeria Oficial</span>
      <h2 class="text-3xl sm:text-4xl font-black text-[#fef3c7] font-serif-vintage">Estilo, Degrades & Barba</h2>
    </div>

    ${renderGalleryGrid(data.gallery, 'rounded-xl', 'aspect-[4/5]')}
  </section>

  <!-- Tradição & Depoimentos -->
  <section id="sobre" class="py-20 bg-[#140f0b] border-t border-[#b45309]/30">
    <div class="max-w-4xl mx-auto px-4 text-center space-y-6">
      <span class="text-xs font-mono uppercase tracking-widest text-[#d97706] font-bold block">Sobre a Casa</span>
      <p class="text-base sm:text-lg text-[#e7d8bf] leading-relaxed font-sub-vintage italic">
        "${data.about}"
      </p>

      <div class="pt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        ${data.reviews.map((r) => `
          <div class="p-5 rounded-xl bg-[#0c0a08] border border-[#b45309]/30 text-left space-y-2">
            <div class="text-[#d97706] text-xs">★★★★★</div>
            <p class="text-xs text-zinc-300 italic leading-relaxed">"${r.text}"</p>
            <span class="text-[11px] font-serif-vintage font-bold text-[#fef3c7] block pt-2">— ${r.author}</span>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Rodapé Vintage -->
  <footer class="py-12 bg-[#080705] border-t border-[#b45309]/20 text-center text-xs text-[#a69379] space-y-2 font-mono">
    <p><strong>${input.businessName}</strong> • ${input.address || input.city} • Atendimento: ${input.hours || 'Segunda a Sábado'}</p>
    <p>© ${new Date().getFullYear()} — Presença Digital Oficial Desenvolvida por Webbilly.</p>
  </footer>

  ${renderFloatingWhatsapp(data.whatsappLink, 'background: linear-gradient(135deg, #d97706, #b45309);')}
</body>
</html>`;
}

// =========================================================================
// 2. ARCHETYPE: MODERNO NEON & STREET (Barberon / Acid Lime / Cyberpunk)
// =========================================================================
function renderModernoNeon(input: SiteGenerationInput): string {
  const data = prepareCommonData(input, '#84cc16');
  return `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${input.businessName} | ${input.niche} em ${input.city}</title>
  <meta name="description" content="${data.slogan}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background: #08080a; color: #f4f4f5; }
    h1, h2, h3, .font-display { font-family: 'Syne', sans-serif; }
    .font-mono-tag { font-family: 'Space Grotesk', monospace; }
    .neon-border { border-color: rgba(132, 204, 22, 0.4); }
    .neon-glow { box-shadow: 0 0 30px rgba(132, 204, 22, 0.25); }
    .neon-text { color: #84cc16; }
  </style>
</head>
<body class="antialiased selection:bg-[#84cc16] selection:text-black">

  <!-- Header Sticky High-Tech -->
  <header class="sticky top-0 z-40 bg-[#08080a]/90 backdrop-blur-xl border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[#84cc16] text-black font-black flex items-center justify-center text-lg shadow-[0_0_20px_rgba(132,204,22,0.4)]">
          ★
        </div>
        <div>
          <span class="font-display font-black text-lg text-white tracking-tight block truncate max-w-[240px] sm:max-w-[320px]" title="${input.businessName}">${data.headerName}</span>
          <span class="font-mono-tag text-[10px] text-[#84cc16] font-bold uppercase tracking-widest block">${input.niche} VIP</span>
        </div>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-xs font-mono-tag font-bold uppercase tracking-wider text-zinc-400">
        <a href="#inicio" class="hover:text-[#84cc16] transition">Início</a>
        <a href="#servicos" class="hover:text-[#84cc16] transition">Preços & Serviços</a>
        <a href="#galeria" class="hover:text-[#84cc16] transition">Transformações</a>
        <a href="#avaliacoes" class="hover:text-[#84cc16] transition">Avaliações 5.0</a>
      </nav>

      <a href="${data.whatsappLink}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-wider text-black bg-[#84cc16] hover:bg-[#a3e635] transition shadow-[0_0_20px_rgba(132,204,22,0.3)] flex items-center gap-2 cursor-pointer">
        <i class="fa-brands fa-whatsapp text-sm"></i>
        <span>Agendar Agora</span>
      </a>
    </div>
  </header>

  <!-- Hero Angular com Glow Neon -->
  <section id="inicio" class="relative pt-20 pb-20 sm:pt-32 sm:pb-32 overflow-hidden flex items-center min-h-[85vh]">
    <div class="absolute inset-0 z-0">
      <img src="${data.heroImg}" alt="${input.businessName}" class="w-full h-full object-cover brightness-[0.22] contrast-125" onerror="this.style.display='none'">
      <div class="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/75 to-transparent"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-8 space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#84cc16]/10 border border-[#84cc16]/30 text-[#84cc16] text-xs font-mono-tag font-bold uppercase tracking-wider">
          <span class="w-2 h-2 rounded-full bg-[#84cc16] animate-ping"></span>
          <span>Atendimento Aberto em ${input.city}</span>
        </div>

        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] font-display uppercase">
          ${input.businessName}
        </h1>

        <p class="text-base sm:text-xl text-zinc-300 font-medium max-w-2xl leading-relaxed">
          ${data.slogan}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
          <a href="${data.whatsappLink}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl font-display font-black text-sm uppercase tracking-wider text-black bg-[#84cc16] hover:bg-[#a3e635] transition shadow-[0_0_30px_rgba(132,204,22,0.4)] flex items-center justify-center gap-3">
            <i class="fa-brands fa-whatsapp text-lg"></i>
            <span>Agendar pelo WhatsApp Oficial</span>
          </a>
          <a href="#servicos" class="px-8 py-4 rounded-xl font-mono-tag font-bold text-xs uppercase tracking-wider text-white border border-white/20 hover:bg-white/10 transition flex items-center justify-center gap-2">
            <span>Ver Catálogo de Preços</span>
            <i class="fa-solid fa-arrow-down text-xs"></i>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Serviços com Cards de Alto Contraste -->
  <section id="servicos" class="py-24 max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <span class="font-mono-tag text-xs font-bold uppercase tracking-widest text-[#84cc16] block mb-1">Catálogo de Serviços</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-display uppercase">Investimento & Procedimentos</h2>
      </div>
      <p class="text-xs text-zinc-400 font-mono-tag">Horários flexíveis • Confirmação instantânea</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      ${data.services.map((s, idx) => `
        <div class="p-6 rounded-2xl bg-[#0f1118] border border-white/[0.08] hover:border-[#84cc16] transition-all duration-300 flex flex-col justify-between group shadow-xl">
          <div class="space-y-3">
            <span class="font-mono-tag text-[10px] font-bold text-[#84cc16] uppercase tracking-wider block">Procedimento #${idx + 1}</span>
            <h3 class="text-lg font-bold text-white group-hover:text-[#84cc16] transition">${s.name}</h3>
            ${s.description ? `<p class="text-xs text-zinc-400 leading-relaxed">${s.description}</p>` : ''}
          </div>
          <div class="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between">
            <span class="text-xl font-black text-white font-mono-tag">${s.price}</span>
            <a href="${data.whatsappLink}" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl bg-[#84cc16]/10 text-[#84cc16] group-hover:bg-[#84cc16] group-hover:text-black transition">
              <i class="fa-brands fa-whatsapp text-sm"></i>
            </a>
          </div>
        </div>
      `).join('')}
    </div>
  </section>

  <!-- Galeria de Fotos / Transformações (Até 25 Fotos) -->
  <section id="galeria" class="py-24 bg-[#0d0f17] border-y border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="font-mono-tag text-xs font-bold uppercase tracking-widest text-[#84cc16] block">Portfólio em Alta Resolução</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-display uppercase">Resultados & Clientes Satisfeitos</h2>
      </div>

      ${renderGalleryGrid(data.gallery, 'rounded-2xl', 'aspect-square')}
    </div>
  </section>

  <!-- Prova Social 5.0 -->
  <section id="avaliacoes" class="py-24 max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
    <div class="text-center space-y-2">
      <span class="font-mono-tag text-xs font-bold uppercase tracking-widest text-[#84cc16] block">Reputação Comprovada</span>
      <h2 class="text-3xl font-black text-white font-display uppercase">Avaliações 5 Estrelas no Google</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      ${data.reviews.map((r) => `
        <div class="p-6 rounded-2xl bg-[#0f1118] border border-white/[0.08] space-y-3">
          <div class="flex items-center gap-1 text-[#84cc16] text-xs">
            ★★★★★
          </div>
          <p class="text-xs text-zinc-300 leading-relaxed font-medium">"${r.text}"</p>
          <span class="text-xs font-bold text-white block pt-2 font-mono-tag">— ${r.author}</span>
        </div>
      `).join('')}
    </div>
  </section>

  <!-- Rodapé Tech -->
  <footer class="py-12 bg-[#050507] border-t border-white/[0.08] text-center text-xs text-zinc-500 font-mono-tag space-y-2">
    <p><strong>${input.businessName}</strong> • ${input.address || input.city} • WhatsApp: ${data.cleanPhone}</p>
    <p>© ${new Date().getFullYear()} — Plataforma Oficial Desenvolvida por Webbilly.</p>
  </footer>

  ${renderFloatingWhatsapp(data.whatsappLink, 'background: #84cc16; color: #000;')}
</body>
</html>`;
}

// =========================================================================
// 3. ARCHETYPE: EDITORIAL LUXO & SALÃO (Barber & Hair Salon / Champagne)
// =========================================================================
function renderEditorialLuxo(input: SiteGenerationInput): string {
  const data = prepareCommonData(input, '#c59a63');
  return `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${input.businessName} — Alta Estética & Visagismo | ${input.city}</title>
  <meta name="description" content="${data.slogan}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Montserrat', sans-serif; background: #0a0a0c; color: #f5f5f7; }
    h1, h2, h3, .font-editorial { font-family: 'Cormorant Garamond', serif; }
    .gold-accent { color: #c59a63; }
    .gold-border { border-color: rgba(197, 154, 99, 0.4); }
  </style>
</head>
<body class="antialiased selection:bg-[#c59a63] selection:text-black">

  <header class="sticky top-0 z-40 bg-[#0a0a0c]/90 backdrop-blur-md border-b border-[#c59a63]/20">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-24 flex items-center justify-between">
      <div>
        <span class="font-editorial text-2xl font-bold tracking-wider text-white block truncate max-w-[240px] sm:max-w-[320px]" title="${input.businessName}">${data.headerName}</span>
        <span class="text-[9px] uppercase tracking-[0.25em] gold-accent block font-medium">Boutique & Visagismo</span>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-300">
        <a href="#inicio" class="hover:text-[#c59a63] transition">Início</a>
        <a href="#servicos" class="hover:text-[#c59a63] transition">Menu de Tratamentos</a>
        <a href="#lookbook" class="hover:text-[#c59a63] transition">Lookbook</a>
        <a href="#sobre" class="hover:text-[#c59a63] transition">O Conceito</a>
      </nav>

      <a href="${data.whatsappLink}" target="_blank" rel="noopener noreferrer" class="px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-black bg-[#c59a63] hover:bg-[#d8b07a] transition cursor-pointer">
        <span>Agendamento VIP</span>
      </a>
    </div>
  </header>

  <!-- Hero Split Screen Editorial -->
  <section id="inicio" class="py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[80vh]">
    <div class="lg:col-span-7 space-y-6">
      <span class="text-xs uppercase tracking-[0.3em] gold-accent font-semibold block">Experiência Sensorial Exclusiva</span>
      <h1 class="font-editorial text-5xl sm:text-7xl font-bold text-white leading-[1.08] tracking-tight">
        A arte de realçar a sua melhor versão.
      </h1>
      <p class="text-sm sm:text-base text-zinc-400 font-light leading-relaxed max-w-xl">
        ${data.slogan}
      </p>

      <div class="pt-4 flex flex-col sm:flex-row items-center gap-4">
        <a href="${data.whatsappLink}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-black bg-[#c59a63] hover:bg-[#d8b07a] transition flex items-center justify-center gap-2">
          <i class="fa-brands fa-whatsapp text-sm"></i>
          <span>Agendar Horário Personalizado</span>
        </a>
      </div>
    </div>

    <div class="lg:col-span-5 relative">
      <div class="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#c59a63]/30 shadow-2xl">
        <img src="${data.heroImg}" alt="${input.businessName}" class="w-full h-full object-cover" onerror="this.style.display='none'">
      </div>
    </div>
  </section>

  <!-- Menu de Tratamentos -->
  <section id="servicos" class="py-24 bg-[#0f0f13] border-y border-[#c59a63]/20">
    <div class="max-w-5xl mx-auto px-4 space-y-12">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase tracking-[0.25em] gold-accent font-semibold block">Catálogo Exclusivo</span>
        <h2 class="font-editorial text-4xl sm:text-5xl font-bold text-white">Menu de Experiências & Valores</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${data.services.map((s) => `
          <div class="p-6 rounded-2xl bg-[#0a0a0c] border border-white/[0.06] hover:border-[#c59a63]/40 transition space-y-3">
            <div class="flex items-baseline justify-between">
              <h3 class="font-editorial text-xl font-bold text-white">${s.name}</h3>
              <span class="text-sm font-semibold gold-accent font-mono">${s.price}</span>
            </div>
            ${s.description ? `<p class="text-xs text-zinc-400 font-light leading-relaxed">${s.description}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Lookbook Galeria -->
  <section id="lookbook" class="py-24 max-w-6xl mx-auto px-4 space-y-10">
    <div class="text-center space-y-2">
      <span class="text-xs uppercase tracking-[0.25em] gold-accent font-semibold block">Lookbook Visual</span>
      <h2 class="font-editorial text-4xl sm:text-5xl font-bold text-white">Inspirações & Resultados Reais</h2>
    </div>

    ${renderGalleryGrid(data.gallery, 'rounded-2xl', 'aspect-[3/4]')}
  </section>

  <!-- Rodapé Editorial -->
  <footer class="py-12 bg-[#050507] border-t border-white/[0.06] text-center text-xs text-zinc-500 font-light space-y-2">
    <p class="font-editorial text-base text-zinc-300"><strong>${input.businessName}</strong> • ${input.address || input.city}</p>
    <p>© ${new Date().getFullYear()} — Presença Digital Oficial.</p>
  </footer>

  ${renderFloatingWhatsapp(data.whatsappLink, 'background: #c59a63; color: #000;')}
</body>
</html>`;
}

// =========================================================================
// 4. ARCHETYPE: CLÍNICA ODONTOLÓGICA & MÉDICA (Dentia / Medical Clean)
// =========================================================================
function renderClinicaSaude(input: SiteGenerationInput): string {
  const isOdonto = (input.niche || '').toLowerCase().includes('odonto') || (input.templateId || '').includes('dentia');
  const accent = isOdonto ? '#0284c7' : '#059669';
  const data = prepareCommonData(input, accent);

  return `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${input.businessName} | ${input.niche} em ${input.city}</title>
  <meta name="description" content="${data.slogan}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #070d18; color: #f1f5f9; }
    h1, h2, h3, .font-title { font-family: 'Outfit', sans-serif; }
  </style>
</head>
<body class="antialiased selection:bg-[${accent}] selection:text-white">

  <!-- Header Clínico -->
  <header class="sticky top-0 z-40 bg-[#070d18]/95 backdrop-blur-md border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[${accent}] text-white font-bold flex items-center justify-center text-lg shadow-lg">
          <i class="fa-solid fa-notes-medical"></i>
        </div>
        <div>
          <span class="font-title font-bold text-lg text-white block">${input.businessName}</span>
          <span class="text-[10px] font-mono tracking-wider uppercase text-[${accent}] font-bold block">${input.niche}</span>
        </div>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-300">
        <a href="#inicio" class="hover:text-[${accent}] transition">Início</a>
        <a href="#procedimentos" class="hover:text-[${accent}] transition">Especialidades</a>
        <a href="#clinica" class="hover:text-[${accent}] transition">Infraestrutura</a>
        <a href="#depoimentos" class="hover:text-[${accent}] transition">Pacientes</a>
      </nav>

      <a href="${data.whatsappLink}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[${accent}] hover:brightness-110 transition shadow-lg flex items-center gap-2 cursor-pointer">
        <i class="fa-brands fa-whatsapp text-sm"></i>
        <span>Agendar Consulta</span>
      </a>
    </div>
  </header>

  <!-- Hero de Autoridade em Saúde -->
  <section id="inicio" class="relative pt-20 pb-20 sm:pt-32 sm:pb-28 overflow-hidden min-h-[80vh] flex items-center">
    <div class="absolute inset-0 z-0">
      <img src="${data.heroImg}" alt="${input.businessName}" class="w-full h-full object-cover brightness-[0.25]" onerror="this.style.display='none'">
      <div class="absolute inset-0 bg-gradient-to-t from-[#070d18] via-[#070d18]/80 to-transparent"></div>
    </div>

    <div class="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-6">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white">
        <span class="w-2 h-2 rounded-full bg-[${accent}] animate-pulse"></span>
        <span>Tecnologia Médica & Atendimento Humanizado em ${input.city}</span>
      </div>

      <h1 class="text-4xl sm:text-6xl font-black text-white font-title tracking-tight leading-tight">
        ${input.businessName}
      </h1>

      <p class="text-lg text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
        ${data.slogan}
      </p>

      <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="${data.whatsappLink}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[${accent}] hover:brightness-110 transition shadow-xl flex items-center justify-center gap-2">
          <i class="fa-brands fa-whatsapp text-base"></i>
          <span>Agendar Avaliação no WhatsApp</span>
        </a>
      </div>
    </div>
  </section>

  <!-- Especialidades e Procedimentos -->
  <section id="procedimentos" class="py-24 bg-[#0b1322] border-y border-white/[0.08]">
    <div class="max-w-6xl mx-auto px-4 space-y-12">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-mono font-bold text-[${accent}] tracking-widest block">Corpo Clínico & Tratamentos</span>
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-title">Especialidades Atendidas</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${data.services.map((s, idx) => `
          <div class="p-6 rounded-2xl bg-[#070d18] border border-white/[0.08] hover:border-[${accent}] transition space-y-3 flex flex-col justify-between">
            <div>
              <span class="text-[10px] font-mono font-bold text-[${accent}] block mb-1">Especialidade #${idx + 1}</span>
              <h3 class="text-lg font-bold text-white font-title">${s.name}</h3>
              ${s.description ? `<p class="text-xs text-slate-400 mt-2 leading-relaxed">${s.description}</p>` : ''}
            </div>
            <div class="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span class="text-sm font-bold text-white font-mono">${s.price}</span>
              <a href="${data.whatsappLink}" target="_blank" rel="noopener noreferrer" class="text-xs text-[${accent}] font-bold hover:underline">
                Consultar →
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Infraestrutura & Galeria (Até 25 Fotos) -->
  <section id="clinica" class="py-24 max-w-7xl mx-auto px-4 space-y-10">
    <div class="text-center space-y-2">
      <span class="text-xs uppercase font-mono font-bold text-[${accent}] tracking-widest block">Espaço & Tecnologia</span>
      <h2 class="text-3xl font-bold text-white font-title">Infraestrutura e Consultórios</h2>
    </div>

    ${renderGalleryGrid(data.gallery, 'rounded-2xl', 'aspect-video')}
  </section>

  <!-- Rodapé Clínico -->
  <footer class="py-12 bg-[#040810] border-t border-white/[0.08] text-center text-xs text-slate-500 space-y-2 font-mono">
    <p><strong>${input.businessName}</strong> • ${input.address || input.city} • Atendimento com horário marcado</p>
    <p>© ${new Date().getFullYear()} — Presença Digital Oficial.</p>
  </footer>

  ${renderFloatingWhatsapp(data.whatsappLink, `background: ${accent};`)}
</body>
</html>`;
}

// =========================================================================
// 5. ARCHETYPE: GASTRONOMIA, RESTAURANTE & SUSHI (FooRes / Sumi / El Royale)
// =========================================================================
function renderGastronomia(input: SiteGenerationInput): string {
  const isSushi = (input.niche || '').toLowerCase().includes('sushi') || (input.templateId || '').includes('sumi');
  const accent = isSushi ? '#e63946' : '#e11d48';
  const data = prepareCommonData(input, accent);

  return `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${input.businessName} — Alta Gastronomia & Cardápio | ${input.city}</title>
  <meta name="description" content="${data.slogan}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #0c0a09; color: #fbf7ee; }
    h1, h2, h3, .font-serif-gastro { font-family: 'DM Serif Display', serif; }
  </style>
</head>
<body class="antialiased selection:bg-[${accent}] selection:text-white">

  <!-- Header Gastronômico -->
  <header class="sticky top-0 z-40 bg-[#0c0a09]/95 backdrop-blur-md border-b border-white/[0.08]">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-22 flex items-center justify-between">
      <div>
        <span class="font-serif-gastro text-2xl font-bold tracking-wide text-white block truncate max-w-[240px] sm:max-w-[320px]" title="${input.businessName}">${data.headerName}</span>
        <span class="text-[10px] uppercase font-mono tracking-widest text-[${accent}] font-bold block">${input.niche}</span>
      </div>

      <nav class="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-zinc-300">
        <a href="#inicio" class="hover:text-[${accent}] transition">Início</a>
        <a href="#cardapio" class="hover:text-[${accent}] transition">Cardápio Oficial</a>
        <a href="#galeria" class="hover:text-[${accent}] transition">Pratos & Ambiente</a>
        <a href="#reserva" class="hover:text-[${accent}] transition">Reservas</a>
      </nav>

      <a href="${data.whatsappLink}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[${accent}] hover:brightness-110 transition shadow-lg flex items-center gap-2 cursor-pointer">
        <i class="fa-solid fa-utensils text-xs"></i>
        <span>Fazer Pedido / Reserva</span>
      </a>
    </div>
  </header>

  <!-- Hero Culinário Dramático -->
  <section id="inicio" class="relative pt-24 pb-20 sm:pt-36 sm:pb-32 overflow-hidden flex items-center min-h-[85vh]">
    <div class="absolute inset-0 z-0">
      <img src="${data.heroImg}" alt="${input.businessName}" class="w-full h-full object-cover brightness-[0.25]" onerror="this.style.display='none'">
      <div class="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/75 to-transparent"></div>
    </div>

    <div class="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-6">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-[#fef3c7]">
        <span>★ Sabores Incomparáveis & Ingredientes Selecionados em ${input.city}</span>
      </div>

      <h1 class="text-4xl sm:text-6xl lg:text-7xl font-normal text-white font-serif-gastro leading-tight">
        ${input.businessName}
      </h1>

      <p class="text-lg sm:text-xl text-zinc-300 italic max-w-2xl mx-auto leading-relaxed">
        "${data.slogan}"
      </p>

      <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="${data.whatsappLink}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-[${accent}] hover:brightness-110 transition shadow-2xl flex items-center justify-center gap-2">
          <i class="fa-brands fa-whatsapp text-lg"></i>
          <span>Pedir no WhatsApp / Reservar Mesa</span>
        </a>
        <a href="#cardapio" class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white border border-white/20 hover:bg-white/10 transition">
          Ver Cardápio
        </a>
      </div>
    </div>
  </section>

  <!-- Cardápio / Menu Gastronômico -->
  <section id="cardapio" class="py-24 bg-[#141210] border-y border-white/[0.08]">
    <div class="max-w-5xl mx-auto px-4 space-y-12">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-mono font-bold text-[${accent}] tracking-widest block">Especialidades da Casa</span>
        <h2 class="text-3xl sm:text-4xl font-normal text-white font-serif-gastro">Cardápio & Valores</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${data.services.map((item, i) => `
          <div class="p-6 rounded-2xl bg-[#0c0a09] border border-white/[0.08] flex flex-col justify-between space-y-3 hover:border-[${accent}]/50 transition">
            <div class="flex items-baseline justify-between">
              <h3 class="font-serif-gastro text-xl font-normal text-white">${item.name}</h3>
              <span class="font-mono text-base font-bold text-[${accent}] ml-4 shrink-0">${item.price}</span>
            </div>
            ${item.description ? `<p class="text-xs text-zinc-400 leading-relaxed italic">${item.description}</p>` : ''}
            <div class="pt-2 flex justify-end">
              <a href="${data.whatsappLink}" target="_blank" rel="noopener noreferrer" class="text-[11px] font-bold text-[${accent}] hover:underline flex items-center gap-1">
                <span>Pedir este prato</span> →
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Galeria de Pratos & Salão (Até 25 Fotos) -->
  <section id="galeria" class="py-24 max-w-6xl mx-auto px-4 space-y-10">
    <div class="text-center space-y-2">
      <span class="text-xs uppercase font-mono font-bold text-[${accent}] tracking-widest block">Experiência Gastronômica</span>
      <h2 class="text-3xl sm:text-4xl font-normal text-white font-serif-gastro">Pratos, Drinks & Ambiente</h2>
    </div>

    ${renderGalleryGrid(data.gallery, 'rounded-2xl', 'aspect-[4/3]')}
  </section>

  <!-- Rodapé Gastronômico -->
  <footer class="py-12 bg-[#070605] border-t border-white/[0.08] text-center text-xs text-zinc-500 font-mono space-y-2">
    <p><strong>${input.businessName}</strong> • ${input.address || input.city} • Atendimento: ${input.hours || 'Terça a Domingo'}</p>
    <p>© ${new Date().getFullYear()} — Cardápio Digital Oficial.</p>
  </footer>

  ${renderFloatingWhatsapp(data.whatsappLink, `background: ${accent};`)}
</body>
</html>`;
}

// =========================================================================
// 6. ARCHETYPE: EDITORIAL MINIMALISTA & ARQUITETURA (Studio Minimal)
// =========================================================================
function renderMinimalista(input: SiteGenerationInput): string {
  const data = prepareCommonData(input, '#3f3f46');

  return `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${input.businessName} — Arquitetura & Design de Interiores</title>
  <meta name="description" content="${data.slogan}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,600;0,6..96,800;1,6..96,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background: #000000; color: #ffffff; }
    h1, h2, h3, .font-bodoni { font-family: 'Bodoni Moda', serif; }
  </style>
</head>
<body class="antialiased selection:bg-white selection:text-black">

  <header class="py-8 border-b border-zinc-900 sticky top-0 z-40 bg-black/90 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-6 flex items-center justify-between">
      <span class="font-bodoni text-2xl tracking-tighter uppercase font-bold truncate max-w-[240px] sm:max-w-[320px] block" title="${input.businessName}">${data.headerName}</span>
      <span class="text-[10px] uppercase font-mono text-zinc-500 tracking-[0.3em] hidden sm:block">${input.city}</span>
      <a href="${data.whatsappLink}" target="_blank" rel="noopener noreferrer" class="px-6 py-2 border border-zinc-700 hover:border-white text-xs font-mono uppercase tracking-widest transition">
        Contato
      </a>
    </div>
  </header>

  <!-- Hero Editorial Assimétrico -->
  <section class="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
    <div class="lg:col-span-8 space-y-6">
      <span class="text-[10px] uppercase font-mono text-zinc-500 tracking-[0.3em]">Studio de Criação & Projetos</span>
      <h1 class="font-bodoni text-5xl sm:text-7xl font-bold leading-[1.05] tracking-tight">
        Forma, pureza e precisão arquitetônica.
      </h1>
      <p class="text-sm text-zinc-400 font-light leading-relaxed max-w-xl">
        ${data.slogan}
      </p>
    </div>

    <div class="lg:col-span-4">
      <div class="aspect-[3/4] border border-zinc-800 overflow-hidden">
        <img src="${data.heroImg}" alt="${input.businessName}" class="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-700">
      </div>
    </div>
  </section>

  <!-- Bento Grid de Projetos & Fotos (Até 25 Fotos) -->
  <section class="py-24 border-t border-zinc-900 max-w-7xl mx-auto px-6 space-y-12">
    <div class="flex items-baseline justify-between border-b border-zinc-900 pb-4">
      <h2 class="font-bodoni text-3xl font-bold">Projetos & Portfólio</h2>
      <span class="font-mono text-xs text-zinc-500">Seleção Oficial (${data.gallery.length} fotos)</span>
    </div>

    ${renderGalleryGrid(data.gallery, 'rounded-none', 'aspect-video')}
  </section>

  <!-- Serviços / Disciplinas -->
  <section class="py-24 border-t border-zinc-900 max-w-7xl mx-auto px-6 space-y-8">
    <h2 class="font-bodoni text-3xl font-bold">Disciplinas de Atuação</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      ${data.services.map((s, idx) => `
        <div class="p-6 border border-zinc-800 space-y-2">
          <span class="font-mono text-[10px] text-zinc-500 block">0${idx + 1} / DISCIPLINA</span>
          <h3 class="font-bodoni text-xl font-bold text-white">${s.name}</h3>
          ${s.description ? `<p class="text-xs text-zinc-400 font-light">${s.description}</p>` : ''}
          <div class="pt-2 font-mono text-xs text-zinc-300">${s.price}</div>
        </div>
      `).join('')}
    </div>
  </section>

  <footer class="py-12 border-t border-zinc-900 text-center text-xs text-zinc-600 font-mono space-y-1">
    <p>${input.businessName} • ${input.city}</p>
    <p>© ${new Date().getFullYear()} — Todos os direitos reservados.</p>
  </footer>

  ${renderFloatingWhatsapp(data.whatsappLink, 'background: #ffffff; color: #000000;')}
</body>
</html>`;
}

// =========================================================================
// RENDERIZADOR UNIVERSAL MODULAR DO DESKTOP STUDIO
// =========================================================================
export function renderDesktopTemplateHtml(templateId: string, input: SiteGenerationInput): string {
  const archetype = resolveTemplateArchetype(templateId);

  switch (archetype) {
    case 'vintage-navalha':
      return renderVintageNavalha(input);
    case 'editorial-luxo':
      return renderEditorialLuxo(input);
    case 'odontologia-clinica':
    case 'medico-clinica':
    case 'estetica-spa':
      return renderClinicaSaude(input);
    case 'gastronomia-gourmet':
    case 'sushi-oriental':
    case 'bistro-luxo':
      return renderGastronomia(input);
    case 'editorial-minimalista':
      return renderMinimalista(input);
    case 'moderno-neon':
    case 'rustico-pub-burger':
    case 'irish-pub':
    case 'confeitaria-cafe':
    case 'cafeteria-especial':
    case 'petshop-veterinaria':
    case 'autoescola-drivepro':
    case 'industrial-serralheria':
    case 'b2b-corporativo':
    case 'comercial-vibrante':
    case 'tattoo-dark':
    default:
      return renderModernoNeon(input);
  }
}

/**
 * Retorna o esqueleto estrutural exato do template para guiar o Gemini
 */
export function getDesktopTemplatePromptSkeleton(templateId: string, input: SiteGenerationInput): string {
  return renderDesktopTemplateHtml(templateId, input);
}
