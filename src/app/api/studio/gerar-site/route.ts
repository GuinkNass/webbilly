import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { readDb, writeDb } from '@/lib/db';
import { sanitizeSlug } from '@/lib/site-storage';
import { getSupabaseAdmin, upsertSubscriptionInSupabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Curadoria de fotos HD por nicho para garantir imagens perfeitas sem depender de APIs externas
const NICHE_PHOTOS: Record<string, string[]> = {
  barbearia: [
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80',
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80'
  ],
  restaurante: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80'
  ],
  sushi: [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80',
    'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&q=80',
    'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80'
  ],
  pizzaria: [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80'
  ],
  hamburgueria: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&q=80',
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&q=80'
  ],
  odontologia: [
    'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&q=80',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80',
    'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&q=80'
  ],
  estetica: [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80',
    'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    'https://images.unsplash.com/photo-1512290900672-1f416a241f87?w=800&q=80'
  ],
  petshop: [
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80',
    'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800&q=80',
    'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&q=80'
  ],
  oficina: [
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&q=80',
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&q=80',
    'https://images.unsplash.com/photo-1613214149922-f1809c99b414?w=800&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'
  ],
  academia: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80'
  ],
  advocacia: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&q=80',
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&q=80'
  ],
  tattoo: [
    'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=1200&q=80',
    'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=800&q=80',
    'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&q=80',
    'https://images.unsplash.com/photo-1590246814883-578336f6ee61?w=800&q=80'
  ]
};

function resolveNichePhotos(niche: string): string[] {
  const clean = (niche || '').toLowerCase();
  for (const [key, list] of Object.entries(NICHE_PHOTOS)) {
    if (clean.includes(key)) return list;
  }
  return NICHE_PHOTOS.barbearia;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessName,
      niche = 'Barbearia',
      city = 'São Paulo - SP',
      phone,
      whatsapp,
      subdomain,
      tagline,
      description,
      theme = 'dark-neon',
      templateId = 'barbearia-crop-vintage',
      accentColor = '#84cc16',
      logoUrl = '',
      heroPhoto: customHeroPhoto = '',
      galleryPhotos: customGalleryPhotos = [],
      services = [],
      features = [],
      faqs = [],
      testimonials = [],
      hours = 'Segunda a Sábado das 08h às 19h',
      address = '',
      instagram = '',
      blocks = {},
      operatorId = 'OP-BILLY-01',
      operatorName = 'Operador Oficial'
    } = body;

    if (!businessName || !subdomain) {
      return NextResponse.json(
        { success: false, error: 'Nome da empresa e subdomínio são obrigatórios.' },
        { status: 400 }
      );
    }

    const cleanSlug = sanitizeSlug(subdomain);
    if (!cleanSlug) {
      return NextResponse.json(
        { success: false, error: 'Subdomínio inválido. Use apenas letras e números.' },
        { status: 400 }
      );
    }

    const rawPhone = (whatsapp || phone || '11999999999').replace(/\D/g, '');
    const cleanPhone = rawPhone.length <= 11 && !rawPhone.startsWith('55') ? `55${rawPhone}` : rawPhone;
    const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
      `Olá! Vim pelo site ${cleanSlug}.webbilly.com.br e gostaria de agendar um horário.`
    )}`;

    // Resolve fotos: prioriza as fotos que o operador selecionou no Pixabay / URLs manuais
    const fallbackNicheList = resolveNichePhotos(niche);
    const heroPhoto = customHeroPhoto || fallbackNicheList[0];
    const galleryPhotos =
      Array.isArray(customGalleryPhotos) && customGalleryPhotos.length > 0
        ? customGalleryPhotos
        : fallbackNicheList.slice(1, 4);

    const slogan = tagline || `Excelência em ${niche} em ${city} com atendimento exclusivo.`;
    const aboutText = description || `Na ${businessName}, transformamos sua experiência com serviços de primeira linha e profissionais dedicados.`;

    // Paletas de cores suportadas
    const PALETTES: Record<string, { primary: string; bg: string; card: string; text: string; border: string }> = {
      'dark-neon': { primary: '#84cc16', bg: '#07090e', card: '#0f121a', text: '#ffffff', border: 'rgba(132, 204, 22, 0.4)' },
      'corporate-blue': { primary: '#2563eb', bg: '#090d16', card: '#0f172a', text: '#ffffff', border: 'rgba(59, 130, 246, 0.4)' },
      'premium-gold': { primary: '#f59e0b', bg: '#0d0b07', card: '#18140c', text: '#ffffff', border: 'rgba(245, 158, 11, 0.4)' },
      'hot-orange': { primary: '#ea580c', bg: '#0f0a07', card: '#1c100b', text: '#ffffff', border: 'rgba(234, 88, 12, 0.4)' },
      'purple-modern': { primary: '#7c3aed', bg: '#0c0714', card: '#170c24', text: '#ffffff', border: 'rgba(124, 58, 237, 0.4)' },
      'clean-dark': { primary: '#10b981', bg: '#0a0d14', card: '#111827', text: '#ffffff', border: 'rgba(16, 185, 129, 0.4)' }
    };

    const chosenTheme = PALETTES[theme] || PALETTES['dark-neon'];
    const activeAccent = accentColor || chosenTheme.primary;

    // Constrói HTML profissional em Tailwind CSS
    let generatedHtml = `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} | ${niche} em ${city}</title>
  <meta name="description" content="${slogan}">
  <link rel="icon" href="${logoUrl || '/favicon.ico'}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: ${chosenTheme.bg}; color: ${chosenTheme.text}; }
    .font-serif { font-family: 'Playfair Display', Georgia, serif; }
    .accent-bg { background-color: ${activeAccent}; }
    .accent-text { color: ${activeAccent}; }
    .accent-border { border-color: ${activeAccent}; }
  </style>
</head>
<body class="antialiased selection:bg-[${activeAccent}] selection:text-black">

  <!-- Header Superior -->
  <header class="fixed top-0 left-0 right-0 z-50 bg-[${chosenTheme.bg}]/90 backdrop-blur-md border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <a href="#inicio" class="flex items-center gap-3">
        ${
          logoUrl
            ? `<img src="${logoUrl}" alt="${businessName}" class="w-10 h-10 object-contain rounded-xl">`
            : `<div class="w-10 h-10 rounded-xl accent-bg text-black font-extrabold flex items-center justify-center text-lg shadow-lg">
                ${businessName.charAt(0)}
              </div>`
        }
        <div>
          <span class="font-extrabold text-base tracking-tight text-white block leading-tight">${businessName}</span>
          <span class="text-[10px] font-mono tracking-widest uppercase font-semibold accent-text block">${niche}</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-zinc-300">
        <a href="#inicio" class="hover:accent-text transition">Início</a>
        <a href="#servicos" class="hover:accent-text transition">Serviços</a>
        <a href="#galeria" class="hover:accent-text transition">Galeria</a>
        <a href="#sobre" class="hover:accent-text transition">Sobre</a>
        <a href="#contato" class="hover:accent-text transition">Contato</a>
      </nav>

      <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black accent-bg hover:brightness-110 transition shadow-lg flex items-center gap-2">
        <i class="fa-brands fa-whatsapp text-sm"></i>
        <span>Agendar Agora</span>
      </a>
    </div>
  </header>

  <!-- Hero Section Impactante -->
  <section id="inicio" class="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden flex items-center min-h-[90vh]">
    <div class="absolute inset-0 z-0">
      <img src="${heroPhoto}" alt="${businessName}" class="w-full h-full object-cover brightness-[0.35]">
      <div class="absolute inset-0 bg-gradient-to-t from-[${chosenTheme.bg}] via-[${chosenTheme.bg}]/70 to-transparent"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-8 space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold tracking-wide uppercase backdrop-blur-md">
          <span class="w-2 h-2 rounded-full accent-bg animate-pulse"></span>
          <span>Atendimento Oficial em ${city}</span>
        </div>

        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          ${businessName}
        </h1>

        <p class="text-lg sm:text-xl text-zinc-200 font-medium max-w-2xl leading-relaxed">
          ${slogan}
        </p>

        <div class="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-black accent-bg hover:brightness-110 transition shadow-xl flex items-center justify-center gap-3">
            <i class="fa-brands fa-whatsapp text-lg"></i>
            <span>Falar Conosco no WhatsApp</span>
          </a>
          <a href="#servicos" class="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm text-white bg-white/10 hover:bg-white/15 border border-white/20 transition flex items-center justify-center gap-2 backdrop-blur-md">
            <span>Ver Cardápio & Serviços</span>
            <i class="fa-solid fa-arrow-down text-xs"></i>
          </a>
        </div>

        <div class="grid grid-cols-3 gap-6 pt-8 border-t border-white/15 max-w-lg">
          <div>
            <span class="text-2xl sm:text-3xl font-extrabold text-white block">100%</span>
            <span class="text-xs text-zinc-300 font-medium">Dedicação</span>
          </div>
          <div>
            <span class="text-2xl sm:text-3xl font-extrabold accent-text block">5.0 ★</span>
            <span class="text-xs text-zinc-300 font-medium">Avaliações</span>
          </div>
          <div>
            <span class="text-2xl sm:text-3xl font-extrabold text-white block">Rápido</span>
            <span class="text-xs text-zinc-300 font-medium">Retorno WhatsApp</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Seção de Serviços / Cardápio com Preços -->
  <section id="servicos" class="py-24 bg-[${chosenTheme.card}] border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <span class="text-xs font-mono font-bold tracking-widest accent-text uppercase">O Que Oferecemos</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Nossos Principais Serviços & Especialidades
        </h2>
        <p class="text-sm text-zinc-400">
          Soluções completas com atendimento personalizado e qualidade garantida.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        ${services.map((s: any, idx: number) => `
        <div class="p-8 rounded-3xl bg-[${chosenTheme.bg}] border border-white/[0.08] hover:border-[${activeAccent}]/50 transition group flex flex-col justify-between space-y-6">
          <div class="space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-white/[0.05] accent-text flex items-center justify-center text-lg font-bold">
              0${idx + 1}
            </div>
            <h3 class="text-xl font-bold text-white group-hover:accent-text transition">${s.name || s.title || s.nome}</h3>
            <p class="text-xs text-zinc-400 leading-relaxed">${s.description || s.desc || s.descricao || 'Atendimento de alto nível com garantia de satisfação.'}</p>
          </div>
          <div class="pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span class="text-sm font-bold accent-text font-mono">${s.price || s.preco || 'Sob Consulta'}</span>
            <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5">
              <span>Agendar</span>
              <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </a>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Galeria de Fotos Profissionais -->
  <section id="galeria" class="py-24 bg-[${chosenTheme.bg}]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <span class="text-xs font-mono font-bold tracking-widest accent-text uppercase">Estrutura & Resultados</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Galeria de Fotos
        </h2>
        <p class="text-sm text-zinc-400">
          Conheça nosso espaço e alguns dos trabalhos e atendimentos realizados.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${galleryPhotos.map((photoUrl: string) => `
        <div class="rounded-3xl overflow-hidden shadow-xl aspect-video lg:aspect-square group relative">
          <img src="${photoUrl}" alt="${businessName}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Sobre Nós & Diferenciais -->
  <section id="sobre" class="py-24 bg-[${chosenTheme.card}] border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-6 space-y-6">
        <span class="text-xs font-mono font-bold tracking-widest accent-text uppercase">Quem Somos</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
          Tradição, paixão e foco total no cliente em ${city}
        </h2>
        <p class="text-sm text-zinc-400 leading-relaxed">
          ${aboutText}
        </p>
        <ul class="space-y-3 pt-2">
          ${features.map((f: string) => `
          <li class="flex items-center gap-3 text-xs text-zinc-300 font-semibold">
            <span class="w-5 h-5 rounded-full accent-bg text-black flex items-center justify-center text-[10px] shrink-0">
              <i class="fa-solid fa-check"></i>
            </span>
            <span>${f}</span>
          </li>
          `).join('')}
        </ul>
      </div>
      <div class="lg:col-span-6">
        <div class="rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl relative">
          <img src="${heroPhoto}" alt="${businessName}" class="w-full h-[400px] object-cover">
          <div class="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-[${chosenTheme.bg}]/90 backdrop-blur-md border border-white/[0.1] flex items-center justify-between">
            <div>
              <span class="text-xs text-zinc-400 block font-medium">Horário de Atendimento:</span>
              <span class="text-sm font-bold text-white">${hours}</span>
            </div>
            <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl accent-bg text-black text-xs font-bold">
              Agendar
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ / Dúvidas Frequentes -->
  ${
    faqs.length > 0
      ? `
  <section class="py-24 bg-[${chosenTheme.bg}] border-t border-white/[0.06]">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16 space-y-3">
        <span class="text-xs font-mono font-bold tracking-widest accent-text uppercase">Tire suas Dúvidas</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-white">Perguntas Frequentes</h2>
      </div>
      <div class="space-y-4">
        ${faqs.map((faq: any) => `
        <div class="p-6 rounded-2xl bg-[${chosenTheme.card}] border border-white/[0.06] space-y-2">
          <h4 class="font-bold text-white text-base">${faq.question}</h4>
          <p class="text-xs text-zinc-400 leading-relaxed">${faq.answer}</p>
        </div>
        `).join('')}
      </div>
    </div>
  </section>`
      : ''
  }

  <!-- Footer / Rodapé -->
  <footer id="contato" class="py-16 bg-black border-t border-white/[0.08] text-xs text-zinc-400">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
      <div>
        <span class="text-lg font-black text-white block">${businessName}</span>
        <span class="text-zinc-500">${niche} • ${city}</span>
        ${address ? `<p class="text-zinc-400 mt-1">${address}</p>` : ''}
      </div>
      <div class="flex items-center gap-4">
        <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-white/5 hover:accent-bg hover:text-black flex items-center justify-center transition">
          <i class="fa-brands fa-whatsapp text-base"></i>
        </a>
        ${
          instagram
            ? `<a href="https://instagram.com/${instagram.replace('@', '')}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-white/5 hover:accent-bg hover:text-black flex items-center justify-center transition">
                <i class="fa-brands fa-instagram text-base"></i>
              </a>`
            : ''
        }
      </div>
      <div class="text-[11px] text-zinc-600">
        Desenvolvido pela plataforma <a href="https://webbilly.com.br" class="text-zinc-400 hover:accent-text">Webbilly</a>
      </div>
    </div>
  </footer>

  <!-- Botão Flutuante do WhatsApp -->
  <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-[0_0_25px_rgba(37,211,102,0.6)] hover:scale-110 transition duration-300">
    <i class="fa-brands fa-whatsapp text-3xl"></i>
  </a>

</body>
</html>`;

    // 1. Grava no disco
    try {
      const siteDir = path.join(process.cwd(), 'public', 'generated-sites', cleanSlug);
      if (!fs.existsSync(siteDir)) {
        fs.mkdirSync(siteDir, { recursive: true });
      }
      fs.writeFileSync(path.join(siteDir, 'index.html'), generatedHtml, 'utf-8');
    } catch (fsErr) {
      console.warn('[Studio Gerar Site] Falha ao gravar arquivo em disco:', fsErr);
    }

    // 2. Salva no banco local db.json
    const leadToken = `lead_${cleanSlug}_${Date.now().toString(36)}`;
    const db = readDb();
    if (!db.generatedSites) db.generatedSites = {};
    db.generatedSites[cleanSlug] = generatedHtml;

    if (!db.demos) db.demos = {};
    db.demos[leadToken] = {
      leadToken,
      title: businessName,
      category: niche,
      deployedUrl: `/api/public/site/${cleanSlug}/render`,
      phone: rawPhone,
      instagram,
      updatedAt: new Date().toISOString()
    };

    if (!Array.isArray(db.subscriptions)) {
      db.subscriptions = [];
    }

    const existingSubIdx = db.subscriptions.findIndex((s) => s.siteSlug === cleanSlug);
    const subRecord = {
      id: `sub_${cleanSlug}`,
      siteSlug: cleanSlug,
      clientName: businessName,
      clientPhone: rawPhone,
      clientEmail: `${cleanSlug}@webbilly.com.br`,
      operatorToken: operatorId,
      operatorName: operatorName,
      monthlyPrice: 29.9,
      status: 'active' as const,
      deployedUrl: `/api/public/site/${cleanSlug}/render`,
      checkoutUrl: `/proposta/${leadToken}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      leadToken
    };

    if (existingSubIdx >= 0) {
      db.subscriptions[existingSubIdx] = { ...db.subscriptions[existingSubIdx], ...subRecord };
    } else {
      db.subscriptions.unshift(subRecord);
    }

    writeDb(db);

    // 3. Sincroniza com Supabase se disponível
    try {
      await upsertSubscriptionInSupabase(subRecord);
      const supabase = getSupabaseAdmin();
      if (supabase) {
        await supabase.from('sites').upsert({
          id: cleanSlug,
          subdomain: cleanSlug,
          business_name: businessName,
          niche,
          city,
          phone: rawPhone,
          whatsapp: cleanPhone,
          deployed_url: `/api/public/site/${cleanSlug}/render`,
          lead_token: leadToken,
          status: 'active',
          operator_id: operatorId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (supaErr) {
      console.warn('[Studio Gerar Site] Erro ao sincronizar com Supabase:', supaErr);
    }

    // 4. Monta a Mensagem Persuasiva do WhatsApp com isolamento de link (\n\n)
    const siteUrl = `https://${cleanSlug}.webbilly.com.br`;
    const proposalUrl = `https://webbilly.com.br/proposta/${leadToken}`;

    const whatsappMessage = `Olá, tudo bem? Sou da equipe da Webbilly e temos uma novidade exclusiva para a *${businessName}*!

Tomamos a iniciativa de criar uma demonstração profissional do site oficial de vocês, adaptado para celulares e pronto para receber clientes do Google:

${siteUrl}

Hoje a maioria das pessoas pesquisa antes no Google ao procurar por ${niche} em ${city}. Ter esse endereço no ar passa muito mais autoridade imediata e ajuda a fechar agendamentos pelo WhatsApp.

Como a página já está montada, preparamos uma condição especial de lançamento por apenas R$ 29,90/mês, sem taxa de criação e sem fidelidade:

${proposalUrl}

O que achou do visual que preparamos para vocês? Se quiser tirar qualquer dúvida ou ativar hoje mesmo, é só me responder por aqui!`;

    return NextResponse.json({
      success: true,
      slug: cleanSlug,
      subdomainUrl: siteUrl,
      previewUrl: `/api/public/site/${cleanSlug}/render`,
      proposalUrl,
      leadToken,
      whatsappMessage
    });
  } catch (error: any) {
    console.error('[Studio Gerar Site] Erro inesperado:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Falha ao gerar e publicar site.' },
      { status: 500 }
    );
  }
}
