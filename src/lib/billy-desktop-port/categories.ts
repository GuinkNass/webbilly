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
