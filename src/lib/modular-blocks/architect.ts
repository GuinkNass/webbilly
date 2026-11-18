import { ModularBlockContext, ArchitectSelection } from './types';
import {
  MODULAR_BLOCK_REGISTRY,
  getBlockById,
  renderModularHeader,
  renderFloatingWhatsApp
} from './registry';
import { injectAnalyticsTracker } from '@/lib/analytics';

export function selectArchitectBlocks(ctx: ModularBlockContext): ArchitectSelection {
  const nicheLower = (ctx.niche || '').toLowerCase();
  const photoCount = (ctx.galleryPhotos || []).filter(p => typeof p === 'string' && p.startsWith('http')).length;

  let heroId = 'hero-split-photo';
  let aboutId = 'about-photo-stats';
  let servicesId = 'services-cards-price-cta';
  let galleryId = 'gallery-masonry-dynamic';
  let testimonialsId = 'testimonials-google-cards';
  let contactId = 'contact-complete-info-footer';
  let reason = '';

  // 1. Adaptação de Hero e Galeria pela quantidade de fotos
  if (photoCount <= 2) {
    heroId = 'hero-fullscreen-dark';
    galleryId = 'gallery-feature-thumbnails';
    reason += `Poucas fotos (${photoCount}): selecionado Hero Fullscreen e Galeria de Destaque Compacta. `;
  } else if (photoCount <= 6) {
    heroId = 'hero-split-photo';
    galleryId = 'gallery-bento-grid';
    reason += `Média de fotos (${photoCount}): selecionado Hero Split e Galeria Bento Grid. `;
  } else {
    heroId = 'hero-floating-gallery';
    galleryId = 'gallery-masonry-dynamic';
    reason += `Amplo acervo de fotos (${photoCount}): selecionado Hero com Galeria Flutuante e Masonry Dinâmico. `;
  }

  // 2. Adaptação por Nicho
  if (/gastronom|restaurante|pizz|burger|sushi|lanch|bar|cafe/i.test(nicheLower)) {
    servicesId = 'services-menu-table';
    aboutId = 'about-differentials-grid';
    reason += `Nicho gastronômico: aplicado Menu/Cardápio de Serviços e Grid de Ingredientes/Diferenciais.`;
  } else if (/barbe|salao|cabelo|estetic|spa|unha|lash|sobrancelha/i.test(nicheLower)) {
    servicesId = 'services-cards-price-cta';
    aboutId = 'about-photo-stats';
    reason += `Nicho beleza/estética: aplicados Cards com Preço/CTA e História Institucional.`;
  } else if (/tattoo|tatuag|piercing|ink|body\s*art/i.test(nicheLower)) {
    heroId = 'hero-asymmetric-editorial';
    aboutId = 'about-brand-manifesto';
    galleryId = 'gallery-masonry-dynamic';
    reason += `Nicho tatuagem/arte: aplicado Estilo Editorial Autoral e Galeria Masonry.`;
  } else if (/advog|jurid|direito|oab|contab|consultoria/i.test(nicheLower)) {
    heroId = 'hero-centered-rating';
    aboutId = 'about-split-checklist';
    servicesId = 'services-specialties-grid';
    contactId = 'contact-split-map-card';
    reason += `Nicho corporativo/jurídico: aplicado Hero 5.0 estrelas, Checklist de Ética e Grid de Áreas de Atuação.`;
  } else if (/odonto|dent|medic|clinica|saude|psico|fisio/i.test(nicheLower)) {
    heroId = 'hero-centered-rating';
    aboutId = 'about-split-checklist';
    servicesId = 'services-specialties-grid';
    testimonialsId = 'testimonials-google-cards';
    reason += `Nicho saúde/clínica: foco em credibilidade, biossegurança e avaliações do Google.`;
  } else if (/oficina|mecanic|auto|funilaria|eletrica|guincho/i.test(nicheLower)) {
    heroId = 'hero-direct-action';
    servicesId = 'services-cards-price-cta';
    contactId = 'contact-complete-info-footer';
    reason += `Nicho automotivo/urgência: foco em chamada rápida para socorro/orçamento imediato.`;
  }

  return { heroId, aboutId, servicesId, galleryId, testimonialsId, contactId, reason };
}

/**
 * Constrói o HTML completo do site sob medida via Modo Arquiteto
 */
export function buildArchitectModularSite(ctx: ModularBlockContext): { html: string; selection: ArchitectSelection } {
  const selection = selectArchitectBlocks(ctx);

  const heroBlock = getBlockById(selection.heroId) || MODULAR_BLOCK_REGISTRY.heroes[0];
  const aboutBlock = getBlockById(selection.aboutId) || MODULAR_BLOCK_REGISTRY.abouts[0];
  const servicesBlock = getBlockById(selection.servicesId) || MODULAR_BLOCK_REGISTRY.services[0];
  const galleryBlock = getBlockById(selection.galleryId) || MODULAR_BLOCK_REGISTRY.galleries[0];
  const testimonialsBlock = getBlockById(selection.testimonialsId) || MODULAR_BLOCK_REGISTRY.testimonials[0];
  const contactBlock = getBlockById(selection.contactId) || MODULAR_BLOCK_REGISTRY.contacts[0];

  const headerHtml = renderModularHeader(ctx);
  const heroHtml = heroBlock.render(ctx);
  const aboutHtml = aboutBlock.render(ctx);
  const servicesHtml = servicesBlock.render(ctx);
  const galleryHtml = galleryBlock.render(ctx);
  const testimonialsHtml = testimonialsBlock.render(ctx);
  const contactHtml = contactBlock.render(ctx);
  const floatingWhatsAppHtml = renderFloatingWhatsApp(ctx);

  const title = `${ctx.businessName} — ${ctx.tagline || ctx.niche}`;
  const description = ctx.description || `${ctx.businessName} em ${ctx.city}. Atendimento especializado em ${ctx.niche}. Agende seu horário pelo WhatsApp.`;

  let fullHtml = `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title.replace(/"/g, '&quot;')}</title>
  <meta name="description" content="${description.replace(/"/g, '&quot;')}" />
  <meta name="theme-color" content="#020617" />
  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
  <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
  <meta property="og:type" content="website" />
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            serif: ['Playfair Display', 'Georgia', 'serif'],
            mono: ['JetBrains Mono', 'monospace']
          }
        }
      }
    }
  </script>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />

  <style>
    /* Estilos globais e neutralização de barras de rolagem desnecessárias */
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: #020617;
      color: #f8fafc;
      overflow-x: hidden;
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    /* Blindagem contra imagens com erro */
    img {
      content-visibility: auto;
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
  ${headerHtml}
  <main>
    ${heroHtml}
    ${aboutHtml}
    ${servicesHtml}
    ${galleryHtml}
    ${testimonialsHtml}
    ${contactHtml}
  </main>
  ${floatingWhatsAppHtml}
</body>
</html>`;

  // Injeta o analisador nativo de cliques e acessos
  fullHtml = injectAnalyticsTracker(fullHtml);

  // Blindagem contra imagens quebradas
  fullHtml = fullHtml.replace(/<img(?![^>]*\bonerror=)([^>]*?)>/gi, '<img$1 onerror="this.style.display=\'none\'">');

  return { html: fullHtml, selection };
}
