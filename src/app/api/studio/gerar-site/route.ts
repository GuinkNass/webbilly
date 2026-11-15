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
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=80',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
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
  odontologia: [
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80',
    'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80',
    'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80',
    'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&q=80'
  ],
  clinica: [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80',
    'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&q=80'
  ],
  estetica: [
    'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1200&q=80',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    'https://images.unsplash.com/photo-1512290900672-1f416a241f87?w=800&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80'
  ],
  petshop: [
    'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1200&q=80',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80',
    'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=800&q=80',
    'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&q=80'
  ],
  oficina: [
    'https://images.unsplash.com/photo-1613214149922-f1809c99b414?w=1200&q=80',
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&q=80',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'
  ],
  academia: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80'
  ],
  advocacia: [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80',
    'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&q=80',
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'
  ],
  imobiliaria: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'
  ],
  padaria: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&q=80'
  ]
};

async function getPixabayPhotos(keyword: string): Promise<string[]> {
  const pixKey = process.env.PIXABAY_API_KEY;
  if (!pixKey) return [];
  try {
    const q = encodeURIComponent(keyword.trim().slice(0, 50));
    const res = await fetch(
      `https://pixabay.com/api/?key=${pixKey}&q=${q}&image_type=photo&orientation=horizontal&safesearch=true&per_page=6`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.hits) && data.hits.length > 0) {
        return data.hits.map((h: any) => h.largeImageURL || h.webformatURL);
      }
    }
  } catch (err) {
    console.warn('[Pixabay] Erro na consulta:', err);
  }
  return [];
}

function resolveNichePhotos(niche: string): string[] {
  const clean = (niche || '').toLowerCase();
  for (const k of Object.keys(NICHE_PHOTOS)) {
    if (clean.includes(k) || k.includes(clean)) {
      return NICHE_PHOTOS[k];
    }
  }
  return [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80'
  ];
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    const businessName = (body.businessName || body.name || body.title || 'Seu Negócio').trim();
    const niche = (body.niche || body.category || 'Comércio Local').trim();
    const city = (body.city || body.cidade || 'Brasil').trim();
    const rawPhone = (body.phone || body.whatsapp || '').trim();
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.length >= 10
      ? (cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`)
      : '5511943168939';

    const address = (body.address || `${city}`).trim();
    const instagram = (body.instagram || '').replace(/^@/, '').trim();
    const slogan = (body.slogan || `Excelência, pontualidade e o melhor atendimento em ${city}.`).trim();
    const description = (body.description || `${businessName} é referência em ${niche} em ${city}, unindo tradição, alta qualidade e atendimento humanizado.`).trim();

    // Normalização e validação de subdomínio
    let cleanSlug = sanitizeSlug(body.subdomain || body.slug || businessName);
    if (!cleanSlug || cleanSlug.length < 3) {
      cleanSlug = sanitizeSlug(`${businessName}-${city || 'sp'}`);
    }
    if (!cleanSlug) cleanSlug = `comercio-${Date.now().toString(36).slice(-5)}`;

    const visualTheme = body.visualTheme || 'Dark Luxo';
    const primaryColor = body.primaryColor || '#84cc16';
    const isDark = visualTheme.toLowerCase().includes('dark') || visualTheme.toLowerCase().includes('luxo') || visualTheme.toLowerCase().includes('urbano');

    // Resolução de fotos profissionais
    let photos: string[] = Array.isArray(body.photos) && body.photos.length > 0 ? body.photos : [];
    if (photos.length < 3) {
      const pixabay = await getPixabayPhotos(`${niche} ${city}`);
      if (pixabay.length > 0) {
        photos = [...photos, ...pixabay];
      }
    }
    if (photos.length < 3) {
      photos = [...photos, ...resolveNichePhotos(niche)];
    }

    const heroPhoto = photos[0];
    const galleryPhoto1 = photos[1] || photos[0];
    const galleryPhoto2 = photos[2] || photos[0];
    const galleryPhoto3 = photos[3] || photos[1];

    // Serviços sugeridos
    let services = Array.isArray(body.services) && body.services.length > 0 ? body.services : [];
    if (services.length === 0) {
      services = [
        { title: `Atendimento Premium em ${niche}`, desc: 'Serviço completo executado por especialistas qualificados.', price: 'Sob Consulta' },
        { title: 'Pacote Especial Completo', desc: 'A melhor experiência personalizada para sua necessidade com garantia.', price: 'R$ 120,00' },
        { title: 'Plano Personalizado Express', desc: 'Rapidez, agilidade e máxima eficiência para o seu dia a dia.', price: 'R$ 80,00' }
      ];
    }

    const operatorId = body.operatorId || user.userId || 'OP-DEFAULT';
    const operatorName = body.operatorName || user.name || 'Consultor Webbilly';
    const operatorEmail = body.operatorEmail || user.email || 'comercial@webbilly.com.br';

    const whatsappLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(`Olá! Vim pelo site oficial ${cleanSlug}.webbilly.com.br e gostaria de mais informações.`)}`;

    // Geração de HTML estruturado com Tailwind, animações e botão flutuante
    const generatedHtml = `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth ${isDark ? 'dark' : ''}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} — Site Oficial em ${city}</title>
  <meta name="description" content="${description}">
  <meta property="og:title" content="${businessName} | ${niche}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${heroPhoto}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://${cleanSlug}.webbilly.com.br">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      ${isDark ? 'background-color: #07090e; color: #f4f4f5;' : 'background-color: #f8fafc; color: #0f172a;'}
    }
    .custom-gradient {
      background: linear-gradient(135deg, ${primaryColor} 0%, #10b981 100%);
    }
  </style>
</head>
<body class="antialiased selection:bg-[#84cc16] selection:text-black">

  <!-- Header Fixo Moderno -->
  <header class="fixed top-0 left-0 right-0 z-40 ${isDark ? 'bg-[#0b0e14]/90' : 'bg-white/90'} backdrop-blur-md border-b ${isDark ? 'border-white/[0.08]' : 'border-slate-200'} transition-all">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-xl custom-gradient flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-[#84cc16]/20 group-hover:scale-105 transition">
          ${businessName.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <span class="font-extrabold text-lg sm:text-xl tracking-tight block ${isDark ? 'text-white' : 'text-slate-900'}">${businessName}</span>
          <span class="text-[10px] font-mono tracking-widest uppercase font-semibold text-[#84cc16] block">${niche}</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-300' : 'text-slate-600'}">
        <a href="#inicio" class="hover:text-[#84cc16] transition">Início</a>
        <a href="#servicos" class="hover:text-[#84cc16] transition">Serviços</a>
        <a href="#galeria" class="hover:text-[#84cc16] transition">Galeria</a>
        <a href="#sobre" class="hover:text-[#84cc16] transition">Sobre</a>
        <a href="#contato" class="hover:text-[#84cc16] transition">Contato</a>
      </nav>

      <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-[#84cc16] hover:bg-[#65a30d] transition shadow-lg shadow-[#84cc16]/25 flex items-center gap-2">
        <i class="fa-brands fa-whatsapp text-sm"></i>
        <span>Agendar Agora</span>
      </a>
    </div>
  </header>

  <!-- Hero Section Impactante -->
  <section id="inicio" class="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden flex items-center min-h-[90vh]">
    <div class="absolute inset-0 z-0">
      <img src="${heroPhoto}" alt="${businessName}" class="w-full h-full object-cover brightness-[0.35]">
      <div class="absolute inset-0 ${isDark ? 'bg-gradient-to-t from-[#07090e] via-[#07090e]/70 to-transparent' : 'bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/70 to-transparent'}"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-8 space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-900/10 border-slate-900/20 text-slate-900'} text-xs font-bold tracking-wide uppercase backdrop-blur-md">
          <span class="w-2 h-2 rounded-full bg-[#84cc16] animate-pulse"></span>
          <span>Atendimento Oficial em ${city}</span>
        </div>

        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          ${businessName}
        </h1>

        <p class="text-lg sm:text-xl text-zinc-200 font-medium max-w-2xl leading-relaxed">
          ${slogan}
        </p>

        <div class="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider text-slate-950 bg-[#84cc16] hover:bg-[#65a30d] transition shadow-xl shadow-[#84cc16]/30 flex items-center justify-center gap-3">
            <i class="fa-brands fa-whatsapp text-lg"></i>
            <span>Falar Conosco no WhatsApp</span>
          </a>
          <a href="#servicos" class="w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm text-white ${isDark ? 'bg-white/10 hover:bg-white/15 border border-white/20' : 'bg-slate-900/40 hover:bg-slate-900/60 border border-white/40'} transition flex items-center justify-center gap-2 backdrop-blur-md">
            <span>Ver Nossos Serviços</span>
            <i class="fa-solid fa-arrow-down text-xs"></i>
          </a>
        </div>

        <div class="grid grid-cols-3 gap-6 pt-8 border-t ${isDark ? 'border-white/15' : 'border-white/30'} max-w-lg">
          <div>
            <span class="text-2xl sm:text-3xl font-extrabold text-white block">100%</span>
            <span class="text-xs text-zinc-300 font-medium">Dedicação</span>
          </div>
          <div>
            <span class="text-2xl sm:text-3xl font-extrabold text-[#84cc16] block">5.0 ★</span>
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

  <!-- Seção de Serviços / Cardápio -->
  <section id="servicos" class="py-24 ${isDark ? 'bg-[#0b0e14]' : 'bg-white'} border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <span class="text-xs font-mono font-bold tracking-widest text-[#84cc16] uppercase">O Que Oferecemos</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}">
          Nossos Principais Serviços & Especialidades
        </h2>
        <p class="text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}">
          Soluções completas com atendimento personalizado para você e seu negócio.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        ${services.map((s: any, idx: number) => `
        <div class="p-8 rounded-3xl ${isDark ? 'bg-[#111420] border-white/[0.08]' : 'bg-slate-50 border-slate-200'} border hover:border-[#84cc16]/50 transition group flex flex-col justify-between space-y-6">
          <div class="space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-[#84cc16]/15 text-[#84cc16] flex items-center justify-center text-lg font-bold">
              0${idx + 1}
            </div>
            <h3 class="text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} group-hover:text-[#84cc16] transition">${s.title || s.nome}</h3>
            <p class="text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'} leading-relaxed">${s.desc || s.descricao || s.description || 'Atendimento de alto nível com garantia de satisfação.'}</p>
          </div>
          <div class="pt-4 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'} flex items-center justify-between">
            <span class="text-sm font-bold text-[#84cc16] font-mono">${s.price || s.preco || 'Sob Consulta'}</span>
            <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="text-xs font-bold ${isDark ? 'text-zinc-300 hover:text-white' : 'text-slate-700 hover:text-black'} flex items-center gap-1.5">
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
  <section id="galeria" class="py-24 ${isDark ? 'bg-[#07090e]' : 'bg-slate-50'}">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <span class="text-xs font-mono font-bold tracking-widest text-[#84cc16] uppercase">Estrutura & Resultados</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}">
          Galeria de Fotos
        </h2>
        <p class="text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}">
          Conheça nosso espaço e alguns dos trabalhos e atendimentos realizados.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="rounded-3xl overflow-hidden shadow-xl aspect-video lg:aspect-square group relative">
          <img src="${galleryPhoto1}" alt="${businessName}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
        </div>
        <div class="rounded-3xl overflow-hidden shadow-xl aspect-video lg:aspect-square group relative">
          <img src="${galleryPhoto2}" alt="${businessName}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
        </div>
        <div class="rounded-3xl overflow-hidden shadow-xl aspect-video lg:aspect-square group relative">
          <img src="${galleryPhoto3}" alt="${businessName}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
        </div>
      </div>
    </div>
  </section>

  <!-- Sobre Nós & Prova Social -->
  <section id="sobre" class="py-24 ${isDark ? 'bg-[#0b0e14]' : 'bg-white'} border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-6 space-y-6">
        <span class="text-xs font-mono font-bold tracking-widest text-[#84cc16] uppercase">Quem Somos</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}">
          Compromisso Real Com a Sua Satisfação
        </h2>
        <p class="text-sm sm:text-base ${isDark ? 'text-zinc-300' : 'text-slate-700'} leading-relaxed">
          ${description}
        </p>
        <div class="space-y-3 pt-2 text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-slate-700'}">
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-circle-check text-[#84cc16]"></i>
            <span>Equipe certificada e com vasta experiência de mercado</span>
          </div>
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-circle-check text-[#84cc16]"></i>
            <span>Atendimento pontual com agendamento simplificado</span>
          </div>
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-circle-check text-[#84cc16]"></i>
            <span>Espaço confortável e fácil localização em ${city}</span>
          </div>
        </div>
      </div>

      <div class="lg:col-span-6 rounded-3xl overflow-hidden shadow-2xl border ${isDark ? 'border-white/10' : 'border-slate-200'}">
        <img src="${heroPhoto}" alt="${businessName}" class="w-full h-96 object-cover">
      </div>
    </div>
  </section>

  <!-- Localização & Contato -->
  <section id="contato" class="py-24 ${isDark ? 'bg-[#07090e]' : 'bg-slate-50'} border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto p-8 sm:p-12 rounded-3xl ${isDark ? 'bg-[#111420] border-white/[0.08]' : 'bg-white border-slate-200'} border shadow-2xl text-center space-y-8">
        <div class="space-y-3">
          <span class="text-xs font-mono font-bold tracking-widest text-[#84cc16] uppercase">Canais Diretos</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}">
            Entre em Contato Conosco
          </h2>
          <p class="text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}">
            Estamos prontos para atender você com toda a atenção que você merece.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
          <div class="p-6 rounded-2xl ${isDark ? 'bg-[#0b0e14]' : 'bg-slate-50'} border ${isDark ? 'border-white/5' : 'border-slate-200'} space-y-2">
            <i class="fa-solid fa-location-dot text-[#84cc16] text-xl"></i>
            <span class="block font-bold ${isDark ? 'text-white' : 'text-slate-900'}">Endereço</span>
            <span class="block ${isDark ? 'text-zinc-400' : 'text-slate-600'} text-[11px]">${address}</span>
          </div>

          <div class="p-6 rounded-2xl ${isDark ? 'bg-[#0b0e14]' : 'bg-slate-50'} border ${isDark ? 'border-white/5' : 'border-slate-200'} space-y-2">
            <i class="fa-brands fa-whatsapp text-emerald-400 text-xl"></i>
            <span class="block font-bold ${isDark ? 'text-white' : 'text-slate-900'}">WhatsApp</span>
            <span class="block ${isDark ? 'text-zinc-400' : 'text-slate-600'} text-[11px]">${rawPhone || '(11) 94316-8939'}</span>
          </div>

          <div class="p-6 rounded-2xl ${isDark ? 'bg-[#0b0e14]' : 'bg-slate-50'} border ${isDark ? 'border-white/5' : 'border-slate-200'} space-y-2">
            <i class="fa-solid fa-clock text-[#84cc16] text-xl"></i>
            <span class="block font-bold ${isDark ? 'text-white' : 'text-slate-900'}">Horário</span>
            <span class="block ${isDark ? 'text-zinc-400' : 'text-slate-600'} text-[11px]">Seg a Sáb: 09h às 19h</span>
          </div>
        </div>

        <div class="pt-4">
          <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider text-slate-950 bg-[#84cc16] hover:bg-[#65a30d] transition shadow-xl shadow-[#84cc16]/30">
            <i class="fa-brands fa-whatsapp text-lg"></i>
            <span>Iniciar Conversa no WhatsApp Agora</span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Rodapé Oficial -->
  <footer class="py-8 ${isDark ? 'bg-[#07090e] border-white/5 text-zinc-500' : 'bg-slate-100 border-slate-200 text-slate-500'} border-t text-xs text-center">
    <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <span>© ${new Date().getFullYear()} ${businessName}. Todos os direitos reservados.</span>
      <span class="font-mono text-[11px]">Desenvolvido e Hospedado na plataforma <a href="https://webbilly.com.br" target="_blank" class="text-[#84cc16] font-bold hover:underline">Webbilly</a></span>
    </div>
  </footer>

  <!-- Botão Flutuante de WhatsApp Oficial -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: linear-gradient(135deg, #25D366, #128C7E); color: #ffffff; border-radius: 50%; box-shadow: 0 4px 20px rgba(18, 140, 126, 0.45); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale com ${businessName} no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>`;

    // 1. Salva arquivo HTML na pasta pública para renderização estática instantânea
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
    } as any;
    writeDb(db);

    // 3. Salva no Supabase (Fonte de Verdade na Nuvem)
    const deployedUrl = `https://${cleanSlug}.webbilly.com.br`;
    const previewUrl = `/api/public/site/${cleanSlug}/render`;
    const proposalUrl = `https://webbilly.com.br/proposta/${leadToken}`;

    try {
      await upsertSubscriptionInSupabase({
        id: `sub_${cleanSlug}`,
        leadToken,
        siteSlug: cleanSlug,
        clientName: businessName,
        clientPhone: rawPhone,
        clientEmail: `${cleanSlug}@cliente.webbilly.com.br`,
        operatorId,
        operatorName,
        status: 'active',
        monthlyPrice: 29.90,
        commissionMonthly: 10.00,
        deployedUrl: previewUrl,
        checkoutUrl: `/api/subscription/create-checkout?slug=${cleanSlug}`
      });

      // Tenta gravar também na tabela sites caso exista
      const supabase = getSupabaseAdmin();
      await supabase.from('sites').upsert({
        id: cleanSlug,
        slug: cleanSlug,
        name: businessName,
        html: generatedHtml,
        phone: rawPhone,
        status: 'active',
        deployed_url: previewUrl,
        operator_id: operatorId
      }).select();
    } catch (sbErr) {
      console.warn('[Studio Gerar Site] Falha ao salvar no Supabase:', sbErr);
    }

    // 4. Mensagem comercial persuasiva formatada para WhatsApp (Regra de Ouro: links isolados por \n\n)
    const whatsappMessage = `Olá! Tudo bem? Meu nome é *${operatorName}*, sou consultor de presença digital da Webbilly.

Notei que a *${businessName}* em ${city} possui uma excelente reputação, mas ainda não contava com um site oficial moderno posicionado no topo do Google.

Pensando em valorizar o comércio de vocês e atrair novos clientes todos os dias, desenvolvi uma demonstração exclusiva e pronta do site oficial de vocês:

https://${cleanSlug}.webbilly.com.br

Além do site no ar, preparei uma proposta oficial de ativação com hospedagem profissional, suporte e certificado de segurança inclusos por apenas *R$ 29,90/mês* (sem taxa de adesão):

https://webbilly.com.br/proposta/${leadToken}

O que achou do visual? Posso deixar ativo oficialmente hoje mesmo para vocês!`;

    return NextResponse.json({
      success: true,
      leadToken,
      slug: cleanSlug,
      businessName,
      deployedUrl,
      previewUrl,
      proposalUrl,
      whatsappMessage,
      whatsappShareUrl: `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappMessage)}`,
      html: generatedHtml
    });

  } catch (err: any) {
    console.error('[Studio Gerar Site] Erro:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao gerar site com IA.' },
      { status: 500 }
    );
  }
}
