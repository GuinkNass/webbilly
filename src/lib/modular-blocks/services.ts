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

export const SERVICE_BLOCKS: ModularBlockDefinition[] = [
  // 1. Cards de Serviços com Preço e Botão WhatsApp
  {
    id: 'services-cards-price-cta',
    name: 'Cards de Serviços com Preço e Botão WhatsApp',
    category: 'services',
    style: 'moderno-vibrante',
    description: 'Grid de cards com preço formatado, descrição concisa e link direto de agendamento.',
    render: (ctx: ModularBlockContext) => {
      const items = (ctx.services && ctx.services.length > 0)
        ? ctx.services
        : [
            { name: `Atendimento Especializado`, price: 'Sob Consulta', description: 'Procedimento completo conduzido por especialista.' },
            { name: `Pacote Completo VIP`, price: 'Sob Consulta', description: 'Nossa experiência mais procurada com máximo cuidado.' },
            { name: `Manutenção & Acompanhamento`, price: 'Sob Consulta', description: 'Revisão periódica para manter resultados perfeitos.' }
          ];

      const cardsHtml = items.map((s, idx) => `
        <div data-wb-slot="service-card" class="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-slate-500">0${idx + 1}.</span>
              <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ${escapeHtml(s.price || 'Sob Consulta')}
              </span>
            </div>
            <h3 class="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">${escapeHtml(s.name)}</h3>
            <p class="text-sm text-slate-400 leading-relaxed">${escapeHtml(s.description || 'Procedimento realizado com os melhores produtos e garantia de satisfação.')}</p>
          </div>
          <div class="pt-6 mt-6 border-t border-slate-800/80">
            <a href="${ctx.whatsappLink}&text=${encodeURIComponent(`Olá! Gostaria de agendar o serviço: ${s.name}`)}" target="_blank" rel="noopener noreferrer" class="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-slate-800 hover:bg-emerald-600 flex items-center justify-center gap-2 transition-all">
              <span>Agendar Este Serviço</span>
              <span>→</span>
            </a>
          </div>
        </div>
      `).join('');

      return `
<section id="servicos" data-wb-section="services" class="py-20 sm:py-28 bg-slate-950 text-slate-100 border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
    <div class="text-center max-w-3xl mx-auto space-y-4">
      <span class="text-xs uppercase tracking-widest font-bold text-emerald-400">Tabela de Procedimentos</span>
      <h2 data-wb-slot="services-title" class="text-3xl sm:text-5xl font-extrabold text-white">Nossos Serviços em Destaque</h2>
      <p data-wb-slot="services-subtitle" class="text-slate-300 text-base">Valores transparentes e dedicação máxima aos detalhes.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${cardsHtml}
    </div>
  </div>
</section>`;
    }
  },

  // 2. Tabela Estilo Cardápio/Menu (gastronomia, barbearias, estética)
  {
    id: 'services-menu-table',
    name: 'Tabela Estilo Cardápio/Menu',
    category: 'services',
    style: 'dark-editorial',
    description: 'Design sofisticado de menu/cardápio dividido em colunas com pontos de linha e valores.',
    render: (ctx: ModularBlockContext) => {
      const items = (ctx.services && ctx.services.length > 0)
        ? ctx.services
        : [
            { name: 'Corte Tradicional na Tesoura', price: 'R$ 45,00', description: 'Acabamento minucioso e alinhamento do visual.' },
            { name: 'Barba Terapia com Toalha Quente', price: 'R$ 40,00', description: 'Óleos essenciais, massagem facial e navalha afiada.' },
            { name: 'Combo Completo Cabelo + Barba', price: 'R$ 75,00', description: 'A experiência definitiva com direito a cerveja gelada.' },
            { name: 'Pigmentação & Camuflagem', price: 'R$ 35,00', description: 'Definição das linhas e disfarce de fios brancos.' }
          ];

      const rowsHtml = items.map((s) => `
        <div class="py-4 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <div class="space-y-1">
            <span class="text-base font-bold text-zinc-100">${escapeHtml(s.name)}</span>
            <p class="text-xs text-zinc-400">${escapeHtml(s.description || 'Ingredientes selecionados e preparo de alta qualidade.')}</p>
          </div>
          <div class="shrink-0 font-serif font-bold text-amber-400 text-base sm:text-lg">
            ${escapeHtml(s.price || 'Sob Consulta')}
          </div>
        </div>
      `).join('');

      return `
<section id="servicos" data-wb-section="services" class="py-20 bg-zinc-950 text-zinc-100 border-b border-zinc-900">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
    <div class="text-center space-y-3">
      <span class="text-xs uppercase tracking-[0.25em] font-semibold text-zinc-500">Menu & Valores</span>
      <h2 data-wb-slot="services-title" class="text-3xl sm:text-4xl font-serif text-zinc-100">Cardápio de Serviços</h2>
      <p class="text-sm text-zinc-400">Confira as opções preparadas especialmente para você.</p>
    </div>
    <div class="p-6 sm:p-10 rounded-2xl bg-zinc-900/60 border border-zinc-800 shadow-xl space-y-2">
      ${rowsHtml}
    </div>
    <div class="text-center pt-4">
      <a href="${ctx.whatsappLink}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-8 py-3.5 rounded-none font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 uppercase tracking-wider text-xs transition-all">
        <span>Fazer Pedido / Agendamento no WhatsApp</span>
      </a>
    </div>
  </div>
</section>`;
    }
  },

  // 3. Grid de Especialidades com Ícones e Destaques
  {
    id: 'services-specialties-grid',
    name: 'Grid de Especialidades com Ícones e Destaques',
    category: 'services',
    style: 'corporativo-clean',
    description: 'Layout corporativo limpo com 4 áreas de atuação destacadas com ícones.',
    render: (ctx: ModularBlockContext) => {
      const items = (ctx.services && ctx.services.length > 0)
        ? ctx.services.slice(0, 4)
        : [
            { name: 'Diagnóstico & Avaliação', price: 'Inicial', description: 'Mapeamento das necessidades com relatório técnico preciso.' },
            { name: 'Tratamento Avançado', price: 'Personalizado', description: 'Protocolos de última geração com alta previsibilidade.' },
            { name: 'Acompanhamento Contínuo', price: 'Incluso', description: 'Suporte pós-atendimento para garantir satisfação.' },
            { name: 'Consultoria Preventiva', price: 'Sob Medida', description: 'Estratégias práticas para evitar problemas futuros.' }
          ];

      const cardsHtml = items.map((s, idx) => `
        <div class="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black text-lg">0${idx + 1}</div>
          <h3 class="text-xl font-bold text-white">${escapeHtml(s.name)}</h3>
          <p class="text-sm text-slate-300 leading-relaxed">${escapeHtml(s.description || 'Atendimento pautado em rigor técnico e ética profissional.')}</p>
          <div class="pt-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            ${escapeHtml(s.price || 'Sob Consulta')}
          </div>
        </div>
      `).join('');

      return `
<section id="servicos" data-wb-section="services" class="py-20 bg-slate-950 text-slate-100 border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
    <div class="max-w-3xl space-y-3">
      <span class="text-xs uppercase tracking-widest font-bold text-blue-400">Áreas de Atuação</span>
      <h2 data-wb-slot="services-title" class="text-3xl sm:text-4xl font-extrabold text-white">Especialidades & Soluções</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      ${cardsHtml}
    </div>
  </div>
</section>`;
    }
  },

  // 4. Planos e Pacotes com Badge Popular
  {
    id: 'services-plans-packages',
    name: 'Planos e Pacotes com Badge Popular',
    category: 'services',
    style: 'moderno-vibrante',
    description: 'Comparativo de planos com destaque para o mais procurado pelo público.',
    render: (ctx: ModularBlockContext) => {
      return `
<section id="servicos" data-wb-section="services" class="py-20 bg-slate-900 text-slate-100 border-b border-slate-800">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
    <div class="text-center max-w-2xl mx-auto space-y-3">
      <h2 data-wb-slot="services-title" class="text-3xl font-extrabold text-white">Planos & Pacotes Exclusivos</h2>
      <p class="text-slate-300 text-sm">Escolha a opção ideal para a sua necessidade e orçamento.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      <div class="p-8 rounded-2xl bg-slate-950 border border-slate-800 space-y-6 flex flex-col justify-between">
        <div class="space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Essencial</p>
          <p class="text-3xl font-black text-white">Sob Consulta</p>
          <p class="text-xs text-slate-400">Ideal para atendimentos rápidos e procedimentos de rotina.</p>
        </div>
        <a href="${ctx.whatsappLink}" class="w-full py-3 rounded-xl font-bold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 text-center">Consultar</a>
      </div>
      <div class="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500 shadow-xl space-y-6 flex flex-col justify-between relative">
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
          Mais Procurado
        </div>
        <div class="space-y-4">
          <p class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Completo VIP</p>
          <p class="text-3xl font-black text-white">Sob Consulta</p>
          <p class="text-xs text-slate-300">Nossa experiência completa com atendimento prioritário e pós-atendimento.</p>
        </div>
        <a href="${ctx.whatsappLink}" class="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 text-center shadow-lg">Agendar VIP</a>
      </div>
      <div class="p-8 rounded-2xl bg-slate-950 border border-slate-800 space-y-6 flex flex-col justify-between">
        <div class="space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Recorrente</p>
          <p class="text-3xl font-black text-white">Personalizado</p>
          <p class="text-xs text-slate-400">Condições especiais para pacotes mensais ou tratamentos continuados.</p>
        </div>
        <a href="${ctx.whatsappLink}" class="w-full py-3 rounded-xl font-bold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 text-center">Saiba Mais</a>
      </div>
    </div>
  </div>
</section>`;
    }
  },

  // 5. Accordion/Lista Interativa de Procedimentos
  {
    id: 'services-interactive-list',
    name: 'Lista Interativa / Accordion de Procedimentos',
    category: 'services',
    style: 'corporativo-clean',
    description: 'Lista estruturada e elegante com descrição expandida de cada serviço.',
    render: (ctx: ModularBlockContext) => {
      const items = ctx.services && ctx.services.length > 0 ? ctx.services : [
        { name: 'Atendimento Inicial & Análise', price: 'Sob Consulta', description: 'Primeiro contato com o profissional para definição do plano de ação ideal.' },
        { name: 'Execução Técnica Rigorosa', price: 'Sob Consulta', description: 'Utilização das técnicas mais modernas e materiais certificados.' },
        { name: 'Revisão & Acompanhamento', price: 'Incluso', description: 'Garantia de resultado e orientações completas para manutenção.' }
      ];

      const listHtml = items.map((s, i) => `
        <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <span class="text-xs font-bold text-blue-400">Etapa 0${i + 1}</span>
            <h3 class="text-lg font-bold text-white">${escapeHtml(s.name)}</h3>
            <p class="text-sm text-slate-300">${escapeHtml(s.description || 'Padrão de qualidade assegurado pela equipe.')}</p>
          </div>
          <a href="${ctx.whatsappLink}" class="shrink-0 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 text-center">
            ${escapeHtml(s.price || 'Agendar')}
          </a>
        </div>
      `).join('');

      return `
<section id="servicos" data-wb-section="services" class="py-20 bg-slate-950 text-slate-100 border-b border-slate-800">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
    <div class="text-center space-y-3">
      <h2 data-wb-slot="services-title" class="text-3xl font-extrabold text-white">Como Funciona Nosso Atendimento</h2>
      <p class="text-slate-400 text-sm">Etapas claras para garantir a melhor entrega do início ao fim.</p>
    </div>
    <div class="space-y-4">
      ${listHtml}
    </div>
  </div>
</section>`;
    }
  },

  // 6. Grid 3 Colunas com Imagem de Cabeçalho
  {
    id: 'services-cards-photo',
    name: 'Cards de Serviços com Fotos de Cabeçalho',
    category: 'services',
    style: 'moderno-vibrante',
    description: 'Cards com foto ilustrativa no topo, perfeitos para gastronomia, estética e tatuagem.',
    render: (ctx: ModularBlockContext) => {
      const photos = (ctx.galleryPhotos && ctx.galleryPhotos.length > 0)
        ? ctx.galleryPhotos
        : [ctx.heroPhoto, ctx.heroPhoto, ctx.heroPhoto];

      const items = (ctx.services && ctx.services.length > 0)
        ? ctx.services.slice(0, 3)
        : [
            { name: 'Especialidade 1', price: 'Destaque', description: 'Serviço mais pedido da casa.' },
            { name: 'Especialidade 2', price: 'Premium', description: 'Experiência exclusiva e personalizada.' },
            { name: 'Especialidade 3', price: 'Especial', description: 'Combinação perfeita de técnica e resultado.' }
          ];

      const cardsHtml = items.map((s, idx) => `
        <div class="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div class="aspect-video w-full overflow-hidden bg-slate-950">
            <img src="${photos[idx % photos.length] || ctx.heroPhoto}" alt="${escapeHtml(s.name)}" class="w-full h-full object-cover hover:scale-105 transition-all duration-500" loading="lazy" />
          </div>
          <div class="p-6 space-y-3 flex-1 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-white">${escapeHtml(s.name)}</h3>
                <span class="text-xs font-bold text-amber-400">${escapeHtml(s.price || 'Sob Consulta')}</span>
              </div>
              <p class="text-xs text-slate-300 leading-relaxed">${escapeHtml(s.description || 'Qualidade garantida e máxima atenção aos detalhes.')}</p>
            </div>
            <div class="pt-4">
              <a href="${ctx.whatsappLink}" class="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-slate-800 hover:bg-emerald-600 transition-all flex items-center justify-center">
                Pedir Informações no WhatsApp
              </a>
            </div>
          </div>
        </div>
      `).join('');

      return `
<section id="servicos" data-wb-section="services" class="py-20 bg-slate-950 text-slate-100 border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
    <div class="text-center max-w-2xl mx-auto space-y-3">
      <span class="text-xs font-bold uppercase tracking-widest text-emerald-400">Catálogo Visual</span>
      <h2 data-wb-slot="services-title" class="text-3xl sm:text-4xl font-extrabold text-white">Nossos Principais Procedimentos</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      ${cardsHtml}
    </div>
  </div>
</section>`;
    }
  },

  // 7. Linhas Detalhadas com Duração, Benefício e Preço
  {
    id: 'services-detailed-rows',
    name: 'Linhas Detalhadas com Duração e Benefício',
    category: 'services',
    style: 'corporativo-clean',
    description: 'Linhas completas com tempo estimado, público-alvo e valor.',
    render: (ctx: ModularBlockContext) => {
      const items = ctx.services && ctx.services.length > 0 ? ctx.services : [
        { name: 'Sessão Individual Completa', price: 'R$ 120,00', description: 'Duração aproximada de 60 minutos com suporte total.' },
        { name: 'Avaliação & Diagnóstico Inicial', price: 'R$ 80,00', description: 'Levantamento minucioso com especialista experiente.' }
      ];

      const rows = items.map(s => `
        <div class="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <h3 class="text-lg font-bold text-white">${escapeHtml(s.name)}</h3>
            <p class="text-xs text-slate-400">${escapeHtml(s.description || 'Horário agendado sem espera.')}</p>
          </div>
          <div class="flex items-center gap-4 shrink-0">
            <span class="text-lg font-black text-emerald-400">${escapeHtml(s.price || 'Sob Consulta')}</span>
            <a href="${ctx.whatsappLink}" class="px-4 py-2 rounded-lg font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500">Agendar</a>
          </div>
        </div>
      `).join('');

      return `
<section id="servicos" data-wb-section="services" class="py-20 bg-slate-950 text-slate-100 border-b border-slate-800">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
    <div class="space-y-2">
      <h2 data-wb-slot="services-title" class="text-3xl font-extrabold text-white">Opções de Atendimento</h2>
      <p class="text-slate-400 text-sm">Selecione o serviço ideal para o seu momento.</p>
    </div>
    <div class="space-y-3">
      ${rows}
    </div>
  </div>
</section>`;
    }
  },

  // 8. Vitrine Minimalista com Badges
  {
    id: 'services-minimalist-badges',
    name: 'Vitrine Minimalista com Badges',
    category: 'services',
    style: 'minimalista',
    description: 'Design ultra limpo e tipográfico com tags rápidas.',
    render: (ctx: ModularBlockContext) => {
      const items = ctx.services && ctx.services.length > 0 ? ctx.services : [
        { name: 'Serviço Primário', price: 'A partir de R$ 50', description: 'Padrão elevado de atendimento.' },
        { name: 'Serviço Secundário', price: 'Sob Consulta', description: 'Solução sob medida para você.' }
      ];

      const html = items.map(s => `
        <div class="p-6 border border-neutral-800 bg-neutral-900/60 space-y-3">
          <div class="flex justify-between items-baseline">
            <h3 class="text-xl font-bold text-white">${escapeHtml(s.name)}</h3>
            <span class="font-mono text-sm text-neutral-300">${escapeHtml(s.price || 'Sob Consulta')}</span>
          </div>
          <p class="text-sm text-neutral-400">${escapeHtml(s.description || 'Execução com técnica refinada.')}</p>
        </div>
      `).join('');

      return `
<section id="servicos" data-wb-section="services" class="py-20 bg-neutral-950 text-white border-b border-neutral-900">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
    <h2 data-wb-slot="services-title" class="text-3xl sm:text-4xl font-black text-white">// Serviços</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      ${html}
    </div>
  </div>
</section>`;
    }
  }
];
