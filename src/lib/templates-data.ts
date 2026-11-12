export interface TemplateInfo {
  slug: string;
  name: string;
  niche: 'barbearia' | 'gastronomia' | 'estetica' | 'pet' | 'consultoria' | 'automotivo';
  categoryLabel: string;
  title: string;
  desc: string;
  tag: string;
  folder: string;
  demoPath: string;
  subdomain: string;
  aliases: string[];
}

export const OFFICIAL_TEMPLATES: TemplateInfo[] = [
  {
    slug: 'barbearia',
    name: 'BarberOn Moderno',
    niche: 'barbearia',
    categoryLabel: 'Barbearias',
    title: 'Barbearias & Estética Masculina',
    desc: 'Agendamentos no WhatsApp, fotos dos cortes, tabela de serviços e visual escuro premium de alta conversão.',
    tag: 'Mais Popular',
    folder: 'barbearia',
    demoPath: '/templates/barbearia/index.html',
    subdomain: 'barbearia.webbilly.com.br',
    aliases: ['barbearia-demo', 'barberon', 'barberon-prime', 'barber', 'corte']
  },
  {
    slug: 'gastronomia',
    name: 'Oldstory Burger & Pub',
    niche: 'gastronomia',
    categoryLabel: 'Hamburguerias & Gastronomia',
    title: 'Hamburguerias, Bares & Gastronomia',
    desc: 'Cardápio digital responsivo com fotos apetitosas, pratos da casa, avaliações e pedidos diretos no WhatsApp.',
    tag: 'Alta Conversão',
    folder: 'gastronomia',
    demoPath: '/templates/gastronomia/index.html',
    subdomain: 'gastronomia.webbilly.com.br',
    aliases: ['burger-demo', 'gastronomia-demo', 'oldstory', 'burger', 'hamburgueria', 'restaurante']
  },
  {
    slug: 'estetica',
    name: 'PureGlow Spa & Estética',
    niche: 'estetica',
    categoryLabel: 'Clínicas & Estética',
    title: 'Clínicas de Estética, Spa & Skincare',
    desc: 'Visual sofisticado para clínicas médicas, harmonização facial, odontologia e procedimentos estéticos avançados.',
    tag: 'Elegante',
    folder: 'estetica',
    demoPath: '/templates/estetica/index.html',
    subdomain: 'estetica.webbilly.com.br',
    aliases: ['estetica-demo', 'pureglow', 'pureglow-spa', 'spa', 'saude', 'clinica']
  },
  {
    slug: 'petshop',
    name: 'Petly Care & Vet',
    niche: 'pet',
    categoryLabel: 'Pet Shops & Veterinárias',
    title: 'Pet Shops & Clínicas Veterinárias',
    desc: 'Apresentação completa de serviços de banho & tosa, vacinas, hotelzinho e cuidados veterinários dedicados.',
    tag: 'Destaque',
    folder: 'petshop',
    demoPath: '/templates/petshop/index.html',
    subdomain: 'petshop.webbilly.com.br',
    aliases: ['petshop-demo', 'petly', 'petly-care', 'veterinaria', 'vet']
  },
  {
    slug: 'consultoria',
    name: 'F&O Consultoria Empresarial',
    niche: 'consultoria',
    categoryLabel: 'Consultoria & Serviços',
    title: 'Consultorias, Advocacia & Contabilidade',
    desc: 'Design corporativo e executivo para consultores, advogados, contadores, peritos e prestadores de serviços B2B.',
    tag: 'Corporativo',
    folder: 'consultoria',
    demoPath: '/templates/consultoria/index.html',
    subdomain: 'consultoria.webbilly.com.br',
    aliases: ['consultoria-demo', 'officepro', 'fo-consultoria', 'advocacia', 'servicos', 'consultoria-financeira']
  },
  {
    slug: 'autoescola',
    name: 'DrivePro Centro de Condutores',
    niche: 'automotivo',
    categoryLabel: 'Autoescolas & Automotivo',
    title: 'Autoescolas, Oficinas & Centros Automotivos',
    desc: 'Tabela de categorias de habilitação (A/B/D), cursos especializados, localização no mapa e matrícula via WhatsApp.',
    tag: 'Completo',
    folder: 'autoescola',
    demoPath: '/templates/autoescola/index.html',
    subdomain: 'autoescola.webbilly.com.br',
    aliases: ['autoescola-demo', 'drivepro', 'centro-automotivo', 'oficina', 'mecanica']
  }
];

export function resolveTemplateBySlug(slug: string): TemplateInfo | null {
  if (!slug) return null;
  const clean = slug.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\.webbilly\.com\.br$/, '');
  return OFFICIAL_TEMPLATES.find(t => 
    t.slug === clean || 
    t.folder === clean || 
    t.aliases.includes(clean) ||
    clean.includes(t.slug)
  ) || null;
}
