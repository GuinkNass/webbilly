import { findTemplateById } from './templates';
import { BlockToggles, DEFAULT_BLOCK_TOGGLES } from './categories';

export interface ServiceItem {
  name: string;
  price: string;
  description?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ReviewItem {
  author: string;
  rating: number;
  text: string;
  date?: string;
}

export interface SiteGenerationInput {
  businessName: string;
  niche: string;
  city: string;
  subdomain: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  address?: string;
  tagline?: string;
  description?: string;
  theme?: string;
  templateId?: string;
  accentColor?: string;
  logoUrl?: string;
  heroPhoto?: string;
  galleryPhotos?: string[];
  services?: ServiceItem[];
  features?: string[];
  faqs?: FaqItem[];
  reviews?: ReviewItem[];
  hours?: string;
  mapEmbedUrl?: string;
  blocks?: Partial<BlockToggles>;
  differentiators?: string;
  toneOfVoice?: string;
  uploadedText?: string;
}

/**
 * Executa a chamada à API Gemini com fallback automático de modelos
 */
async function callGeminiApi(prompt: string, apiKey: string, preferredModel?: string): Promise<string> {
  const models = [
    preferredModel || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-flash-latest'
  ].filter(Boolean);

  const tried = new Set<string>();
  let lastError: any = null;

  for (const model of models) {
    if (tried.has(model)) continue;
    tried.add(model);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 32768
          }
        })
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        console.warn(`[Gemini Engine] Modelo ${model} falhou com status ${res.status}: ${errorText.slice(0, 150)}`);
        continue;
      }

      const json = await res.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = cleanHtmlResponse(rawText);

      if (cleaned && cleaned.includes('</html>') && cleaned.includes('<body')) {
        return cleaned;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Engine] Erro na requisição ao modelo ${model}:`, err.message);
    }
  }

  throw lastError || new Error('Nenhum modelo compatível do Gemini respondeu com sucesso.');
}

function cleanHtmlResponse(text: string): string {
  let cleaned = (text || '').trim();
  cleaned = cleaned.replace(/^```html\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  return cleaned.trim();
}

/**
 * Constrói o HTML usando a IA Gemini ou o Motor Cirúrgico Local do Billy Desktop
 */
export async function buildSiteHtml(input: SiteGenerationInput): Promise<{ html: string; usedAi: boolean; modelUsed?: string }> {
  const tpl = findTemplateById(input.templateId || 'barbearia-crop-vintage');
  const blocks: BlockToggles = { ...DEFAULT_BLOCK_TOGGLES, ...(input.blocks || {}) };

  const rawPhone = (input.whatsapp || input.phone || '11999999999').replace(/\D/g, '');
  const cleanPhone = rawPhone.length <= 11 && !rawPhone.startsWith('55') ? `55${rawPhone}` : rawPhone;
  const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Olá! Vim pelo site ${input.subdomain}.webbilly.com.br e gostaria de mais informações sobre os serviços da ${input.businessName}.`
  )}`;

  const activeAccent = input.accentColor || tpl.accentColor || '#84cc16';
  const apiKey = process.env.GEMINI_API_KEY || '';

  // 1. Tenta geração profunda via Gemini AI se houver API Key
  if (apiKey) {
    try {
      const prompt = `Você é o compilador sênior de Landing Pages do Billy Suite Desktop.
Sua missão é gerar o código HTML/Tailwind CSS COMPLETO, ultra-responsivo e de altíssima conversão para o seguinte comércio local:

1. DADOS DO NEGÓCIO:
- Nome: "${input.businessName}"
- Nicho / Ramo: "${input.niche}"
- Cidade e Estado: "${input.city}"
- Subdomínio: "${input.subdomain}.webbilly.com.br"
- Telefone / WhatsApp: "${cleanPhone}"
- Link Oficial WhatsApp CTA: "${whatsappLink}"
- Endereço Físico: "${input.address || 'Atendimento com horário marcado / Consultar endereço no WhatsApp'}"
- Horários de Funcionamento: "${input.hours || 'Segunda a Sábado das 08h30 às 19h30'}"
- Instagram: "${input.instagram || ''}"
- Template Visual Escolhido: "${tpl.name}" (${tpl.category})
- Tom de Voz da Copy: "${input.toneOfVoice || 'Comercial Agressivo de Alta Conversão'}"
- Cor de Destaque Primária (Hex): "${activeAccent}"
- Logotipo: "${input.logoUrl || ''}"
- Foto Hero Principal: "${input.heroPhoto || tpl.previewImg}"
- Galeria de Fotos Reais: ${JSON.stringify(input.galleryPhotos && input.galleryPhotos.length > 0 ? input.galleryPhotos : [tpl.previewImg])}
- Diferenciais Exclusivos: "${input.differentiators || input.tagline || 'Atendimento pontual, estrutura moderna, profissionais experientes e facilidade no pagamento.'}"

2. CARDÁPIO / SERVIÇOS & PREÇOS FORNECIDOS:
${JSON.stringify(input.services || [])}

3. PERGUNTAS FREQUENTES (FAQ):
${JSON.stringify(input.faqs || [])}

4. DEPOIMENTOS E AVALIAÇÕES:
${JSON.stringify(input.reviews || [])}

${input.uploadedText ? `5. TEXTO ADICIONAL / EXTRAÇÃO DE CARDÁPIO:\n"""\n${input.uploadedText}\n"""\nIncorpore fielmente esses itens e preços na tabela do site.` : ''}

6. STATUS DOS BLOCOS (LIGAR / DESLIGAR):
- Top Notification Bar: ${blocks.topBar ? 'ATIVO' : 'DESLIGADO'}
- Hero Principal: ${blocks.hero ? 'ATIVO' : 'DESLIGADO'}
- Sobre Nós / História: ${blocks.about ? 'ATIVO' : 'DESLIGADO'}
- Galeria de Fotos / Portfólio: ${blocks.gallery ? 'ATIVO' : 'DESLIGADO'}
- Cardápio / Tabela de Preços: ${blocks.pricingTable ? 'ATIVO' : 'DESLIGADO'}
- Horários de Funcionamento: ${blocks.hours ? 'ATIVO' : 'DESLIGADO'}
- Mapa de Localização: ${blocks.map ? 'ATIVO' : 'DESLIGADO'}
- Depoimentos e Avaliações: ${blocks.reviews ? 'ATIVO' : 'DESLIGADO'}
- FAQ / Objeções: ${blocks.faq ? 'ATIVO' : 'DESLIGADO'}
- Botão Flutuante de WhatsApp: ${blocks.whatsappFloat ? 'ATIVO' : 'DESLIGADO'}

DIRETRIZES DE DESIGN OBRIGATÓRIAS:
- Inclua Tailwind CSS (<script src="https://cdn.tailwindcss.com"></script>) e FontAwesome 6 (<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">).
- Inclua fontes Google Fonts modernas (Plus Jakarta Sans ou Inter).
- O site deve ser escuro e premium (background #07090e ou #0b0f19) com toques luminosos na cor de destaque ${activeAccent}.
- TODOS os botões de ação (Agendar, Pedir Orçamento, Falar com Especialista) DEVEM ter href="${whatsappLink}" target="_blank" rel="noopener noreferrer".
- O botão flutuante de WhatsApp deve ficar fixo no canto inferior direito.
- RETORNE EXCLUSIVAMENTE o código HTML completo final, iniciando em <!DOCTYPE html> e finalizando em </html>, sem blocos markdown (\`\`\`html) e sem qualquer texto adicional.`;

      const aiHtml = await callGeminiApi(prompt, apiKey);
      if (aiHtml && aiHtml.length > 500) {
        return { html: aiHtml, usedAi: true, modelUsed: process.env.GEMINI_MODEL || 'gemini-2.5-flash' };
      }
    } catch (aiErr: any) {
      console.warn('[Gemini Engine] Erro na geração com IA, acionando motor modular cirúrgico local:', aiErr?.message);
    }
  }

  // 2. Motor Modular Cirúrgico do Billy Desktop (Garantia de 100% de sucesso sem mock)
  const localHtml = generateSmartModularDesktopHtml(input, tpl, blocks, activeAccent, cleanPhone, whatsappLink);
  return { html: localHtml, usedAi: false };
}

/**
 * Construtor modular offline de altíssima fidelidade estética e conversão
 */
function generateSmartModularDesktopHtml(
  input: SiteGenerationInput,
  tpl: any,
  blocks: BlockToggles,
  accentColor: string,
  cleanPhone: string,
  whatsappLink: string
): string {
  const heroImg = input.heroPhoto || (input.galleryPhotos && input.galleryPhotos[0]) || tpl.previewImg;
  const gallery = (input.galleryPhotos && input.galleryPhotos.length > 0)
    ? input.galleryPhotos
    : [tpl.previewImg, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80'];

  const services = (input.services && input.services.length > 0)
    ? input.services
    : [
        { name: `Serviço Especializado de ${input.niche}`, price: 'R$ 60,00', description: 'Atendimento exclusivo com padrão de excelência e produtos de ponta.' },
        { name: 'Combo Completo Premium', price: 'R$ 110,00', description: 'O pacote mais pedido da casa com máxima comodidade e acabamento refinado.' },
        { name: 'Atendimento Expresso', price: 'R$ 45,00', description: 'Rapidez e precisão sem abrir mão da qualidade para a sua rotina.' },
        { name: 'Consultoria / Avaliação Personalizada', price: 'Sob Consulta', description: 'Análise individual detalhada para identificar a melhor solução.' }
      ];

  const faqs = (input.faqs && input.faqs.length > 0)
    ? input.faqs
    : [
        { question: 'Como funciona o agendamento de horários?', answer: 'É simples e imediato! Basta clicar em qualquer botão de WhatsApp nesta página para falar direto com nossa equipe.' },
        { question: 'Quais são as formas de pagamento aceitas?', answer: 'Aceitamos Pix instantâneo, dinheiro e cartões de crédito e débito com parcelamento disponível.' },
        { question: 'Onde o estabelecimento está localizado?', answer: `${input.address || `Estamos estrategicamente localizados em ${input.city}, com fácil acesso e estacionamento nas proximidades.`}` }
      ];

  const reviews = (input.reviews && input.reviews.length > 0)
    ? input.reviews
    : [
        { author: 'Carlos Henrique M.', rating: 5, text: 'Atendimento nota 10! Pontualidade, profissionais atenciosos e ambiente impecável. Recomendo de olhos fechados!' },
        { author: 'Mariana Silveira', rating: 5, text: 'Superou todas as minhas expectativas. O melhor serviço da região sem dúvida alguma!' },
        { author: 'Rafael Duarte', rating: 5, text: 'Rápido, honesto e com preço justo. Virei cliente fiel!' }
      ];

  const slogan = input.tagline || `Referência em ${input.niche} em ${input.city} com atendimento exclusivo`;
  const about = input.description || `Na ${input.businessName}, unimos paixão, tecnologia e atenção aos mínimos detalhes para oferecer uma experiência incomparável em ${input.niche}. Nossa missão é entregar resultados que superam expectativas com atendimento acolhedor.`;

  return `<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${input.businessName} | ${input.niche} em ${input.city}</title>
  <meta name="description" content="${slogan}">
  <link rel="icon" href="${input.logoUrl || '/favicon.ico'}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #07090e; color: #f8fafc; }
    .accent-bg { background-color: ${accentColor}; }
    .accent-text { color: ${accentColor}; }
    .accent-border { border-color: ${accentColor}; }
    .accent-ring:focus { --tw-ring-color: ${accentColor}; }
    .glow-accent { box-shadow: 0 0 35px ${accentColor}40; }
  </style>
</head>
<body class="antialiased selection:bg-[${accentColor}] selection:text-black">

  ${blocks.topBar ? `
  <!-- Top Notification Bar -->
  <div class="bg-gradient-to-r from-[#0c1017] via-[${accentColor}]/20 to-[#0c1017] border-b border-white/[0.08] text-[11px] font-semibold py-2 px-4 text-center text-zinc-300">
    <span class="inline-flex items-center gap-2">
      <span class="w-2 h-2 rounded-full accent-bg animate-pulse"></span>
      <span>⭐ Atendimento em <strong>${input.city}</strong> — Agendamentos abertos pelo WhatsApp!</span>
    </span>
  </div>
  ` : ''}

  <!-- Header Fixo -->
  <header class="sticky top-0 z-40 bg-[#07090e]/90 backdrop-blur-md border-b border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <a href="#inicio" class="flex items-center gap-3">
        ${input.logoUrl
          ? `<img src="${input.logoUrl}" alt="${input.businessName}" class="w-11 h-11 object-contain rounded-xl">`
          : `<div class="w-11 h-11 rounded-xl accent-bg text-black font-black flex items-center justify-center text-xl shadow-lg">
              ${input.businessName.charAt(0)}
            </div>`
        }
        <div>
          <span class="font-extrabold text-base tracking-tight text-white block leading-tight">${input.businessName}</span>
          <span class="text-[10px] font-mono tracking-widest uppercase font-bold accent-text block">${input.niche}</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-zinc-400">
        <a href="#inicio" class="hover:text-white transition">Início</a>
        ${blocks.about ? '<a href="#sobre" class="hover:text-white transition">Sobre</a>' : ''}
        ${blocks.pricingTable ? '<a href="#servicos" class="hover:text-white transition">Serviços</a>' : ''}
        ${blocks.gallery ? '<a href="#galeria" class="hover:text-white transition">Galeria</a>' : ''}
        ${blocks.reviews ? '<a href="#depoimentos" class="hover:text-white transition">Avaliações</a>' : ''}
        ${blocks.faq ? '<a href="#faq" class="hover:text-white transition">FAQ</a>' : ''}
      </nav>

      <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider text-black accent-bg hover:brightness-110 transition shadow-lg flex items-center gap-2 cursor-pointer">
        <i class="fa-brands fa-whatsapp text-sm"></i>
        <span>Agendar Horário</span>
      </a>
    </div>
  </header>

  ${blocks.hero ? `
  <!-- Hero Section -->
  <section id="inicio" class="relative pt-24 pb-20 sm:pt-32 sm:pb-28 overflow-hidden min-h-[85vh] flex items-center">
    <div class="absolute inset-0 z-0">
      <img src="${heroImg}" alt="${input.businessName}" class="w-full h-full object-cover brightness-[0.3]">
      <div class="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/80 to-transparent"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-8 space-y-6">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold tracking-wide uppercase backdrop-blur-md">
          <span class="w-2 h-2 rounded-full accent-bg animate-pulse"></span>
          <span>Excelência em ${input.niche} • ${input.city}</span>
        </div>

        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
          ${input.businessName}
        </h1>

        <p class="text-lg sm:text-xl text-zinc-300 font-medium max-w-2xl leading-relaxed">
          ${slogan}
        </p>

        <div class="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-black accent-bg hover:brightness-110 transition shadow-xl glow-accent flex items-center justify-center gap-3">
            <i class="fa-brands fa-whatsapp text-lg"></i>
            <span>Falar no WhatsApp Agora</span>
          </a>

          ${blocks.pricingTable ? `
          <a href="#servicos" class="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm text-white bg-white/10 hover:bg-white/15 border border-white/20 transition flex items-center justify-center gap-2">
            <span>Ver Preços & Serviços</span>
            <i class="fa-solid fa-arrow-down text-xs"></i>
          </a>
          ` : ''}
        </div>
      </div>
    </div>
  </section>
  ` : ''}

  ${blocks.about ? `
  <!-- Seção Sobre Nós -->
  <section id="sobre" class="py-20 bg-[#0c1017] border-y border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div class="lg:col-span-6 relative rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl aspect-[4/3]">
        <img src="${gallery[0] || heroImg}" alt="Sobre ${input.businessName}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
          <div>
            <span class="text-xs uppercase font-mono font-bold accent-text block">Atendimento Diferenciado</span>
            <span class="text-lg font-black text-white">Compromisso com o seu bem-estar</span>
          </div>
        </div>
      </div>

      <div class="lg:col-span-6 space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[${accentColor}]/15 border border-[${accentColor}]/30 accent-text text-xs font-bold uppercase tracking-wider">
          <span>Quem Somos</span>
        </div>
        <h2 class="text-3xl sm:text-4xl font-black text-white leading-tight">
          Mais que um serviço, uma experiência de primeira linha.
        </h2>
        <p class="text-zinc-400 text-sm leading-relaxed">
          ${about}
        </p>

        <div class="grid grid-cols-2 gap-4 pt-2">
          <div class="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
            <span class="text-2xl font-black accent-text block">100%</span>
            <span class="text-xs text-zinc-400 font-medium">Dedicação e Cuidado</span>
          </div>
          <div class="p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
            <span class="text-2xl font-black accent-text block">5.0 ★</span>
            <span class="text-xs text-zinc-400 font-medium">Avaliações Positivas</span>
          </div>
        </div>
      </div>
    </div>
  </section>
  ` : ''}

  ${blocks.pricingTable ? `
  <!-- Seção de Serviços e Preços -->
  <section id="servicos" class="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-2xl mx-auto space-y-3 mb-16">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[${accentColor}]/15 border border-[${accentColor}]/30 accent-text text-xs font-bold uppercase tracking-wider">
        <span>Tabela Oficial</span>
      </div>
      <h2 class="text-3xl sm:text-4xl font-black text-white">Serviços & Investimento</h2>
      <p class="text-zinc-400 text-sm">Transparência total e o melhor custo-benefício para você.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      ${services.map((s, idx) => `
        <div class="p-6 rounded-3xl bg-[#0e121b] border border-white/[0.08] hover:border-[${accentColor}]/50 transition-all duration-300 flex flex-col justify-between group shadow-xl">
          <div class="space-y-3">
            <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.06] text-zinc-400 font-bold inline-block">Item #${idx + 1}</span>
            <h3 class="text-lg font-bold text-white group-hover:accent-text transition">${s.name}</h3>
            ${s.description ? `<p class="text-xs text-zinc-400 leading-relaxed">${s.description}</p>` : ''}
          </div>
          <div class="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between">
            <span class="text-lg font-black accent-text font-mono">${s.price}</span>
            <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="p-2 rounded-xl bg-white/[0.06] group-hover:accent-bg group-hover:text-black text-white transition">
              <i class="fa-brands fa-whatsapp text-sm"></i>
            </a>
          </div>
        </div>
      `).join('')}
    </div>
  </section>
  ` : ''}

  ${blocks.gallery && gallery.length > 0 ? `
  <!-- Galeria de Fotos -->
  <section id="galeria" class="py-20 bg-[#0c1017] border-y border-white/[0.06]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <span class="text-xs uppercase font-bold tracking-widest accent-text block">Portfólio Real</span>
        <h2 class="text-3xl sm:text-4xl font-black text-white">Galeria de Trabalhos</h2>
        <p class="text-zinc-400 text-sm">Confira um pouco da nossa estrutura, ambiente e transformações.</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        ${gallery.map((photo, i) => `
          <div class="group relative aspect-square rounded-2xl overflow-hidden border border-white/[0.08] bg-zinc-900 shadow-lg">
            <img src="${photo}" alt="Trabalho ${i + 1}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
              <span class="text-xs font-bold text-white">Foto #${i + 1}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  ${blocks.reviews && reviews.length > 0 ? `
  <!-- Depoimentos e Avaliações -->
  <section id="depoimentos" class="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center max-w-2xl mx-auto space-y-3 mb-16">
      <div class="inline-flex items-center gap-1.5 text-amber-400 text-sm font-bold">
        <i class="fa-solid fa-star"></i>
        <i class="fa-solid fa-star"></i>
        <i class="fa-solid fa-star"></i>
        <i class="fa-solid fa-star"></i>
        <i class="fa-solid fa-star"></i>
      </div>
      <h2 class="text-3xl sm:text-4xl font-black text-white">O que dizem os nossos clientes</h2>
      <p class="text-zinc-400 text-sm">Avaliações comprovadas de quem confia no nosso trabalho.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      ${reviews.map((r) => `
        <div class="p-6 rounded-3xl bg-[#0e121b] border border-white/[0.08] space-y-4 shadow-xl">
          <div class="flex items-center gap-1 text-amber-400 text-xs">
            ${Array(r.rating || 5).fill('<i class="fa-solid fa-star"></i>').join('')}
          </div>
          <p class="text-zinc-300 text-xs leading-relaxed italic">"${r.text}"</p>
          <div class="pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span class="text-xs font-bold text-white">${r.author}</span>
            <span class="text-[10px] text-zinc-500 font-mono">Avaliação Google</span>
          </div>
        </div>
      `).join('')}
    </div>
  </section>
  ` : ''}

  ${blocks.faq && faqs.length > 0 ? `
  <!-- FAQ -->
  <section id="faq" class="py-20 bg-[#0c1017] border-y border-white/[0.06]">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      <div class="text-center space-y-2">
        <span class="text-xs font-bold uppercase tracking-widest accent-text block">Tire Suas Dúvidas</span>
        <h2 class="text-3xl font-black text-white">Perguntas Frequentes</h2>
      </div>

      <div class="space-y-4">
        ${faqs.map((f) => `
          <div class="p-5 rounded-2xl bg-[#0e121b] border border-white/[0.06] space-y-2">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-circle-question accent-text text-xs"></i>
              <span>${f.question}</span>
            </h3>
            <p class="text-xs text-zinc-400 leading-relaxed pl-5">${f.answer}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Rodapé Oficial -->
  <footer class="py-16 bg-black border-t border-white/[0.08] text-xs text-zinc-400">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
      <div>
        <span class="text-lg font-black text-white block">${input.businessName}</span>
        <span class="text-zinc-500">${input.niche} • ${input.city}</span>
        ${input.address ? `<p class="text-zinc-400 mt-1">${input.address}</p>` : ''}
        ${input.hours ? `<p class="text-zinc-500 text-[11px] mt-0.5"><i class="fa-regular fa-clock mr-1"></i>${input.hours}</p>` : ''}
      </div>

      <div class="flex items-center gap-3">
        <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black accent-bg hover:brightness-110 transition flex items-center gap-2">
          <i class="fa-brands fa-whatsapp text-sm"></i>
          <span>Falar no WhatsApp</span>
        </a>
      </div>

      <div class="text-[11px] text-zinc-600">
        Desenvolvido pela plataforma <a href="https://webbilly.com.br" class="text-zinc-400 hover:accent-text">Webbilly</a>
      </div>
    </div>
  </footer>

  ${blocks.whatsappFloat ? `
  <!-- Botão Flutuante do WhatsApp -->
  <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-[0_0_25px_rgba(37,211,102,0.6)] hover:scale-110 transition duration-300">
    <i class="fa-brands fa-whatsapp text-3xl"></i>
  </a>
  ` : ''}

</body>
</html>`;
}
