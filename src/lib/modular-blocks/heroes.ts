import { ModularBlockDefinition, ModularBlockContext } from './types';

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const HERO_BLOCKS: ModularBlockDefinition[] = [
  // 1. Hero Split com Foto Lateral
  {
    id: 'hero-split-photo',
    name: 'Hero Split com Foto Lateral',
    category: 'heroes',
    style: 'moderno-vibrante',
    description: 'Layout split moderno com texto persuasivo, badge de nicho e foto em destaque na lateral.',
    render: (ctx: ModularBlockContext) => {
      const title = escapeHtml(ctx.tagline || ctx.businessName);
      const subtitle = escapeHtml(ctx.description || `Experiência premium, atendimento de excelência e resultados comprovados em ${ctx.city}.`);
      const name = escapeHtml(ctx.businessName);
      const niche = escapeHtml(ctx.niche);
      const img = ctx.heroPhoto || 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&auto=format&fit=crop&q=80';

      return `
<section data-wb-section="hero" class="relative overflow-hidden bg-slate-950 text-slate-100 py-16 sm:py-24 lg:py-32 border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
      <div class="lg:col-span-7 space-y-6 text-left">
        <div data-wb-slot="hero-badge" class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>${niche} • Atendimento em ${escapeHtml(ctx.city)}</span>
        </div>
        <h1 data-wb-slot="hero-title" class="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          ${title}
        </h1>
        <p data-wb-slot="hero-subtitle" class="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
          ${subtitle}
        </p>
        <div class="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <a data-wb-slot="hero-cta" href="${ctx.whatsappLink}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] text-base">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-2.124-.516-1.531-.631-2.52-2.18-2.597-2.282-.075-.102-.622-.828-.622-1.58 0-.752.395-1.121.536-1.272.141-.15.309-.188.411-.188.103 0 .206.002.296.006.096.004.225-.036.35.265.13.313.444 1.084.483 1.163.039.078.065.17.013.273-.052.102-.078.167-.155.257-.078.09-.163.2-.233.27-.08.08-.163.167-.07.327.093.16.413.682.887 1.103.61.542 1.123.71 1.282.789.159.078.252.069.345-.039.094-.108.404-.47.512-.63.108-.16.216-.133.364-.078.149.055.944.445 1.106.526.162.081.27.121.31.189.04.068.04.394-.104.799z"/></svg>
            <span>Falar no WhatsApp Agora</span>
          </a>
          <a href="#servicos" class="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all text-base">
            <span>Ver Nossos Serviços</span>
          </a>
        </div>
        <div class="pt-6 border-t border-slate-800/80 flex items-center gap-6 text-xs text-slate-400">
          <div class="flex items-center gap-1.5">
            <span class="text-amber-400 text-sm">★★★★★</span>
            <span class="font-semibold text-slate-200">5.0 no Google</span>
          </div>
          <div class="w-1 h-1 rounded-full bg-slate-700"></div>
          <div>Atendimento Rápido</div>
          <div class="w-1 h-1 rounded-full bg-slate-700"></div>
          <div>Espaço Climatizado</div>
        </div>
      </div>
      <div class="lg:col-span-5 relative">
        <div class="relative mx-auto max-w-md lg:max-w-none">
          <div class="absolute -inset-4 bg-emerald-500/20 rounded-3xl blur-2xl"></div>
          <div class="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl aspect-[4/5] bg-slate-900">
            <img data-wb-slot="hero-image" src="${img}" alt="${name}" class="w-full h-full object-cover transform hover:scale-105 transition-all duration-700" loading="eager" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
            <div class="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60">
              <p class="text-xs font-bold text-white tracking-wide uppercase">${name}</p>
              <p class="text-[11px] text-slate-300">Estrutura completa e profissionais dedicados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
    }
  },

  // 2. Hero Fullscreen com Overlay Escuro
  {
    id: 'hero-fullscreen-dark',
    name: 'Hero Fullscreen com Overlay Escuro',
    category: 'heroes',
    style: 'dark-editorial',
    description: 'Impacto visual imersivo com imagem de fundo, tipografia marcante e alto contraste.',
    render: (ctx: ModularBlockContext) => {
      const title = escapeHtml(ctx.tagline || `O Melhor em ${ctx.niche} em ${ctx.city}`);
      const subtitle = escapeHtml(ctx.description || `Tradição, dedicação e padrão rigoroso de excelência para você.`);
      const name = escapeHtml(ctx.businessName);
      const img = ctx.heroPhoto || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&auto=format&fit=crop&q=80';

      return `
<section data-wb-section="hero" class="relative min-h-[85vh] flex items-center justify-center bg-slate-950 text-white overflow-hidden py-24 px-4 sm:px-6">
  <div class="absolute inset-0 z-0">
    <img data-wb-slot="hero-image" src="${img}" alt="${name}" class="w-full h-full object-cover scale-105 filter brightness-50" />
    <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/50"></div>
  </div>
  <div class="relative z-10 max-w-4xl mx-auto text-center space-y-6">
    <div data-wb-slot="hero-badge" class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-amber-400/10 text-amber-300 border border-amber-400/30">
      ★ ${escapeHtml(ctx.niche)} de Referência ★
    </div>
    <h1 data-wb-slot="hero-title" class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none">
      ${title}
    </h1>
    <p data-wb-slot="hero-subtitle" class="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto font-light leading-relaxed">
      ${subtitle}
    </p>
    <div class="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
      <a data-wb-slot="hero-cta" href="${ctx.whatsappLink}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-9 py-4 rounded-xl font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-xl hover:scale-105 text-base flex items-center justify-center gap-2">
        <span>Agendar pelo WhatsApp</span>
        <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"/></svg>
      </a>
      <a href="#sobre" class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all text-base">
        Conhecer a Nossa História
      </a>
    </div>
  </div>
</section>`;
    }
  },

  // 3. Hero Centralizado com Badge Google Rating
  {
    id: 'hero-centered-rating',
    name: 'Hero Centralizado com Badge Google Rating',
    category: 'heroes',
    style: 'corporativo-clean',
    description: 'Design corporativo clean focado em prova social instantânea e nota 5.0 estrelas.',
    render: (ctx: ModularBlockContext) => {
      const title = escapeHtml(ctx.businessName);
      const tagline = escapeHtml(ctx.tagline || `Excelência e Compromisso em ${ctx.city}`);
      const desc = escapeHtml(ctx.description || `Atendimento sob medida com foco na sua total comodidade e confiança.`);

      return `
<section data-wb-section="hero" class="relative bg-slate-900 text-slate-100 py-20 sm:py-28 lg:py-36 border-b border-slate-800">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
    <div data-wb-slot="hero-badge" class="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 shadow-sm text-xs font-semibold text-slate-200 mx-auto">
      <div class="flex text-amber-400">★★★★★</div>
      <span class="text-white font-bold">5.0</span>
      <span class="text-slate-400">Avaliado com nota máxima no Google Maps</span>
    </div>
    <h1 data-wb-slot="hero-title" class="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
      ${title}
    </h1>
    <p data-wb-slot="hero-subtitle" class="text-lg sm:text-2xl text-slate-300 font-normal max-w-3xl mx-auto leading-relaxed">
      ${tagline} — ${desc}
    </p>
    <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
      <a data-wb-slot="hero-cta" href="${ctx.whatsappLink}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all hover:scale-105 text-base flex items-center justify-center gap-2">
        <span>Falar Diretamente no WhatsApp</span>
        <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"/></svg>
      </a>
      <a href="#contato" class="w-full sm:w-auto px-7 py-4 rounded-xl font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-base">
        Como Chegar & Horários
      </a>
    </div>
  </div>
</section>`;
    }
  },

  // 4. Hero Assimétrico Estilo Editorial
  {
    id: 'hero-asymmetric-editorial',
    name: 'Hero Assimétrico Estilo Editorial',
    category: 'heroes',
    style: 'classico-sofisticado',
    description: 'Estética clássica editorial com tipografia refinada, números grandes e elegância visual.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const title = escapeHtml(ctx.tagline || `Arte, Técnica & Tradição.`);
      const img = ctx.heroPhoto || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&auto=format&fit=crop&q=80';

      return `
<section data-wb-section="hero" class="relative bg-zinc-950 text-zinc-100 py-16 sm:py-24 border-b border-zinc-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-8 space-y-6">
        <p data-wb-slot="hero-badge" class="text-xs uppercase tracking-[0.3em] font-semibold text-zinc-400">
          Estúdio • ${escapeHtml(ctx.niche)} • Desde 2018
        </p>
        <h1 data-wb-slot="hero-title" class="text-4xl sm:text-6xl lg:text-7xl font-serif font-light text-zinc-100 leading-none tracking-tight">
          ${name}
        </h1>
        <p data-wb-slot="hero-subtitle" class="text-lg sm:text-xl text-zinc-400 font-sans max-w-2xl leading-relaxed">
          ${title} Cada detalhe pensado para proporcionar uma experiência marcante e inesquecível.
        </p>
        <div class="pt-4 flex flex-wrap gap-4">
          <a data-wb-slot="hero-cta" href="${ctx.whatsappLink}" target="_blank" rel="noopener noreferrer" class="px-8 py-3.5 rounded-none font-medium tracking-wide text-zinc-950 bg-zinc-100 hover:bg-white transition-all text-sm uppercase">
            Solicitar Orçamento Exclusivo
          </a>
          <a href="#galeria" class="px-7 py-3.5 rounded-none font-medium text-zinc-300 border border-zinc-700 hover:border-zinc-500 transition-all text-sm uppercase">
            Ver Portfólio
          </a>
        </div>
      </div>
      <div class="lg:col-span-4">
        <div class="relative p-2 border border-zinc-800 bg-zinc-900/50">
          <img data-wb-slot="hero-image" src="${img}" alt="${name}" class="w-full h-80 sm:h-96 object-cover grayscale hover:grayscale-0 transition-all duration-700" />
        </div>
      </div>
    </div>
  </div>
</section>`;
    }
  },

  // 5. Hero Minimalista Bold
  {
    id: 'hero-minimalist-bold',
    name: 'Hero Minimalista Bold',
    category: 'heroes',
    style: 'minimalista',
    description: 'Tipografia dominante, contrastes altos e foco total na proposta de valor imediata.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const tagline = escapeHtml(ctx.tagline || `Soluções definitivas em ${ctx.niche}`);

      return `
<section data-wb-section="hero" class="bg-black text-white py-20 sm:py-32 border-b border-neutral-900">
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <div class="space-y-6">
      <span data-wb-slot="hero-badge" class="inline-block text-xs font-mono tracking-widest text-neutral-400 uppercase">
        // ${escapeHtml(ctx.city)}
      </span>
      <h1 data-wb-slot="hero-title" class="text-4xl sm:text-7xl font-extrabold tracking-tighter text-white leading-tight">
        ${name}.
      </h1>
      <p data-wb-slot="hero-subtitle" class="text-xl sm:text-3xl text-neutral-400 font-medium max-w-4xl leading-relaxed">
        ${tagline}. Padrão elevado para quem não abre mão de qualidade.
      </p>
      <div class="pt-8">
        <a data-wb-slot="hero-cta" href="${ctx.whatsappLink}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-black text-sm tracking-wide uppercase hover:bg-neutral-200 transition-all">
          <span>Iniciar Atendimento WhatsApp</span>
          <span>→</span>
        </a>
      </div>
    </div>
  </div>
</section>`;
    }
  },

  // 6. Hero Glassmorphism Dark Modern
  {
    id: 'hero-glassmorphism-dark',
    name: 'Hero Glassmorphism Dark Modern',
    category: 'heroes',
    style: 'moderno-vibrante',
    description: 'Fundo escuro profundo com blur de vidro fosco, gradiente suave e estética tech.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const title = escapeHtml(ctx.tagline || `Referência em ${ctx.niche}`);
      const desc = escapeHtml(ctx.description || `Estrutura moderna e equipe qualificada pronta para atender você.`);

      return `
<section data-wb-section="hero" class="relative bg-slate-950 text-slate-100 py-24 sm:py-32 overflow-hidden border-b border-slate-800">
  <div class="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
  <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
  <div class="relative max-w-5xl mx-auto px-4 sm:px-6">
    <div class="p-8 sm:p-14 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-2xl text-center space-y-6">
      <div data-wb-slot="hero-badge" class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
        <span>✨ Padrão de Excelência em ${escapeHtml(ctx.city)}</span>
      </div>
      <h1 data-wb-slot="hero-title" class="text-3xl sm:text-6xl font-black text-white tracking-tight">
        ${name}
      </h1>
      <p data-wb-slot="hero-subtitle" class="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
        ${title} — ${desc}
      </p>
      <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a data-wb-slot="hero-cta" href="${ctx.whatsappLink}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-600/25 transition-all text-sm">
          Falar Conosco no WhatsApp
        </a>
        <a href="#servicos" class="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-sm">
          Conhecer Serviços
        </a>
      </div>
    </div>
  </div>
</section>`;
    }
  },

  // 7. Hero com Mini Galeria Flutuante
  {
    id: 'hero-floating-gallery',
    name: 'Hero com Mini Galeria Flutuante',
    category: 'heroes',
    style: 'moderno-vibrante',
    description: 'Hero dinâmico com fotos em mosaico lateral perfeito para comércios com muitas fotos.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const title = escapeHtml(ctx.tagline || `O Espaço Ideal para Você em ${ctx.city}`);
      const photos = (ctx.galleryPhotos && ctx.galleryPhotos.length > 0)
        ? ctx.galleryPhotos
        : [ctx.heroPhoto, ctx.heroPhoto, ctx.heroPhoto];
      const p1 = photos[0] || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80';
      const p2 = photos[1] || p1;
      const p3 = photos[2] || p1;

      return `
<section data-wb-section="hero" class="relative bg-slate-900 text-slate-100 py-16 sm:py-24 border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-6 space-y-6">
        <span data-wb-slot="hero-badge" class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          ★ ${escapeHtml(ctx.niche)}
        </span>
        <h1 data-wb-slot="hero-title" class="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
          ${name}
        </h1>
        <p data-wb-slot="hero-subtitle" class="text-base sm:text-lg text-slate-300 leading-relaxed">
          ${title}. Atendimento humanizado, pontualidade e os melhores resultados para você.
        </p>
        <div class="pt-2 flex flex-wrap gap-4">
          <a data-wb-slot="hero-cta" href="${ctx.whatsappLink}" target="_blank" rel="noopener noreferrer" class="px-8 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all text-sm">
            Agendar Horário WhatsApp
          </a>
        </div>
      </div>
      <div class="lg:col-span-6 grid grid-cols-2 gap-4">
        <div class="space-y-4">
          <img data-wb-slot="hero-image-1" src="${p1}" alt="${name}" class="rounded-2xl object-cover h-48 w-full shadow-lg border border-slate-800" />
          <img data-wb-slot="hero-image-2" src="${p2}" alt="${name}" class="rounded-2xl object-cover h-64 w-full shadow-lg border border-slate-800" />
        </div>
        <div class="pt-8 space-y-4">
          <img data-wb-slot="hero-image-3" src="${p3}" alt="${name}" class="rounded-2xl object-cover h-64 w-full shadow-lg border border-slate-800" />
          <div class="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-center">
            <p class="text-2xl font-black text-amber-400">5.0 ★</p>
            <p class="text-xs text-slate-300">Google Avaliações</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
    }
  },

  // 8. Hero Clean Foco em Ação Direta
  {
    id: 'hero-direct-action',
    name: 'Hero Clean Foco em Ação Direta',
    category: 'heroes',
    style: 'corporativo-clean',
    description: 'Layout focado 100% em conversão imediata, horário de atendimento e botão de contato.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const hours = escapeHtml(ctx.hours || 'Segunda a Sábado das 08h às 19h');
      const address = escapeHtml(ctx.address || ctx.city);

      return `
<section data-wb-section="hero" class="bg-slate-950 text-slate-100 py-16 sm:py-24 border-b border-slate-800">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
    <span data-wb-slot="hero-badge" class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
      <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Aberto hoje • ${hours}
    </span>
    <h1 data-wb-slot="hero-title" class="text-4xl sm:text-6xl font-black text-white tracking-tight">
      ${name}
    </h1>
    <p data-wb-slot="hero-subtitle" class="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto">
      Localizado em ${address}. Atendimento especializado com agendamento imediato sem espera.
    </p>
    <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
      <a data-wb-slot="hero-cta" href="${ctx.whatsappLink}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xl transition-all text-base flex items-center justify-center gap-2">
        <span>Chamar no WhatsApp Agora</span>
      </a>
      <a href="tel:${ctx.phone}" class="w-full sm:w-auto px-6 py-4 rounded-xl font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-base">
        Ligar: ${escapeHtml(ctx.phone)}
      </a>
    </div>
  </div>
</section>`;
    }
  }
];
