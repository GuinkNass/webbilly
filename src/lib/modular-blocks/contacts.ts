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

export const CONTACT_BLOCKS: ModularBlockDefinition[] = [
  // 1. Horário de Funcionamento + Endereço + Rota Google Maps + WhatsApp + Rodapé Limpo
  {
    id: 'contact-complete-info-footer',
    name: 'Contato Completo + Horários + Rota Maps',
    category: 'contacts',
    style: 'moderno-vibrante',
    description: 'Layout completo com horário de funcionamento, endereço, link para rotas no Google Maps e botão de WhatsApp.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const hours = escapeHtml(ctx.hours || 'Segunda a Sábado das 08h às 19h');
      const address = escapeHtml(ctx.address || `${ctx.city}`);
      const cleanMapsQuery = encodeURIComponent(`${ctx.businessName} ${ctx.address || ctx.city}`);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${cleanMapsQuery}`;

      return `
<section id="contato" data-wb-section="contact" class="py-20 sm:py-28 bg-slate-900 text-slate-100 border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
    <div class="text-center max-w-3xl mx-auto space-y-3">
      <span class="text-xs uppercase tracking-widest font-bold text-emerald-400">Atendimento & Localização</span>
      <h2 data-wb-slot="contact-title" class="text-3xl sm:text-5xl font-extrabold text-white">Venha nos Visitar</h2>
      <p class="text-slate-300 text-sm sm:text-base">Estamos prontos para receber você com todo o conforto e excelência.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Card 1: Horários -->
      <div class="p-8 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xl">🕒</div>
        <h3 class="text-xl font-bold text-white">Horário de Atendimento</h3>
        <p data-wb-slot="contact-hours" class="text-sm text-slate-300 leading-relaxed font-medium">
          ${hours}
        </p>
        <p class="text-xs text-emerald-400 font-semibold">Agendamentos com prioridade pelo WhatsApp</p>
      </div>

      <!-- Card 2: Endereço & Rota -->
      <div class="p-8 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xl">📍</div>
        <h3 class="text-xl font-bold text-white">Nosso Endereço</h3>
        <p data-wb-slot="contact-address" class="text-sm text-slate-300 leading-relaxed">
          ${address}
        </p>
        <div class="pt-2">
          <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
            <span>Abrir Rota no Google Maps</span>
            <span>↗</span>
          </a>
        </div>
      </div>

      <!-- Card 3: Contato Direto -->
      <div class="p-8 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xl">💬</div>
        <h3 class="text-xl font-bold text-white">Fale com a Equipe</h3>
        <p class="text-sm text-slate-300 leading-relaxed">
          Tire dúvidas, confira disponibilidades e reserve seu horário agora mesmo.
        </p>
        <div class="pt-2">
          <a data-wb-slot="contact-whatsapp" href="${ctx.whatsappLink}" target="_blank" rel="noopener noreferrer" class="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-2 transition-all shadow-md">
            <span>Iniciar Conversa no WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Rodapé Integrado -->
<footer class="py-12 bg-slate-950 text-slate-400 border-t border-slate-900 text-xs">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
    <div class="space-y-1 text-center sm:text-left">
      <p class="font-bold text-white text-sm">${name}</p>
      <p data-wb-slot="footer-text">${address} • Todos os direitos reservados © 2026</p>
    </div>
    <div class="flex items-center gap-6">
      <a href="#servicos" class="hover:text-white transition-colors">Serviços</a>
      <a href="#sobre" class="hover:text-white transition-colors">Sobre</a>
      <a href="#galeria" class="hover:text-white transition-colors">Galeria</a>
      <a href="${ctx.whatsappLink}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 font-bold hover:underline">WhatsApp</a>
    </div>
  </div>
</footer>`;
    }
  },

  // 2. Split Localização com Mapa / Rota + Card WhatsApp Direto
  {
    id: 'contact-split-map-card',
    name: 'Split Localização + Card WhatsApp Direto',
    category: 'contacts',
    style: 'corporativo-clean',
    description: 'Divisão em duas colunas com dados de localização e card escuro de alta conversão.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const address = escapeHtml(ctx.address || ctx.city);
      const hours = escapeHtml(ctx.hours || 'Segunda a Sábado das 08h às 19h');
      const cleanMapsQuery = encodeURIComponent(`${ctx.businessName} ${ctx.address || ctx.city}`);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${cleanMapsQuery}`;

      return `
<section id="contato" data-wb-section="contact" class="py-20 bg-slate-950 text-slate-100 border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-7 space-y-6">
        <span class="text-xs uppercase tracking-widest font-bold text-blue-400">Onde Estamos</span>
        <h2 data-wb-slot="contact-title" class="text-3xl sm:text-4xl font-extrabold text-white">Localização Privilegiada em ${escapeHtml(ctx.city)}</h2>
        <div class="space-y-4 text-slate-300 text-sm leading-relaxed">
          <p><strong class="text-white">Endereço:</strong> ${address}</p>
          <p><strong class="text-white">Horário de Funcionamento:</strong> ${hours}</p>
          <p><strong class="text-white">Telefone:</strong> ${escapeHtml(ctx.phone)}</p>
        </div>
        <div class="pt-2">
          <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-slate-800 hover:bg-slate-700 border border-slate-700">
            <span>Traçar Rota no Google Maps</span>
            <span>↗</span>
          </a>
        </div>
      </div>
      <div class="lg:col-span-5 p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center">
        <h3 class="text-2xl font-black text-white">Precisa de Atendimento Rápido?</h3>
        <p class="text-xs text-slate-300">Nossa equipe responde em minutos no WhatsApp para agendamentos e orçamentos.</p>
        <a data-wb-slot="contact-whatsapp" href="${ctx.whatsappLink}" target="_blank" rel="noopener noreferrer" class="w-full py-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2">
          <span>Chamar no WhatsApp</span>
        </a>
      </div>
    </div>
  </div>
</section>
<footer class="py-8 bg-slate-950 text-center text-xs text-slate-500 border-t border-slate-900">
  <p>${name} • ${address} • © 2026</p>
</footer>`;
    }
  },

  // 3. Banner Escuro de Conversão Imediata + Dados no Rodapé
  {
    id: 'contact-dark-cta-banner',
    name: 'Banner Escuro de Conversão + Informações',
    category: 'contacts',
    style: 'dark-editorial',
    description: 'Chamada imersiva de encerramento com tipografia serifada e rodapé escuro editorial.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const address = escapeHtml(ctx.address || ctx.city);

      return `
<section id="contato" data-wb-section="contact" class="py-24 bg-zinc-950 text-zinc-100 border-b border-zinc-900 text-center">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
    <span class="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500">Agende sua Visita</span>
    <h2 data-wb-slot="contact-title" class="text-3xl sm:text-5xl font-serif font-light text-zinc-100">
      Pronto para viver essa experiência?
    </h2>
    <p class="text-zinc-400 text-base max-w-xl mx-auto font-sans">
      Garanta seu horário com nossos especialistas e receba um atendimento verdadeiramente exclusivo.
    </p>
    <div class="pt-4">
      <a data-wb-slot="contact-whatsapp" href="${ctx.whatsappLink}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-3 px-9 py-4 bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-widest hover:bg-amber-300 transition-all shadow-xl">
        <span>Falar Diretamente no WhatsApp</span>
        <span>→</span>
      </a>
    </div>
  </div>
</section>
<footer class="py-12 bg-black text-zinc-500 text-xs border-t border-zinc-900">
  <div class="max-w-6xl mx-auto px-4 text-center space-y-2">
    <p class="font-serif text-sm text-zinc-300">${name}</p>
    <p>${address} • Atendimento de Excelência</p>
    <p class="text-[11px] text-zinc-600">Desenvolvido com tecnologia WebBILLY © 2026</p>
  </div>
</footer>`;
    }
  },

  // 4. Cartão de Visita Centralizado Elegante
  {
    id: 'contact-minimal-card',
    name: 'Cartão de Visita Centralizado Elegante',
    category: 'contacts',
    style: 'minimalista',
    description: 'Cartão de contato minimalista com todos os canais em alta clareza visual.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);

      return `
<section id="contato" data-wb-section="contact" class="py-24 bg-neutral-950 text-white border-b border-neutral-900">
  <div class="max-w-xl mx-auto px-4 sm:px-6">
    <div class="p-8 sm:p-12 border border-neutral-800 bg-neutral-900/80 space-y-8 text-center">
      <div class="space-y-2">
        <span class="text-xs font-mono uppercase tracking-widest text-neutral-400">// Contato</span>
        <h2 data-wb-slot="contact-title" class="text-2xl sm:text-3xl font-black text-white">${name}</h2>
      </div>
      <div class="space-y-3 text-sm text-neutral-300">
        <p><strong>Cidade:</strong> ${escapeHtml(ctx.city)}</p>
        ${ctx.address ? `<p><strong>Endereço:</strong> ${escapeHtml(ctx.address)}</p>` : ''}
        ${ctx.hours ? `<p><strong>Horários:</strong> ${escapeHtml(ctx.hours)}</p>` : ''}
        <p><strong>Telefone:</strong> ${escapeHtml(ctx.phone)}</p>
      </div>
      <div class="pt-4">
        <a data-wb-slot="contact-whatsapp" href="${ctx.whatsappLink}" target="_blank" rel="noopener noreferrer" class="inline-block w-full py-4 bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all">
          Iniciar WhatsApp
        </a>
      </div>
    </div>
  </div>
</section>
<footer class="py-6 bg-black text-center text-xs text-neutral-600 font-mono">
  ${name} • ${escapeHtml(ctx.city)} • 2026
</footer>`;
    }
  },

  // 5. Seção Multicanal Completa
  {
    id: 'contact-multi-channel',
    name: 'Seção Multicanal com Horários e Redes',
    category: 'contacts',
    style: 'moderno-vibrante',
    description: 'Canais integrados (WhatsApp, Telefone, Instagram e Localização física).',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const cleanMapsQuery = encodeURIComponent(`${ctx.businessName} ${ctx.address || ctx.city}`);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${cleanMapsQuery}`;

      return `
<section id="contato" data-wb-section="contact" class="py-20 bg-slate-950 text-slate-100 border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
    <div class="text-center max-w-2xl mx-auto space-y-2">
      <h2 data-wb-slot="contact-title" class="text-3xl font-extrabold text-white">Canais de Atendimento</h2>
      <p class="text-slate-400 text-sm">Escolha a melhor forma de se comunicar conosco.</p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
      <a href="${ctx.whatsappLink}" target="_blank" rel="noopener noreferrer" class="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-2">
        <span class="text-2xl">📱</span>
        <p class="font-bold text-white text-sm">WhatsApp</p>
        <p class="text-xs text-emerald-400">Mensagem Direta</p>
      </a>
      <a href="tel:${ctx.phone}" class="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all space-y-2">
        <span class="text-2xl">📞</span>
        <p class="font-bold text-white text-sm">Telefone</p>
        <p class="text-xs text-blue-400">${escapeHtml(ctx.phone)}</p>
      </a>
      <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all space-y-2">
        <span class="text-2xl">📍</span>
        <p class="font-bold text-white text-sm">Como Chegar</p>
        <p class="text-xs text-amber-400">Ver Rota Maps</p>
      </a>
      <div class="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <span class="text-2xl">⏰</span>
        <p class="font-bold text-white text-sm">Funcionamento</p>
        <p class="text-xs text-slate-300">${escapeHtml(ctx.hours || 'Seg a Sáb')}</p>
      </div>
    </div>
  </div>
</section>
<footer class="py-8 bg-slate-950 text-center text-xs text-slate-500 border-t border-slate-900">
  <p>${name} • ${escapeHtml(ctx.city)} • Todos os direitos reservados © 2026</p>
</footer>`;
    }
  }
];
