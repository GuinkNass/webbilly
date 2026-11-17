/**
 * BILLY REAL TEMPLATES - Catalogo 1:1 Oficial dos 20 Templates do Billy Desktop
 * Portabilidade completa dos layouts estruturais com tipografias, grids e identidades unicas.
 */

export const BILLY_REAL_TEMPLATES_HTML: Record<string, string> = {
  "autoescola-drivepro": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Autoescola & CFC Credenciado Detran</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg, #0b1329);
      color: var(--text, #f8fafc);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Oswald', sans-serif;
      letter-spacing: 0.5px;
    }
    .accent-bg { background-color: var(--primary, #f59e0b); }
    .accent-color { color: var(--primary, #f59e0b); }
    .surface-card { background-color: var(--surface, #131f3d); }
    .detran-badge { border-left: 4px solid var(--primary, #f59e0b); }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <div class="bg-black/60 border-b border-white/[0.08] text-xs py-2.5 px-4 hidden sm:block">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-6 text-zinc-300">
        <span class="flex items-center gap-2"><i class="fas fa-id-card accent-color"></i> CFC Credenciado Detran • Alto Índice de Aprovação</span>
        <span class="flex items-center gap-2"><i class="fas fa-map-marker-alt text-zinc-400"></i> {{ADDRESS}}</span>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-zinc-400"><i class="far fa-clock"></i> {{HOURS}}</span>
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="accent-color font-bold hover:underline flex items-center gap-1.5">
          <i class="fab fa-whatsapp"></i> {{PHONE}}
        </a>
      </div>
    </div>
  </div>

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/95 border-b border-white/[0.1]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl accent-bg flex items-center justify-center font-black text-black text-xl shadow-lg">
          <i class="fas fa-car-side"></i>
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-bold tracking-tight text-white font-heading uppercase">{{HEADER_NAME}}</span>
          <span class="text-[10px] uppercase font-extrabold tracking-widest accent-color">AUTOESCOLA & CFC OFICIAL</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-300">
        <a href="#sobre" class="hover:accent-color transition">Sobre o CFC</a>
        <a href="#categorias" class="hover:accent-color transition">Categorias CNH</a>
        <a href="#passo-a-passo" class="hover:accent-color transition">Como Funciona</a>
        <a href="#depoimentos" class="hover:accent-color transition">Aprovados</a>
        <a href="#faq" class="hover:accent-color transition">Dúvidas Detran</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp text-base"></i>
          <span>Matricule-se Agora</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-[var(--bg)] via-[#0d1733] to-[var(--bg)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/[0.1] surface-card detran-badge">
          <span class="w-2.5 h-2.5 rounded-full accent-bg animate-pulse"></span>
          <span class="text-white">CONQUISTE SUA CNH DE PRIMEIRA • PARCELAMENTO EM ATÉ 12X</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight font-heading uppercase">
          Aprenda a Dirigir com Confiança e <span class="accent-color">Conquiste sua Habilitação</span>
        </h1>

        <p class="text-base text-zinc-300 leading-relaxed max-w-2xl">
          {{DESCRIPTION}} Veículos modernos com ar-condicionado e direção hidráulica, simulador próprio e instrutores altamente capacitados e pacientes para você ser aprovado sem medo.
        </p>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div class="p-3 rounded-xl surface-card border border-white/[0.08] text-center">
            <i class="fas fa-award accent-color text-xl mb-1"></i>
            <p class="text-xs font-bold text-white uppercase font-heading">Alto Índice</p>
            <p class="text-[10px] text-zinc-400">De Aprovação</p>
          </div>
          <div class="p-3 rounded-xl surface-card border border-white/[0.08] text-center">
            <i class="fas fa-car accent-color text-xl mb-1"></i>
            <p class="text-xs font-bold text-white uppercase font-heading">Frota Nova</p>
            <p class="text-[10px] text-zinc-400">Com Ar e Direção</p>
          </div>
          <div class="p-3 rounded-xl surface-card border border-white/[0.08] text-center">
            <i class="fas fa-user-check accent-color text-xl mb-1"></i>
            <p class="text-xs font-bold text-white uppercase font-heading">Instrutores</p>
            <p class="text-[10px] text-zinc-400">Pacientes e VIP</p>
          </div>
          <div class="p-3 rounded-xl surface-card border border-white/[0.08] text-center">
            <i class="fas fa-credit-card accent-color text-xl mb-1"></i>
            <p class="text-xs font-bold text-white uppercase font-heading">Em até 12x</p>
            <p class="text-[10px] text-zinc-400">No Cartão ou Boleto</p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-xl transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-xl"></i>
            <span>Simular Matrícula no WhatsApp</span>
          </a>
          <a href="#passo-a-passo" class="px-6 py-4 rounded-xl border border-white/[0.15] hover:border-white/40 text-white font-bold text-sm text-center transition">
            Ver Passo a Passo Detran
          </a>
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <div class="relative rounded-3xl overflow-hidden border-2 border-white/[0.1] shadow-2xl surface-card aspect-[4/3] group">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}} - Autoescola" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
            <span class="px-3 py-1 rounded-lg accent-bg text-black font-black text-xs uppercase w-max mb-2">CFC Autorizado</span>
            <h3 class="text-xl font-bold text-white font-heading">{{BUSINESS_NAME}}</h3>
            <p class="text-xs text-zinc-300">{{ADDRESS}}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="passo-a-passo" class="py-16 border-t border-white/[0.08] bg-black/40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-3 max-w-2xl mx-auto">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">SIMPLES E DESCOMPLICADO</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-heading uppercase">Os 5 Passos para Sua Habilitação</h2>
        <p class="text-xs text-zinc-400">Acompanhamos você desde o primeiro cadastro até a emissão da sua CNH no Detran.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="p-5 rounded-2xl surface-card border border-white/[0.08] space-y-3 relative">
          <span class="w-8 h-8 rounded-full accent-bg text-black font-black flex items-center justify-center text-sm font-heading">01</span>
          <h4 class="font-bold text-white text-sm font-heading uppercase">Matrícula & Exames</h4>
          <p class="text-xs text-zinc-400 leading-relaxed">Inscrição rápida na autoescola e agendamento dos exames médico e psicotécnico credenciados.</p>
        </div>
        <div class="p-5 rounded-2xl surface-card border border-white/[0.08] space-y-3 relative">
          <span class="w-8 h-8 rounded-full accent-bg text-black font-black flex items-center justify-center text-sm font-heading">02</span>
          <h4 class="font-bold text-white text-sm font-heading uppercase">Curso Teórico</h4>
          <p class="text-xs text-zinc-400 leading-relaxed">45 horas de aulas teóricas com simulados reais do Detran em horários matutinos, noturnos ou EAD.</p>
        </div>
        <div class="p-5 rounded-2xl surface-card border border-white/[0.08] space-y-3 relative">
          <span class="w-8 h-8 rounded-full accent-bg text-black font-black flex items-center justify-center text-sm font-heading">03</span>
          <h4 class="font-bold text-white text-sm font-heading uppercase">Prova Teórica</h4>
          <p class="text-xs text-zinc-400 leading-relaxed">Realização da prova teórica do Detran com suporte total da nossa equipe para aprovação segura.</p>
        </div>
        <div class="p-5 rounded-2xl surface-card border border-white/[0.08] space-y-3 relative">
          <span class="w-8 h-8 rounded-full accent-bg text-black font-black flex items-center justify-center text-sm font-heading">04</span>
          <h4 class="font-bold text-white text-sm font-heading uppercase">Aulas Práticas</h4>
          <p class="text-xs text-zinc-400 leading-relaxed">Treinamento prático nas ruas e na baliza com instrutores pacientes no veículo da sua categoria.</p>
        </div>
        <div class="p-5 rounded-2xl surface-card border border-white/[0.08] space-y-3 relative bg-gradient-to-b from-[#131f3d] to-emerald-950/40">
          <span class="w-8 h-8 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center text-sm font-heading"><i class="fas fa-check"></i></span>
          <h4 class="font-bold text-emerald-400 text-sm font-heading uppercase">Exame & CNH!</h4>
          <p class="text-xs text-zinc-300 leading-relaxed">Exame prático de direção e entrega da sua CNH oficial pronta para dirigir por todo o Brasil!</p>
        </div>
      </div>
    </div>
  </section>

  <section id="categorias" class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span class="text-xs uppercase font-extrabold tracking-widest accent-color">CURSOS E HABILITAÇÕES</span>
          <h2 class="text-3xl sm:text-4xl font-black text-white font-heading uppercase">Categorias de CNH & Serviços</h2>
        </div>
        <p class="text-xs text-zinc-400 max-w-md">Escolha a categoria desejada e fale diretamente com a secretaria para consultar turmas abertas.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.08] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6 space-y-6">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">TRADIÇÃO & SEGURANÇA</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-heading uppercase">Excelência e Respeito ao Futuro Condutor</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>
        
        <div class="space-y-3 pt-2">
          <div class="flex items-center gap-3 text-xs text-zinc-200">
            <i class="fas fa-check-circle text-emerald-400 text-base"></i>
            <span>Pista de treino oficial similar ao trajeto de prova do Detran</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-zinc-200">
            <i class="fas fa-check-circle text-emerald-400 text-base"></i>
            <span>Aulas de direção defensiva e atendimento personalizado para pessoas com medo de dirigir</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-zinc-200">
            <i class="fas fa-check-circle text-emerald-400 text-base"></i>
            <span>Condições de pagamento facilitadas e parcelamento direto com a autoescola</span>
          </div>
        </div>

        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl accent-bg text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition">
          <i class="fab fa-whatsapp text-base"></i>
          <span>Falar com um Consultor de Matrícula</span>
        </a>
      </div>

      <div class="lg:col-span-6 grid grid-cols-2 gap-4">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">DEPOIMENTOS REAIS</span>
        <h2 class="text-3xl font-black text-white font-heading uppercase">O que Dizem Nossos Alunos Aprovados</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

  <section id="faq" class="py-16 border-t border-white/[0.08] surface-card">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-black text-white font-heading uppercase">Dúvidas Frequentes sobre a CNH</h2>
        <p class="text-xs text-zinc-400">Esclarecemos as principais dúvidas sobre o processo de habilitação no Detran.</p>
      </div>

      <div class="space-y-3">
        {{FAQ_CARDS}}
      </div>
    </div>
  </section>

  <footer class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-400">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl accent-bg flex items-center justify-center font-black text-black text-base">
          <i class="fas fa-car-side"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-white font-heading uppercase tracking-wide">{{BUSINESS_NAME}}</span>
          <span class="text-[10px] text-zinc-500">CFC Credenciado Detran</span>
        </div>
      </div>

      <div class="text-center md:text-left">
        <p>{{ADDRESS}}</p>
        <p class="text-[11px] text-zinc-500 mt-0.5">Horário: {{HOURS}}</p>
      </div>

      <div class="flex items-center gap-4">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="accent-color font-bold hover:underline">WhatsApp Oficial</a>
        <span>•</span>
        <span>© {{YEAR}} Todos os direitos reservados.</span>
      </div>
    </div>
  </footer>


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "barbearia-crop-vintage": `<!DOCTYPE html>
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
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg, #0d0d0d);
      color: var(--text, #f5f5f4);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Playfair Display', serif;
    }
    .accent-bg { background-color: var(--primary, #d97706); }
    .accent-color { color: var(--primary, #d97706); }
    .surface-card { background-color: var(--surface, #161412); }
    .crop-border { border: 1px solid rgba(217, 119, 6, 0.3); }
    .price-line { display: flex; align-items: baseline; justify-content: space-between; }
    .price-line .dots { flex: 1; border-bottom: 1px dotted rgba(255,255,255,0.25); margin: 0 10px; }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/90 border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl accent-bg flex items-center justify-center font-black text-black text-lg shadow-lg">
          {{INITIALS}}
        </div>
        <div class="flex flex-col">
          <span class="text-lg font-black tracking-tight text-white font-heading">{{HEADER_NAME}}</span>
          <span class="text-[10px] uppercase font-bold tracking-widest accent-color">TRADIÇÃO EM CORTES CLÁSSICOS</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-300">
        <a href="#sobre" class="hover:text-white transition">{{NAV_ABOUT}}</a>
        <a href="#servicos" class="hover:text-white transition">{{NAV_SERVICES}}</a>
        <a href="#galeria" class="hover:text-white transition">Fotos de Cortes</a>
        <a href="#depoimentos" class="hover:text-white transition">Avaliações</a>
        <a href="#contato" class="hover:text-white transition">Localização</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp text-sm"></i>
          <span>Agendar Horário</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-12 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/[0.1] surface-card">
          <span class="w-2 h-2 rounded-full accent-bg animate-pulse"></span>
          <span class="accent-color">{{NICHE_LABEL}}</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight font-heading">
          {{HERO_TITLE}}
        </h1>

        <p class="text-base text-zinc-300 leading-relaxed max-w-xl">
          {{HERO_SUBTITLE}}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-xl transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-xl"></i>
            <span>{{PRIMARY_CTA}}</span>
          </a>
          <a href="#servicos" class="px-6 py-4 rounded-xl border border-white/[0.15] hover:border-white/40 text-white font-bold text-sm text-center transition">
            Ver Tabela de Serviços
          </a>
        </div>

        <div class="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.08]">
          <div>
            <div class="text-2xl font-black accent-color font-heading">100%</div>
            <div class="text-[11px] text-zinc-400">{{METRIC_1_LABEL}}</div>
          </div>
          <div>
            <div class="text-2xl font-black accent-color font-heading">VIP</div>
            <div class="text-[11px] text-zinc-400">{{METRIC_2_LABEL}}</div>
          </div>
          <div>
            <div class="text-2xl font-black accent-color font-heading">5.0 ★</div>
            <div class="text-[11px] text-zinc-400">Google Reviews</div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <div class="relative rounded-3xl overflow-hidden border-2 border-white/[0.1] shadow-2xl surface-card aspect-[4/5] group">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
            <span class="px-3 py-1 rounded-lg accent-bg text-black font-black text-xs uppercase w-max mb-2">Barbearia Tradicional</span>
            <h3 class="text-xl font-bold text-white font-heading">{{BUSINESS_NAME}}</h3>
            <p class="text-xs text-zinc-300">{{ADDRESS}}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-5 relative aspect-square rounded-2xl overflow-hidden border border-white/[0.1]">
        <img src="{{HERO_IMG}}" alt="Sobre {{BUSINESS_NAME}}" class="w-full h-full object-cover" onerror="this.style.display='none'">
      </div>

      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider accent-color">
          <span>NOSSA HISTÓRIA</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight font-heading">
          Tradição, Precisão & Cuidado em Cada Detalhe
        </h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>

        <div class="pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl accent-bg text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg">
            <i class="fab fa-whatsapp"></i>
            <span>Agende pelo WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <section id="servicos" class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
      <div class="text-center space-y-3 max-w-2xl mx-auto">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">CARDÁPIO DE SERVIÇOS</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-heading">{{SERVICES_TITLE}}</h2>
        <p class="text-xs text-zinc-400">Atendimento de primeira linha com produtos premium e mestres barbeiros experientes.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="galeria" class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span class="text-xs uppercase font-extrabold tracking-widest accent-color">PORTFÓLIO VISUAL</span>
          <h2 class="text-3xl font-black text-white font-heading">Galeria de Estilo & Transformações</h2>
        </div>
        <p class="text-xs text-zinc-400 max-w-md">{{GALLERY_SUBTITLE}}</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">OPINIÕES DE CLIENTES</span>
        <h2 class="text-3xl font-black text-white font-heading">O que Nossos Clientes Dizem</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

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


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "barbearia-barberon-moderno": `<!DOCTYPE html>
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
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Syne:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Montserrat', sans-serif;
      background-color: var(--bg, #090d16);
      color: var(--text, #f8fafc);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Syne', sans-serif;
      letter-spacing: -0.5px;
    }
    .accent-bg { background-color: var(--primary, #84cc16); }
    .accent-color { color: var(--primary, #84cc16); }
    .surface-card { background-color: var(--surface, #0f172a); }
    .neon-border { border: 1px solid rgba(132, 204, 22, 0.4); box-shadow: 0 0 15px rgba(132, 204, 22, 0.15); }
    .neon-glow { text-shadow: 0 0 20px rgba(132, 204, 22, 0.6); }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <div class="bg-black border-b border-white/[0.08] overflow-hidden py-2 whitespace-nowrap text-[10px] font-mono tracking-widest uppercase text-zinc-400">
    <div class="inline-block animate-marquee">
      ⚡ {{MARQUEE_TEXT}} ⚡
    </div>
  </div>

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/95 border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl accent-bg flex items-center justify-center font-black text-black text-lg shadow-[0_0_20px_rgba(132,204,22,0.4)]">
          {{INITIALS}}
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-black tracking-tight text-white font-heading uppercase">{{HEADER_NAME}}</span>
          <span class="text-[9px] uppercase font-mono font-bold tracking-widest accent-color">URBAN BARBER EXPERIENCE</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-300">
        <a href="#servicos" class="hover:accent-color transition">Serviços VIP</a>
        <a href="#sobre" class="hover:accent-color transition">{{NAV_ABOUT}}</a>
        <a href="#galeria" class="hover:accent-color transition">Transformações</a>
        <a href="#depoimentos" class="hover:accent-color transition">Reviews</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp text-sm"></i>
          <span>{{HEADER_CTA}}</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-10 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-[#84cc16]/30 bg-[#84cc16]/10 text-[#a3e635]">
          <span class="w-2 h-2 rounded-full bg-[#84cc16] animate-ping"></span>
          <span>{{NICHE_LABEL}}</span>
        </div>

        <h1 class="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none font-heading uppercase">
          Eleve Seu Estilo ao <span class="accent-color neon-glow">Nível Máximo</span>
        </h1>

        <p class="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
          {{DESCRIPTION}}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_25px_rgba(132,204,22,0.4)] transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-xl"></i>
            <span>{{PRIMARY_CTA}}</span>
          </a>
          <a href="#servicos" class="px-6 py-4 rounded-xl border border-white/[0.15] hover:border-white/40 text-white font-bold text-xs uppercase tracking-wider text-center transition">
            Conhecer Serviços
          </a>
        </div>
      </div>

      <div class="lg:col-span-5">
        <div class="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl surface-card aspect-square group neon-border">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
          <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-6">
            <span class="px-2.5 py-1 rounded-md bg-[#84cc16] text-black font-black text-[10px] uppercase w-max mb-2">{{CARD_BADGE}}</span>
            <h3 class="text-2xl font-black text-white font-heading">{{BUSINESS_NAME}}</h3>
            <p class="text-xs text-zinc-300">{{ADDRESS}}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="servicos" class="py-16 border-t border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span class="text-xs uppercase font-mono font-bold tracking-widest accent-color">TABELA DE SERVIÇOS</span>
          <h2 class="text-3xl sm:text-4xl font-black text-white font-heading uppercase">Cortes & Tratamentos</h2>
        </div>
        <p class="text-xs text-zinc-400 max-w-sm">Técnicas modernas de corte na tesoura e máquina, pigmentação e barboterapia.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.08] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-7 space-y-6">
        <span class="text-xs uppercase font-mono font-bold tracking-widest accent-color">{{NAV_ABOUT_UPPER}}</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-heading uppercase">O Seu Refúgio de Estilo & Conforto</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>
        <div class="pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl accent-bg text-black font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition">
            <i class="fab fa-whatsapp text-base"></i>
            <span>Falar Diretamente no WhatsApp</span>
          </a>
        </div>
      </div>

      <div class="lg:col-span-5 grid grid-cols-2 gap-3">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-mono font-bold tracking-widest accent-color">EXPERIÊNCIA DOS CLIENTES</span>
        <h2 class="text-3xl font-black text-white font-heading uppercase">Avaliações 5 Estrelas</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

  <footer class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg accent-bg flex items-center justify-center font-black text-black text-xs">
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


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "estetica-pureglow-spa": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Clínica de Estética & SPA</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg, #110e14);
      color: var(--text, #faf5f0);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Cormorant Garamond', serif;
    }
    .accent-bg { background-color: var(--primary, #d4af37); }
    .accent-color { color: var(--primary, #d4af37); }
    .surface-card { background-color: var(--surface, #1a1622); }
    .spa-shadow { box-shadow: 0 10px 30px rgba(212, 175, 55, 0.15); }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <div class="bg-black/50 border-b border-white/[0.06] text-xs py-2 px-4 hidden sm:block">
    <div class="max-w-7xl mx-auto flex items-center justify-between text-zinc-300">
      <span class="flex items-center gap-2"><i class="fas fa-sparkles accent-color"></i> Atendimento com Hora Marcada & Consultoria Estética Personalizada</span>
      <div class="flex items-center gap-4">
        <span><i class="far fa-clock"></i> {{HOURS}}</span>
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="accent-color font-bold hover:underline">
          <i class="fab fa-whatsapp"></i> {{PHONE}}
        </a>
      </div>
    </div>
  </div>

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/90 border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full accent-bg flex items-center justify-center font-bold text-black text-lg shadow-md">
          <i class="fas fa-spa"></i>
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-bold tracking-tight text-white font-heading">{{HEADER_NAME}}</span>
          <span class="text-[10px] uppercase font-bold tracking-widest accent-color">ESTÉTICA & BEM-ESTAR</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
        <a href="#rituais" class="hover:text-white transition">Procedimentos & Rituais</a>
        <a href="#sobre" class="hover:text-white transition">A Clínica</a>
        <a href="#galeria" class="hover:text-white transition">Ambiente & Resultados</a>
        <a href="#depoimentos" class="hover:text-white transition">Depoimentos</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-full accent-bg text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp"></i>
          <span>Agendar Avaliação</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-12 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-white/[0.1] surface-card">
          <span class="w-2 h-2 rounded-full accent-bg"></span>
          <span class="accent-color">CUIDADO HUMANIZADO & TECNOLOGIA AVANÇADA</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-tight font-heading">
          Realce Sua Beleza Natural com <span class="accent-color italic">Tratamentos Exclusivos</span>
        </h1>

        <p class="text-base text-zinc-300 leading-relaxed max-w-xl">
          {{DESCRIPTION}}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-full accent-bg text-black font-bold text-sm uppercase tracking-wider hover:brightness-110 shadow-xl transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-lg"></i>
            <span>{{PRIMARY_CTA}}</span>
          </a>
          <a href="#rituais" class="px-6 py-4 rounded-full border border-white/[0.15] hover:border-white/40 text-white font-medium text-sm text-center transition">
            Conhecer Procedimentos
          </a>
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <div class="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl surface-card aspect-[4/5] spa-shadow group">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
        </div>
      </div>
    </div>
  </section>

  <section id="rituais" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2 max-w-2xl mx-auto">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">TRATAMENTOS AVANÇADOS</span>
        <h2 class="text-3xl sm:text-4xl font-normal text-white font-heading">Rituais Faciais & Corporais</h2>
        <p class="text-xs text-zinc-400">Protocolos exclusivos desenhados para a sua saúde e rejuvenescimento.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6 space-y-6">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">A CLÍNICA</span>
        <h2 class="text-3xl sm:text-4xl font-normal text-white font-heading">Um Espaço Planejado para o Seu Relaxamento</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>
      </div>

      <div class="lg:col-span-6 grid grid-cols-2 gap-4">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">DEPOIMENTOS</span>
        <h2 class="text-3xl font-normal text-white font-heading">A Opinião das Nossas Pacientes</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

  <footer class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
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


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "restaurante-foores-gourmet": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Alta Gastronomia & Cozinha Autêntica</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg, #141113);
      color: var(--text, #fdfbf7);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Playfair Display', serif;
    }
    .accent-bg { background-color: var(--primary, #c59b27); }
    .accent-color { color: var(--primary, #c59b27); }
    .surface-card { background-color: var(--surface, #1f1a1e); }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <div class="bg-black/70 border-b border-white/[0.08] text-xs py-2 px-4 hidden sm:block">
    <div class="max-w-7xl mx-auto flex items-center justify-between text-zinc-300">
      <span class="flex items-center gap-2"><i class="fas fa-utensils accent-color"></i> Reservas para Almoço, Jantar e Comemorações Especiais</span>
      <div class="flex items-center gap-4">
        <span><i class="far fa-clock"></i> {{HOURS}}</span>
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="accent-color font-bold hover:underline">
          <i class="fab fa-whatsapp"></i> Reservar Mesa
        </a>
      </div>
    </div>
  </div>

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/90 border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl accent-bg flex items-center justify-center font-black text-black text-lg shadow-lg">
          <i class="fas fa-wine-glass-alt"></i>
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-bold tracking-tight text-white font-heading">{{HEADER_NAME}}</span>
          <span class="text-[10px] uppercase font-bold tracking-widest accent-color">ALTA GASTRONOMIA</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
        <a href="#cardapio" class="hover:text-white transition">Cardápio do Chef</a>
        <a href="#sobre" class="hover:text-white transition">A Nossa Casa</a>
        <a href="#galeria" class="hover:text-white transition">Pratos & Ambiente</a>
        <a href="#depoimentos" class="hover:text-white transition">Avaliações</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp"></i>
          <span>Pedir Delivery / Reservar</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-12 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-white/[0.1] surface-card">
          <span class="w-2 h-2 rounded-full accent-bg animate-pulse"></span>
          <span class="accent-color">INGREDIENTES FRESCOS & RECEITAS AUTORAIS</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight font-heading">
          Uma Experiência Gastronômica <span class="accent-color italic">Memorável</span>
        </h1>

        <p class="text-base text-zinc-300 leading-relaxed max-w-xl">
          {{DESCRIPTION}}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-xl transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-xl"></i>
            <span>{{PRIMARY_CTA}}</span>
          </a>
          <a href="#cardapio" class="px-6 py-4 rounded-xl border border-white/[0.15] hover:border-white/40 text-white font-bold text-sm text-center transition">
            Ver Cardápio Completo
          </a>
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <div class="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl surface-card aspect-[4/3] group">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
        </div>
      </div>
    </div>
  </section>

  <section id="cardapio" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2 max-w-2xl mx-auto">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">SELEÇÃO DO CHEF</span>
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-heading">Pratos Assinatura & Destaques</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6 space-y-6">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">TRADIÇÃO & AMOR À COZINHA</span>
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-heading">Onde Cada Ingrediente Conta uma História</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>
      </div>

      <div class="lg:col-span-6 grid grid-cols-2 gap-4">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">AVALIAÇÕES REAIS</span>
        <h2 class="text-3xl font-bold text-white font-heading">A Palavra de Quem Já Saboreou</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

  <footer class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
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


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "odontologia-dentia-clinica": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Odontologia Digital & Estética do Sorriso</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg, #0b1320);
      color: var(--text, #f8fafc);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .accent-bg { background-color: var(--primary, #06b6d4); }
    .accent-color { color: var(--primary, #06b6d4); }
    .surface-card { background-color: var(--surface, #111d33); }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <div class="bg-black/50 border-b border-white/[0.08] text-xs py-2 px-4 hidden sm:block">
    <div class="max-w-7xl mx-auto flex items-center justify-between text-zinc-300">
      <span class="flex items-center gap-2"><i class="fas fa-tooth accent-color"></i> Atendimento Odontológico Completo & Plantão de Urgência</span>
      <div class="flex items-center gap-4">
        <span><i class="far fa-clock"></i> {{HOURS}}</span>
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="accent-color font-bold hover:underline">
          <i class="fab fa-whatsapp"></i> {{PHONE}}
        </a>
      </div>
    </div>
  </div>

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/90 border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl accent-bg flex items-center justify-center font-black text-black text-lg shadow-lg">
          <i class="fas fa-tooth"></i>
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-bold tracking-tight text-white font-heading">{{HEADER_NAME}}</span>
          <span class="text-[10px] uppercase font-bold tracking-widest accent-color">CLÍNICA ODONTOLÓGICA</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
        <a href="#tratamentos" class="hover:text-white transition">Tratamentos</a>
        <a href="#sobre" class="hover:text-white transition">A Clínica</a>
        <a href="#galeria" class="hover:text-white transition">Resultados</a>
        <a href="#depoimentos" class="hover:text-white transition">Depoimentos</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp"></i>
          <span>Agendar Avaliação</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-12 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/[0.1] surface-card">
          <span class="w-2 h-2 rounded-full accent-bg animate-pulse"></span>
          <span class="accent-color">ODONTOLOGIA DIGITAL • TRATAMENTOS SEM DOR</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight font-heading">
          Volte a Sorrir com <span class="accent-color">Confiança & Saúde</span>
        </h1>

        <p class="text-base text-zinc-300 leading-relaxed max-w-xl">
          {{DESCRIPTION}}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-xl transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-xl"></i>
            <span>{{PRIMARY_CTA}}</span>
          </a>
          <a href="#tratamentos" class="px-6 py-4 rounded-xl border border-white/[0.15] hover:border-white/40 text-white font-bold text-sm text-center transition">
            Ver Especialidades
          </a>
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <div class="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl surface-card aspect-[4/3] group">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
        </div>
      </div>
    </div>
  </section>

  <section id="tratamentos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2 max-w-2xl mx-auto">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">NOSSAS ESPECIALIDADES</span>
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-heading">Tratamentos Modernos & Eficazes</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6 space-y-6">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">ESTRUTURA DE PONTA</span>
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-heading">Tecnologia, Conforto e Cuidado com Seu Sorriso</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>
      </div>

      <div class="lg:col-span-6 grid grid-cols-2 gap-4">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">SATISFAÇÃO GARANTIDA</span>
        <h2 class="text-3xl font-bold text-white font-heading">Sorrisos Transformados</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

  <footer class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
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


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "serralheria-welbim-soldagem": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Serralheria, Estruturas Metálicas & Soldagem</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg, #18181b);
      color: var(--text, #f4f4f5);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Oswald', sans-serif;
      letter-spacing: 0.5px;
    }
    .accent-bg { background-color: var(--primary, #f97316); }
    .accent-color { color: var(--primary, #f97316); }
    .surface-card { background-color: var(--surface, #27272a); }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <div class="bg-black/60 border-b border-white/[0.08] text-xs py-2 px-4 hidden sm:block">
    <div class="max-w-7xl mx-auto flex items-center justify-between text-zinc-300">
      <span class="flex items-center gap-2"><i class="fas fa-hammer accent-color"></i> Fabricação Sob Medida, Portões Automáticos & Coberturas Metálicas</span>
      <div class="flex items-center gap-4">
        <span><i class="far fa-clock"></i> {{HOURS}}</span>
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="accent-color font-bold hover:underline">
          <i class="fab fa-whatsapp"></i> {{PHONE}}
        </a>
      </div>
    </div>
  </div>

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/95 border-b border-white/[0.1]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl accent-bg flex items-center justify-center font-black text-black text-lg shadow-lg">
          <i class="fas fa-industry"></i>
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-bold tracking-tight text-white font-heading uppercase">{{HEADER_NAME}}</span>
          <span class="text-[10px] uppercase font-bold tracking-widest accent-color">SERRALHERIA & ESTRUTURAS</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-300">
        <a href="#servicos" class="hover:text-white transition">Serviços</a>
        <a href="#sobre" class="hover:text-white transition">A Oficina</a>
        <a href="#galeria" class="hover:text-white transition">Obras Realizadas</a>
        <a href="#depoimentos" class="hover:text-white transition">Clientes</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp"></i>
          <span>Orçamento Rápido</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-12 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/[0.1] surface-card">
          <span class="w-2 h-2 rounded-full accent-bg animate-pulse"></span>
          <span class="accent-color">AÇO GALVANIZADO & SOLDA PROFISSIONAL DE ALTA RESISTÊNCIA</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight font-heading uppercase">
          Estruturas de Aço com <span class="accent-color">Máxima Precisão</span>
        </h1>

        <p class="text-base text-zinc-300 leading-relaxed max-w-xl">
          {{DESCRIPTION}}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-xl transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-xl"></i>
            <span>{{PRIMARY_CTA}}</span>
          </a>
          <a href="#servicos" class="px-6 py-4 rounded-xl border border-white/[0.15] hover:border-white/40 text-white font-bold text-sm text-center transition">
            Ver Todos os Serviços
          </a>
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <div class="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl surface-card aspect-[4/3] group">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
        </div>
      </div>
    </div>
  </section>

  <section id="servicos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2 max-w-2xl mx-auto">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">SOLUÇÕES EM METAL</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-heading uppercase">Serviços de Serralheria & Solda</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6 space-y-6">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">TRADIÇÃO & QUALIDADE</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-heading uppercase">Segurança e Durabilidade que Duram Décadas</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>
      </div>

      <div class="lg:col-span-6 grid grid-cols-2 gap-4">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">AVALIAÇÕES</span>
        <h2 class="text-3xl font-black text-white font-heading uppercase">O que Nossos Clientes Falam</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

  <footer class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <span class="font-bold text-white font-heading uppercase">{{BUSINESS_NAME}}</span>
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


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "studio-minimal": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Estúdio de Design & Criação</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg, #050505);
      color: var(--text, #f4f4f5);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Cinzel', serif;
      letter-spacing: 1px;
    }
    .accent-bg { background-color: var(--primary, #ffffff); }
    .accent-color { color: var(--primary, #ffffff); }
    .surface-card { background-color: var(--surface, #111111); }
    .minimal-border { border: 1px solid rgba(255, 255, 255, 0.12); }
  </style>
</head>
<body class="antialiased selection:bg-white selection:text-black">

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/95 border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <span class="text-xl font-bold tracking-widest text-white font-heading uppercase">{{HEADER_NAME}}</span>
      </a>

      <nav class="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-medium text-zinc-400">
        <a href="#servicos" class="hover:text-white transition">Serviços</a>
        <a href="#sobre" class="hover:text-white transition">Manifesto</a>
        <a href="#galeria" class="hover:text-white transition">Obras</a>
        <a href="#depoimentos" class="hover:text-white transition">Clientes</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2 rounded-full border border-white hover:bg-white hover:text-black text-white font-semibold text-xs uppercase tracking-wider transition">
          Falar Conosco
        </a>
      </div>
    </div>
  </header>

  <section class="pt-24 pb-20 px-6 max-w-7xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-8 space-y-8">
        <span class="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">ESTÚDIO AUTORAL & EXCLUSIVO</span>
        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight font-heading uppercase">
          {{HERO_TITLE}}
        </h1>
        <p class="text-sm sm:text-base text-zinc-400 max-w-xl font-light leading-relaxed">
          {{HERO_SUBTITLE}}
        </p>
        <div class="pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition shadow-2xl">
            <span>Iniciar Projeto no WhatsApp</span>
            <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>

      <div class="lg:col-span-4">
        <div class="aspect-[3/4] rounded-2xl overflow-hidden minimal-border">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-700" onerror="this.style.display='none'">
        </div>
      </div>
    </div>
  </section>

  <section id="servicos" class="py-20 border-t border-white/[0.08] px-6 max-w-7xl mx-auto space-y-12">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <span class="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">SERVIÇOS DE DESIGN</span>
        <h2 class="text-3xl font-bold text-white font-heading uppercase">Práticas & Soluções</h2>
      </div>
      <p class="text-xs text-zinc-500 max-w-xs">Execução precisa com foco em minimalismo, requinte e funcionalidade.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {{SERVICES_CARDS}}
    </div>
  </section>

  <section id="sobre" class="py-20 border-t border-white/[0.08] surface-card px-6">
    <div class="max-w-5xl mx-auto space-y-8 text-center">
      <span class="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">MANIFESTO</span>
      <h2 class="text-3xl sm:text-4xl font-bold text-white font-heading uppercase leading-snug">Menos Excesso, Mais Significado</h2>
      <p class="text-sm text-zinc-300 font-light leading-relaxed max-w-2xl mx-auto">{{ABOUT_TEXT}}</p>
    </div>
  </section>

  <section id="galeria" class="py-20 border-t border-white/[0.08] px-6 max-w-7xl mx-auto space-y-10">
    <div class="text-center space-y-2">
      <span class="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">PORTFÓLIO VISUAL</span>
      <h2 class="text-3xl font-bold text-white font-heading uppercase">Obras Selecionadas</h2>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {{GALLERY_GRID}}
    </div>
  </section>

  <section id="depoimentos" class="py-20 border-t border-white/[0.08] px-6 max-w-7xl mx-auto space-y-10">
    <div class="text-center space-y-2">
      <h2 class="text-3xl font-bold text-white font-heading uppercase">Palavra dos Clientes</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {{REVIEWS_CARDS}}
    </div>
  </section>

  <footer class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-500 px-6">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <span class="font-bold text-white font-heading uppercase tracking-widest">{{BUSINESS_NAME}}</span>
      <p>{{ADDRESS}}</p>
      <div class="flex items-center gap-4">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="text-white hover:underline">WhatsApp</a>
        <span>•</span>
        <span>© {{YEAR}} Todos os direitos reservados.</span>
      </div>
    </div>
  </footer>


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "medico-medicalguide-clinica": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Medicina Integrada & Consultas com Especialistas</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg, #0b1320);
      color: var(--text, #f8fafc);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .accent-bg { background-color: var(--primary, #06b6d4); }
    .accent-color { color: var(--primary, #06b6d4); }
    .surface-card { background-color: var(--surface, #111d33); }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <div class="bg-black/50 border-b border-white/[0.08] text-xs py-2 px-4 hidden sm:block">
    <div class="max-w-7xl mx-auto flex items-center justify-between text-zinc-300">
      <span class="flex items-center gap-2"><i class="fas fa-user-md accent-color"></i> Atendimento Odontológico Completo & Plantão de Urgência</span>
      <div class="flex items-center gap-4">
        <span><i class="far fa-clock"></i> {{HOURS}}</span>
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="accent-color font-bold hover:underline">
          <i class="fab fa-whatsapp"></i> {{PHONE}}
        </a>
      </div>
    </div>
  </div>

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/90 border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl accent-bg flex items-center justify-center font-black text-black text-lg shadow-lg">
          <i class="fas fa-user-md"></i>
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-bold tracking-tight text-white font-heading">{{HEADER_NAME}}</span>
          <span class="text-[10px] uppercase font-bold tracking-widest accent-color">CENTRO MÉDICO & DIAGNÓSTICO</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
        <a href="#tratamentos" class="hover:text-white transition">Tratamentos</a>
        <a href="#sobre" class="hover:text-white transition">A Clínica</a>
        <a href="#galeria" class="hover:text-white transition">Resultados</a>
        <a href="#depoimentos" class="hover:text-white transition">Depoimentos</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp"></i>
          <span>Agendar Avaliação</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-12 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/[0.1] surface-card">
          <span class="w-2 h-2 rounded-full accent-bg animate-pulse"></span>
          <span class="accent-color">ODONTOLOGIA DIGITAL • TRATAMENTOS SEM DOR</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight font-heading">
          Volte a Sorrir com <span class="accent-color">Confiança & Saúde</span>
        </h1>

        <p class="text-base text-zinc-300 leading-relaxed max-w-xl">
          {{DESCRIPTION}}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-xl transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-xl"></i>
            <span>{{PRIMARY_CTA}}</span>
          </a>
          <a href="#tratamentos" class="px-6 py-4 rounded-xl border border-white/[0.15] hover:border-white/40 text-white font-bold text-sm text-center transition">
            Ver Especialidades
          </a>
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <div class="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl surface-card aspect-[4/3] group">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
        </div>
      </div>
    </div>
  </section>

  <section id="tratamentos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2 max-w-2xl mx-auto">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">NOSSAS ESPECIALIDADES</span>
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-heading">Tratamentos Modernos & Eficazes</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6 space-y-6">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">ESTRUTURA DE PONTA</span>
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-heading">Tecnologia, Conforto e Cuidado com Seu Sorriso</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>
      </div>

      <div class="lg:col-span-6 grid grid-cols-2 gap-4">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">SATISFAÇÃO GARANTIDA</span>
        <h2 class="text-3xl font-bold text-white font-heading">Sorrisos Transformados</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

  <footer class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
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


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "bistro-granny-cafe": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Alta Gastronomia & Cozinha Autêntica</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg, #141113);
      color: var(--text, #fdfbf7);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Playfair Display', serif;
    }
    .accent-bg { background-color: var(--primary, #c59b27); }
    .accent-color { color: var(--primary, #c59b27); }
    .surface-card { background-color: var(--surface, #1f1a1e); }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <div class="bg-black/70 border-b border-white/[0.08] text-xs py-2 px-4 hidden sm:block">
    <div class="max-w-7xl mx-auto flex items-center justify-between text-zinc-300">
      <span class="flex items-center gap-2"><i class="fas fa-utensils accent-color"></i> Reservas para Almoço, Jantar e Comemorações Especiais</span>
      <div class="flex items-center gap-4">
        <span><i class="far fa-clock"></i> {{HOURS}}</span>
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="accent-color font-bold hover:underline">
          <i class="fab fa-whatsapp"></i> Reservar Mesa
        </a>
      </div>
    </div>
  </div>

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/90 border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl accent-bg flex items-center justify-center font-black text-black text-lg shadow-lg">
          <i class="fas fa-wine-glass-alt"></i>
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-bold tracking-tight text-white font-heading">{{HEADER_NAME}}</span>
          <span class="text-[10px] uppercase font-bold tracking-widest accent-color">BISTRÔ ARTESANAL & CAFÉ</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
        <a href="#cardapio" class="hover:text-white transition">Cardápio do Chef</a>
        <a href="#sobre" class="hover:text-white transition">A Nossa Casa</a>
        <a href="#galeria" class="hover:text-white transition">Pratos & Ambiente</a>
        <a href="#depoimentos" class="hover:text-white transition">Avaliações</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp"></i>
          <span>Pedir Delivery / Reservar</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-12 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-white/[0.1] surface-card">
          <span class="w-2 h-2 rounded-full accent-bg animate-pulse"></span>
          <span class="accent-color">INGREDIENTES FRESCOS & RECEITAS AUTORAIS</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight font-heading">
          O Aconchego do Pão Quentinho & Café Especial <span class="accent-color italic">Memorável</span>
        </h1>

        <p class="text-base text-zinc-300 leading-relaxed max-w-xl">
          {{DESCRIPTION}}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-xl transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-xl"></i>
            <span>{{PRIMARY_CTA}}</span>
          </a>
          <a href="#cardapio" class="px-6 py-4 rounded-xl border border-white/[0.15] hover:border-white/40 text-white font-bold text-sm text-center transition">
            Ver Cardápio Completo
          </a>
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <div class="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl surface-card aspect-[4/3] group">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
        </div>
      </div>
    </div>
  </section>

  <section id="cardapio" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2 max-w-2xl mx-auto">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">SELEÇÃO DO CHEF</span>
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-heading">Pratos Assinatura & Destaques</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6 space-y-6">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">TRADIÇÃO & AMOR À COZINHA</span>
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-heading">Onde Cada Ingrediente Conta uma História</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>
      </div>

      <div class="lg:col-span-6 grid grid-cols-2 gap-4">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">AVALIAÇÕES REAIS</span>
        <h2 class="text-3xl font-bold text-white font-heading">A Palavra de Quem Já Saboreou</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

  <footer class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
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


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "cafezone-coffee-shop": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Alta Gastronomia & Cozinha Autêntica</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg, #141113);
      color: var(--text, #fdfbf7);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Playfair Display', serif;
    }
    .accent-bg { background-color: var(--primary, #c59b27); }
    .accent-color { color: var(--primary, #c59b27); }
    .surface-card { background-color: var(--surface, #1f1a1e); }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <div class="bg-black/70 border-b border-white/[0.08] text-xs py-2 px-4 hidden sm:block">
    <div class="max-w-7xl mx-auto flex items-center justify-between text-zinc-300">
      <span class="flex items-center gap-2"><i class="fas fa-utensils accent-color"></i> Reservas para Almoço, Jantar e Comemorações Especiais</span>
      <div class="flex items-center gap-4">
        <span><i class="far fa-clock"></i> {{HOURS}}</span>
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="accent-color font-bold hover:underline">
          <i class="fab fa-whatsapp"></i> Reservar Mesa
        </a>
      </div>
    </div>
  </div>

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/90 border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl accent-bg flex items-center justify-center font-black text-black text-lg shadow-lg">
          <i class="fas fa-wine-glass-alt"></i>
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-bold tracking-tight text-white font-heading">{{HEADER_NAME}}</span>
          <span class="text-[10px] uppercase font-bold tracking-widest accent-color">CAFETERIA ESPECIAL & MICRO-TORREFAÇÃO</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
        <a href="#cardapio" class="hover:text-white transition">Cardápio do Chef</a>
        <a href="#sobre" class="hover:text-white transition">A Nossa Casa</a>
        <a href="#galeria" class="hover:text-white transition">Pratos & Ambiente</a>
        <a href="#depoimentos" class="hover:text-white transition">Avaliações</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp"></i>
          <span>Pedir Delivery / Reservar</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-12 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-white/[0.1] surface-card">
          <span class="w-2 h-2 rounded-full accent-bg animate-pulse"></span>
          <span class="accent-color">INGREDIENTES FRESCOS & RECEITAS AUTORAIS</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight font-heading">
          Grãos Selecionados e Moídos na Hora <span class="accent-color italic">Memorável</span>
        </h1>

        <p class="text-base text-zinc-300 leading-relaxed max-w-xl">
          {{DESCRIPTION}}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-xl transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-xl"></i>
            <span>{{PRIMARY_CTA}}</span>
          </a>
          <a href="#cardapio" class="px-6 py-4 rounded-xl border border-white/[0.15] hover:border-white/40 text-white font-bold text-sm text-center transition">
            Ver Cardápio Completo
          </a>
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <div class="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl surface-card aspect-[4/3] group">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
        </div>
      </div>
    </div>
  </section>

  <section id="cardapio" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2 max-w-2xl mx-auto">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">SELEÇÃO DO CHEF</span>
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-heading">Pratos Assinatura & Destaques</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6 space-y-6">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">TRADIÇÃO & AMOR À COZINHA</span>
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-heading">Onde Cada Ingrediente Conta uma História</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>
      </div>

      <div class="lg:col-span-6 grid grid-cols-2 gap-4">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">AVALIAÇÕES REAIS</span>
        <h2 class="text-3xl font-bold text-white font-heading">A Palavra de Quem Já Saboreou</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

  <footer class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
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


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "bar-oldstory-whiskey": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Whiskey Bar & Speakeasy</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg, #0d0d0d);
      color: var(--text, #f5f5f4);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Playfair Display', serif;
    }
    .accent-bg { background-color: var(--primary, #d97706); }
    .accent-color { color: var(--primary, #d97706); }
    .surface-card { background-color: var(--surface, #161412); }
    .crop-border { border: 1px solid rgba(217, 119, 6, 0.3); }
    .price-line { display: flex; align-items: baseline; justify-content: space-between; }
    .price-line .dots { flex: 1; border-bottom: 1px dotted rgba(255,255,255,0.25); margin: 0 10px; }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/90 border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl accent-bg flex items-center justify-center font-black text-black text-lg shadow-lg">
          {{INITIALS}}
        </div>
        <div class="flex flex-col">
          <span class="text-lg font-black tracking-tight text-white font-heading">{{HEADER_NAME}}</span>
          <span class="text-[10px] uppercase font-bold tracking-widest accent-color">DRINKS CLÁSSICOS & SINGLE MALTS</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-300">
        <a href="#sobre" class="hover:text-white transition">{{NAV_ABOUT}}</a>
        <a href="#servicos" class="hover:text-white transition">{{NAV_SERVICES}}</a>
        <a href="#galeria" class="hover:text-white transition">Fotos de Cortes</a>
        <a href="#depoimentos" class="hover:text-white transition">Avaliações</a>
        <a href="#contato" class="hover:text-white transition">Localização</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp text-sm"></i>
          <span>Agendar Horário</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-12 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/[0.1] surface-card">
          <span class="w-2 h-2 rounded-full accent-bg animate-pulse"></span>
          <span class="accent-color">{{NICHE_LABEL}}</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight font-heading">
          {{HERO_TITLE}}
        </h1>

        <p class="text-base text-zinc-300 leading-relaxed max-w-xl">
          {{HERO_SUBTITLE}}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-xl transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-xl"></i>
            <span>{{PRIMARY_CTA}}</span>
          </a>
          <a href="#servicos" class="px-6 py-4 rounded-xl border border-white/[0.15] hover:border-white/40 text-white font-bold text-sm text-center transition">
            Ver Tabela de Serviços
          </a>
        </div>

        <div class="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.08]">
          <div>
            <div class="text-2xl font-black accent-color font-heading">100%</div>
            <div class="text-[11px] text-zinc-400">{{METRIC_1_LABEL}}</div>
          </div>
          <div>
            <div class="text-2xl font-black accent-color font-heading">VIP</div>
            <div class="text-[11px] text-zinc-400">{{METRIC_2_LABEL}}</div>
          </div>
          <div>
            <div class="text-2xl font-black accent-color font-heading">5.0 ★</div>
            <div class="text-[11px] text-zinc-400">Google Reviews</div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <div class="relative rounded-3xl overflow-hidden border-2 border-white/[0.1] shadow-2xl surface-card aspect-[4/5] group">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
            <span class="px-3 py-1 rounded-lg accent-bg text-black font-black text-xs uppercase w-max mb-2">Barbearia Tradicional</span>
            <h3 class="text-xl font-bold text-white font-heading">{{BUSINESS_NAME}}</h3>
            <p class="text-xs text-zinc-300">{{ADDRESS}}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-5 relative aspect-square rounded-2xl overflow-hidden border border-white/[0.1]">
        <img src="{{HERO_IMG}}" alt="Sobre {{BUSINESS_NAME}}" class="w-full h-full object-cover" onerror="this.style.display='none'">
      </div>

      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider accent-color">
          <span>NOSSA HISTÓRIA</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight font-heading">
          Tradição, Precisão & Cuidado em Cada Detalhe
        </h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>

        <div class="pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl accent-bg text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg">
            <i class="fab fa-whatsapp"></i>
            <span>Agende pelo WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <section id="servicos" class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
      <div class="text-center space-y-3 max-w-2xl mx-auto">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">CARDÁPIO DE SERVIÇOS</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-heading">Carta de Bebidas & Petiscos Especiais</h2>
        <p class="text-xs text-zinc-400">Atendimento de primeira linha com produtos premium e mestres barbeiros experientes.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="galeria" class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span class="text-xs uppercase font-extrabold tracking-widest accent-color">PORTFÓLIO VISUAL</span>
          <h2 class="text-3xl font-black text-white font-heading">Galeria de Estilo & Transformações</h2>
        </div>
        <p class="text-xs text-zinc-400 max-w-md">{{GALLERY_SUBTITLE}}</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">OPINIÕES DE CLIENTES</span>
        <h2 class="text-3xl font-black text-white font-heading">O que Nossos Clientes Dizem</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

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


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "pub-tavern-irish": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Irish Pub & Cervejaria Artesanal</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg, #18181b);
      color: var(--text, #f4f4f5);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Oswald', sans-serif;
      letter-spacing: 0.5px;
    }
    .accent-bg { background-color: var(--primary, #f97316); }
    .accent-color { color: var(--primary, #f97316); }
    .surface-card { background-color: var(--surface, #27272a); }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <div class="bg-black/60 border-b border-white/[0.08] text-xs py-2 px-4 hidden sm:block">
    <div class="max-w-7xl mx-auto flex items-center justify-between text-zinc-300">
      <span class="flex items-center gap-2"><i class="fas fa-hammer accent-color"></i> Fabricação Sob Medida, Portões Automáticos & Coberturas Metálicas</span>
      <div class="flex items-center gap-4">
        <span><i class="far fa-clock"></i> {{HOURS}}</span>
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="accent-color font-bold hover:underline">
          <i class="fab fa-whatsapp"></i> {{PHONE}}
        </a>
      </div>
    </div>
  </div>

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/95 border-b border-white/[0.1]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl accent-bg flex items-center justify-center font-black text-black text-lg shadow-lg">
          <i class="fas fa-industry"></i>
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-bold tracking-tight text-white font-heading uppercase">{{HEADER_NAME}}</span>
          <span class="text-[10px] uppercase font-bold tracking-widest accent-color">CHOPP NA TORNEIRA & BURGERS</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-300">
        <a href="#servicos" class="hover:text-white transition">Serviços</a>
        <a href="#sobre" class="hover:text-white transition">A Oficina</a>
        <a href="#galeria" class="hover:text-white transition">Obras Realizadas</a>
        <a href="#depoimentos" class="hover:text-white transition">Clientes</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp"></i>
          <span>Orçamento Rápido</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-12 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/[0.1] surface-card">
          <span class="w-2 h-2 rounded-full accent-bg animate-pulse"></span>
          <span class="accent-color">AÇO GALVANIZADO & SOLDA PROFISSIONAL DE ALTA RESISTÊNCIA</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight font-heading uppercase">
          Estruturas de Aço com <span class="accent-color">Máxima Precisão</span>
        </h1>

        <p class="text-base text-zinc-300 leading-relaxed max-w-xl">
          {{DESCRIPTION}}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-xl transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-xl"></i>
            <span>{{PRIMARY_CTA}}</span>
          </a>
          <a href="#servicos" class="px-6 py-4 rounded-xl border border-white/[0.15] hover:border-white/40 text-white font-bold text-sm text-center transition">
            Ver Todos os Serviços
          </a>
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <div class="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl surface-card aspect-[4/3] group">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
        </div>
      </div>
    </div>
  </section>

  <section id="servicos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2 max-w-2xl mx-auto">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">SOLUÇÕES EM METAL</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-heading uppercase">Serviços de Serralheria & Solda</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6 space-y-6">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">TRADIÇÃO & QUALIDADE</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-heading uppercase">Segurança e Durabilidade que Duram Décadas</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>
      </div>

      <div class="lg:col-span-6 grid grid-cols-2 gap-4">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">AVALIAÇÕES</span>
        <h2 class="text-3xl font-black text-white font-heading uppercase">O que Nossos Clientes Falam</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

  <footer class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <span class="font-bold text-white font-heading uppercase">{{BUSINESS_NAME}}</span>
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


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "restaurante-elroyale-cafe": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Alta Gastronomia & Cozinha Autêntica</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg, #141113);
      color: var(--text, #fdfbf7);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Playfair Display', serif;
    }
    .accent-bg { background-color: var(--primary, #c59b27); }
    .accent-color { color: var(--primary, #c59b27); }
    .surface-card { background-color: var(--surface, #1f1a1e); }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <div class="bg-black/70 border-b border-white/[0.08] text-xs py-2 px-4 hidden sm:block">
    <div class="max-w-7xl mx-auto flex items-center justify-between text-zinc-300">
      <span class="flex items-center gap-2"><i class="fas fa-utensils accent-color"></i> Reservas para Almoço, Jantar e Comemorações Especiais</span>
      <div class="flex items-center gap-4">
        <span><i class="far fa-clock"></i> {{HOURS}}</span>
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="accent-color font-bold hover:underline">
          <i class="fab fa-whatsapp"></i> Reservar Mesa
        </a>
      </div>
    </div>
  </div>

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/90 border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl accent-bg flex items-center justify-center font-black text-black text-lg shadow-lg">
          <i class="fas fa-wine-glass-alt"></i>
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-bold tracking-tight text-white font-heading">{{HEADER_NAME}}</span>
          <span class="text-[10px] uppercase font-bold tracking-widest accent-color">FINE DINING & EVENTOS EXCLUSIVOS</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
        <a href="#cardapio" class="hover:text-white transition">Cardápio do Chef</a>
        <a href="#sobre" class="hover:text-white transition">A Nossa Casa</a>
        <a href="#galeria" class="hover:text-white transition">Pratos & Ambiente</a>
        <a href="#depoimentos" class="hover:text-white transition">Avaliações</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp"></i>
          <span>Pedir Delivery / Reservar</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-12 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-white/[0.1] surface-card">
          <span class="w-2 h-2 rounded-full accent-bg animate-pulse"></span>
          <span class="accent-color">INGREDIENTES FRESCOS & RECEITAS AUTORAIS</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight font-heading">
          Uma Experiência Gastronômica <span class="accent-color italic">Memorável</span>
        </h1>

        <p class="text-base text-zinc-300 leading-relaxed max-w-xl">
          {{DESCRIPTION}}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-xl transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-xl"></i>
            <span>{{PRIMARY_CTA}}</span>
          </a>
          <a href="#cardapio" class="px-6 py-4 rounded-xl border border-white/[0.15] hover:border-white/40 text-white font-bold text-sm text-center transition">
            Ver Cardápio Completo
          </a>
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <div class="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl surface-card aspect-[4/3] group">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
        </div>
      </div>
    </div>
  </section>

  <section id="cardapio" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2 max-w-2xl mx-auto">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">SELEÇÃO DO CHEF</span>
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-heading">Pratos Assinatura & Destaques</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6 space-y-6">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">TRADIÇÃO & AMOR À COZINHA</span>
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-heading">Onde Cada Ingrediente Conta uma História</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>
      </div>

      <div class="lg:col-span-6 grid grid-cols-2 gap-4">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">AVALIAÇÕES REAIS</span>
        <h2 class="text-3xl font-bold text-white font-heading">A Palavra de Quem Já Saboreou</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

  <footer class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
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


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "restaurante-sumi-culinaria": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Sushi Bar & Cozinha Oriental Contemporânea</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Syne:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Montserrat', sans-serif;
      background-color: var(--bg, #090d16);
      color: var(--text, #f8fafc);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Syne', sans-serif;
      letter-spacing: -0.5px;
    }
    .accent-bg { background-color: var(--primary, #84cc16); }
    .accent-color { color: var(--primary, #84cc16); }
    .surface-card { background-color: var(--surface, #0f172a); }
    .neon-border { border: 1px solid rgba(132, 204, 22, 0.4); box-shadow: 0 0 15px rgba(132, 204, 22, 0.15); }
    .neon-glow { text-shadow: 0 0 20px rgba(132, 204, 22, 0.6); }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <div class="bg-black border-b border-white/[0.08] overflow-hidden py-2 whitespace-nowrap text-[10px] font-mono tracking-widest uppercase text-zinc-400">
    <div class="inline-block animate-marquee">
      ⚡ {{MARQUEE_TEXT}} ⚡
    </div>
  </div>

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/95 border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl accent-bg flex items-center justify-center font-black text-black text-lg shadow-[0_0_20px_rgba(132,204,22,0.4)]">
          {{INITIALS}}
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-black tracking-tight text-white font-heading uppercase">{{HEADER_NAME}}</span>
          <span class="text-[9px] uppercase font-mono font-bold tracking-widest accent-color">OMAKASE & GASTRONOMIA ORIENTAL</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-300">
        <a href="#servicos" class="hover:accent-color transition">Serviços VIP</a>
        <a href="#sobre" class="hover:accent-color transition">{{NAV_ABOUT}}</a>
        <a href="#galeria" class="hover:accent-color transition">Transformações</a>
        <a href="#depoimentos" class="hover:accent-color transition">Reviews</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp text-sm"></i>
          <span>{{HEADER_CTA}}</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-10 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-[#84cc16]/30 bg-[#84cc16]/10 text-[#a3e635]">
          <span class="w-2 h-2 rounded-full bg-[#84cc16] animate-ping"></span>
          <span>{{NICHE_LABEL}}</span>
        </div>

        <h1 class="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none font-heading uppercase">
          Eleve Seu Estilo ao <span class="accent-color neon-glow">Nível Máximo</span>
        </h1>

        <p class="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
          {{DESCRIPTION}}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_25px_rgba(132,204,22,0.4)] transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-xl"></i>
            <span>{{PRIMARY_CTA}}</span>
          </a>
          <a href="#servicos" class="px-6 py-4 rounded-xl border border-white/[0.15] hover:border-white/40 text-white font-bold text-xs uppercase tracking-wider text-center transition">
            Conhecer Serviços
          </a>
        </div>
      </div>

      <div class="lg:col-span-5">
        <div class="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl surface-card aspect-square group neon-border">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
          <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-6">
            <span class="px-2.5 py-1 rounded-md bg-[#84cc16] text-black font-black text-[10px] uppercase w-max mb-2">{{CARD_BADGE}}</span>
            <h3 class="text-2xl font-black text-white font-heading">{{BUSINESS_NAME}}</h3>
            <p class="text-xs text-zinc-300">{{ADDRESS}}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="servicos" class="py-16 border-t border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span class="text-xs uppercase font-mono font-bold tracking-widest accent-color">TABELA DE SERVIÇOS</span>
          <h2 class="text-3xl sm:text-4xl font-black text-white font-heading uppercase">Combos de Sushi, Sashimi & Pratos Quentes</h2>
        </div>
        <p class="text-xs text-zinc-400 max-w-sm">Técnicas modernas de corte na tesoura e máquina, pigmentação e barboterapia.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.08] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-7 space-y-6">
        <span class="text-xs uppercase font-mono font-bold tracking-widest accent-color">{{NAV_ABOUT_UPPER}}</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-heading uppercase">O Seu Refúgio de Estilo & Conforto</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>
        <div class="pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl accent-bg text-black font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition">
            <i class="fab fa-whatsapp text-base"></i>
            <span>Falar Diretamente no WhatsApp</span>
          </a>
        </div>
      </div>

      <div class="lg:col-span-5 grid grid-cols-2 gap-3">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-mono font-bold tracking-widest accent-color">EXPERIÊNCIA DOS CLIENTES</span>
        <h2 class="text-3xl font-black text-white font-heading uppercase">Avaliações 5 Estrelas</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

  <footer class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg accent-bg flex items-center justify-center font-black text-black text-xs">
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


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "petshop-petly-veterinaria": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Pet Shop, Banho & Tosa e Clínica Veterinária</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg, #0b1329);
      color: var(--text, #f8fafc);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Oswald', sans-serif;
      letter-spacing: 0.5px;
    }
    .accent-bg { background-color: var(--primary, #f59e0b); }
    .accent-color { color: var(--primary, #f59e0b); }
    .surface-card { background-color: var(--surface, #131f3d); }
    .detran-badge { border-left: 4px solid var(--primary, #f59e0b); }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <div class="bg-black/60 border-b border-white/[0.08] text-xs py-2.5 px-4 hidden sm:block">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-6 text-zinc-300">
        <span class="flex items-center gap-2"><i class="fas fa-id-card accent-color"></i> CFC Credenciado Detran • Alto Índice de Aprovação</span>
        <span class="flex items-center gap-2"><i class="fas fa-map-marker-alt text-zinc-400"></i> {{ADDRESS}}</span>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-zinc-400"><i class="far fa-clock"></i> {{HOURS}}</span>
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="accent-color font-bold hover:underline flex items-center gap-1.5">
          <i class="fab fa-whatsapp"></i> {{PHONE}}
        </a>
      </div>
    </div>
  </div>

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/95 border-b border-white/[0.1]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl accent-bg flex items-center justify-center font-black text-black text-xl shadow-lg">
          <i class="fas fa-paw"></i>
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-bold tracking-tight text-white font-heading uppercase">{{HEADER_NAME}}</span>
          <span class="text-[10px] uppercase font-extrabold tracking-widest accent-color">CUIDADO PET COMPLETO & AMOR</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-300">
        <a href="#sobre" class="hover:accent-color transition">Sobre o CFC</a>
        <a href="#categorias" class="hover:accent-color transition">Categorias CNH</a>
        <a href="#passo-a-passo" class="hover:accent-color transition">Como Funciona</a>
        <a href="#depoimentos" class="hover:accent-color transition">Aprovados</a>
        <a href="#faq" class="hover:accent-color transition">Dúvidas Detran</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp text-base"></i>
          <span>Matricule-se Agora</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-[var(--bg)] via-[#0d1733] to-[var(--bg)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/[0.1] surface-card detran-badge">
          <span class="w-2.5 h-2.5 rounded-full accent-bg animate-pulse"></span>
          <span class="text-white">CONQUISTE SUA CNH DE PRIMEIRA • PARCELAMENTO EM ATÉ 12X</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight font-heading uppercase">
          Aprenda a Dirigir com Confiança e <span class="accent-color">Conquiste sua Habilitação</span>
        </h1>

        <p class="text-base text-zinc-300 leading-relaxed max-w-2xl">
          {{DESCRIPTION}} Veículos modernos com ar-condicionado e direção hidráulica, simulador próprio e instrutores altamente capacitados e pacientes para você ser aprovado sem medo.
        </p>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div class="p-3 rounded-xl surface-card border border-white/[0.08] text-center">
            <i class="fas fa-award accent-color text-xl mb-1"></i>
            <p class="text-xs font-bold text-white uppercase font-heading">Alto Índice</p>
            <p class="text-[10px] text-zinc-400">De Aprovação</p>
          </div>
          <div class="p-3 rounded-xl surface-card border border-white/[0.08] text-center">
            <i class="fas fa-car accent-color text-xl mb-1"></i>
            <p class="text-xs font-bold text-white uppercase font-heading">Frota Nova</p>
            <p class="text-[10px] text-zinc-400">Com Ar e Direção</p>
          </div>
          <div class="p-3 rounded-xl surface-card border border-white/[0.08] text-center">
            <i class="fas fa-user-check accent-color text-xl mb-1"></i>
            <p class="text-xs font-bold text-white uppercase font-heading">Instrutores</p>
            <p class="text-[10px] text-zinc-400">Pacientes e VIP</p>
          </div>
          <div class="p-3 rounded-xl surface-card border border-white/[0.08] text-center">
            <i class="fas fa-credit-card accent-color text-xl mb-1"></i>
            <p class="text-xs font-bold text-white uppercase font-heading">Em até 12x</p>
            <p class="text-[10px] text-zinc-400">No Cartão ou Boleto</p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-xl transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-xl"></i>
            <span>Simular Matrícula no WhatsApp</span>
          </a>
          <a href="#passo-a-passo" class="px-6 py-4 rounded-xl border border-white/[0.15] hover:border-white/40 text-white font-bold text-sm text-center transition">
            Ver Passo a Passo Detran
          </a>
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <div class="relative rounded-3xl overflow-hidden border-2 border-white/[0.1] shadow-2xl surface-card aspect-[4/3] group">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}} - Autoescola" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
            <span class="px-3 py-1 rounded-lg accent-bg text-black font-black text-xs uppercase w-max mb-2">CFC Autorizado</span>
            <h3 class="text-xl font-bold text-white font-heading">{{BUSINESS_NAME}}</h3>
            <p class="text-xs text-zinc-300">{{ADDRESS}}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="passo-a-passo" class="py-16 border-t border-white/[0.08] bg-black/40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-3 max-w-2xl mx-auto">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">SIMPLES E DESCOMPLICADO</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-heading uppercase">Nossos Cuidados e Carinho Especial com seu Pet</h2>
        <p class="text-xs text-zinc-400">Acompanhamos você desde o primeiro cadastro até a emissão da sua CNH no Detran.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="p-5 rounded-2xl surface-card border border-white/[0.08] space-y-3 relative">
          <span class="w-8 h-8 rounded-full accent-bg text-black font-black flex items-center justify-center text-sm font-heading">01</span>
          <h4 class="font-bold text-white text-sm font-heading uppercase">Matrícula & Exames</h4>
          <p class="text-xs text-zinc-400 leading-relaxed">Inscrição rápida na autoescola e agendamento dos exames médico e psicotécnico credenciados.</p>
        </div>
        <div class="p-5 rounded-2xl surface-card border border-white/[0.08] space-y-3 relative">
          <span class="w-8 h-8 rounded-full accent-bg text-black font-black flex items-center justify-center text-sm font-heading">02</span>
          <h4 class="font-bold text-white text-sm font-heading uppercase">Curso Teórico</h4>
          <p class="text-xs text-zinc-400 leading-relaxed">45 horas de aulas teóricas com simulados reais do Detran em horários matutinos, noturnos ou EAD.</p>
        </div>
        <div class="p-5 rounded-2xl surface-card border border-white/[0.08] space-y-3 relative">
          <span class="w-8 h-8 rounded-full accent-bg text-black font-black flex items-center justify-center text-sm font-heading">03</span>
          <h4 class="font-bold text-white text-sm font-heading uppercase">Prova Teórica</h4>
          <p class="text-xs text-zinc-400 leading-relaxed">Realização da prova teórica do Detran com suporte total da nossa equipe para aprovação segura.</p>
        </div>
        <div class="p-5 rounded-2xl surface-card border border-white/[0.08] space-y-3 relative">
          <span class="w-8 h-8 rounded-full accent-bg text-black font-black flex items-center justify-center text-sm font-heading">04</span>
          <h4 class="font-bold text-white text-sm font-heading uppercase">Aulas Práticas</h4>
          <p class="text-xs text-zinc-400 leading-relaxed">Treinamento prático nas ruas e na baliza com instrutores pacientes no veículo da sua categoria.</p>
        </div>
        <div class="p-5 rounded-2xl surface-card border border-white/[0.08] space-y-3 relative bg-gradient-to-b from-[#131f3d] to-emerald-950/40">
          <span class="w-8 h-8 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center text-sm font-heading"><i class="fas fa-check"></i></span>
          <h4 class="font-bold text-emerald-400 text-sm font-heading uppercase">Exame & CNH!</h4>
          <p class="text-xs text-zinc-300 leading-relaxed">Exame prático de direção e entrega da sua CNH oficial pronta para dirigir por todo o Brasil!</p>
        </div>
      </div>
    </div>
  </section>

  <section id="categorias" class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span class="text-xs uppercase font-extrabold tracking-widest accent-color">CURSOS E HABILITAÇÕES</span>
          <h2 class="text-3xl sm:text-4xl font-black text-white font-heading uppercase">Banho, Tosa, Vacinas & Consultas</h2>
        </div>
        <p class="text-xs text-zinc-400 max-w-md">Escolha a categoria desejada e fale diretamente com a secretaria para consultar turmas abertas.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.08] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6 space-y-6">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">TRADIÇÃO & SEGURANÇA</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-heading uppercase">Excelência e Respeito ao Futuro Condutor</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>
        
        <div class="space-y-3 pt-2">
          <div class="flex items-center gap-3 text-xs text-zinc-200">
            <i class="fas fa-check-circle text-emerald-400 text-base"></i>
            <span>Pista de treino oficial similar ao trajeto de prova do Detran</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-zinc-200">
            <i class="fas fa-check-circle text-emerald-400 text-base"></i>
            <span>Aulas de direção defensiva e atendimento personalizado para pessoas com medo de dirigir</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-zinc-200">
            <i class="fas fa-check-circle text-emerald-400 text-base"></i>
            <span>Condições de pagamento facilitadas e parcelamento direto com a autoescola</span>
          </div>
        </div>

        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl accent-bg text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition">
          <i class="fab fa-whatsapp text-base"></i>
          <span>Falar com um Consultor de Matrícula</span>
        </a>
      </div>

      <div class="lg:col-span-6 grid grid-cols-2 gap-4">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">DEPOIMENTOS REAIS</span>
        <h2 class="text-3xl font-black text-white font-heading uppercase">O que Dizem Nossos Alunos Aprovados</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

  <section id="faq" class="py-16 border-t border-white/[0.08] surface-card">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-black text-white font-heading uppercase">Dúvidas Frequentes sobre a CNH</h2>
        <p class="text-xs text-zinc-400">Esclarecemos as principais dúvidas sobre o processo de habilitação no Detran.</p>
      </div>

      <div class="space-y-3">
        {{FAQ_CARDS}}
      </div>
    </div>
  </section>

  <footer class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-400">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl accent-bg flex items-center justify-center font-black text-black text-base">
          <i class="fas fa-paw"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-white font-heading uppercase tracking-wide">{{BUSINESS_NAME}}</span>
          <span class="text-[10px] text-zinc-500">CFC Credenciado Detran</span>
        </div>
      </div>

      <div class="text-center md:text-left">
        <p>{{ADDRESS}}</p>
        <p class="text-[11px] text-zinc-500 mt-0.5">Horário: {{HOURS}}</p>
      </div>

      <div class="flex items-center gap-4">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="accent-color font-bold hover:underline">WhatsApp Oficial</a>
        <span>•</span>
        <span>© {{YEAR}} Todos os direitos reservados.</span>
      </div>
    </div>
  </footer>


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "consultoria-financeira-fo": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Odontologia Digital & Estética do Sorriso</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg, #0b1320);
      color: var(--text, #f8fafc);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .accent-bg { background-color: var(--primary, #06b6d4); }
    .accent-color { color: var(--primary, #06b6d4); }
    .surface-card { background-color: var(--surface, #111d33); }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <div class="bg-black/50 border-b border-white/[0.08] text-xs py-2 px-4 hidden sm:block">
    <div class="max-w-7xl mx-auto flex items-center justify-between text-zinc-300">
      <span class="flex items-center gap-2"><i class="fas fa-chart-line accent-color"></i> Atendimento Odontológico Completo & Plantão de Urgência</span>
      <div class="flex items-center gap-4">
        <span><i class="far fa-clock"></i> {{HOURS}}</span>
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="accent-color font-bold hover:underline">
          <i class="fab fa-whatsapp"></i> {{PHONE}}
        </a>
      </div>
    </div>
  </div>

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/90 border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl accent-bg flex items-center justify-center font-black text-black text-lg shadow-lg">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-bold tracking-tight text-white font-heading">{{HEADER_NAME}}</span>
          <span class="text-[10px] uppercase font-bold tracking-widest accent-color">CONSULTORIA EMPRESARIAL & FINANCEIRA</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
        <a href="#tratamentos" class="hover:text-white transition">Tratamentos</a>
        <a href="#sobre" class="hover:text-white transition">A Clínica</a>
        <a href="#galeria" class="hover:text-white transition">Resultados</a>
        <a href="#depoimentos" class="hover:text-white transition">Depoimentos</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp"></i>
          <span>Agendar Avaliação</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-12 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/[0.1] surface-card">
          <span class="w-2 h-2 rounded-full accent-bg animate-pulse"></span>
          <span class="accent-color">ODONTOLOGIA DIGITAL • TRATAMENTOS SEM DOR</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight font-heading">
          Volte a Sorrir com <span class="accent-color">Confiança & Saúde</span>
        </h1>

        <p class="text-base text-zinc-300 leading-relaxed max-w-xl">
          {{DESCRIPTION}}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-xl transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-xl"></i>
            <span>{{PRIMARY_CTA}}</span>
          </a>
          <a href="#tratamentos" class="px-6 py-4 rounded-xl border border-white/[0.15] hover:border-white/40 text-white font-bold text-sm text-center transition">
            Ver Especialidades
          </a>
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <div class="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl surface-card aspect-[4/3] group">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
        </div>
      </div>
    </div>
  </section>

  <section id="tratamentos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2 max-w-2xl mx-auto">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">SOLUÇÕES CORPORATIVAS</span>
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-heading">Tratamentos Modernos & Eficazes</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6 space-y-6">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">ESTRUTURA DE PONTA</span>
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-heading">Tecnologia, Conforto e Cuidado com Seu Sorriso</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>
      </div>

      <div class="lg:col-span-6 grid grid-cols-2 gap-4">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-bold tracking-widest accent-color">SATISFAÇÃO GARANTIDA</span>
        <h2 class="text-3xl font-bold text-white font-heading">Sorrisos Transformados</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

  <footer class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
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


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "commercial-vibrant": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Catálogo Comercial & Ofertas Exclusivas</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Syne:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Montserrat', sans-serif;
      background-color: var(--bg, #090d16);
      color: var(--text, #f8fafc);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Syne', sans-serif;
      letter-spacing: -0.5px;
    }
    .accent-bg { background-color: var(--primary, #84cc16); }
    .accent-color { color: var(--primary, #84cc16); }
    .surface-card { background-color: var(--surface, #0f172a); }
    .neon-border { border: 1px solid rgba(132, 204, 22, 0.4); box-shadow: 0 0 15px rgba(132, 204, 22, 0.15); }
    .neon-glow { text-shadow: 0 0 20px rgba(132, 204, 22, 0.6); }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <div class="bg-black border-b border-white/[0.08] overflow-hidden py-2 whitespace-nowrap text-[10px] font-mono tracking-widest uppercase text-zinc-400">
    <div class="inline-block animate-marquee">
      ⚡ {{MARQUEE_TEXT}} ⚡
    </div>
  </div>

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/95 border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl accent-bg flex items-center justify-center font-black text-black text-lg shadow-[0_0_20px_rgba(132,204,22,0.4)]">
          {{INITIALS}}
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-black tracking-tight text-white font-heading uppercase">{{HEADER_NAME}}</span>
          <span class="text-[9px] uppercase font-mono font-bold tracking-widest accent-color">PRODUTOS SELECIONADOS & PRONTA ENTREGA</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-300">
        <a href="#servicos" class="hover:accent-color transition">Serviços VIP</a>
        <a href="#sobre" class="hover:accent-color transition">{{NAV_ABOUT}}</a>
        <a href="#galeria" class="hover:accent-color transition">Transformações</a>
        <a href="#depoimentos" class="hover:accent-color transition">Reviews</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp text-sm"></i>
          <span>{{HEADER_CTA}}</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-10 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-[#84cc16]/30 bg-[#84cc16]/10 text-[#a3e635]">
          <span class="w-2 h-2 rounded-full bg-[#84cc16] animate-ping"></span>
          <span>{{NICHE_LABEL}}</span>
        </div>

        <h1 class="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none font-heading uppercase">
          Eleve Seu Estilo ao <span class="accent-color neon-glow">Nível Máximo</span>
        </h1>

        <p class="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
          {{DESCRIPTION}}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_25px_rgba(132,204,22,0.4)] transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-xl"></i>
            <span>{{PRIMARY_CTA}}</span>
          </a>
          <a href="#servicos" class="px-6 py-4 rounded-xl border border-white/[0.15] hover:border-white/40 text-white font-bold text-xs uppercase tracking-wider text-center transition">
            Conhecer Serviços
          </a>
        </div>
      </div>

      <div class="lg:col-span-5">
        <div class="relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl surface-card aspect-square group neon-border">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
          <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-6">
            <span class="px-2.5 py-1 rounded-md bg-[#84cc16] text-black font-black text-[10px] uppercase w-max mb-2">{{CARD_BADGE}}</span>
            <h3 class="text-2xl font-black text-white font-heading">{{BUSINESS_NAME}}</h3>
            <p class="text-xs text-zinc-300">{{ADDRESS}}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="servicos" class="py-16 border-t border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span class="text-xs uppercase font-mono font-bold tracking-widest accent-color">TABELA DE SERVIÇOS</span>
          <h2 class="text-3xl sm:text-4xl font-black text-white font-heading uppercase">Catálogo de Produtos & Serviços</h2>
        </div>
        <p class="text-xs text-zinc-400 max-w-sm">Técnicas modernas de corte na tesoura e máquina, pigmentação e barboterapia.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.08] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-7 space-y-6">
        <span class="text-xs uppercase font-mono font-bold tracking-widest accent-color">{{NAV_ABOUT_UPPER}}</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-heading uppercase">O Seu Refúgio de Estilo & Conforto</h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>
        <div class="pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl accent-bg text-black font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition">
            <i class="fab fa-whatsapp text-base"></i>
            <span>Falar Diretamente no WhatsApp</span>
          </a>
        </div>
      </div>

      <div class="lg:col-span-5 grid grid-cols-2 gap-3">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-mono font-bold tracking-widest accent-color">EXPERIÊNCIA DOS CLIENTES</span>
        <h2 class="text-3xl font-black text-white font-heading uppercase">Avaliações 5 Estrelas</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

  <footer class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg accent-bg flex items-center justify-center font-black text-black text-xs">
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


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "portfolio-dark": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Portfólio Profissional & Consultoria Técnica</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg, #050505);
      color: var(--text, #f4f4f5);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Cinzel', serif;
      letter-spacing: 1px;
    }
    .accent-bg { background-color: var(--primary, #ffffff); }
    .accent-color { color: var(--primary, #ffffff); }
    .surface-card { background-color: var(--surface, #111111); }
    .minimal-border { border: 1px solid rgba(255, 255, 255, 0.12); }
  </style>
</head>
<body class="antialiased selection:bg-white selection:text-black">

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/95 border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <span class="text-xl font-bold tracking-widest text-white font-heading uppercase">{{HEADER_NAME}}</span>
      </a>

      <nav class="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-medium text-zinc-400">
        <a href="#servicos" class="hover:text-white transition">Serviços</a>
        <a href="#sobre" class="hover:text-white transition">Manifesto</a>
        <a href="#galeria" class="hover:text-white transition">Obras</a>
        <a href="#depoimentos" class="hover:text-white transition">Clientes</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2 rounded-full border border-white hover:bg-white hover:text-black text-white font-semibold text-xs uppercase tracking-wider transition">
          Falar Conosco
        </a>
      </div>
    </div>
  </header>

  <section class="pt-24 pb-20 px-6 max-w-7xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-8 space-y-8">
        <span class="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">ESTÚDIO AUTORAL & EXCLUSIVO</span>
        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight font-heading uppercase">
          {{HERO_TITLE}}
        </h1>
        <p class="text-sm sm:text-base text-zinc-400 max-w-xl font-light leading-relaxed">
          {{HERO_SUBTITLE}}
        </p>
        <div class="pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition shadow-2xl">
            <span>Iniciar Projeto no WhatsApp</span>
            <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>

      <div class="lg:col-span-4">
        <div class="aspect-[3/4] rounded-2xl overflow-hidden minimal-border">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-700" onerror="this.style.display='none'">
        </div>
      </div>
    </div>
  </section>

  <section id="servicos" class="py-20 border-t border-white/[0.08] px-6 max-w-7xl mx-auto space-y-12">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <span class="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">SERVIÇOS DE DESIGN</span>
        <h2 class="text-3xl font-bold text-white font-heading uppercase">Práticas & Soluções</h2>
      </div>
      <p class="text-xs text-zinc-500 max-w-xs">Execução precisa com foco em minimalismo, requinte e funcionalidade.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {{SERVICES_CARDS}}
    </div>
  </section>

  <section id="sobre" class="py-20 border-t border-white/[0.08] surface-card px-6">
    <div class="max-w-5xl mx-auto space-y-8 text-center">
      <span class="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">MANIFESTO</span>
      <h2 class="text-3xl sm:text-4xl font-bold text-white font-heading uppercase leading-snug">Menos Excesso, Mais Significado</h2>
      <p class="text-sm text-zinc-300 font-light leading-relaxed max-w-2xl mx-auto">{{ABOUT_TEXT}}</p>
    </div>
  </section>

  <section id="galeria" class="py-20 border-t border-white/[0.08] px-6 max-w-7xl mx-auto space-y-10">
    <div class="text-center space-y-2">
      <span class="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">PORTFÓLIO VISUAL</span>
      <h2 class="text-3xl font-bold text-white font-heading uppercase">Obras Selecionadas</h2>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {{GALLERY_GRID}}
    </div>
  </section>

  <section id="depoimentos" class="py-20 border-t border-white/[0.08] px-6 max-w-7xl mx-auto space-y-10">
    <div class="text-center space-y-2">
      <h2 class="text-3xl font-bold text-white font-heading uppercase">Palavra dos Clientes</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {{REVIEWS_CARDS}}
    </div>
  </section>

  <footer class="py-12 border-t border-white/[0.08] bg-black text-xs text-zinc-500 px-6">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <span class="font-bold text-white font-heading uppercase tracking-widest">{{BUSINESS_NAME}}</span>
      <p>{{ADDRESS}}</p>
      <div class="flex items-center gap-4">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="text-white hover:underline">WhatsApp</a>
        <span>•</span>
        <span>© {{YEAR}} Todos os direitos reservados.</span>
      </div>
    </div>
  </footer>


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

  "barbearia-hair-salon": `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{BUSINESS_NAME}} | Hair Salon & Estética Masculina e Feminina</title>
  <meta name="description" content="{{DESCRIPTION}}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: {{PRIMARY_COLOR}};
      --bg: {{BG_COLOR}};
      --surface: {{SURFACE_COLOR}};
      --text: {{TEXT_COLOR}};
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg, #0d0d0d);
      color: var(--text, #f5f5f4);
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Playfair Display', serif;
    }
    .accent-bg { background-color: var(--primary, #d97706); }
    .accent-color { color: var(--primary, #d97706); }
    .surface-card { background-color: var(--surface, #161412); }
    .crop-border { border: 1px solid rgba(217, 119, 6, 0.3); }
    .price-line { display: flex; align-items: baseline; justify-content: space-between; }
    .price-line .dots { flex: 1; border-bottom: 1px dotted rgba(255,255,255,0.25); margin: 0 10px; }
  </style>
</head>
<body class="antialiased selection:bg-[var(--primary)] selection:text-black">

  <header class="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg)]/90 border-b border-white/[0.08]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl accent-bg flex items-center justify-center font-black text-black text-lg shadow-lg">
          {{INITIALS}}
        </div>
        <div class="flex flex-col">
          <span class="text-lg font-black tracking-tight text-white font-heading">{{HEADER_NAME}}</span>
          <span class="text-[10px] uppercase font-bold tracking-widest accent-color">BELEZA & ESTILO COMPLETO</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-300">
        <a href="#sobre" class="hover:text-white transition">{{NAV_ABOUT}}</a>
        <a href="#servicos" class="hover:text-white transition">{{NAV_SERVICES}}</a>
        <a href="#galeria" class="hover:text-white transition">Fotos de Cortes</a>
        <a href="#depoimentos" class="hover:text-white transition">Avaliações</a>
        <a href="#contato" class="hover:text-white transition">Localização</a>
      </nav>

      <div class="flex items-center gap-3">
        <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl accent-bg text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition flex items-center gap-2">
          <i class="fab fa-whatsapp text-sm"></i>
          <span>Agendar Horário</span>
        </a>
      </div>
    </div>
  </header>

  <section class="relative pt-12 pb-20 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/[0.1] surface-card">
          <span class="w-2 h-2 rounded-full accent-bg animate-pulse"></span>
          <span class="accent-color">{{NICHE_LABEL}}</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight font-heading">
          {{HERO_TITLE}}
        </h1>

        <p class="text-base text-zinc-300 leading-relaxed max-w-xl">
          {{HERO_SUBTITLE}}
        </p>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="px-8 py-4 rounded-xl accent-bg text-black font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-xl transition flex items-center justify-center gap-3">
            <i class="fab fa-whatsapp text-xl"></i>
            <span>{{PRIMARY_CTA}}</span>
          </a>
          <a href="#servicos" class="px-6 py-4 rounded-xl border border-white/[0.15] hover:border-white/40 text-white font-bold text-sm text-center transition">
            Ver Tabela de Serviços
          </a>
        </div>

        <div class="grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.08]">
          <div>
            <div class="text-2xl font-black accent-color font-heading">100%</div>
            <div class="text-[11px] text-zinc-400">{{METRIC_1_LABEL}}</div>
          </div>
          <div>
            <div class="text-2xl font-black accent-color font-heading">VIP</div>
            <div class="text-[11px] text-zinc-400">{{METRIC_2_LABEL}}</div>
          </div>
          <div>
            <div class="text-2xl font-black accent-color font-heading">5.0 ★</div>
            <div class="text-[11px] text-zinc-400">Google Reviews</div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-5 relative">
        <div class="relative rounded-3xl overflow-hidden border-2 border-white/[0.1] shadow-2xl surface-card aspect-[4/5] group">
          <img src="{{HERO_IMG}}" alt="{{BUSINESS_NAME}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onerror="this.style.display='none'">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
            <span class="px-3 py-1 rounded-lg accent-bg text-black font-black text-xs uppercase w-max mb-2">Barbearia Tradicional</span>
            <h3 class="text-xl font-bold text-white font-heading">{{BUSINESS_NAME}}</h3>
            <p class="text-xs text-zinc-300">{{ADDRESS}}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="sobre" class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-5 relative aspect-square rounded-2xl overflow-hidden border border-white/[0.1]">
        <img src="{{HERO_IMG}}" alt="Sobre {{BUSINESS_NAME}}" class="w-full h-full object-cover" onerror="this.style.display='none'">
      </div>

      <div class="lg:col-span-7 space-y-6">
        <div class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider accent-color">
          <span>NOSSA HISTÓRIA</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-black text-white tracking-tight font-heading">
          Tradição, Precisão & Cuidado em Cada Detalhe
        </h2>
        <p class="text-sm text-zinc-300 leading-relaxed">{{ABOUT_TEXT}}</p>

        <div class="pt-2">
          <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl accent-bg text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg">
            <i class="fab fa-whatsapp"></i>
            <span>Agende pelo WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <section id="servicos" class="py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
      <div class="text-center space-y-3 max-w-2xl mx-auto">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">CARDÁPIO DE SERVIÇOS</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white font-heading">{{SERVICES_TITLE}}</h2>
        <p class="text-xs text-zinc-400">Atendimento de primeira linha com produtos premium e mestres barbeiros experientes.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {{SERVICES_CARDS}}
      </div>
    </div>
  </section>

  <section id="galeria" class="py-16 border-t border-white/[0.06] surface-card">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span class="text-xs uppercase font-extrabold tracking-widest accent-color">PORTFÓLIO VISUAL</span>
          <h2 class="text-3xl font-black text-white font-heading">Galeria de Estilo & Transformações</h2>
        </div>
        <p class="text-xs text-zinc-400 max-w-md">{{GALLERY_SUBTITLE}}</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {{GALLERY_GRID}}
      </div>
    </div>
  </section>

  <section id="depoimentos" class="py-16 border-t border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-xs uppercase font-extrabold tracking-widest accent-color">OPINIÕES DE CLIENTES</span>
        <h2 class="text-3xl font-black text-white font-heading">O que Nossos Clientes Dizem</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </div>
  </section>

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


  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL -->
  <div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
    <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; width: 62px; height: 62px; background: #25D366; color: #ffffff; border-radius: 50%; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.1) rotate(5deg)'" onmouseout="this.style.transform='scale(1) rotate(0deg)'" title="Fale conosco no WhatsApp">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  </div>

</body>
</html>
`,

};

export function getBillyRealTemplateHtml(templateId?: string): string {
  const clean = (templateId || '').toLowerCase().trim();
  if (clean && BILLY_REAL_TEMPLATES_HTML[clean]) {
    return BILLY_REAL_TEMPLATES_HTML[clean];
  }
  // Busca por correspondência parcial
  for (const [key, html] of Object.entries(BILLY_REAL_TEMPLATES_HTML)) {
    if (key.includes(clean) || clean.includes(key)) {
      return html;
    }
  }
  return BILLY_REAL_TEMPLATES_HTML["barbearia-crop-vintage"];
}
