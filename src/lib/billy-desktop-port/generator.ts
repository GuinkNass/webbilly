import { findTemplateById } from './templates';
import { BlockToggles, DEFAULT_BLOCK_TOGGLES } from './categories';
import { getDesktopTemplateHtml } from '../desktop-templates-html';
import { formatHeaderName } from '../desktop-templates';

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
  shortName?: string;
  headerName?: string;
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
  primaryColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  fontPair?: string;
  paletteId?: string;
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
 * Executa a chamada à API Gemini com fallback automático de modelos e timeout seguro
 */
async function callGeminiApi(prompt: string, apiKey: string, preferredModel?: string): Promise<string> {
  const models = [
    preferredModel || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-pro'
  ].filter(Boolean);

  const cleanKey = apiKey.trim();
  const tried = new Set<string>();
  let lastError: any = null;

  for (const model of models) {
    if (tried.has(model)) continue;
    tried.add(model);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 32768
          }
        }),
        signal: AbortSignal.timeout(25000)
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        console.warn(`[Gemini Engine] Modelo ${model} retornou status ${res.status}: ${errorText.slice(0, 150)}`);
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

  throw lastError || new Error('Nenhum modelo compatível do Gemini respondeu a tempo.');
}

function cleanHtmlResponse(text: string, fallbackHeroImg: string = ''): string {
  let cleaned = (text || '').trim();
  cleaned = cleaned.replace(/^```html\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');

  // 1. Remove qualquer tag <img> com src vazio (""), nulo ou indefinido
  cleaned = cleaned.replace(/<img[^>]*src=["']\s*(?:undefined|null)?\s*["'][^>]*>/gi, '');

  // 2. Se houver <img> com src vazio restante, substitui pelo heroImg válido
  if (fallbackHeroImg) {
    cleaned = cleaned.replace(/<img([^>]*?)src=["']\s*["']([^>]*?)>/gi, `<img$1src="${fallbackHeroImg}"$2>`);
  }

  // 3. Garante que TODAS as tags <img> tenham onerror="this.style.display='none'" para evitar ícone quebrado
  cleaned = cleaned.replace(/<img(?![^>]*\bonerror=)([^>]*?)>/gi, '<img$1 onerror="this.style.display=\'none\'">');

  return cleaned.trim();
}

/**
 * Adaptador cirúrgico local que injeta 100% dos dados reais do cliente no template estrutural do Desktop
 */
export function adaptDesktopTemplateLocally(
  baseTemplateHtml: string,
  input: SiteGenerationInput,
  heroImg: string,
  gallery: string[],
  cleanPhone: string,
  whatsappLink: string
): string {
  const primaryColor = (input.primaryColor || input.accentColor || '#84cc16').trim();
  const bgColor = (input.backgroundColor || '#090d14').trim();
  const surfaceColor = (input.surfaceColor || '#111827').trim();
  const textColor = (input.textColor || '#f8fafc').trim();

  const headerName = formatHeaderName(input.businessName, input.shortName || input.headerName);
  const words = (input.businessName || 'Empresa').trim().split(/\s+/);
  const initials = words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : words[0].slice(0, 2).toUpperCase();

  const nicheLower = (input.niche || '').toLowerCase();
  let primaryCta = 'Falar no WhatsApp';
  if (/barbe|corte|cabelo|salon|barba/i.test(nicheLower)) primaryCta = 'Agendar Horário no WhatsApp';
  else if (/pizza|restaurante|burger|hamburguer|lanche|comida|gourmet|sushi/i.test(nicheLower)) primaryCta = 'Fazer Pedido no WhatsApp';
  else if (/odonto|dentia|dentista|clinica|médic|medico|saude|estetic/i.test(nicheLower)) primaryCta = 'Agendar Consulta / Avaliação';
  else if (/autoescola|cnh|drive/i.test(nicheLower)) primaryCta = 'Matricule-se / Falar no WhatsApp';
  else if (/serralheria|solda|calha/i.test(nicheLower)) primaryCta = 'Solicitar Orçamento Grátis';
  else if (/consultoria|advocacia|advogado|contab/i.test(nicheLower)) primaryCta = 'Falar com Especialista';

  const servicesList: ServiceItem[] = (input.services && input.services.length > 0)
    ? input.services
    : [
        { name: `Serviço Especializado de ${input.niche}`, price: 'R$ 70,00', description: 'Atendimento de excelência com materiais e produtos de primeira linha.' },
        { name: 'Combo Completo Signature', price: 'R$ 130,00', description: 'O serviço mais pedido da casa com máxima comodidade e acabamento refinado.' },
        { name: 'Atendimento Rápido / Express', price: 'R$ 50,00', description: 'Pontualidade e precisão ideal para a sua rotina.' },
        { name: 'Avaliação & Consultoria Personalizada', price: 'Sob Consulta', description: 'Análise individual detalhada para identificar a melhor solução.' }
      ];

  const servicesCardsHtml = servicesList.map((s, idx) => `
    <div class="p-6 rounded-2xl surface-card border border-white/[0.08] hover:border-white/[0.2] transition-all duration-300 flex flex-col justify-between space-y-4">
      <div>
        <div class="flex items-start justify-between gap-4">
          <h4 class="font-bold text-white text-lg font-heading">${s.name}</h4>
          <span class="px-3 py-1 rounded-lg accent-bg text-black font-black text-xs shrink-0">${s.price || 'Sob Consulta'}</span>
        </div>
        <p class="text-xs text-zinc-400 mt-2 leading-relaxed">${s.description || 'Execução impecável com profissionais altamente capacitados e atendimento de alto padrão.'}</p>
      </div>
      <a href="${whatsappLink}&text=${encodeURIComponent(`Olá! Gostaria de agendar/pedir o serviço: ${s.name} (${s.price})`)}" target="_blank" rel="noopener noreferrer" class="w-full py-2.5 rounded-xl border border-white/[0.1] hover:accent-bg hover:text-black text-white text-xs font-bold transition flex items-center justify-center gap-2">
        <i class="fab fa-whatsapp"></i>
        <span>Solicitar pelo WhatsApp</span>
      </a>
    </div>
  `).join('\n');

  const galleryGridHtml = gallery.map((img, idx) => `
    <div class="group relative aspect-square rounded-2xl overflow-hidden border border-white/[0.08] shadow-lg transition-transform duration-300 hover:-translate-y-1">
      <img src="${img}" alt="Foto ${idx + 1}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.style.display='none'">
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
        <span class="text-[10px] font-mono uppercase tracking-wider text-white font-bold">Foto Oficial #${idx + 1}</span>
      </div>
    </div>
  `).join('\n');

  const reviewsList: ReviewItem[] = (input.reviews && input.reviews.length > 0)
    ? input.reviews
    : [
        { author: 'Carlos Henrique M.', rating: 5, text: 'Atendimento nota 10! Pontualidade, profissionais atenciosos e ambiente impecável. Recomendo de olhos fechados!' },
        { author: 'Mariana Silveira', rating: 5, text: 'Superou todas as minhas expectativas. O melhor serviço da região sem dúvida alguma!' },
        { author: 'Rafael Duarte', rating: 5, text: 'Rápido, honesto e com preço justo. Virei cliente fiel!' }
      ];

  const reviewsCardsHtml = reviewsList.map((r) => `
    <div class="p-6 rounded-2xl surface-card border border-white/[0.08] space-y-3">
      <div class="flex items-center gap-1 text-amber-400 text-sm">
        ${'★'.repeat(Math.min(5, Math.max(1, Math.round(r.rating || 5))))}
      </div>
      <p class="text-xs text-zinc-300 italic leading-relaxed">"${r.text}"</p>
      <div class="pt-2 border-t border-white/[0.05] flex items-center justify-between text-xs">
        <span class="font-bold text-white">${r.author}</span>
        <span class="text-[10px] text-emerald-400 flex items-center gap-1"><i class="fas fa-check-circle"></i> Verificado</span>
      </div>
    </div>
  `).join('\n');

  const faqsList: FaqItem[] = (input.faqs && input.faqs.length > 0)
    ? input.faqs
    : [
        { question: 'Como funciona o agendamento de horários ou pedidos?', answer: 'É simples e imediato! Basta clicar em qualquer botão de WhatsApp nesta página para falar diretamente com nossa equipe em tempo real.' },
        { question: 'Quais são as formas de pagamento aceitas?', answer: 'Aceitamos Pix instantâneo, dinheiro e cartões de crédito e débito com parcelamento facilitado.' },
        { question: 'Onde o estabelecimento está localizado?', answer: `${input.address || `Estamos estrategicamente localizados em ${input.city}, com fácil acesso e estacionamento nas proximidades.`}` }
      ];

  const faqCardsHtml = faqsList.map((f) => `
    <div class="p-5 rounded-2xl surface-card border border-white/[0.08] space-y-1.5">
      <h4 class="font-bold text-white text-sm flex items-center gap-2">
        <i class="fas fa-question-circle accent-color"></i>
        <span>${f.question}</span>
      </h4>
      <p class="text-xs text-zinc-400 leading-relaxed pl-5">${f.answer}</p>
    </div>
  `).join('\n');

  const heroTitle = input.tagline || (input.niche ? `${input.niche} de Referência em ${input.city}` : `Excelência e Tradição em ${input.city}`);
  const heroSubtitle = input.description || `Na ${input.businessName}, cada detalhe é pensado para proporcionar uma experiência marcante com profissionais de alto gabarito e atendimento humanizado.`;
  const aboutText = input.differentiators || input.description || `Com tradição consolidada em ${input.city}, a ${input.businessName} alia inovação contínua, infraestrutura moderna e respeito absoluto ao tempo e às necessidades de cada cliente.`;

  let result = baseTemplateHtml;

  // Substituição de Tokens estruturais
  const replacements: Record<string, string> = {
    '{{BUSINESS_NAME}}': input.businessName,
    '{{HEADER_NAME}}': headerName,
    '{{INITIALS}}': initials,
    '{{NICHE_LABEL}}': input.niche || 'Comércio Local',
    '{{TAGLINE}}': heroTitle,
    '{{DESCRIPTION}}': heroSubtitle,
    '{{PRIMARY_COLOR}}': primaryColor,
    '{{BG_COLOR}}': bgColor,
    '{{SURFACE_COLOR}}': surfaceColor,
    '{{TEXT_COLOR}}': textColor,
    '{{HERO_TITLE}}': heroTitle,
    '{{HERO_SUBTITLE}}': heroSubtitle,
    '{{PRIMARY_CTA}}': primaryCta,
    '{{HERO_IMG}}': heroImg,
    '{{ABOUT_TEXT}}': aboutText,
    '{{SERVICES_CARDS}}': servicesCardsHtml,
    '{{GALLERY_GRID}}': galleryGridHtml,
    '{{REVIEWS_CARDS}}': reviewsCardsHtml,
    '{{FAQ_CARDS}}': faqCardsHtml,
    '{{WHATSAPP_LINK}}': whatsappLink,
    '{{HOURS}}': input.hours || 'Segunda a Sábado das 08h às 19h',
    '{{HOURS_SHORT}}': input.hours ? input.hours.split('|')[0].trim() : 'Seg a Sáb',
    '{{ADDRESS}}': input.address || `${input.city} - Atendimento presencial e online`,
    '{{PHONE}}': cleanPhone,
    '{{YEAR}}': new Date().getFullYear().toString()
  };

  for (const [token, val] of Object.entries(replacements)) {
    result = result.split(token).join(val);
  }

  return cleanHtmlResponse(result, heroImg);
}

/**
 * Constrói o HTML usando a IA Gemini alimentada com o Template Desktop Real + Injeção de Paletas
 */
export async function buildSiteHtml(input: SiteGenerationInput): Promise<{ html: string; usedAi: boolean; modelUsed?: string }> {
  const tpl = findTemplateById(input.templateId || 'barbearia-crop-vintage');
  const baseTemplateHtml = getDesktopTemplateHtml(input.templateId);

  const rawPhone = (input.whatsapp || input.phone || '11999999999').replace(/\D/g, '');
  const cleanPhone = rawPhone.length <= 11 && !rawPhone.startsWith('55') ? `55${rawPhone}` : rawPhone;
  const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Olá! Vim pelo site ${input.subdomain}.webbilly.com.br e gostaria de mais informações sobre os serviços da ${input.businessName}.`
  )}`;

  const activeAccent = (input.primaryColor || input.accentColor || tpl.accentColor || '#84cc16').trim();
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();

  // Garante seleção de imagem Hero e Galeria válidas sem URLs vazias
  const validGallery = (input.galleryPhotos || []).filter(
    (p) => typeof p === 'string' && p.trim().startsWith('http')
  );
  const heroImg = (input.heroPhoto && input.heroPhoto.trim().startsWith('http'))
    ? input.heroPhoto.trim()
    : (validGallery.length > 0 ? validGallery[0] : tpl.previewImg);
  const gallery = validGallery.length > 0 ? validGallery : [heroImg, tpl.previewImg];

  // 1. Tenta geração profunda via Gemini AI enviando o Template Real como Base
  if (apiKey) {
    try {
      const prompt = `Você é o compilador sênior de Landing Pages do Billy Suite Desktop.
Sua missão é adaptar o HTML completo do template oficial desktop fornecido abaixo para o comérco local solicitado, preservando RIGOROSAMENTE mais de 90% da estrutura, layout, classes CSS e fontes originais:

========================================================================
1. DADOS REAIS DO NEGÓCIO (NICHO E IDENTIDADE ESTREITA):
- Nome Oficial: "${input.businessName}"
- Nome no Cabeçalho (Curto): "${formatHeaderName(input.businessName, input.shortName || input.headerName)}"
- Nicho / Ramo: "${input.niche}"
- Cidade e Estado: "${input.city}"
- Subdomínio: "${input.subdomain}.webbilly.com.br"
- Telefone / WhatsApp: "${cleanPhone}"
- Link Oficial WhatsApp CTA: "${whatsappLink}"
- Endereço Físico: "${input.address || 'Atendimento com horário marcado / Consultar endereço no WhatsApp'}"
- Horários de Funcionamento: "${input.hours || 'Segunda a Sábado das 08h30 às 19h30'}"
- Instagram: "${input.instagram || ''}"
- Template Visual Base: "${tpl.name}" (${tpl.category} - ${input.templateId})
- Tom de Voz da Copy: "${input.toneOfVoice || 'Comercial Agressivo de Alta Conversão'}"
- Cor Primária Escolhida: "${activeAccent}"
- Cor de Fundo (Background): "${input.backgroundColor || '#090d14'}"
- Cor de Superfície (Cards): "${input.surfaceColor || '#111827'}"
- Cor do Texto: "${input.textColor || '#f8fafc'}"
- Foto Hero Principal (OBRIGATÓRIO USAR ESTA URL NO HERO): "${heroImg}"
- Galeria de Fotos Reais Selecionadas pelo Operador (distribua entre o Hero, Galeria e Cards): ${JSON.stringify(gallery)}
- Diferenciais Exclusivos: "${input.differentiators || input.tagline || 'Atendimento pontual, estrutura moderna, profissionais experientes e facilidade no pagamento.'}"

2. CARDÁPIO / SERVIÇOS & PREÇOS FORNECIDOS:
${JSON.stringify(input.services || [])}

3. PERGUNTAS FREQUENTES (FAQ):
${JSON.stringify(input.faqs || [])}

4. DEPOIMENTOS E AVALIAÇÕES:
${JSON.stringify(input.reviews || [])}

${input.uploadedText ? `5. TEXTO ADICIONAL / EXTRAÇÃO DE CARDÁPIO:\n"""\n${input.uploadedText}\n"""\nIncorpore fielmente esses itens e preços na tabela do site.` : ''}

========================================================================
6. CÓDIGO HTML DO TEMPLATE OFICIAL DO BILLY DESKTOP A SER ADAPTADO:
\`\`\`html
${baseTemplateHtml}
\`\`\`

========================================================================
DIRETRIZES OBRIGATÓRIAS DE GERAÇÃO:
1. FIDELIDADE ABSOLUTA AO NICHO:
- Reescreva TODOS os títulos, chamadas, descrições e botões para o nicho EXATO de "${input.niche}".
- NUNCA misture termos de outros nichos (exemplo: se for barbearia, use "Agendar Horário", "Corte", "Barba"; NUNCA use "Agendar Consulta", "Exames" ou "Tratamentos Médicos"). Se for restaurante, use termos gastronômicos e pratos.
2. PRESERVAÇÃO ESTRUTURAL (90%+):
- Mantenha a estrutura HTML, as classes CSS, as tags <style>, as variáveis CSS (:root { --primary, --bg, --surface, --text }) e os scripts intactos.
- Injete no :root as cores escolhidas: --primary: ${activeAccent}; --bg: ${input.backgroundColor || '#090d14'}; --surface: ${input.surfaceColor || '#111827'}; --text: ${input.textColor || '#f8fafc'};
3. IMAGENS REAIS E BLINDAGEM:
- Use a imagem "${heroImg}" no Hero principal.
- Na galeria, distribua as fotos do array fornecido.
- Adicione SEMPRE em TODAS as tags <img> o atributo onerror="this.style.display='none'".
4. WHATSAPP & LINKS:
- Todos os botões de ação (Agendar, Pedir, Comprar, Falar) DEVEM apontar para href="${whatsappLink}".
- Garanta que o botão flutuante de WhatsApp permaneça presente.
5. SAÍDA EXCLUSIVA:
- Retorne EXCLUSIVAMENTE o código HTML completo final, iniciando em <!DOCTYPE html> e finalizando em </html>, sem blocos markdown (\`\`\`html) e sem qualquer texto antes ou depois.`;

      const rawAiHtml = await callGeminiApi(prompt, apiKey);
      const aiHtml = cleanHtmlResponse(rawAiHtml, heroImg);
      if (aiHtml && aiHtml.length > 500 && aiHtml.includes('</html>')) {
        return { html: aiHtml, usedAi: true, modelUsed: process.env.GEMINI_MODEL || 'gemini-2.5-flash' };
      }
    } catch (aiErr: any) {
      console.warn('[Gemini Engine] Erro na geração com IA, acionando motor cirúrgico local do Desktop:', aiErr?.message);
    }
  }

  // 2. Motor Cirúrgico Local do Billy Desktop com Injeção Precisa no Template Oficial
  const localHtml = adaptDesktopTemplateLocally(
    baseTemplateHtml,
    input,
    heroImg,
    gallery,
    cleanPhone,
    whatsappLink
  );
  return { html: localHtml, usedAi: false };
}
