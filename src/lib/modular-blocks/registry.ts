import { BlockCategory, BlockStyle, ModularBlockDefinition, ModularBlockContext } from './types';
import { HERO_BLOCKS } from './heroes';
import { ABOUT_BLOCKS } from './abouts';
import { SERVICE_BLOCKS } from './services';
import { GALLERY_BLOCKS } from './galleries';
import { TESTIMONIAL_BLOCKS } from './testimonials';
import { CONTACT_BLOCKS } from './contacts';

export const MODULAR_BLOCK_REGISTRY: Record<BlockCategory, ModularBlockDefinition[]> = {
  heroes: HERO_BLOCKS,
  abouts: ABOUT_BLOCKS,
  services: SERVICE_BLOCKS,
  galleries: GALLERY_BLOCKS,
  testimonials: TESTIMONIAL_BLOCKS,
  contacts: CONTACT_BLOCKS
};

export const ALL_MODULAR_BLOCKS: ModularBlockDefinition[] = [
  ...HERO_BLOCKS,
  ...ABOUT_BLOCKS,
  ...SERVICE_BLOCKS,
  ...GALLERY_BLOCKS,
  ...TESTIMONIAL_BLOCKS,
  ...CONTACT_BLOCKS
];

export function getBlockById(id: string): ModularBlockDefinition | undefined {
  return ALL_MODULAR_BLOCKS.find(b => b.id === id);
}

export function getBlocksByCategory(category: BlockCategory): ModularBlockDefinition[] {
  return MODULAR_BLOCK_REGISTRY[category] || [];
}

export function getBlocksByStyle(style: BlockStyle): ModularBlockDefinition[] {
  return ALL_MODULAR_BLOCKS.filter(b => b.style === style);
}

/**
 * Renderiza o Header / Topo de Navegação Fixo
 */
export function renderModularHeader(ctx: ModularBlockContext): string {
  const name = ctx.businessName
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return `
<header class="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
    <a href="#" class="flex items-center gap-2 group">
      <span class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 font-black flex items-center justify-center text-base shadow-sm">
        ${name.charAt(0)}
      </span>
      <span class="text-lg sm:text-xl font-extrabold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
        ${name}
      </span>
    </a>
    <nav class="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
      <a href="#sobre" class="hover:text-white transition-colors">Sobre Nós</a>
      <a href="#servicos" class="hover:text-white transition-colors">Serviços</a>
      <a href="#galeria" class="hover:text-white transition-colors">Galeria</a>
      <a href="#depoimentos" class="hover:text-white transition-colors">Avaliações</a>
      <a href="#contato" class="hover:text-white transition-colors">Contato</a>
    </nav>
    <div class="flex items-center gap-3">
      <a href="${ctx.whatsappLink}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all hover:scale-105">
        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-2.124-.516-1.531-.631-2.52-2.18-2.597-2.282-.075-.102-.622-.828-.622-1.58 0-.752.395-1.121.536-1.272.141-.15.309-.188.411-.188.103 0 .206.002.296.006.096.004.225-.036.35.265.13.313.444 1.084.483 1.163.039.078.065.17.013.273-.052.102-.078.167-.155.257-.078.09-.163.2-.233.27-.08.08-.163.167-.07.327.093.16.413.682.887 1.103.61.542 1.123.71 1.282.789.159.078.252.069.345-.039.094-.108.404-.47.512-.63.108-.16.216-.133.364-.078.149.055.944.445 1.106.526.162.081.27.121.31.189.04.068.04.394-.104.799z"/></svg>
        <span>Agendar Horário</span>
      </a>
    </div>
  </div>
</header>`;
}

/**
 * Renderiza o botão flutuante oficial do WhatsApp com pulso
 */
export function renderFloatingWhatsApp(ctx: ModularBlockContext): string {
  return `
<a href="${ctx.whatsappLink}" target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp" class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 group">
  <span class="absolute -inset-1 rounded-full bg-emerald-500 opacity-30 group-hover:opacity-60 animate-ping"></span>
  <svg class="w-8 h-8 fill-current relative z-10" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.074-2.124-.516-1.531-.631-2.52-2.18-2.597-2.282-.075-.102-.622-.828-.622-1.58 0-.752.395-1.121.536-1.272.141-.15.309-.188.411-.188.103 0 .206.002.296.006.096.004.225-.036.35.265.13.313.444 1.084.483 1.163.039.078.065.17.013.273-.052.102-.078.167-.155.257-.078.09-.163.2-.233.27-.08.08-.163.167-.07.327.093.16.413.682.887 1.103.61.542 1.123.71 1.282.789.159.078.252.069.345-.039.094-.108.404-.47.512-.63.108-.16.216-.133.364-.078.149.055.944.445 1.106.526.162.081.27.121.31.189.04.068.04.394-.104.799z"/></svg>
</a>`;
}
