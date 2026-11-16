const fs = require('fs');
const path = require('path');

const templates = [
  {
    id: 'barbearia-crop-vintage',
    name: 'BarberCrop Vintage Navalha',
    niche: 'Barbearia & Barbaterapia',
    category: 'barbearia',
    fontHead: 'Playfair Display',
    fontBody: 'Plus Jakarta Sans',
    fontImport: 'family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700',
    defaultPrimary: '#d97706',
    defaultBg: '#0d0d0d',
    defaultSurface: '#161412',
    defaultText: '#f5f5f4',
    badge: 'ESTILO CLÁSSICO & NAVALHA AFIADA',
    heroSubtitle: 'Experiência clássica de barbearia com toalha quente, navalha e cortes modernos de alta precisão.',
    styleExtra: `
      .crop-border { border: 1px solid rgba(217, 119, 6, 0.25); }
      .crop-gold { color: var(--primary, #d97706); }
      .crop-bg-gold { background-color: var(--primary, #d97706); }
      .price-line { display: flex; align-items: baseline; justify-content: space-between; }
      .price-line .dots { flex: 1; border-bottom: 1px dotted rgba(255,255,255,0.2); margin: 0 10px; }
    `
  },
  {
    id: 'barbearia-barberon-moderno',
    name: 'Barberon Dark Neon',
    niche: 'Barbearia Moderna & Fade',
    category: 'barbearia',
    fontHead: 'Syne',
    fontBody: 'Montserrat',
    fontImport: 'family=Montserrat:wght@400;500;600;700;800&family=Syne:wght@700;800;900',
    defaultPrimary: '#84cc16',
    defaultBg: '#07090e',
    defaultSurface: '#0e121a',
    defaultText: '#f8fafc',
    badge: 'CORTE FADE • BARBA • PIGMENTAÇÃO',
    heroSubtitle: 'Ambiente futurista, cortes na régua e profissionais premiados para transformar sua auto-estima.',
    styleExtra: `
      .neon-glow { box-shadow: 0 0 25px rgba(132, 204, 22, 0.25); }
      .neon-border { border: 1px solid rgba(132, 204, 22, 0.35); }
      .neon-text { color: var(--primary, #84cc16); }
    `
  },
  {
    id: 'barbearia-hair-salon',
    name: 'Hair Salon Luxo Editorial',
    niche: 'Salão de Beleza & Cabelos',
    category: 'barbearia',
    fontHead: 'Cormorant Garamond',
    fontBody: 'Plus Jakarta Sans',
    fontImport: 'family=Cormorant+Garamond:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700',
    defaultPrimary: '#eab308',
    defaultBg: '#0c0a09',
    defaultSurface: '#1c1917',
    defaultText: '#fafaf9',
    badge: 'HAUTE COIFFURE & ALTA ESTÉTICA',
    heroSubtitle: 'Especialistas em mechas, visagismo, tratamentos capilares intensivos e acabamentos de passarela.',
    styleExtra: `
      .luxury-border { border: 1px solid rgba(234, 179, 8, 0.2); }
      .gold-gradient { background: linear-gradient(135deg, #fef08a 0%, #ca8a04 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    `
  },
  {
    id: 'estetica-pureglow-spa',
    name: 'PureGlow Spa & Harmonização',
    niche: 'Clínica de Estética & Spa',
    category: 'saude',
    fontHead: 'Outfit',
    fontBody: 'Plus Jakarta Sans',
    fontImport: 'family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700',
    defaultPrimary: '#f43f5e',
    defaultBg: '#090d16',
    defaultSurface: '#111827',
    defaultText: '#f8fafc',
    badge: 'BEM-ESTAR • REJUVENESCIMENTO • HARMONIZAÇÃO',
    heroSubtitle: 'Protocolos estéticos avançados, tecnologias de ponta e cuidados personalizados para realçar sua beleza natural.',
    styleExtra: `
      .glow-pink { box-shadow: 0 0 30px rgba(244, 63, 94, 0.2); }
      .pink-border { border: 1px solid rgba(244, 63, 94, 0.3); }
    `
  },
  {
    id: 'odontologia-dentia-clinica',
    name: 'Dentia Odontologia Integrada',
    niche: 'Odontologia & Implantes',
    category: 'saude',
    fontHead: 'Plus Jakarta Sans',
    fontBody: 'Inter',
    fontImport: 'family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800',
    defaultPrimary: '#0284c7',
    defaultBg: '#050a14',
    defaultSurface: '#0b1329',
    defaultText: '#f0f9ff',
    badge: 'ODONTOLOGIA ESTÉTICA • IMPLANTES • ALINHADORES',
    heroSubtitle: 'Seu sorriso em primeiro lugar. Tecnologia odontológica digital sem dor, com agilidade e máxima precisão.',
    styleExtra: `
      .dent-blue { color: var(--primary, #0284c7); }
      .blue-glow { box-shadow: 0 0 25px rgba(2, 132, 199, 0.2); }
    `
  },
  {
    id: 'medico-medicalguide-clinica',
    name: 'MedicalGuide Policlínica',
    niche: 'Clínica Médica & Especialidades',
    category: 'saude',
    fontHead: 'Plus Jakarta Sans',
    fontBody: 'Inter',
    fontImport: 'family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800',
    defaultPrimary: '#0d9488',
    defaultBg: '#040d12',
    defaultSurface: '#0c1a24',
    defaultText: '#f0fdfa',
    badge: 'CORPO CLÍNICO DEDICADO • EXAMES • CONSULTAS',
    heroSubtitle: 'Atendimento médico humanizado com especialistas em diversas áreas e infraestrutura moderna completa.',
    styleExtra: `
      .teal-border { border: 1px solid rgba(13, 148, 136, 0.3); }
      .teal-glow { box-shadow: 0 0 25px rgba(13, 148, 136, 0.2); }
    `
  },
  {
    id: 'restaurante-foores-gourmet',
    name: 'Foores Alta Gastronomia',
    niche: 'Restaurante & Experiência Gastronômica',
    category: 'gastronomia',
    fontHead: 'Playfair Display',
    fontBody: 'Plus Jakarta Sans',
    fontImport: 'family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700',
    defaultPrimary: '#f59e0b',
    defaultBg: '#0c0a09',
    defaultSurface: '#191512',
    defaultText: '#fafaf9',
    badge: 'GASTRONOMIA AUTORAL & SABORES MARCANTES',
    heroSubtitle: 'Ingredientes frescos selecionados, receitas exclusivas e um ambiente sofisticado para almoços e jantares memoráveis.',
    styleExtra: `
      .foores-border { border: 1px solid rgba(245, 158, 11, 0.25); }
      .menu-tab-active { background: var(--primary, #f59e0b); color: #000; font-weight: bold; }
    `
  },
  {
    id: 'restaurante-sumi-culinaria',
    name: 'Sumi Japanese Culinária',
    niche: 'Sushi Bar & Culinária Oriental',
    category: 'gastronomia',
    fontHead: 'Syne',
    fontBody: 'Plus Jakarta Sans',
    fontImport: 'family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Syne:wght@700;800;900',
    defaultPrimary: '#ef4444',
    defaultBg: '#080808',
    defaultSurface: '#141414',
    defaultText: '#f5f5f5',
    badge: 'SUSHI ARTESANAL • RODÍZIO PREMIUM • SASHIMI',
    heroSubtitle: 'Tradição oriental e frescor incomparável em cortes nobres de salmão, atum e criações contemporâneas do chef.',
    styleExtra: `
      .sumi-red { color: var(--primary, #ef4444); }
      .sumi-border { border: 1px solid rgba(239, 68, 68, 0.3); }
    `
  },
  {
    id: 'restaurante-elroyale-cafe',
    name: 'El Royale Bistro & Carnes',
    niche: 'Bistrô & Steakhouse',
    category: 'gastronomia',
    fontHead: 'Playfair Display',
    fontBody: 'Montserrat',
    fontImport: 'family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800',
    defaultPrimary: '#dc2626',
    defaultBg: '#0b0b0d',
    defaultSurface: '#17161c',
    defaultText: '#f8fafc',
    badge: 'CORTES NOBRES • VINHOS • AMBIENTE EXCLUSIVO',
    heroSubtitle: 'Grelhados artesanais na brasa, massas frescas e uma carta de bebidas impecável no coração da cidade.',
    styleExtra: `
      .elroyale-border { border: 1px solid rgba(220, 38, 38, 0.25); }
    `
  },
  {
    id: 'bar-oldstory-whiskey',
    name: 'Old Story Whiskey & Pub',
    niche: 'Bar, Destilados & Petiscos',
    category: 'gastronomia',
    fontHead: 'Oswald',
    fontBody: 'Plus Jakarta Sans',
    fontImport: 'family=Oswald:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700',
    defaultPrimary: '#d97706',
    defaultBg: '#0a0a0c',
    defaultSurface: '#161414',
    defaultText: '#fef3c7',
    badge: 'CHOPP ARTESANAL • COQUETÉIS • BURGERS NA BRASA',
    heroSubtitle: 'O ponto de encontro perfeito com música ambiente, drinks autorais e petiscos generosos.',
    styleExtra: `
      .whiskey-border { border: 1px solid rgba(217, 119, 6, 0.3); }
    `
  },
  {
    id: 'pub-tavern-irish',
    name: 'The Tavern Irish Pub',
    niche: 'Pub Irlandês & Cervejaria',
    category: 'gastronomia',
    fontHead: 'Oswald',
    fontBody: 'Inter',
    fontImport: 'family=Inter:wght@400;500;600;700&family=Oswald:wght@600;700',
    defaultPrimary: '#16a34a',
    defaultBg: '#040d07',
    defaultSurface: '#0b1a0f',
    defaultText: '#f0fdf4',
    badge: 'TORNEIRAS DE CHOPP • ROCK CLÁSSICO • TRANSMISSÕES',
    heroSubtitle: 'Autêntica atmosfera de pub com dezenas de torneiras de chopp, petiscos especiais e clima contagiante.',
    styleExtra: `
      .tavern-green { color: var(--primary, #16a34a); }
      .tavern-border { border: 1px solid rgba(22, 163, 74, 0.3); }
    `
  },
  {
    id: 'bistro-granny-cafe',
    name: 'Granny Confeitaria & Café',
    niche: 'Confeitaria, Doceria & Bolos',
    category: 'gastronomia',
    fontHead: 'Playfair Display',
    fontBody: 'Plus Jakarta Sans',
    fontImport: 'family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700',
    defaultPrimary: '#f97316',
    defaultBg: '#0f0c0a',
    defaultSurface: '#1a1512',
    defaultText: '#fff7ed',
    badge: 'RECEITAS ARTESANAIS • BOLOS CASEIROS • CAFÉS',
    heroSubtitle: 'Doces feitos com amor, tortas premiadas, salgados folhados e o café mais acolhedor da região.',
    styleExtra: `
      .granny-border { border: 1px solid rgba(249, 115, 22, 0.25); }
    `
  },
  {
    id: 'cafezone-coffee-shop',
    name: 'CafeZone Special Coffee',
    niche: 'Cafeteria & Grãos Especiais',
    category: 'gastronomia',
    fontHead: 'Syne',
    fontBody: 'Inter',
    fontImport: 'family=Inter:wght@400;500;600;700&family=Syne:wght@700;800',
    defaultPrimary: '#b45309',
    defaultBg: '#0a0807',
    defaultSurface: '#181310',
    defaultText: '#fef3c7',
    badge: 'CAFÉS ESPECIAIS • MÉTODOS DE EXTRAÇÃO • BRUNCH',
    heroSubtitle: 'Grãos 100% arábica torrados com precisão, espresso aveludado e comidinhas preparadas na hora.',
    styleExtra: `
      .coffee-border { border: 1px solid rgba(180, 83, 9, 0.3); }
    `
  },
  {
    id: 'petshop-petly-veterinaria',
    name: 'Petly Clínica Veterinária & Pet',
    niche: 'Pet Shop, Banho e Tosa & Vet',
    category: 'comercio',
    fontHead: 'Plus Jakarta Sans',
    fontBody: 'Inter',
    fontImport: 'family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800',
    defaultPrimary: '#06b6d4',
    defaultBg: '#050f14',
    defaultSurface: '#0b1d28',
    defaultText: '#ecfeff',
    badge: 'BANHO & TOSA • CONSULTAS VETERINÁRIAS • RAÇÕES',
    heroSubtitle: 'Cuidado, carinho e infraestrutura completa para a saúde, higiene e alegria do seu melhor amigo.',
    styleExtra: `
      .pet-border { border: 1px solid rgba(6, 182, 212, 0.3); }
      .pet-glow { box-shadow: 0 0 25px rgba(6, 182, 212, 0.2); }
    `
  },
  {
    id: 'autoescola-drivepro',
    name: 'DrivePro Centro de Formação',
    niche: 'Autoescola & Habilitação CNH',
    category: 'servicos',
    fontHead: 'Oswald',
    fontBody: 'Plus Jakarta Sans',
    fontImport: 'family=Oswald:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800',
    defaultPrimary: '#eab308',
    defaultBg: '#090d14',
    defaultSurface: '#111827',
    defaultText: '#f8fafc',
    badge: 'PRIMEIRA HABILITAÇÃO • CARRO & MOTO • RECICLAGEM',
    heroSubtitle: 'Aprovação rápida e sem estresse. Frota moderna com ar-condicionado, pista própria e instrutores credenciados.',
    styleExtra: `
      .drive-yellow { color: var(--primary, #eab308); }
      .drive-border { border: 1px solid rgba(234, 179, 8, 0.35); }
      .cat-badge { background: var(--primary, #eab308); color: #000; font-weight: 800; border-radius: 8px; padding: 4px 12px; display: inline-block; }
    `
  },
  {
    id: 'serralheria-welbim-soldagem',
    name: 'Welbim Estruturas Metálicas',
    niche: 'Serralheria & Soldas Industriais',
    category: 'servicos',
    fontHead: 'Oswald',
    fontBody: 'Inter',
    fontImport: 'family=Inter:wght@400;500;600;700&family=Oswald:wght@600;700',
    defaultPrimary: '#f97316',
    defaultBg: '#08090c',
    defaultSurface: '#12141a',
    defaultText: '#f1f5f9',
    badge: 'PORTÕES AUTOMÁTICOS • MEZANINOS • COBERTURAS',
    heroSubtitle: 'Soluções sob medida em ferro, aço carbono e alumínio com acabamento de alta resistência e garantia comprovada.',
    styleExtra: `
      .welb-border { border: 1px solid rgba(249, 115, 22, 0.3); }
    `
  },
  {
    id: 'consultoria-financeira-fo',
    name: 'F&O Consultoria Financeira & Gestão',
    niche: 'Consultoria, Contabilidade & B2B',
    category: 'advocacia',
    fontHead: 'Plus Jakarta Sans',
    fontBody: 'Inter',
    fontImport: 'family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800',
    defaultPrimary: '#3b82f6',
    defaultBg: '#050a14',
    defaultSurface: '#0d1527',
    defaultText: '#f8fafc',
    badge: 'PLANEJAMENTO TRIBUTÁRIO • BPO • GESTÃO EMPRESARIAL',
    heroSubtitle: 'Maximizamos a rentabilidade e a segurança fiscal do seu negócio com diagnósticos estratégicos e consultoria contínua.',
    styleExtra: `
      .fo-border { border: 1px solid rgba(59, 130, 246, 0.3); }
      .fo-blue { color: var(--primary, #3b82f6); }
    `
  },
  {
    id: 'commercial-vibrant',
    name: 'Vibrant Soluções Comerciais',
    niche: 'Comércio, Lojas & Varejo',
    category: 'comercio',
    fontHead: 'Syne',
    fontBody: 'Plus Jakarta Sans',
    fontImport: 'family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800;900',
    defaultPrimary: '#8b5cf6',
    defaultBg: '#080511',
    defaultSurface: '#140e26',
    defaultText: '#faf5ff',
    badge: 'OFERTAS EXCLUSIVAS • ENTREGA RÁPIDA • QUALIDADE',
    heroSubtitle: 'Variedade inigualável, preços justos e atendimento focado em resolver as necessidades do seu dia a dia.',
    styleExtra: `
      .vibrant-border { border: 1px solid rgba(139, 92, 246, 0.35); }
      .vibrant-glow { box-shadow: 0 0 30px rgba(139, 92, 246, 0.25); }
    `
  },
  {
    id: 'portfolio-dark',
    name: 'Dark Studio & Tattoo Art',
    niche: 'Estúdio de Tatuagem & Piercing',
    category: 'servicos',
    fontHead: 'Syne',
    fontBody: 'Inter',
    fontImport: 'family=Inter:wght@400;500;600;700&family=Syne:wght@700;800;900',
    defaultPrimary: '#10b981',
    defaultBg: '#05070a',
    defaultSurface: '#0b1017',
    defaultText: '#f0fdf4',
    badge: 'BLACKWORK • REALISMO • FINE LINE • AUTORAL',
    heroSubtitle: 'Artes exclusivas na pele com biossegurança hospitalar, materiais 100% descartáveis e ambiente climatizado.',
    styleExtra: `
      .dark-border { border: 1px solid rgba(16, 185, 129, 0.3); }
      .dark-glow { box-shadow: 0 0 30px rgba(16, 185, 129, 0.2); }
    `
  },
  {
    id: 'studio-minimal',
    name: 'Minimal Nordic Studio',
    niche: 'Arquitetura, Design & Consultoria',
    category: 'advocacia',
    fontHead: 'Inter',
    fontBody: 'Inter',
    fontImport: 'family=Inter:wght@300;400;500;600;700;800',
    defaultPrimary: '#64748b',
    defaultBg: '#090a0f',
    defaultSurface: '#11131c',
    defaultText: '#f8fafc',
    badge: 'SIMPLICIDADE • PRECISÃO • PROPÓSITO',
    heroSubtitle: 'Design inteligente, clareza conceitual e soluções atemporais desenvolvidas com máximo rigor estético.',
    styleExtra: `
      .minimal-border { border: 1px solid rgba(255, 255, 255, 0.1); }
    `
  }
];

function generateTemplateHtml(t) {
  return `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | {{TAGLINE}}</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?${t.fontImport}&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: '${t.fontBody}', sans-serif;
      background-color: var(--bg, ${t.defaultBg});
      color: var(--text, ${t.defaultText});
    }
    h1, h2, h3, h4, .font-heading {
      font-family: '${t.fontHead}', sans-serif;
    }
    .accent-bg { background-color: var(--primary, ${t.defaultPrimary}); }
    .accent-color { color: var(--primary, ${t.defaultPrimary}); }
    .surface-card { background-color: var(--surface, ${t.defaultSurface}); }
    ${t.styleExtra}
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <!-- CABEÇALHO OFICIAL -->
  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/90 border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl accent-bg flex items-center justify-center font-black text-black text-lg shadow-lg">
          {{INITIALS}}
        </div>
        <div class="flex flex-col">
          <span class="text-lg font-black tracking-tight text-white font-heading">{{HEADER_NAME}}</span>
          <span class="text-[10px] uppercase font-bold tracking-widest accent-color">{{NICHE_LABEL}}</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-300">
        <a href="#sobre" class="hover:text-white transition">Sobre</a>
        <a href="#servicos" class="hover:text-white transition">Serviços & Preços</a>
        <a href="#galeria" class="hover:text-white transition">Fotos Oficiais</a>
        <a href="#depoimentos" class="hover:text-white transition">Avaliações</a>
        <a href="#contato" class="hover:text-white transition">Localização</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp text-sm"></i>
          <span>Falar no WhatsApp</span>
        </a>
      </div>
    </div>
  </header>

  <!-- HERO SECTION -->
  <section class="relative pt-12 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/[0.1] surface-card">
          <span class="w-2 h-2 rounded-full accent-bg animate-pulse"></span>
          <span class="accent-color">${t.badge}</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight font-heading">
          {{HERO_TITLE}}
        </h1>

        <p class="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
          {{HERO_SUBTITLE}}
        </p>

        <!-- Ações do Hero -->
        <div class="flex flex-wrap items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-xl transition flex items-center gap-3">
            <i class="fab fa-whatsapp text-lg"></i>
            <span>{{PRIMARY_CTA}}</span>
          </a>

          <a href="#servicos" class="px-6 py-4 rounded-xl surface-card text-white font-bold text-sm border border-white/[0.1] hover:bg-white/[0.05] transition flex items-center gap-2">
            <span>Ver Tabela & Preços</span>
            <i class="fas fa-arrow-down text-xs"></i>
          </a>
        </div>

        <!-- Diferenciais Rápidos -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-white/[0.08]">
          <div class="p-3 rounded-xl surface-card border border-white/[0.05]">
            <div class="accent-color font-black text-base">★ 5.0 Estrelas</div>
            <div class="text-[11px] text-zinc-400">Excelência no Google Maps</div>
          </div>
          <div class="p-3 rounded-xl surface-card border border-white/[0.05]">
            <div class="accent-color font-black text-base">{{HOURS_SHORT}}</div>
            <div class="text-[11px] text-zinc-400">Horário Flexível</div>
          </div>
          <div class="p-3 rounded-xl surface-card border border-white/[0.05] col-span-2 sm:col-span-1">
            <div class="accent-color font-black text-base">Atendimento Vip</div>
            <div class="text-[11px] text-zinc-400">Pontualidade & Conforto</div>
          </div>
        </div>
      </div>

      <!-- Imagem Principal Hero -->
      <div class="lg:col-span-5 relative">
        <div class="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl aspect-[4/5]">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover" onerror="this.style.display='none'">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
            <span class="text-xs uppercase font-mono font-bold accent-color tracking-widest">Presença Digital Oficial</span>
            <h3 class="text-xl font-bold text-white font-heading">{{BUSINESS_NAME}}</h3>
            <p class="text-xs text-zinc-300 mt-1"><i class="fas fa-map-marker-alt text-amber-400 mr-1.5"></i>{{ADDRESS}}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SOBRE & DIFERENCIAIS -->
  <section id="sobre" class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6 space-y-4">
        <span class="text-xs font-mono uppercase font-bold tracking-widest accent-color">Nossa História & Estrutura</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-heading">
          Compromisso com o Padrão de Excelência
        </h2>
        <p class="text-sm sm:text-base text-zinc-300 leading-relaxed">
          {{ABOUT_TEXT}}
        </p>
        <div class="space-y-2 pt-2">
          <div class="flex items-center gap-3 text-sm text-zinc-200">
            <i class="fas fa-check-circle accent-color"></i>
            <span>Equipe treinada e materiais de altíssima qualidade</span>
          </div>
          <div class="flex items-center gap-3 text-sm text-zinc-200">
            <i class="fas fa-check-circle accent-color"></i>
            <span>Facilidade no pagamento: Pix, cartões em até 12x e dinheiro</span>
          </div>
          <div class="flex items-center gap-3 text-sm text-zinc-200">
            <i class="fas fa-check-circle accent-color"></i>
            <span>Atendimento ágil direto pelo WhatsApp</span>
          </div>
        </div>
      </div>

      <div class="lg:col-span-6 grid grid-cols-2 gap-4">
        <div class="p-6 rounded-2xl bg-[var(--bg)] border border-white/[0.08] space-y-2">
          <i class="fas fa-clock text-2xl accent-color"></i>
          <h4 class="font-bold text-white text-base">Horário</h4>
          <p class="text-xs text-zinc-400">{{HOURS}}</p>
        </div>
        <div class="p-6 rounded-2xl bg-[var(--bg)] border border-white/[0.08] space-y-2">
          <i class="fas fa-map-marked-alt text-2xl accent-color"></i>
          <h4 class="font-bold text-white text-base">Localização</h4>
          <p class="text-xs text-zinc-400">{{ADDRESS}}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- SERVIÇOS & TABELA DE PREÇOS -->
  <section id="servicos" class="py-20 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <span class="text-xs font-mono uppercase font-bold tracking-widest accent-color">Cardápio & Valores Oficiais</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-heading">Nossos Serviços & Preços</h2>
        <p class="text-sm text-zinc-400">Valores transparentes e pacotes sob medida para você.</p>
      </div>

      <!-- Grade de Serviços -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <!-- GALERIA DE FOTOS OFICIAIS -->
  <section id="galeria" class="py-20 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span class="text-xs font-mono uppercase font-bold tracking-widest accent-color">Nosso Espaço & Resultados</span>
          <h2 class="text-3xl font-black text-white font-heading mt-1">Galeria de Fotos Reais</h2>
        </div>
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="text-xs font-bold accent-color hover:underline inline-flex items-center gap-1.5">
          <span>Ver mais fotos no WhatsApp</span>
          <i class="fas fa-arrow-right"></i>
        </a>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <!-- AVALIAÇÕES / DEPOIMENTOS -->
  <section id="depoimentos" class="py-20 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center max-w-xl mx-auto space-y-3">
        <span class="text-xs font-mono uppercase font-bold tracking-widest accent-color">Satisfação Comprovada</span>
        <h2 class="text-3xl font-black text-white font-heading">O Que Nossos Clientes Dizem</h2>
        <p class="text-xs text-zinc-400">Avaliações públicas verificadas no Google Maps.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-black text-white font-heading">Dúvidas Frequentes</h2>
        <p class="text-xs text-zinc-400">Tudo o que você precisa saber antes de nos visitar.</p>
      </div>

      <div class="space-y-3">
        {{FAQ_CARDS}}
      </div>
    </div>
  </section>

  <!-- CTA FINAL -->
  <section class="py-16 border-t border-white/[0.06] relative overflow-hidden">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
      <h2 class="text-3xl sm:text-4xl font-black text-white font-heading">
        Pronto para Vivenciar a Melhor Experiência?
      </h2>
      <p class="text-sm text-zinc-300 max-w-xl mx-auto">
        Clique no botão abaixo e fale agora mesmo com nossa equipe no WhatsApp para tirar dúvidas ou agendar seu atendimento.
      </p>
      <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-3 px-8 py-4 rounded-2xl accent-bg text-black font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-2xl transition">
        <i class="fab fa-whatsapp text-xl"></i>
        <span>Falar Diretamente no WhatsApp</span>
      </a>
    </div>
  </section>

  <!-- RODAPÉ -->
  <footer id="contato" class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg accent-bg flex items-center justify-center font-bold text-black text-xs">
          {{INITIALS}}
        </div>
        <span class="font-bold text-white font-heading">{{BUSINESS_NAME}}</span>
      </div>

      <div class="text-center md:text-left">
        <p>{{ADDRESS}}</p>
        <p class="text-[11px] text-zinc-400 mt-0.5">Horário: {{HOURS}}</p>
      </div>

      <div class="flex items-center gap-4">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="accent-color font-bold hover:underline">WhatsApp</a>
        <span>•</span>
        <span>© {{YEAR}} Todos os direitos reservados.</span>
      </div>
    </div>
  </footer>

  <!-- BOTÃO FLUTUANTE DE WHATSAPP -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>`;
}

let out = `/**
 * Catálogo Oficial dos 20 Templates Estruturais do Billy Desktop
 * Mapeamento completo com HTML/CSS de 90% da identidade visual
 */

export interface DesktopTemplateDefinition {
  id: string;
  name: string;
  niche: string;
  category: string;
  defaultPrimary: string;
  defaultBg: string;
  defaultSurface: string;
  defaultText: string;
  html: string;
}

export const DESKTOP_TEMPLATE_HTML: Record<string, string> = {
`;

for (const t of templates) {
  const htmlContent = generateTemplateHtml(t);
  out += `  ${JSON.stringify(t.id)}: ${JSON.stringify(htmlContent)},\n`;
}

out += `};\n\n`;

out += `export function getDesktopTemplateHtml(templateId?: string): string {
  const clean = (templateId || '').toLowerCase().trim();
  if (clean && DESKTOP_TEMPLATE_HTML[clean]) {
    return DESKTOP_TEMPLATE_HTML[clean];
  }
  // Correspondência parcial
  for (const [key, html] of Object.entries(DESKTOP_TEMPLATE_HTML)) {
    if (key.includes(clean) || clean.includes(key)) {
      return html;
    }
  }
  return DESKTOP_TEMPLATE_HTML['barbearia-crop-vintage'];
}
`;

const dest = path.join(__dirname, '../src/lib/desktop-templates-html.ts');
fs.writeFileSync(dest, out, 'utf-8');
console.log('Gerado com sucesso em:', dest);
