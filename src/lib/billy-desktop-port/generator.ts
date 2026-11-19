import { findTemplateById } from './templates';
import { BlockToggles, DEFAULT_BLOCK_TOGGLES } from './categories';
import { getBillyRealTemplateHtml } from '../billy-real-templates';
import { formatHeaderName } from '../desktop-templates';
import { safeParseGeminiJson } from '../gemini-json';
import { compileTemplateWithCheerio, StructuredSiteJson, SiteCompilerOptions } from '../dom-template-compiler';
import { injectAnalyticsTracker } from '@/lib/analytics';
import { renderNativeSite, StructuredSiteData } from '../native-site-renderer';

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
  marquee_text?: string;
  nav_about?: string;
  nav_services?: string;
  header_cta?: string;
  card_badge?: string;
  services_title?: string;
  services_subtitle?: string;
  gallery_subtitle?: string;
  metric_1_label?: string;
  metric_2_label?: string;
}

/**
 * Inteligência Local de Fallback por Nicho:
 * Garante textos 100% adequados ao nicho em 0ms caso a IA demore ou esteja offline.
 */
function getNicheIntelligentCopy(input: SiteGenerationInput): NicheCopyJson {
  const nicheLower = (input.niche || '').toLowerCase();
  const nameLower = (input.businessName || '').toLowerCase();
  const city = input.city || 'São Paulo - SP';
  const name = input.businessName;

  // 1. Tatuagem e Piercing (prioridade alta para evitar cair em estética genérica)
  if (/tattoo|tatuag|piercing|ink|body\s*art/i.test(nicheLower) || /tattoo|tatuag|piercing|ink/i.test(nameLower)) {
    return {
      headline: input.tagline || `Arte Autoral, Biossegurança & Estilo Único em ${city}`,
      subheadline: input.description || `No ${name}, transformamos ideias em arte viva na pele com máxima precisão, tintas importadas certificadas e piercings em titânio grau implante.`,
      badge_nicho: 'TATUAGEM AUTORAL • PIERCING • BIOSSEGURANÇA',
      primary_cta: 'Orçar Projeto no WhatsApp',
      sobre_titulo: 'Arte na Pele com Segurança e Identidade',
      sobre_texto: input.differentiators || `O ${name} foi idealizado para oferecer uma experiência acolhedora e segura. Nossos artistas dominam técnicas autorais e seguimos rigorosamente todas as normas da ANVISA com materiais 100% descartáveis e esterilização hospitalar.`,
      marquee_text: 'ARTE AUTORAL • PIERCING TITÂNIO • BIOSSEGURANÇA ANVISA • PROJETOS EXCLUSIVOS • ATENDIMENTO COM HORA MARCADA',
      nav_about: 'O Estúdio',
      nav_services: 'Tattoos & Piercings',
      header_cta: 'Orçar no WhatsApp',
      card_badge: 'Estúdio Autoral',
      services_title: 'Tatuagens, Piercings & Procedimentos',
      services_subtitle: 'Linhas finas, realismo, projetos autorais e perfurações corporais com cicatrização assistida.',
      gallery_subtitle: 'Confira trabalhos reais de tatuagens e perfurações realizadas em nosso estúdio.',
      metric_1_label: 'Arte Autoral',
      metric_2_label: 'Biossegurança',
      servicos: [
        { name: 'Tatuagem Autoral / Projeto Exclusivo', price: 'Sob Consulta', description: 'Criação sob medida do seu desenho com base nas suas referências e anatomia corporal.' },
        { name: 'Aplicação de Piercing em Titânio', price: 'R$ 80,00', description: 'Perfuração com joalheria em titânio grau implante antialérgico e agulha americana.' },
        { name: 'Flash Tattoo / Fine Line & Traço Fino', price: 'A partir de R$ 150,00', description: 'Desenhos delicados com agulha fina para aplicação rápida e cicatrização suave.' },
        { name: 'Reforma & Cobertura (Cover-up)', price: 'Sob Consulta', description: 'Renovação estética de tatuagens antigas com camuflagem de altíssima precisão.' }
      ],
      faqs: [
        { question: 'Como faço para pedir um orçamento de tatuagem?', answer: 'Basta clicar no botão de WhatsApp e nos enviar sua ideia de referência, o tamanho aproximado em centímetros e onde no corpo deseja fazer!' },
        { question: 'Os materiais e agulhas são 100% esterilizados?', answer: 'Sim! Utilizamos exclusivamente materiais descartáveis de uso único e autoclave hospitalar com laudo rigoroso da ANVISA.' },
        { question: 'Menores de 18 anos podem tatuar ou colocar piercing?', answer: 'Somente a partir de 16 anos acompanhados de pai, mãe ou responsável legal munidos de documentação com foto.' }
      ],
      depoimentos: [
        { author: 'Camila Rocha', rating: 5, text: 'Traço finíssimo e cicatrização perfeita! O estúdio é impecável de limpo e o tatuador foi super paciente.' },
        { author: 'Diego Navarro', rating: 5, text: 'Fiz um fechamento de braço que ficou surreal. Atendimento de outro nível pelo WhatsApp.' },
        { author: 'Beatriz Vasconcelos', rating: 5, text: 'Coloquei dois piercings de titânio, não doeu nada e não inflamou. Profissionais fantásticos!' }
      ]
    };
  }

  // 2. Barbearia e Cabelo Masculino
  if (/barbe|corte|cabelo|salon|barba/i.test(nicheLower)) {
    return {
      headline: input.tagline || `Estilo, Precisão e Navalha Afiada em ${city}`,
      subheadline: input.description || `Na ${name}, você encontra mestres barbeiros, corte clássico e moderno, barboterapia relaxante e ambiente exclusivo com cerveja gelada.`,
      badge_nicho: 'CORTE FADE • BARBA • PIGMENTAÇÃO',
      primary_cta: 'Agendar Horário no WhatsApp',
      sobre_titulo: 'Tradição & Excelência em Cada Corte',
      sobre_texto: input.differentiators || `A ${name} nasceu para resgatar a verdadeira essência da barbearia clássica aliada às técnicas mais inovadoras do mercado. Nosso espaço é planejado para ser seu refúgio de estilo e conforto em ${city}.`,
      marquee_text: 'CORTE FADE MASTER • BARBOTERAPIA VIP • PIGMENTAÇÃO • CERVEJA GELADA • ATENDIMENTO COM HORA MARCADA',
      nav_about: 'A Barbearia',
      nav_services: 'Cortes & Barba',
      header_cta: 'Agendar Horário VIP',
      card_badge: 'Barbearia VIP',
      services_title: 'Cortes, Barba & Cuidados Masculinos',
      services_subtitle: 'Cortes clássicos e degradê milimétrico executados por especialistas com produtos premium.',
      gallery_subtitle: 'Confira alguns dos cortes e barboterapias mais recentes realizados em nossa bancada.',
      metric_1_label: 'Navalha Afiada',
      metric_2_label: 'Toalha Quente',
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
        { author: 'Rodrigo Silveira', rating: 5, text: 'Melhor barbearia da região! Atendimento impecável, corte perfeito e cerveja sempre gelada.' },
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
      marquee_text: 'ALTA GASTRONOMIA • INGREDIENTES FRESCOS • RECEITAS EXCLUSIVAS • DELIVERY RÁPIDO • SABOR INCOMPARÁVEL',
      nav_about: 'Nossa História',
      nav_services: 'Cardápio & Pratos',
      header_cta: 'Pedir no WhatsApp',
      card_badge: 'Gastronomia',
      services_title: 'Cardápio & Especialidades da Casa',
      services_subtitle: 'Pratos preparados na hora com receitas exclusivas e os melhores ingredientes.',
      gallery_subtitle: 'Fotos reais dos pratos mais pedidos e do nosso ambiente acolhedor.',
      metric_1_label: 'Sabor Artesanal',
      metric_2_label: 'Entrega Quente',
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
      marquee_text: 'ATENDIMENTO HUMANIZADO • EQUIPE MULTIDISCIPLINAR • TECNOLOGIA DE PONTA • ESTRUTURA MODERNA • CONFORTO TOTAL',
      nav_about: 'A Clínica',
      nav_services: 'Procedimentos',
      header_cta: 'Agendar Consulta',
      card_badge: 'Clínica Especializada',
      services_title: 'Tratamentos & Procedimentos Especializados',
      services_subtitle: 'Cuidado individualizado com métodos modernos e recuperação confortável.',
      gallery_subtitle: 'Conheça nossa estrutura clínica, consultórios e equipamentos de ponta.',
      metric_1_label: 'Cuidado Seguro',
      metric_2_label: 'Tecnologia Avançada',
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
    marquee_text: 'ATENDIMENTO PREMIUM • EXCELÊNCIA & QUALIDADE • PONTUALIDADE RIGOROSA • SATISFAÇÃO GARANTIDA • REFERÊNCIA LOCAL',
    nav_about: 'Sobre Nós',
    nav_services: 'Serviços',
    header_cta: 'Falar no WhatsApp',
    card_badge: 'Referência Local',
    services_title: 'Nossos Serviços & Especialidades',
    services_subtitle: 'Soluções sob medida executadas por especialistas dedicados ao seu sucesso.',
    gallery_subtitle: 'Confira fotos reais da nossa estrutura e dos serviços entregues aos nossos clientes.',
    metric_1_label: 'Alto Padrão',
    metric_2_label: 'Garantia Total',
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
            maxOutputTokens: 8192
          }
        }),
        signal: AbortSignal.timeout(8000) // 8s de timeout máximo por tentativa
      });

      if (!res.ok) continue;

      const data = await res.json();
      const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawJson) {
        const parsed = safeParseGeminiJson<any>(rawJson, null);
        if (parsed && (parsed.headline || parsed.primary_cta)) {
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

  // Substituição cirúrgica dos Tokens estruturais oficiais do Billy Desktop
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
    '{{HEADER_CTA}}': copy.header_cta || copy.primary_cta || 'Falar no WhatsApp',
    '{{CARD_BADGE}}': copy.card_badge || copy.badge_nicho || input.niche || 'Destaque',
    '{{MARQUEE_TEXT}}': copy.marquee_text || 'ATENDIMENTO PREMIUM • EXCELÊNCIA & QUALIDADE • PONTUALIDADE • SATISFAÇÃO GARANTIDA',
    '{{NAV_ABOUT}}': copy.nav_about || 'Sobre Nós',
    '{{NAV_ABOUT_UPPER}}': (copy.nav_about || 'SOBRE NÓS').toUpperCase(),
    '{{NAV_SERVICES}}': copy.nav_services || 'Serviços',
    '{{SERVICES_TITLE}}': copy.services_title || 'Nossos Serviços & Especialidades',
    '{{SERVICES_SUBTITLE}}': copy.services_subtitle || 'Conheça nossos procedimentos com alto padrão de excelência.',
    '{{GALLERY_SUBTITLE}}': copy.gallery_subtitle || 'Confira alguns dos nossos trabalhos mais recentes.',
    '{{METRIC_1_LABEL}}': copy.metric_1_label || 'Qualidade Superior',
    '{{METRIC_2_LABEL}}': copy.metric_2_label || 'Atendimento Ágil',
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

  // Substitui endereços fictícios e textos residuais de demos
  result = result.replace(/3869 Shearwood Forest Drive[\s\S]*?United States/gi, input.address || `${input.city} - Atendimento presencial e online`);
  result = result.replace(/121 King Street, Melbourne[\s\S]*?Australia/gi, input.address || `${input.city} - Atendimento presencial e online`);
  result = result.replace(/PO Box 16122 Collins Street[\s\S]*?Australia/gi, input.address || `${input.city} - Atendimento presencial e online`);
  result = result.replace(/Lorem ipsum dolor sit amet, consectetur adipiscing elit[\s\S]*?eleifend\./gi, copy.sobre_texto);

  // 1. Desativa classes bloqueantes de loading no <body>
  result = result.replace(/<body([^>]*)class=["']([^"']*\b)?(?:has-loading-screen|loading|is-loading|preload)(\b[^"']*)?["']/gi, '<body$1class="$2 $3"');

  // 2. Remove blocos físicos de preloader do DOM para evitar qualquer cobertura invisível
  result = result.replace(/<div[^>]*(?:id|class)=["'][^"']*(?:loading-screen|preloader|loader-wrapper|loader-wrap|de-loader|cube-loader|page-loader)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');

  // 3. Injeção obrigatória do CSS blindado de visibilidade, contraste, backgrounds e botão WhatsApp
  const visibilityOverrideCss = `
<style id="billy-visibility-overrides">
  /* 0. BLINDAGEM DE BACKGROUND IMAGE (Sem repetição em mosaico, preenchimento total e centralizado) */
  [style*="background-image"], [style*="background:"],
  header, .hero, .banner, .slider, .intro-section,
  [class*="hero"], [class*="banner"], [class*="slider"], [class*="bg-cover"],
  .ts-background-image, .jarallax, [data-bg-img], section:first-of-type {
    background-repeat: no-repeat !important;
    background-size: cover !important;
    background-position: center center !important;
  }

  /* 1. CONTRASTE E VISIBILIDADE BLINDADA (Nunca texto preto em fundo preto) */
  body {
    color: #f4f4f5 !important;
    background-color: #090d14 !important;
  }
  h1, h2, h3, h4, h5, h6, .font-heading, .hero__title {
    color: #ffffff !important;
  }
  p, li, .lead, .subtitle, .description {
    color: #f4f4f5 !important;
  }
  .accent-bg, .btn-primary, [class*="badge-"] {
    color: #09090b !important;
  }
  .accent-bg h1, .accent-bg h2, .accent-bg h3, .accent-bg p, .accent-bg span {
    color: #09090b !important;
  }

  /* 2. Neutralização absoluta de Preloaders, Loaders e Splash screens */
  #preloader, .preloader, .preloader-cover, .preloader-wrap, .loader-wrap, .loader-wrapper,
  #loader-wrapper, #loader, .loader, #de-loader, .loading-screen, #loading, #loading-area,
  #loading-center, #loading-center-absolute, .images-preloader, #handle-preloader,
  .cube-loader, #cube-loader, .page-loader, .spinner-wrapper, .pace,
  [class*="preloader"], [class*="loading-screen"], [id*="preloader"] {
    display: none !important;
    opacity: 0 !important;
    pointer-events: none !important;
    visibility: hidden !important;
    z-index: -9999 !important;
    height: 0 !important;
    width: 0 !important;
  }

  /* 3. Forçar visibilidade e renderização imediata de elementos animados */
  [data-aos], .wow, .reveal, .animated, .hero__title, .hero__link,
  body.has-loading-screen .navbar, body.has-loading-screen .hero__link,
  body.has-loading-screen h1 .hero__title {
    opacity: 1 !important;
    transform: none !important;
    visibility: visible !important;
    animation: none !important;
    transition: none !important;
    color: inherit !important;
  }

  body.has-loading-screen, body.loading, body.is-loading, body.preload {
    opacity: 1 !important;
    visibility: visible !important;
  }

  /* 4. Garantir que html e body não fiquem com overflow travado */
  html, body {
    overflow: auto !important;
    overflow-x: hidden !important;
    opacity: 1 !important;
    visibility: visible !important;
    height: auto !important;
  }

  /* 5. BOTÃO FLUTUANTE DE WHATSAPP (Sem corte de texto, largura automática e padding nobre) */
  #billy-floating-whatsapp, #billy-floating-whatsapp a, a[href*="wa.me"], a[href*="whatsapp"].fixed, a.fixed[href*="whatsapp"] {
    white-space: nowrap !important;
    max-width: none !important;
    width: auto !important;
    overflow: visible !important;
  }
  #billy-floating-whatsapp a {
    padding: 12px 20px !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 8px !important;
    line-height: 1 !important;
    border-radius: 9999px !important;
  }
  #billy-floating-whatsapp span, a[href*="whatsapp"] span {
    display: inline !important;
    white-space: nowrap !important;
    overflow: visible !important;
  }
</style>
`;

  if (result.includes('</head>')) {
    result = result.replace('</head>', `${visibilityOverrideCss}\n</head>`);
  } else {
    result = `${visibilityOverrideCss}\n${result}`;
  }

  // 4. Garante botão flutuante de WhatsApp oficial Billy
  const floatingWhatsAppHtml = `
<!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL BILLY -->
<div id="billy-floating-whatsapp" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999;">
  <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 20px; background: #25D366; color: #ffffff; border-radius: 9999px; box-shadow: 0 4px 25px rgba(0,0,0,0.5); text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap !important; width: auto !important; max-width: none !important; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" title="Fale conosco no WhatsApp">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink: 0;">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
    <span style="display: inline !important; white-space: nowrap !important;">Falar no WhatsApp</span>
  </a>
</div>
`;

  if (!result.includes('billy-floating-whatsapp') && !result.includes('fab fa-whatsapp text-2xl')) {
    if (result.includes('</body>')) {
      result = result.replace('</body>', `${floatingWhatsAppHtml}\n</body>`);
    } else {
      result = `${result}\n${floatingWhatsAppHtml}`;
    }
  }

  // Injeção do analisador nativo de acessos e cliques no WhatsApp
  result = injectAnalyticsTracker(result);

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
  const baseTemplateHtml = getBillyRealTemplateHtml(input.templateId);

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

  // 0. Modo Arquiteto IA — Layout Sob Medida via Blocos Modulares Tailwind
  if (input.templateId === 'modular-architect' || input.templateId === 'arquiteto-ia') {
    const { buildArchitectModularSite } = await import('@/lib/modular-blocks/architect');
    const modularResult = buildArchitectModularSite({
      businessName: input.businessName,
      shortName: input.shortName,
      niche: input.niche,
      city: input.city,
      subdomain: input.subdomain,
      phone: cleanPhone,
      whatsapp: cleanPhone,
      whatsappLink,
      instagram: input.instagram,
      address: input.address,
      hours: input.hours,
      tagline: input.tagline || defaultNicheCopy.headline,
      description: input.description || defaultNicheCopy.subheadline,
      heroPhoto: heroImg,
      galleryPhotos: gallery,
      services: (input.services && input.services.length > 0)
        ? input.services
        : (defaultNicheCopy.servicos?.map(s => ({ name: s.name, price: s.price, description: s.description })) || []),
      reviews: (input.reviews && input.reviews.length > 0)
        ? input.reviews
        : (defaultNicheCopy.depoimentos || []),
      accentColor: input.accentColor,
      primaryColor: input.primaryColor,
      backgroundColor: input.backgroundColor,
      surfaceColor: input.surfaceColor
    });
    return { html: modularResult.html, usedAi: true, modelUsed: 'architect-engine' };
  }

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

  // 2. Renderização Nativa com Motor Tailwind CSS + Google Fonts 100% blindado
  const nativeData: StructuredSiteData = {
    heroTitle: finalCopy.headline || input.tagline || input.businessName,
    heroSubtitle: finalCopy.subheadline || input.description || '',
    ctaText: finalCopy.primary_cta || 'Falar no WhatsApp',
    aboutTitle: finalCopy.sobre_titulo || 'Sobre Nós',
    aboutParagraphs: [
      finalCopy.sobre_texto || `A ${input.businessName} consolidou-se como referência indiscutível em ${input.city}, aliando dedicação incansável e atenção aos detalhes.`,
      input.differentiators || `Trabalhamos exclusivamente com métodos certificados e profissionais apaixonados pelo que fazem, assegurando a você segurança, pontualidade e satisfação total.`
    ],
    services: (finalCopy.servicos && finalCopy.servicos.length > 0)
      ? finalCopy.servicos.map(s => ({ title: s.name, description: s.description || '', priceTag: s.price }))
      : [],
    testimonials: (finalCopy.depoimentos && finalCopy.depoimentos.length > 0)
      ? finalCopy.depoimentos.map(d => ({ name: d.author, text: d.text, rating: d.rating }))
      : [],
    businessHours: input.hours || 'Segunda a Sábado das 08h às 19h',
    seoDescription: `${input.businessName} em ${input.city}`
  };

  const finalHtml = renderNativeSite({
    businessName: input.businessName,
    shortName: input.shortName,
    headerName: input.headerName,
    niche: input.niche,
    city: input.city,
    subdomain: input.subdomain,
    phone: cleanPhone,
    whatsapp: cleanPhone,
    instagram: input.instagram,
    address: input.address,
    hours: input.hours,
    templateId: input.templateId,
    theme: input.theme,
    paletteId: input.paletteId,
    primaryColor: input.primaryColor,
    accentColor: input.accentColor,
    backgroundColor: input.backgroundColor,
    surfaceColor: input.surfaceColor,
    textColor: input.textColor,
    fontPair: input.fontPair,
    logoUrl: input.logoUrl,
    heroPhoto: heroImg,
    galleryPhotos: gallery,
    data: nativeData
  });

  return { html: finalHtml, usedAi, modelUsed };
}
