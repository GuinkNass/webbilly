export interface CategoryGroup {
  group: string;
  categories: string[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    group: 'Saúde & Estética Avançada',
    categories: [
      'Odontologia Estética & Implantes',
      'Harmonização Facial & Botox',
      'Dermatologia & Laser',
      'Clínica Médica & Cirurgia Plástica',
      'Estética Corporal & Massoterapia',
      'Podologia Clínica',
      'Nutrição & Emagrecimento',
      'Fisioterapia & Pilates'
    ]
  },
  {
    group: 'Arte, Beleza & Estilo',
    categories: [
      'Tatuagem Realista & Preto e Cinza',
      'Tatuagem Fineline & Floral',
      'Body Piercing & Modificações',
      'Barbearia Tradicional & VIP',
      'Salão de Beleza & Colorimetria',
      'Nail Designer & Alongamentos',
      'Lash Designer & Sobrancelhas',
      'Maquiagem Profissional',
      'Fotografia & Ensaios'
    ]
  },
  {
    group: 'Gastronomia Local',
    categories: [
      'Hamburgueria Artesanal',
      'Pizzaria Forno a Lenha',
      'Restaurante Japonês & Sushi',
      'Confeitaria Artesanal & Café',
      'Steakhouse & Churrascaria',
      'Bar, Choperia & Petiscaria',
      'Comida Mexicana & Tacos',
      'Padaria & Pães Artesanais'
    ]
  },
  {
    group: 'Serviços Profissionais',
    categories: [
      'Advocacia Trabalhista & Cível',
      'Imobiliária & Consultoria de Imóveis',
      'Arquitetura & Design de Interiores',
      'Contabilidade & Assessoria Fiscal',
      'Engenharia Civil & Laudos',
      'Consultoria Empresarial & Marketing'
    ]
  },
  {
    group: 'Automotivo & Manutenção',
    categories: [
      'Estética Automotiva & Detailing',
      'Oficina Mecânica & Diagnósticos',
      'Funilaria, Pintura & Martelinho',
      'Auto Elétrica & Acessórios',
      'Ar-condicionado Automotivo',
      'Centro Automotivo & Pneus',
      'Autoescola & Centro de Formação (CFC)'
    ]
  },
  {
    group: 'Casa, Decoração & Construção',
    categories: [
      'Marcenaria Sob Medida & Móveis',
      'Design de Ambientes & Cortinas',
      'Vidraçaria & Esquadrias de Alumínio',
      'Reformas & Acabamentos',
      'Pintura Residencial & Efeitos',
      'Eletricista & Instalações',
      'Serralheria & Estruturas Metálicas'
    ]
  }
];

export const TONES_OF_VOICE = [
  { id: 'comercial', label: 'Comercial Agressivo / Alta Conversão', icon: '🚀', desc: 'Foco total em vendas rápidas, gatilhos de escassez, autoridade e CTAs diretos no WhatsApp.' },
  { id: 'luxo', label: 'Luxo / Exclusivo', icon: '👑', desc: 'Linguagem nobre, sofisticada e com ênfase em alto padrão, requinte e atendimento privativo.' },
  { id: 'criativo', label: 'Jovem / Criativo', icon: '🎨', desc: 'Tom descontraído, moderno, autêntico e focado em conexão visual, originalidade e estilo.' },
  { id: 'institucional', label: 'Técnico / Institucional', icon: '🏢', desc: 'Clareza técnica, credibilidade formal, segurança jurídica e precisão para B2B e clínicas.' }
];

export const ACCENT_COLORS = [
  { name: 'Verde Billy Neon', hex: '#84cc16' },
  { name: 'Roxo Violeta', hex: '#8b5cf6' },
  { name: 'Verde WhatsApp', hex: '#22c55e' },
  { name: 'Dourado Nobre', hex: '#d4af37' },
  { name: 'Azul Royal', hex: '#2563eb' },
  { name: 'Vermelho Intenso', hex: '#ef4444' },
  { name: 'Rosa Magenta', hex: '#ec4899' },
  { name: 'Laranja Vibrante', hex: '#f97316' },
  { name: 'Âmbar Dourado', hex: '#f59e0b' },
  { name: 'Ciano High-Tech', hex: '#06b6d4' }
];

export interface CuratedPalette {
  id: string;
  name: string;
  category: string;
  nicheTag?: string;
  primary: string;
  background: string;
  surface: string;
  text: string;
  desc: string;
}

export const CURATED_PALETTES: CuratedPalette[] = [
  {
    id: 'juridico-naval-ouro',
    name: 'Jurídico Naval & Ouro',
    category: 'Advocacia & Corporativo',
    primary: '#d97706',
    background: '#0b0f19',
    surface: '#1e293b',
    text: '#f8fafc',
    desc: 'Autoridade e sobriedade para advogados, perícias e consultorias.'
  },
  {
    id: 'clinica-clean-esmeralda',
    name: 'Clínica Clean Esmeralda',
    category: 'Saúde & Medicina',
    primary: '#10b981',
    background: '#022c22',
    surface: '#064e3b',
    text: '#f0fdf4',
    desc: 'Higiene, tranquilidade e confiança clínica para consultórios.'
  },
  {
    id: 'luxo-noir-champagne',
    name: 'Luxo Noir & Champagne',
    category: 'Alto Padrão & Joalheria',
    primary: '#d4af37',
    background: '#0a0a0a',
    surface: '#171717',
    text: '#fdfbf7',
    desc: 'Elegância minimalista com acabamento em ouro champagne.'
  },
  {
    id: 'gastronomia-terracota',
    name: 'Gastronomia Terracota',
    category: 'Restaurantes & Cafés',
    primary: '#ea580c',
    background: '#1c0d02',
    surface: '#451a03',
    text: '#fff7ed',
    desc: 'Tons quentes e acolhedores de forno a lenha e especiarias.'
  },
  {
    id: 'tech-slate-neon',
    name: 'Tech Slate & Neon',
    category: 'Tecnologia & B2B Moderno',
    primary: '#00f0ff',
    background: '#090d16',
    surface: '#111827',
    text: '#f0f9ff',
    desc: 'Estética futurista e veloz com contraste vibrante.'
  },
  {
    id: 'minimalista-editorial',
    name: 'Minimalista Editorial',
    category: 'Arquitetura & Design',
    primary: '#a1a1aa',
    background: '#09090b',
    surface: '#18181b',
    text: '#fafafa',
    desc: 'Visual revista de arquitetura com tons neutros puros.'
  },
  {
    id: 'barbearia-vintage-tabaco',
    name: 'Barbearia Vintage Tabaco',
    category: 'Barbearia & Estilo',
    primary: '#b45309',
    background: '#140e0a',
    surface: '#292524',
    text: '#fef3c7',
    desc: 'Couro envelhecido, toalha quente e atmosfera clássica.'
  },
  {
    id: 'odonto-cirurgico-blue',
    name: 'Odonto Cirúrgico Blue',
    category: 'Odontologia & Implantes',
    primary: '#0284c7',
    background: '#082f49',
    surface: '#0c4a6e',
    text: '#f0f9ff',
    desc: 'Azul cirúrgico brilhante transmitindo assepsia e precisão.'
  },
  {
    id: 'estetica-spa-rose',
    name: 'Estética & Spa Rosé',
    category: 'Estética & Harmonização',
    primary: '#f43f5e',
    background: '#1f040d',
    surface: '#4c0519',
    text: '#fff1f2',
    desc: 'Delicadeza, beleza e rejuvenescimento facial.'
  },
  {
    id: 'automotivo-carbono',
    name: 'Automotivo Carbono',
    category: 'Mecânica & Detailing',
    primary: '#ef4444',
    background: '#090b10',
    surface: '#181d28',
    text: '#f8fafc',
    desc: 'Fibra de carbono e vermelho racing de alto desempenho.'
  },
  {
    id: 'petshop-vet-menta',
    name: 'Pet Shop & Vet Menta',
    category: 'Veterinária & Pet Care',
    primary: '#14b8a6',
    background: '#042f2e',
    surface: '#0f4a47',
    text: '#f0fdfa',
    desc: 'Frescor, carinho e cuidado dedicado aos animais.'
  },
  {
    id: 'fitness-crossfit-vulcanico',
    name: 'Fitness & Vulcânico',
    category: 'Academias & Luta',
    primary: '#f97316',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    desc: 'Energia máxima, determinação e impacto visual esportivo.'
  }
];

export interface TypographyPair {
  id: string;
  name: string;
  headingFont: string;
  bodyFont: string;
  googleFontsUrl: string;
  desc: string;
  heading?: string;
  body?: string;
  sample?: string;
  bestFor?: string;
}

export const TYPOGRAPHY_PAIRS: TypographyPair[] = [
  {
    id: 'editorial-classico',
    name: 'Editorial Clássico',
    headingFont: "'Playfair Display', serif",
    bodyFont: "'Inter', sans-serif",
    heading: 'Playfair Display',
    body: 'Inter',
    sample: 'Excelência & Tradição em Serviços Jurídicos',
    bestFor: 'Advocacia, Consultorias & Luxo',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400&display=swap',
    desc: 'Playfair Display + Inter (Sofisticação, advocacia e luxo)'
  },
  {
    id: 'moderno-executivo',
    name: 'Moderno Executivo',
    headingFont: "'Plus Jakarta Sans', sans-serif",
    bodyFont: "'Plus Jakarta Sans', sans-serif",
    heading: 'Plus Jakarta Sans',
    body: 'Plus Jakarta Sans',
    sample: 'Tecnologia de ponta e resultados comprovados',
    bestFor: 'Startups, B2B & Clínicas VIP',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
    desc: 'Plus Jakarta Sans (O padrão das maiores startups e B2B)'
  },
  {
    id: 'autoridade-clean',
    name: 'Autoridade Clean',
    headingFont: "'Montserrat', sans-serif",
    bodyFont: "'Open Sans', sans-serif",
    heading: 'Montserrat',
    body: 'Open Sans',
    sample: 'Cuidado especializado com foco no seu bem-estar',
    bestFor: 'Médicos, Dentistas & Saúde',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500;600&display=swap',
    desc: 'Montserrat + Open Sans (Clareza, clínicas médicas e odontologia)'
  },
  {
    id: 'urbano-impacto',
    name: 'Urbano Impacto',
    headingFont: "'Oswald', sans-serif",
    bodyFont: "'Roboto', sans-serif",
    heading: 'Oswald',
    body: 'Roboto',
    sample: 'ESTILO BRUTO, TÉCNICA E ATITUDE',
    bestFor: 'Barbearias, Tattoo & Academias',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Roboto:wght@400;500;700&display=swap',
    desc: 'Oswald + Roboto (Tattoo, barbearias urbanas e automobilismo)'
  }
];

export interface BlockToggles {
  topBar: boolean;
  hero: boolean;
  about: boolean;
  gallery: boolean;
  pricingTable: boolean;
  hours: boolean;
  map: boolean;
  reviews: boolean;
  faq: boolean;
  contactForm: boolean;
  partners: boolean;
  whatsappFloat: boolean;
}

export const DEFAULT_BLOCK_TOGGLES: BlockToggles = {
  topBar: true,
  hero: true,
  about: true,
  gallery: true,
  pricingTable: true,
  hours: true,
  map: true,
  reviews: true,
  faq: true,
  contactForm: true,
  partners: true,
  whatsappFloat: true
};
