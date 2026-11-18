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

export const ABOUT_BLOCKS: ModularBlockDefinition[] = [
  // 1. História com Foto + Estatísticas
  {
    id: 'about-photo-stats',
    name: 'História com Foto + Estatísticas',
    category: 'abouts',
    style: 'moderno-vibrante',
    description: 'Apresentação institucional com imagem lateral e métricas de autoridade (Anos de experiência, 5★).',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const niche = escapeHtml(ctx.niche);
      const city = escapeHtml(ctx.city);
      const photo = (ctx.galleryPhotos && ctx.galleryPhotos.length > 0)
        ? ctx.galleryPhotos[0]
        : (ctx.heroPhoto || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80');

      return `
<section id="sobre" data-wb-section="about" class="py-20 sm:py-28 bg-slate-900 text-slate-100 border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-5 relative">
        <div class="relative rounded-2xl overflow-hidden border border-slate-700 shadow-xl aspect-[4/5] bg-slate-950">
          <img data-wb-slot="about-image" src="${photo}" alt="Sobre ${name}" class="w-full h-full object-cover" loading="lazy" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
          <div class="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700">
            <p class="text-xs font-semibold text-emerald-400">Compromisso com o Cliente</p>
            <p class="text-sm font-bold text-white">Atendimento em ${city}</p>
          </div>
        </div>
      </div>
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
          <span>Quem Somos</span>
        </div>
        <h2 data-wb-slot="about-title" class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Dedicação, Técnica e Excelência em ${niche}
        </h2>
        <div data-wb-slot="about-text" class="space-y-4 text-slate-300 text-base leading-relaxed">
          <p>
            A <strong class="text-white">${name}</strong> foi construída com um objetivo claro: entregar uma experiência de alto padrão, combinando profissionais experientes, produtos de ponta e respeito irrestrito aos prazos e preferências de cada cliente.
          </p>
          <p>
            Localizados em <strong class="text-white">${city}</strong>, oferecemos um ambiente pensado em cada detalhe para o seu bem-estar, segurança e total satisfação.
          </p>
        </div>
        <div data-wb-slot="about-stats" class="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800">
          <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <p class="text-2xl sm:text-3xl font-black text-emerald-400">+5 Anos</p>
            <p class="text-xs text-slate-400 mt-1 font-medium">De Experiência</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <p class="text-2xl sm:text-3xl font-black text-amber-400">5.0 ★</p>
            <p class="text-xs text-slate-400 mt-1 font-medium">Nota no Google</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <p class="text-2xl sm:text-3xl font-black text-white">100%</p>
            <p class="text-xs text-slate-400 mt-1 font-medium">Dedicação</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
    }
  },

  // 2. Grid de 4 Diferenciais com Ícones
  {
    id: 'about-differentials-grid',
    name: 'Grid de 4 Diferenciais com Ícones',
    category: 'abouts',
    style: 'corporativo-clean',
    description: 'Foco nos 4 pilares fundamentais do comércio (Pontualidade, Qualidade, Ambiente, Garantia).',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const niche = escapeHtml(ctx.niche);

      return `
<section id="sobre" data-wb-section="about" class="py-20 bg-slate-950 text-slate-100 border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
    <div class="max-w-3xl mx-auto space-y-4">
      <span class="text-xs uppercase tracking-widest font-bold text-blue-400">Nossos Diferenciais</span>
      <h2 data-wb-slot="about-title" class="text-3xl sm:text-4xl font-extrabold text-white">
        Por que escolher a ${name}?
      </h2>
      <p data-wb-slot="about-text" class="text-slate-300 text-base">
        Nosso padrão de atendimento em ${niche} foi desenvolvido para garantir tranquilidade e resultados impecáveis.
      </p>
    </div>
    <div data-wb-slot="about-cards" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
      <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xl">✓</div>
        <h3 class="text-lg font-bold text-white">Profissionais Qualificados</h3>
        <p class="text-sm text-slate-400 leading-relaxed">Equipe com treinamento contínuo e atualização nas melhores técnicas do segmento.</p>
      </div>
      <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xl">⚡</div>
        <h3 class="text-lg font-bold text-white">Pontualidade & Agilidade</h3>
        <p class="text-sm text-slate-400 leading-relaxed">Respeito rigoroso aos horários agendados e atendimento sem filas desnecessárias.</p>
      </div>
      <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xl">★</div>
        <h3 class="text-lg font-bold text-white">Produtos de Primeira Linha</h3>
        <p class="text-sm text-slate-400 leading-relaxed">Utilizamos apenas insumos e materiais certificados pelos órgãos reguladores.</p>
      </div>
      <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xl">❤</div>
        <h3 class="text-lg font-bold text-white">Ambiente Confortável</h3>
        <p class="text-sm text-slate-400 leading-relaxed">Espaço climatizado, higienizado e projetado para acolher você com comodidade.</p>
      </div>
    </div>
  </div>
</section>`;
    }
  },

  // 3. Manifesto da Marca Editorial
  {
    id: 'about-brand-manifesto',
    name: 'Manifesto da Marca Editorial',
    category: 'abouts',
    style: 'dark-editorial',
    description: 'Texto institucional nobre com tipografia clássica, manifesto e citação de liderança.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);

      return `
<section id="sobre" data-wb-section="about" class="py-24 bg-zinc-950 text-zinc-100 border-b border-zinc-900">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
    <p class="text-xs uppercase tracking-[0.3em] font-semibold text-zinc-500">Manifesto Institucional</p>
    <blockquote data-wb-slot="about-title" class="text-2xl sm:text-4xl font-serif font-light text-zinc-100 leading-snug">
      “Acreditamos que a verdadeira excelência está na harmonia entre técnica rigorosa, sensibilidade artística e respeito genuíno a cada cliente.”
    </blockquote>
    <div data-wb-slot="about-text" class="text-zinc-400 text-base leading-relaxed max-w-2xl mx-auto space-y-4">
      <p>
        No <strong class="text-zinc-200">${name}</strong>, repudiamos o atendimento genérico e apressado. Cada serviço é conduzido como um compromisso único de arte e valor.
      </p>
    </div>
    <div class="pt-6 border-t border-zinc-900 inline-block">
      <p class="font-serif italic text-lg text-zinc-300">Direção Geral</p>
      <p class="text-xs uppercase tracking-wider text-zinc-500 font-mono mt-1">${name} • ${escapeHtml(ctx.city)}</p>
    </div>
  </div>
</section>`;
    }
  },

  // 4. Split História + Checklist de Garantias
  {
    id: 'about-split-checklist',
    name: 'Split História + Checklist de Garantias',
    category: 'abouts',
    style: 'corporativo-clean',
    description: 'Apresentação com foto e lista de garantias/biossegurança/certificações.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const photo = ctx.heroPhoto || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1000&auto=format&fit=crop&q=80';

      return `
<section id="sobre" data-wb-section="about" class="py-20 bg-slate-900 text-slate-100 border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-6 space-y-6">
        <h2 data-wb-slot="about-title" class="text-3xl sm:text-4xl font-extrabold text-white">
          Compromisso com Segurança, Higiene e Resultados
        </h2>
        <div data-wb-slot="about-text" class="text-slate-300 text-base leading-relaxed space-y-3">
          <p>
            Na <strong class="text-white">${name}</strong>, a sua segurança e satisfação estão sempre em primeiro lugar. Seguimos os mais rigorosos protocolos operacionais do mercado.
          </p>
        </div>
        <ul data-wb-slot="about-checklist" class="space-y-3 pt-2 text-sm text-slate-200">
          <li class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">✓</span>
            <span>Esterilização e biossegurança conforme normas vigentes</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">✓</span>
            <span>Produtos originais com garantia de procedência</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">✓</span>
            <span>Acompanhamento pós-atendimento e suporte contínuo</span>
          </li>
        </ul>
      </div>
      <div class="lg:col-span-6">
        <div class="rounded-2xl overflow-hidden border border-slate-700 shadow-xl aspect-video bg-slate-950">
          <img src="${photo}" alt="Instalações ${name}" class="w-full h-full object-cover" loading="lazy" />
        </div>
      </div>
    </div>
  </div>
</section>`;
    }
  },

  // 5. Cards de Valores e Compromisso
  {
    id: 'about-cards-values',
    name: 'Cards de Valores e Compromisso',
    category: 'abouts',
    style: 'moderno-vibrante',
    description: 'Três blocos estruturados: Missão, Visão e Princípios com acabamento moderno.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);

      return `
<section id="sobre" data-wb-section="about" class="py-20 bg-slate-950 text-slate-100 border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-3xl mx-auto mb-12 space-y-3">
      <h2 data-wb-slot="about-title" class="text-3xl font-extrabold text-white">Nossa Filosofia de Trabalho</h2>
      <p data-wb-slot="about-text" class="text-slate-400 text-sm">O que guia as decisões diárias da equipe da ${name}.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div class="text-2xl font-black text-emerald-400">01.</div>
        <h3 class="text-xl font-bold text-white">Transparência Total</h3>
        <p class="text-sm text-slate-300 leading-relaxed">Explicamos detalhadamente cada procedimento, valor e prazo antes do início do serviço.</p>
      </div>
      <div class="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div class="text-2xl font-black text-cyan-400">02.</div>
        <h3 class="text-xl font-bold text-white">Aperfeiçoamento</h3>
        <p class="text-sm text-slate-300 leading-relaxed">Investimento contínuo em novos equipamentos, cursos e tendências globais do setor.</p>
      </div>
      <div class="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div class="text-2xl font-black text-amber-400">03.</div>
        <h3 class="text-xl font-bold text-white">Fidelização</h3>
        <p class="text-sm text-slate-300 leading-relaxed">Mais do que clientes, construímos relacionamentos de longa data baseados na confiança.</p>
      </div>
    </div>
  </div>
</section>`;
    }
  },

  // 6. Sobre Clean Minimalista com Assinatura
  {
    id: 'about-clean-minimal',
    name: 'Sobre Clean Minimalista com Assinatura',
    category: 'abouts',
    style: 'minimalista',
    description: 'Design super limpo, direto ao ponto, com assinatura da equipe.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);

      return `
<section id="sobre" data-wb-section="about" class="py-20 bg-neutral-950 text-neutral-100 border-b border-neutral-900">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
    <span class="text-xs font-mono uppercase tracking-widest text-neutral-500">// Institucional</span>
    <h2 data-wb-slot="about-title" class="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
      Comprometidos com a melhor experiência em ${escapeHtml(ctx.niche)}.
    </h2>
    <div data-wb-slot="about-text" class="text-lg text-neutral-300 space-y-4 font-normal leading-relaxed">
      <p>
        No <strong>${name}</strong>, acreditamos que excelência não é um ato isolado, mas sim um hábito construído a cada atendimento.
      </p>
      <p>
        Venha nos visitar e comprove na prática o cuidado com cada detalhe.
      </p>
    </div>
    <div class="pt-6 flex items-center justify-between border-t border-neutral-900 text-sm text-neutral-400">
      <div>${name} • ${escapeHtml(ctx.city)}</div>
      <div class="font-bold text-white">Equipe ${name}</div>
    </div>
  </div>
</section>`;
    }
  }
];
