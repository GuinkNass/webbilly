/**
 * Motor de Renderização Server-Side de Templates React (Webbilly)
 * Utiliza renderToStaticMarkup do react-dom/server com componentes tipados e Tailwind CSS.
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server.edge';
import { BusinessSiteData, TemplateBlueprint } from '@/types/site-template-data';
import { getTemplateBySlug, SiteTemplateEntry } from '@/components/site-templates/registry';
import { injectAnalyticsTracker } from '@/lib/analytics';

export interface RenderReactSiteOptions {
  data: BusinessSiteData;
  templateSlug: string;
}

function escapeHtml(text?: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderReactSite({ data, templateSlug }: RenderReactSiteOptions): string {
  const templateEntry: SiteTemplateEntry = getTemplateBySlug(templateSlug);
  const { blueprint, component: Component } = templateEntry;

  // 1. Renderização Server-Side Estática ultrarrápida do Componente React
  const componentMarkup = renderToStaticMarkup(React.createElement(Component, { data }));

  const headingFont = blueprint?.typography?.headingFont || 'Montserrat';
  const bodyFont = blueprint?.typography?.bodyFont || 'Inter';
  const primaryColor = data.palette?.primary || blueprint?.defaultPalette?.primary || '#3b82f6';
  const secondaryColor = data.palette?.secondary || blueprint?.defaultPalette?.secondary || '#10b981';
  const bgColor = data.palette?.background || blueprint?.defaultPalette?.background || '#09090b';
  const surfaceColor = data.palette?.surface || blueprint?.defaultPalette?.surface || '#18181b';
  const textColor = data.palette?.text || blueprint?.defaultPalette?.text || '#f4f4f5';

  const cleanTitle = escapeHtml(data.seo?.title || `${data.brandName} | ${data.niche}`);
  const cleanDescription = escapeHtml(data.seo?.description || data.hero?.subtitle || `${data.brandName} - ${data.niche}`);
  const heroImage = data.hero?.backgroundImage || blueprint?.thumbnail || '';

  // 2. Montagem do Documento HTML5 Completo com Tailwind CSS CDN e Google Fonts
  let fullHtml = `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
  <title>${cleanTitle}</title>
  <meta name="description" content="${cleanDescription}" />

  <!-- Open Graph / Redes Sociais -->
  <meta property="og:title" content="${cleanTitle}" />
  <meta property="og:description" content="${cleanDescription}" />
  <meta property="og:image" content="${heroImage}" />
  <meta property="og:type" content="website" />

  <!-- Google Fonts Oficiais -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:ital,wght@0,400;0,600;0,700;0,800;0,900;1,800;1,900&family=Oswald:wght@500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

  <!-- Font Awesome 6 Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />

  <!-- Tailwind CSS CDN Oficial com Configuração Personalizada -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brandPrimary: '${primaryColor}',
            brandSecondary: '${secondaryColor}',
            brandBg: '${bgColor}',
            brandSurface: '${surfaceColor}',
            brandText: '${textColor}',
          },
          fontFamily: {
            heading: ['"${headingFont}"', 'sans-serif'],
            body: ['"${bodyFont}"', 'sans-serif'],
          }
        }
      }
    };
  </script>
  <style>
    body {
      font-family: '${bodyFont}', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: ${bgColor};
      color: ${textColor};
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: '${headingFont}', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
  </style>
</head>
<body class="antialiased min-h-screen">
  ${componentMarkup}
</body>
</html>`;

  // 3. Injeta o micro-script de analytics (POST /api/analytics/hit) antes de </body>
  try {
    fullHtml = injectAnalyticsTracker(fullHtml);
  } catch (err) {
    console.warn('[renderReactSite] Aviso ao injetar analytics tracker:', err);
  }

  return fullHtml.trim();
}
