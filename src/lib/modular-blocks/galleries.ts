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

export const GALLERY_BLOCKS: ModularBlockDefinition[] = [
  // 1. Grid Masonry Responsivo (3 a 24 fotos sem espaços vazios)
  {
    id: 'gallery-masonry-dynamic',
    name: 'Grid Masonry Responsivo Dinâmico',
    category: 'galleries',
    style: 'moderno-vibrante',
    description: 'Adaptação inteligente de 3 a 24 fotos em colunas com alturas variadas e sem lacunas vazias.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const rawPhotos = (ctx.galleryPhotos && ctx.galleryPhotos.length > 0)
        ? ctx.galleryPhotos.filter(p => typeof p === 'string' && p.startsWith('http'))
        : [ctx.heroPhoto];

      // Se tiver poucas fotos, repete ou ajusta para não ficar vazio
      const photos = rawPhotos.length >= 3 ? rawPhotos : [
        rawPhotos[0] || ctx.heroPhoto,
        rawPhotos[1] || rawPhotos[0] || ctx.heroPhoto,
        rawPhotos[2] || rawPhotos[0] || ctx.heroPhoto
      ];

      const itemsHtml = photos.map((url, idx) => {
        // Altura alternada sutil para efeito masonry
        const hClass = (idx % 3 === 0) ? 'aspect-[3/4]' : (idx % 2 === 0 ? 'aspect-square' : 'aspect-[4/3]');
        return `
          <div data-wb-slot="gallery-item" class="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-md ${hClass}">
            <img src="${url}" alt="${name} Foto ${idx + 1}" class="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-500" loading="lazy" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <span class="text-xs font-semibold text-white tracking-wide">${name}</span>
            </div>
          </div>
        `;
      }).join('');

      return `
<section id="galeria" data-wb-section="gallery" class="py-20 sm:py-28 bg-slate-950 text-slate-100 border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
    <div class="text-center max-w-3xl mx-auto space-y-3">
      <span class="text-xs uppercase tracking-widest font-bold text-emerald-400">Ambiente & Resultados</span>
      <h2 data-wb-slot="gallery-title" class="text-3xl sm:text-5xl font-extrabold text-white">Galeria de Fotos</h2>
      <p data-wb-slot="gallery-subtitle" class="text-slate-300 text-sm sm:text-base">Confira os detalhes da nossa estrutura e o resultado do nosso trabalho.</p>
    </div>
    <div data-wb-slot="gallery-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      ${itemsHtml}
    </div>
  </div>
</section>`;
    }
  },

  // 2. Carrossel / Strip Horizontal Contínuo
  {
    id: 'gallery-horizontal-strip',
    name: 'Carrossel / Strip Horizontal Contínuo',
    category: 'galleries',
    style: 'dark-editorial',
    description: 'Faixa contínua com scroll horizontal responsivo e visual cinematográfico.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const photos = (ctx.galleryPhotos && ctx.galleryPhotos.length > 0)
        ? ctx.galleryPhotos
        : [ctx.heroPhoto, ctx.heroPhoto, ctx.heroPhoto, ctx.heroPhoto];

      const cardsHtml = photos.map((p, idx) => `
        <div class="shrink-0 w-72 sm:w-80 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 aspect-[3/4] shadow-xl">
          <img src="${p}" alt="${name} Foto ${idx + 1}" class="w-full h-full object-cover" loading="lazy" />
        </div>
      `).join('');

      return `
<section id="galeria" data-wb-section="gallery" class="py-20 bg-zinc-950 text-zinc-100 border-b border-zinc-900 overflow-hidden">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex justify-between items-end">
    <div>
      <span class="text-xs uppercase tracking-[0.2em] font-semibold text-zinc-500">Portfólio</span>
      <h2 data-wb-slot="gallery-title" class="text-3xl font-serif text-white">Trabalhos Realizados</h2>
    </div>
    <span class="text-xs text-zinc-400 hidden sm:block">Deslize para ver mais →</span>
  </div>
  <div class="flex gap-4 overflow-x-auto pb-6 px-4 sm:px-6 lg:px-8 no-scrollbar scroll-smooth">
    ${cardsHtml}
  </div>
</section>`;
    }
  },

  // 3. Foto Principal em Destaque + Grid de Miniaturas
  {
    id: 'gallery-feature-thumbnails',
    name: 'Foto Principal em Destaque + Miniaturas',
    category: 'galleries',
    style: 'corporativo-clean',
    description: 'Ideal para 2 a 5 fotos: uma grande foto à esquerda e miniaturas organizadas à direita.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const photos = (ctx.galleryPhotos && ctx.galleryPhotos.length > 0)
        ? ctx.galleryPhotos
        : [ctx.heroPhoto, ctx.heroPhoto, ctx.heroPhoto];

      const mainPhoto = photos[0] || ctx.heroPhoto;
      const thumbs = photos.slice(1, 5);

      const thumbsHtml = thumbs.map((p, idx) => `
        <div class="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 aspect-square">
          <img src="${p}" alt="${name} Miniatura ${idx + 1}" class="w-full h-full object-cover" loading="lazy" />
        </div>
      `).join('');

      return `
<section id="galeria" data-wb-section="gallery" class="py-20 bg-slate-900 text-slate-100 border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
    <div class="space-y-2">
      <h2 data-wb-slot="gallery-title" class="text-3xl font-extrabold text-white">Conheça Nosso Espaço</h2>
      <p class="text-slate-400 text-sm">Estrutura de ponta projetada para seu conforto e bem-estar.</p>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      <div class="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 aspect-[4/3] lg:aspect-auto">
        <img src="${mainPhoto}" alt="${name} Destaque" class="w-full h-full object-cover" loading="lazy" />
      </div>
      <div class="lg:col-span-5 grid grid-cols-2 gap-4">
        ${thumbsHtml.length > 0 ? thumbsHtml : `
          <div class="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square"><img src="${mainPhoto}" class="w-full h-full object-cover" /></div>
          <div class="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square"><img src="${mainPhoto}" class="w-full h-full object-cover" /></div>
        `}
      </div>
    </div>
  </div>
</section>`;
    }
  },

  // 4. Bento Grid Moderno (layout assimétrico de fotos)
  {
    id: 'gallery-bento-grid',
    name: 'Bento Grid Moderno Assimétrico',
    category: 'galleries',
    style: 'moderno-vibrante',
    description: 'Layout moderno estilo Bento Grid com 4 a 6 fotos de tamanhos variados e harmônicos.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const photos = (ctx.galleryPhotos && ctx.galleryPhotos.length > 0)
        ? ctx.galleryPhotos
        : [ctx.heroPhoto, ctx.heroPhoto, ctx.heroPhoto, ctx.heroPhoto];

      const p1 = photos[0] || ctx.heroPhoto;
      const p2 = photos[1] || p1;
      const p3 = photos[2] || p1;
      const p4 = photos[3] || p1;

      return `
<section id="galeria" data-wb-section="gallery" class="py-20 bg-slate-950 text-slate-100 border-b border-slate-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
    <div class="text-center max-w-2xl mx-auto space-y-3">
      <h2 data-wb-slot="gallery-title" class="text-3xl sm:text-4xl font-extrabold text-white">Nossos Registros</h2>
      <p class="text-slate-400 text-sm">Cada momento registrado com perfeição e carinho.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2 rounded-2xl overflow-hidden border border-slate-800 aspect-video bg-slate-900">
        <img src="${p1}" alt="${name}" class="w-full h-full object-cover hover:scale-105 transition-all duration-700" loading="lazy" />
      </div>
      <div class="rounded-2xl overflow-hidden border border-slate-800 aspect-square md:aspect-auto bg-slate-900">
        <img src="${p2}" alt="${name}" class="w-full h-full object-cover hover:scale-105 transition-all duration-700" loading="lazy" />
      </div>
      <div class="rounded-2xl overflow-hidden border border-slate-800 aspect-square bg-slate-900">
        <img src="${p3}" alt="${name}" class="w-full h-full object-cover hover:scale-105 transition-all duration-700" loading="lazy" />
      </div>
      <div class="md:col-span-2 rounded-2xl overflow-hidden border border-slate-800 aspect-video bg-slate-900">
        <img src="${p4}" alt="${name}" class="w-full h-full object-cover hover:scale-105 transition-all duration-700" loading="lazy" />
      </div>
    </div>
  </div>
</section>`;
    }
  },

  // 5. Grid Estilo Instagram Clean 3x3 / 4x4
  {
    id: 'gallery-instagram-grid',
    name: 'Grid Estilo Instagram Clean',
    category: 'galleries',
    style: 'minimalista',
    description: 'Quadrados simétricos estilo feed do Instagram com hover suave e link para redes.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const photos = (ctx.galleryPhotos && ctx.galleryPhotos.length > 0)
        ? ctx.galleryPhotos.slice(0, 6)
        : [ctx.heroPhoto, ctx.heroPhoto, ctx.heroPhoto, ctx.heroPhoto, ctx.heroPhoto, ctx.heroPhoto];

      const html = photos.map((p, idx) => `
        <div class="aspect-square rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 group relative">
          <img src="${p}" alt="${name} Post ${idx + 1}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
            Ver Foto
          </div>
        </div>
      `).join('');

      return `
<section id="galeria" data-wb-section="gallery" class="py-20 bg-neutral-950 text-neutral-100 border-b border-neutral-900">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
    <div class="flex items-center justify-between">
      <h2 data-wb-slot="gallery-title" class="text-2xl font-bold text-white">// Feed Visual</h2>
      ${ctx.instagram ? `<span class="text-xs font-mono text-neutral-400">${escapeHtml(ctx.instagram)}</span>` : ''}
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      ${html}
    </div>
  </div>
</section>`;
    }
  },

  // 6. Vitrine Alternada com Hover Zoom
  {
    id: 'gallery-alternating-showcase',
    name: 'Vitrine Alternada com Hover Zoom',
    category: 'galleries',
    style: 'classico-sofisticado',
    description: 'Vitrine artística em tela cheia com legendas delicadas e transições suaves.',
    render: (ctx: ModularBlockContext) => {
      const name = escapeHtml(ctx.businessName);
      const photos = (ctx.galleryPhotos && ctx.galleryPhotos.length > 0)
        ? ctx.galleryPhotos.slice(0, 4)
        : [ctx.heroPhoto, ctx.heroPhoto, ctx.heroPhoto, ctx.heroPhoto];

      const items = photos.map((p, idx) => `
        <div class="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 aspect-[4/5] relative group">
          <img src="${p}" alt="${name}" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" loading="lazy" />
          <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80"></div>
          <div class="absolute bottom-4 left-4 right-4">
            <p class="text-xs font-serif text-amber-300">Coleção 2026</p>
            <p class="text-sm font-bold text-white">${name} #${idx + 1}</p>
          </div>
        </div>
      `).join('');

      return `
<section id="galeria" data-wb-section="gallery" class="py-20 bg-zinc-950 text-zinc-100 border-b border-zinc-900">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
    <div class="text-center space-y-2">
      <span class="text-xs font-mono uppercase tracking-[0.25em] text-zinc-500">Exposição</span>
      <h2 data-wb-slot="gallery-title" class="text-3xl sm:text-4xl font-serif text-white">Nossas Obras & Detalhes</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      ${items}
    </div>
  </div>
</section>`;
    }
  }
];
