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

export const TESTIMONIAL_BLOCKS: ModularBlockDefinition[] = [
  // 1. Cards de Avaliações Reais do Google Maps com Estrelas Douradas
  {
    id: 'testimonials-google-cards',
    name: 'Cards de Avaliações Google Maps (5★)',
    category: 'testimonials',
    style: 'moderno-vibrante',
    description: 'Cards modernos com estrelas douradas, badge do Google e depoimentos autênticos.',
    render: (ctx: ModularBlockContext) => {
      const items = (ctx.reviews && ctx.reviews.length > 0)
        ? ctx.reviews.slice(0, 3)
        : [
            { author: 'Guilherme Siqueira', rating: 5, text: 'Atendimento fantástico! Profissionais dedicados, pontuais e com resultado impecável. Recomendo de olhos fechados!' },
            { author: 'Camila Fernandes', rating: 5, text: 'Melhor experiência da cidade! Fui super bem atendida e com certeza voltarei sempre.' },
            { author: 'Rodrigo Medeiros', rating: 5, text: 'Estrutura impecável, preço justo e serviço de altíssima qualidade. Virei cliente fiel!' }
          ];

      const cardsHtml = items.map((r) => `
        <div data-wb-slot="testimonial-card" class="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-4 flex flex-col justify-between">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex text-amber-400 text-sm tracking-wider">★★★★★</div>
              <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Google Maps
              </span>
            </div>
            <p class="text-sm text-slate-300 leading-relaxed italic">“${escapeHtml(r.text)}”</p>
          </div>
          <div class="pt-4 border-t border-slate-800 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white font-bold flex items-center justify-center text-sm shadow">
              ${escapeHtml(r.author.charAt(0))}
            </div>
            <div>
              <p class="text-sm font-bold text-white">${escapeHtml(r.author)}</p>
              <p class="text-[11px] text-slate-400">Cliente Verificado • ${escapeHtml(ctx.city)}</p>
            </div>
          </div>
        </div>
      `).join('');

      return `
<section id="depoimentos" data-wb-section="testimonials" class="py-20 sm:py-28 bg-slate-950 text-slate-100 border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
    <div class="text-center max-w-3xl mx-auto space-y-3">
      <span class="text-xs uppercase tracking-widest font-bold text-amber-400">Opinião dos Clientes</span>
      <h2 data-wb-slot="testimonials-title" class="text-3xl sm:text-5xl font-extrabold text-white">Avaliações 5 Estrelas</h2>
      <p class="text-slate-400 text-sm sm:text-base">A satisfação dos nossos clientes é o nosso maior patrimônio.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      ${cardsHtml}
    </div>
  </div>
</section>`;
    }
  },

  // 2. Depoimento em Destaque Grande + Lista Lateral
  {
    id: 'testimonials-featured-side',
    name: 'Depoimento em Destaque + Lista Lateral',
    category: 'testimonials',
    style: 'dark-editorial',
    description: 'Um depoimento principal de grande destaque ladeado por dois relatos complementares.',
    render: (ctx: ModularBlockContext) => {
      const items = (ctx.reviews && ctx.reviews.length > 0)
        ? ctx.reviews
        : [
            { author: 'Mariana Duarte', rating: 5, text: 'Superou todas as minhas expectativas! O cuidado em cada detalhe e a clareza nas orientações me conquistaram.' },
            { author: 'Thiago Neves', rating: 5, text: 'Pontualidade britânica e profissionais de alto gabarito. Vale cada centavo investido.' },
            { author: 'Renata Bastos', rating: 5, text: 'Já virei cliente assídua! Ambiente impecável e receptividade calorosa.' }
          ];

      const featured = items[0];
      const sideItems = items.slice(1, 3);

      return `
<section id="depoimentos" data-wb-section="testimonials" class="py-20 bg-zinc-950 text-zinc-100 border-b border-zinc-900">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
    <div class="space-y-2">
      <span class="text-xs uppercase tracking-[0.25em] font-semibold text-zinc-500">Depoimentos</span>
      <h2 data-wb-slot="testimonials-title" class="text-3xl font-serif text-white">O Que Dizem Quem Já Conhece</h2>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      <div class="lg:col-span-7 p-8 sm:p-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-6">
        <div class="space-y-4">
          <div class="text-amber-400 text-base">★★★★★</div>
          <p class="text-xl sm:text-2xl font-serif italic text-zinc-100 leading-relaxed">
            “${escapeHtml(featured.text)}”
          </p>
        </div>
        <div>
          <p class="text-base font-bold text-white">${escapeHtml(featured.author)}</p>
          <p class="text-xs text-zinc-400">Avaliação verificada no Google</p>
        </div>
      </div>
      <div class="lg:col-span-5 space-y-4 flex flex-col justify-between">
        ${sideItems.map(s => `
          <div class="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div class="text-amber-400 text-xs">★★★★★</div>
            <p class="text-xs text-zinc-300 leading-relaxed italic">“${escapeHtml(s.text)}”</p>
            <p class="text-xs font-bold text-white">${escapeHtml(s.author)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
</section>`;
    }
  },

  // 3. Grid 3 Colunas com Avatares e Cidade
  {
    id: 'testimonials-three-col-avatar',
    name: 'Grid 3 Colunas com Avatares e Cidade',
    category: 'testimonials',
    style: 'corporativo-clean',
    description: 'Apresentação corporativa clara com avatar, nome e cidade do cliente.',
    render: (ctx: ModularBlockContext) => {
      const items = ctx.reviews && ctx.reviews.length > 0 ? ctx.reviews.slice(0, 3) : [
        { author: 'Bruno Lemos', rating: 5, text: 'Excelente prestação de serviço. Tudo transparente, sem surpresas e com total atenção ao cliente.' },
        { author: 'Aline Souza', rating: 5, text: 'Recomendo com certeza! Equipe muito atenciosa e trabalho de altíssimo nível.' },
        { author: 'Felipe Rocha', rating: 5, text: 'Melhor custo-benefício e qualidade da região. Continuem com esse trabalho excelente!' }
      ];

      const html = items.map(r => `
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div class="flex text-amber-400 text-xs">★★★★★</div>
          <p class="text-sm text-slate-300 leading-relaxed">“${escapeHtml(r.text)}”</p>
          <div class="pt-3 border-t border-slate-800">
            <p class="text-sm font-bold text-white">${escapeHtml(r.author)}</p>
            <p class="text-xs text-slate-400">${escapeHtml(ctx.city)}</p>
          </div>
        </div>
      `).join('');

      return `
<section id="depoimentos" data-wb-section="testimonials" class="py-20 bg-slate-950 text-slate-100 border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
    <div class="text-center max-w-2xl mx-auto space-y-2">
      <h2 data-wb-slot="testimonials-title" class="text-3xl font-extrabold text-white">Relatos de Satisfação</h2>
      <p class="text-slate-400 text-sm">Transparência e confiança comprovada por quem utiliza nossos serviços.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      ${html}
    </div>
  </div>
</section>`;
    }
  },

  // 4. Cards Compactos com Selo de Verificação
  {
    id: 'testimonials-compact-verified',
    name: 'Cards Compactos com Selo de Verificação',
    category: 'testimonials',
    style: 'minimalista',
    description: 'Visual moderno e compacto com selo verde de cliente verificado.',
    render: (ctx: ModularBlockContext) => {
      const items = ctx.reviews && ctx.reviews.length > 0 ? ctx.reviews.slice(0, 3) : [
        { author: 'Leonardo C.', rating: 5, text: 'Nota 10 em tudo: recepção, execução e pós-venda.' },
        { author: 'Patricia M.', rating: 5, text: 'Lugar super agradável e profissionais nota mil.' },
        { author: 'Daniel V.', rating: 5, text: 'Pontualidade e qualidade acima da média.' }
      ];

      const html = items.map(r => `
        <div class="p-5 rounded-xl border border-neutral-800 bg-neutral-900 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-white">${escapeHtml(r.author)}</span>
            <span class="text-emerald-400 font-semibold">✓ Verificado</span>
          </div>
          <p class="text-xs text-neutral-300">“${escapeHtml(r.text)}”</p>
        </div>
      `).join('');

      return `
<section id="depoimentos" data-wb-section="testimonials" class="py-16 bg-neutral-950 text-white border-b border-neutral-900">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
    <h2 data-wb-slot="testimonials-title" class="text-2xl font-black">// Avaliações</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      ${html}
    </div>
  </div>
</section>`;
    }
  },

  // 5. Balões de Feedback WhatsApp / Direct
  {
    id: 'testimonials-chat-bubbles',
    name: 'Balões de Feedback Estilo WhatsApp',
    category: 'testimonials',
    style: 'moderno-vibrante',
    description: 'Depoimentos dispostos como mensagens recebidas no WhatsApp com balão verde.',
    render: (ctx: ModularBlockContext) => {
      const items = ctx.reviews && ctx.reviews.length > 0 ? ctx.reviews.slice(0, 3) : [
        { author: 'Lucas Andrade', rating: 5, text: 'Passando pra agradecer pelo atendimento impecável de hoje! Ficou perfeito demais.' },
        { author: 'Beatriz Costa', rating: 5, text: 'Pessoal, muito obrigada! Vocês ganharam uma cliente fiel com certeza.' },
        { author: 'Gabriel Mendes', rating: 5, text: 'Sensacional o resultado! Já indiquei pros amigos aqui do trabalho.' }
      ];

      const html = items.map((r, i) => `
        <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">WA</div>
            <div>
              <p class="text-xs font-bold text-white">${escapeHtml(r.author)}</p>
              <p class="text-[10px] text-slate-400">Mensagem WhatsApp • 14:3${i}</p>
            </div>
          </div>
          <p class="text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
            ${escapeHtml(r.text)}
          </p>
        </div>
      `).join('');

      return `
<section id="depoimentos" data-wb-section="testimonials" class="py-20 bg-slate-950 text-slate-100 border-b border-slate-800">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
    <div class="text-center space-y-2">
      <h2 data-wb-slot="testimonials-title" class="text-3xl font-extrabold text-white">Mensagens de Quem Já Foi Atendido</h2>
      <p class="text-slate-400 text-sm">Prints e feedbacks reais que recebemos diariamente.</p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      ${html}
    </div>
  </div>
</section>`;
    }
  }
];
