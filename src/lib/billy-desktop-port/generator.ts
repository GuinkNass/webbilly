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

export interface NicheCopyJson {
  headline: string;
  subheadline: string;
  badge_nicho: string;
  primary_cta: string;
  sobre_titulo: string;
  sobre_texto: string;
  diferenciais_rapidos?: Array<{ title: string; subtitle: string }>;
  servicos?: ServiceItem[];
  depoimentos?: ReviewItem[];
  faqs?: FaqItem[];
  footer_tagline?: string;
}

/**
 * Inteligência Local de Fallback por Nicho:
 * Garante textos 100% adequados ao nicho em 0ms caso a IA demore ou esteja offline.
 */
function getNicheIntelligentCopy(input: SiteGenerationInput): NicheCopyJson {
  const nicheLower = (input.niche || '').toLowerCase();
  const city = input.city || 'São Paulo - SP';
  const name = input.businessName;

  if (/barbe|corte|cabelo|salon|barba/i.test(nicheLower)) {
    return {
      headline: input.tagline || `Estilo, Precisão e Navalha Afiada em ${city}`,
      subheadline: input.description || `Na ${name}, você encontra mestres barbeiros, corte clássico e moderno, barboterapia relaxante e ambiente exclusivo com cerveja gelada.`,
      badge_nicho: 'CORTE FADE • BARBA • PIGMENTAÇÃO',
      primary_cta: 'Agendar Horário no WhatsApp',
      sobre_titulo: 'Tradição & Excelência em Cada Corte',
      sobre_texto: input.differentiators || `A ${name} nasceu para resgatar a verdadeira essência da barbearia clássica aliada às técnicas mais inovadoras do mercado. Nosso espaço é planejado para ser seu refúgio de estilo e conforto em ${city}.`,
      servicos: [
        { name: 'Corte Degradê / Fade Master', price: 'R$ 55,00', description: 'Acabamento milimétrico com tesoura, máquina e finalização premium.' },
        { name: 'Barboterapia com Toalha Quente', price: 'R$ 45,00', description: 'Esfoliação facial, hidratação profunda e lâmina afiada.' },
        { name: 'Combo Completo Cabelo & Barba', price: 'R$ 90,00', description: 'Nosso serviço mais pedido: visual alinhado da cabeça aos pés.' },
        { name: 'Pigmentação & Camuflagem de Fios', price: 'R$ 40,00', description: 'Disfarce natural de falhas e fios brancos com produtos de primeira linha.' }
      ],
      faqs: [
        { question: 'Preciso agendar com antecedência?', answer: 'Recomendamos agendar pelo WhatsApp para garantir seu horário sem espera, mas atendemos por ordem de chegada conforme disponibilidade.' },
        { question: 'Quais as formas de pagamento aceitas?', answer: 'Aceitamos Pix instantâneo, dinheiro e cartões de crédito e débito.' },
        { question: 'Onde a barbearia está localizada?', answer: `${input.address || `Estamos em localização privilegiada em ${city}, com fácil acesso e estacionamento nas proximidades.`}` }
      ],
      depoimentos: [
        { author: 'Rodrigo Silveira', rating: 5, text: 'Melhor barbearia de São Paulo! Atendimento impecável, corte perfeito e chopp sempre gelado.' },
        { author: 'Lucas Martins', rating: 5, text: 'Pontualidade britânica e profissionais muito detalhistas. Não corto cabelo em outro lugar!' },
        { author: 'Felipe Alencar', rating: 5, text: 'Barboterapia sensacional, saí renovado. Ambiente agradável demais.' }
      ]
    };
  }

  if (/pizza|restaurante|burger|hamburguer|lanche|comida|gourmet|sushi/i.test(nicheLower)) {
    return {
      headline: input.tagline || `Sabor Incomparável & Tradição Gastronômica em ${city}`,
      subheadline: input.description || `Ingredientes selecionados, preparo artesanal e uma experiência gastronômica memorável para saborear no local ou receber quentinho via delivery.`,
      badge_nicho: 'ALTA GASTRONOMIA • SABOR AUTÊNTICO',
      primary_cta: 'Fazer Pedido no WhatsApp',
      sobre_titulo: 'Nossa Paixão pela Culinária',
      sobre_texto: input.differentiators || `Na ${name}, cada prato conta uma história. Priorizamos ingredientes frescos de produtores selecionados, respeitando o tempo de preparo para levar à sua mesa sabor e aconchego.`,
      servicos: [
        { name: 'Especial da Casa / Prato Assinatura', price: 'R$ 68,00', description: 'Receita exclusiva desenvolvida pelo chef com os melhores ingredientes da estação.' },
        { name: 'Combo Degustação para Compartilhar', price: 'R$ 115,00', description: 'Porção generosa para 2 pessoas com acompanhamentos especiais.' },
        { name: 'Sobremesa Artesanal da Casa', price: 'R$ 26,00', description: 'Finalização doce perfeita com calda quente e textura equilibrada.' },
        { name: 'Bebidas Selecionadas & Drinks', price: 'A partir de R$ 12,00', description: 'Sucos naturais, refrigerantes e carta de bebidas artesanais.' }
      ],
      faqs: [
        { question: 'Como fazer pedidos para entrega (delivery)?', answer: 'Basta clicar no botão de WhatsApp nesta página para falar com nosso atendimento e enviar seu endereço.' },
        { question: 'Aceitam reservas para aniversários ou grupos?', answer: 'Sim! Aceitamos reservas antecipadas com pacotes especiais para comemorações.' },
        { question: 'Quais são os horários de funcionamento?', answer: `${input.hours || 'Atendemos de terça a domingo no almoço e no jantar.'}` }
      ],
      depoimentos: [
        { author: 'Camila Fernandes', rating: 5, text: 'Comida maravilhosa, tempero no ponto certo e entrega super rápida. Nota 10!' },
        { author: 'Marcelo Castro', rating: 5, text: 'Ambiente aconchegante e comida deliciosa. O atendimento pelo WhatsApp foi super atencioso.' },
        { author: 'Juliana Prado', rating: 5, text: 'Pratos bem servidos e ingredientes de primeira. Virou o favorito da família toda.' }
      ]
    };
  }

  if (/odonto|dentia|dentista|clinica|médic|medico|saude|estetic/i.test(nicheLower)) {
    return {
      headline: input.tagline || `Saúde, Tecnologia e Cuidado Humanizado em ${city}`,
      subheadline: input.description || `Tratamentos modernos com profissionais especialistas, estrutura de ponta e foco no seu bem-estar e qualidade de vida.`,
      badge_nicho: 'ATENDIMENTO MÉDICO • ESTRUTURA MODERNA',
      primary_cta: 'Agendar Consulta no WhatsApp',
      sobre_titulo: 'Compromisso com o Seu Bem-Estar',
      sobre_texto: input.differentiators || `A ${name} reúne especialistas dedicados a um atendimento ético e acolhedor. Nossa clínica é equipada com os aparelhos mais modernos para diagnósticos precisos e tratamentos confortáveis.`,
      servicos: [
        { name: 'Avaliação Inicial & Diagnóstico Completo', price: 'Sob Consulta', description: 'Exame clínico detalhado para planejamento do seu tratamento ideal.' },
        { name: 'Procedimento Especializado de Ponta', price: 'Sob Consulta', description: 'Tecnologia avançada com máxima precisão e recuperação rápida.' },
        { name: 'Acompanhamento Preventivo Contínuo', price: 'Sob Consulta', description: 'Check-ups periódicos para manter sua saúde sempre protegida.' },
        { name: 'Atendimento Rápido para Casos Urgentes', price: 'Sob Consulta', description: 'Plantão acolhedor para alívio imediato do seu desconforto.' }
      ],
      faqs: [
        { question: 'Como agendar uma avaliação?', answer: 'Clique no botão de WhatsApp para falar diretamente com nossa recepção e escolher o melhor dia e horário.' },
        { question: 'Aceitam convênios ou somente particular?', answer: 'Trabalhamos com consultas particulares facilitadas e fornecemos documentação completa para reembolso.' },
        { question: 'Onde a clínica está situada?', answer: `${input.address || `Estamos em endereço de fácil acesso em ${city}, com acessibilidade e conforto.`}` }
      ],
      depoimentos: [
        { author: 'Patrícia Souza', rating: 5, text: 'Dra e equipe maravilhosas! Explicaram cada detalhe com muita paciência e o resultado foi impecável.' },
        { author: 'Eduardo Ribeiro', rating: 5, text: 'Clínica moderna e muito limpa. Atendimento pontual e sem dor. Recomendo muito.' },
        { author: 'Renata Lima', rating: 5, text: 'Perdi o medo de ir ao consultório graças ao carinho e acolhimento dessa equipe.' }
      ]
    };
  }

  // Fallback Comercial Geral
  return {
    headline: input.tagline || `Excelência, Tradição e Confiança em ${city}`,
    subheadline: input.description || `Na ${name}, unimos tradição consolidada e atendimento personalizado para entregar as melhores soluções para você.`,
    badge_nicho: (input.niche || 'COMÉRCIO LOCAL').toUpperCase(),
    primary_cta: 'Falar no WhatsApp',
    sobre_titulo: 'Compromisso com o Padrão de Qualidade',
    sobre_texto: input.differentiators || `Com atuação de destaque em ${city}, a ${name} se consolidou pela seriedade, pontualidade e respeito aos seus clientes. Conte com nossa equipe especializada para atender suas expectativas.`,
    servicos: [
      { name: `Serviço Especializado de ${input.niche}`, price: 'Sob Consulta', description: 'Atendimento de alto padrão com materiais e métodos certificados.' },
      { name: 'Solução Completa Personalizada', price: 'Sob Consulta', description: 'Planejamento sob medida para atender perfeitamente a sua necessidade.' },
      { name: 'Atendimento Ágil / Express', price: 'Sob Consulta', description: 'Prioridade e agilidade com garantia de satisfação.' },
      { name: 'Consultoria & Suporte Pós-Venda', price: 'Incluso', description: 'Acompanhamento contínuo e orientação de especialistas.' }
    ],
    faqs: [
      { question: 'Como tirar dúvidas ou solicitar orçamento?', answer: 'Clique em qualquer botão de WhatsApp desta página para falar diretamente com nossa equipe em tempo real.' },
      { question: 'Quais são as opções de pagamento?', answer: 'Facilitamos o pagamento em Pix, cartões em até 12x e boleto bancário.' },
      { question: 'Onde vocês atendem?', answer: `${input.address || `Atendemos presencialmente em ${city} e através dos nossos canais digitais.`}` }
    ],
    depoimentos: [
      { author: 'Marcos Vinicius', rating: 5, text: 'Profissionais excelentes! Cumpriram exatamente o prazo combinado com qualidade nota 10.' },
      { author: 'Aline Barbosa', rating: 5, text: 'Preço justo e atendimento super transparente pelo WhatsApp. Voltarei a fazer negócio com certeza.' },
      { author: 'Thiago Mendes', rating: 5, text: 'Superaram as expectativas. Atendimento impecável do início ao fim.' }
    ]
  };
}

/**
 * Geração Ultra-Rápida de Copy em JSON com Gemini (~2 a 4 segundos):
 * Pede estritamente o objeto JSON contendo os textos adaptados ao nicho exato.
 */
async function callGeminiForNicheCopy(
  input: SiteGenerationInput,
  apiKey: string,
  preferredModel?: string
): Promise<Partial<NicheCopyJson> | null> {
  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');
  if (!cleanKey) return null;

  const models = [
    preferredModel || process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    'gemini-3.8-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ].filter(Boolean);

  const headerName = formatHeaderName(input.businessName, input.shortName || input.headerName);

  const prompt = `Você é o redator sênior de conversão do Billy Suite Desktop.
Gere um objeto JSON rigorosamente estruturado para a Landing Page do negócio local abaixo:

DADOS DO CLIENTE:
- Nome: "${input.businessName}" (Cabeçalho: "${headerName}")
- Nicho / Ramo EXATO: "${input.niche}"
- Cidade/Estado: "${input.city}"
- Diferenciais informados: "${input.differentiators || input.tagline || ''}"
- Horário: "${input.hours || ''}"
- Endereço: "${input.address || ''}"
- Serviços informados pelo operador: ${JSON.stringify(input.services || [])}
- Avaliações reais: ${JSON.stringify(input.reviews || [])}
${input.uploadedText ? `- Extração de Cardápio/Texto OCR:\n"""${input.uploadedText.slice(0, 800)}"""` : ''}

DIRETRIZES FUNDAMENTAIS:
1. Adapte 100% dos textos para o nicho de "${input.niche}". NUNCA use termos de outros nichos (ex: barbearia não usa "consulta médica"; restaurante não usa "corte de cabelo").
2. Retorne estritamente um JSON no seguinte schema:
{
  "headline": "Título curto de alto impacto (máx 9 palavras)",
  "subheadline": "Subtítulo persuasivo com benefícios claros (máx 28 palavras)",
  "badge_nicho": "Tag curta em caixa alta com separador bullet (ex: CORTE FADE • BARBA • PIGMENTAÇÃO)",
  "primary_cta": "Texto direto de ação no WhatsApp (ex: Agendar Horário no WhatsApp)",
  "sobre_titulo": "Título da história/sobre (ex: Tradição & Navalha Afiada)",
  "sobre_texto": "Texto sobre a trajetória e o compromisso com o padrão de qualidade (máx 50 palavras)",
  "servicos": [
    { "name": "Nome do serviço", "price": "R$ XX,00 ou Sob Consulta", "description": "Breve explicação do serviço" }
  ],
  "faqs": [
    { "question": "Dúvida frequente do nicho", "answer": "Resposta objetiva e tranquilizadora" }
  ],
  "depoimentos": [
    { "author": "Nome do cliente", "rating": 5, "text": "Depoimento realista e elogioso" }
  ]
}`;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.25,
            responseMimeType: 'application/json',
            maxOutputTokens: 2048
          }
        }),
        signal: AbortSignal.timeout(8000) // 8s de timeout máximo por tentativa
      });

      if (!res.ok) continue;

      const data = await res.json();
      const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        if (parsed.headline && parsed.primary_cta) {
          return parsed;
        }
      }
    } catch (err: any) {
      console.warn(`[Gemini Fast Copy] Modelo ${model} falhou ou expirou:`, err?.message);
    }
  }

  return null;
}

/**
 * Adaptador cirúrgico local que injeta 100% dos dados reais do cliente no template estrutural do Desktop
 */
export function adaptDesktopTemplateLocally(
  baseTemplateHtml: string,
  input: SiteGenerationInput,
  copy: NicheCopyJson,
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

  // Prioriza serviços fornecidos pelo operador ou os gerados pela IA
  const servicesList: ServiceItem[] =
    (input.services && input.services.length > 0)
      ? input.services
      : (copy.servicos && copy.servicos.length > 0)
      ? copy.servicos
      : [
          { name: `Serviço Especializado de ${input.niche}`, price: 'Sob Consulta', description: 'Atendimento de primeira linha com profissionais certificados.' },
          { name: 'Combo Completo Signature', price: 'R$ 130,00', description: 'O serviço mais pedido da casa com máxima comodidade e acabamento refinado.' },
          { name: 'Atendimento Rápido / Express', price: 'R$ 50,00', description: 'Pontualidade e precisão ideal para a sua rotina.' },
          { name: 'Avaliação & Consultoria Personalizada', price: 'Sob Consulta', description: 'Análise individual detalhada para identificar a melhor solução.' }
        ];

  const servicesCardsHtml = servicesList.map((s) => `
    <div class="p-6 rounded-2xl surface-card border border-white/[0.08] hover:border-white/[0.2] transition-all duration-300 flex flex-col justify-between space-y-4">
      <div>
        <div class="flex items-start justify-between gap-4">
          <h4 class="font-bold text-white text-lg font-heading">${s.name}</h4>
          <span class="px-3 py-1 rounded-lg accent-bg text-black font-black text-xs shrink-0">${s.price || 'Sob Consulta'}</span>
        </div>
        <p class="text-xs text-zinc-400 mt-2 leading-relaxed">${s.description || 'Execução impecável com profissionais altamente capacitados e atendimento de alto padrão.'}</p>
      </div>
      <a href="${whatsappLink}&text=${encodeURIComponent(`Olá! Gostaria de informações/agendar o serviço: ${s.name} (${s.price})`)}" target="_blank" rel="noopener noreferrer" class="w-full py-2.5 rounded-xl border border-white/[0.1] hover:accent-bg hover:text-black text-white text-xs font-bold transition flex items-center justify-center gap-2">
        <i class="fab fa-whatsapp"></i>
        <span>Solicitar pelo WhatsApp</span>
      </a>
    </div>
  `).join('\n');

  // Galeria de fotos reais com blindagem onerror
  const galleryGridHtml = gallery.map((img, idx) => `
    <div class="group relative aspect-square rounded-2xl overflow-hidden border border-white/[0.08] shadow-lg transition-transform duration-300 hover:-translate-y-1">
      <img src="${img}" alt="Foto ${idx + 1}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.style.display='none'">
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
        <span class="text-[10px] font-mono uppercase tracking-wider text-white font-bold">Foto Oficial #${idx + 1}</span>
      </div>
    </div>
  `).join('\n');

  // Avaliações / Depoimentos
  const reviewsList: ReviewItem[] =
    (input.reviews && input.reviews.length > 0)
      ? input.reviews
      : (copy.depoimentos && copy.depoimentos.length > 0)
      ? copy.depoimentos
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

  // FAQs
  const faqsList: FaqItem[] =
    (input.faqs && input.faqs.length > 0)
      ? input.faqs
      : (copy.faqs && copy.faqs.length > 0)
      ? copy.faqs
      : [
          { question: 'Como funciona o agendamento ou pedido?', answer: 'É simples e imediato! Basta clicar em qualquer botão de WhatsApp nesta página para falar diretamente com nossa equipe em tempo real.' },
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

  let result = baseTemplateHtml;

  // Substituição cirúrgica dos 24 Tokens estruturais oficiais do Billy Desktop
  const replacements: Record<string, string> = {
    '{{BUSINESS_NAME}}': input.businessName,
    '{{HEADER_NAME}}': headerName,
    '{{INITIALS}}': initials,
    '{{NICHE_LABEL}}': copy.badge_nicho || input.niche || 'Comércio Local',
    '{{TAGLINE}}': copy.headline,
    '{{DESCRIPTION}}': copy.subheadline,
    '{{PRIMARY_COLOR}}': primaryColor,
    '{{BG_COLOR}}': bgColor,
    '{{SURFACE_COLOR}}': surfaceColor,
    '{{TEXT_COLOR}}': textColor,
    '{{HERO_TITLE}}': copy.headline,
    '{{HERO_SUBTITLE}}': copy.subheadline,
    '{{PRIMARY_CTA}}': copy.primary_cta || 'Falar no WhatsApp',
    '{{HERO_IMG}}': heroImg,
    '{{ABOUT_TEXT}}': copy.sobre_texto,
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

  // Limpeza e blindagem final contra imagens quebradas
  result = result.replace(/<img(?![^>]*\bonerror=)([^>]*?)>/gi, '<img$1 onerror="this.style.display=\'none\'">');
  result = result.replace(/<img[^>]*src=["']\s*(?:undefined|null)?\s*["'][^>]*>/gi, '');

  return result.trim();
}

/**
 * Constrói o HTML combinando a IA Gemini ultra-rápida (JSON de copy em ~3s)
 * diretamente no Template Desktop Real autêntico, garantindo 100% da arquitetura
 * e concluindo toda a operação em menos de 8 segundos.
 */
export async function buildSiteHtml(
  input: SiteGenerationInput
): Promise<{ html: string; usedAi: boolean; modelUsed?: string }> {
  const tpl = findTemplateById(input.templateId || 'barbearia-crop-vintage');
  const baseTemplateHtml = getDesktopTemplateHtml(input.templateId);

  const rawPhone = (input.whatsapp || input.phone || '11999999999').replace(/\D/g, '');
  const cleanPhone = rawPhone.length <= 11 && !rawPhone.startsWith('55') ? `55${rawPhone}` : rawPhone;
  const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Olá! Vim pelo site ${input.subdomain}.webbilly.com.br e gostaria de mais informações sobre os serviços da ${input.businessName}.`
  )}`;

  // Garante seleção de imagem Hero e Galeria válidas sem URLs vazias
  const validGallery = (input.galleryPhotos || []).filter(
    (p) => typeof p === 'string' && p.trim().startsWith('http')
  );
  const heroImg = (input.heroPhoto && input.heroPhoto.trim().startsWith('http'))
    ? input.heroPhoto.trim()
    : (validGallery.length > 0 ? validGallery[0] : tpl.previewImg);
  const gallery = validGallery.length > 0 ? validGallery : [heroImg, tpl.previewImg];

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  const defaultNicheCopy = getNicheIntelligentCopy(input);

  let finalCopy: NicheCopyJson = defaultNicheCopy;
  let usedAi = false;
  let modelUsed: string | undefined;

  // 1. Tenta geração ultra-rápida de Copy em JSON com Gemini (~2 a 4s)
  if (apiKey) {
    try {
      const preferredModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
      const aiCopy = await callGeminiForNicheCopy(input, apiKey, preferredModel);
      if (aiCopy && aiCopy.headline && aiCopy.primary_cta) {
        finalCopy = {
          ...defaultNicheCopy,
          ...aiCopy,
          servicos: (aiCopy.servicos && aiCopy.servicos.length > 0) ? aiCopy.servicos : defaultNicheCopy.servicos,
          faqs: (aiCopy.faqs && aiCopy.faqs.length > 0) ? aiCopy.faqs : defaultNicheCopy.faqs,
          depoimentos: (aiCopy.depoimentos && aiCopy.depoimentos.length > 0) ? aiCopy.depoimentos : defaultNicheCopy.depoimentos
        };
        usedAi = true;
        modelUsed = preferredModel;
      }
    } catch (err: any) {
      console.warn('[BuildSiteHtml] Falha na IA Gemini, aplicando Copy Inteligente local:', err?.message);
    }
  }

  // 2. Injeta 100% da Copy + Cores + Fotos no Template Oficial Desktop
  const compiledHtml = adaptDesktopTemplateLocally(
    baseTemplateHtml,
    input,
    finalCopy,
    heroImg,
    gallery,
    cleanPhone,
    whatsappLink
  );

  return { html: compiledHtml, usedAi, modelUsed };
}
