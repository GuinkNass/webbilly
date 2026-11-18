import { DRIVE_TEMPLATES_METADATA } from '@/lib/templates-catalog/metadata';

export interface DesktopTemplate {
  id: string;
  name: string;
  niche: string;
  category: string;
  badge: string;
  description: string;
  accentColor: string;
  features: string[];
  previewImg: string;
  recommendedKeywords: string[];
}

const BASE_DESKTOP_TEMPLATES: DesktopTemplate[] = [
  {
    id: 'modular-architect',
    name: 'Modo Arquiteto IA — Layout Sob Medida (Tailwind Blocks)',
    niche: 'Multinicho / Inteligente',
    category: 'Inteligência Artificial',
    badge: 'Arquiteto IA • Sob Medida',
    description: 'Motor inteligente que analisa o nicho, fotos reais e perfil do comércio, combinando blocos modulares Tailwind CSS sob medida com zero CSS quebrado e zero Lorem Ipsum.',
    accentColor: '#10b981',
    features: [
      'Composição modular sob medida de 6 seções',
      'Adaptação inteligente de 1 a 24 fotos sem lacunas',
      'Tipografia moderna e contraste blindado',
      'Estilização limpa Tailwind CSS CDN'
    ],
    previewImg: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80',
    recommendedKeywords: ['arquiteto', 'ia', 'modular', 'sob medida', 'tailwind', 'inteligente', 'automático', 'todos']
  },
  {
    id: 'barbearia-crop-vintage',
    name: 'BarberCrop — Barbearia Clássica & Navalha',
    niche: 'Barbearia',
    category: 'Beleza & Estética',
    badge: 'Vintage & Navalha',
    description: 'Estética vintage e tradicional de barbearia com tipografia clássica, cards de serviços em madeira nobre e galeria de cortes na navalha.',
    accentColor: '#b45309',
    features: [
      'Visual clássico de barbearia tradicional',
      'Tabela detalhada de cortes e barba',
      'Galeria de estilo e cortes masculinos',
      'Botão de agendamento rápido no WhatsApp'
    ],
    previewImg: '/templates-thumbs/barbearia-crop-vintage.jpg',
    recommendedKeywords: ['barbearia', 'barbeiro', 'barba', 'corte masculino', 'navalha', 'bigode']
  },
  {
    id: 'barbearia-barberon-moderno',
    name: 'Barberon — Barbearia VIP & Neon Urbano',
    niche: 'Barbearia',
    category: 'Beleza & Estética',
    badge: 'Moderno & Neon',
    description: 'Design escuro e sofisticado com hero dinâmico, lista de serviços com preços, avaliações 5 estrelas e galeria de degradê e freestyle.',
    accentColor: '#84cc16',
    features: [
      'Hero de alta conversão com agendamento imediato',
      'Tabela de preços de corte, barba e pigmentação',
      'Galeria de fotos reais de transformações',
      'Depoimentos e avaliações de clientes do Google'
    ],
    previewImg: '/templates-thumbs/barbearia-barberon-moderno.jpg',
    recommendedKeywords: ['barber', 'degrade', 'fade', 'pigmentacao', 'estilo masculino', 'cerveja artesanal']
  },
  {
    id: 'barbearia-hair-salon',
    name: 'Barber & Hair Salon — Salão & Barbearia',
    niche: 'Salão & Barbearia',
    category: 'Beleza & Barbearia',
    badge: 'Salão Unissex & Spa',
    description: 'Template premium para barbearias, salões de beleza e estética masculina/feminina. Hero com agendamento, catálogo de tratamentos capilares e tabela de preços.',
    accentColor: '#c59a63',
    features: [
      'Design responsivo elegante de alto contraste',
      'Tabela completa de cortes, escova e química',
      'Galeria de transformações e fotos do espaço',
      'Botão flutuante para agendamento no WhatsApp'
    ],
    previewImg: '/templates-thumbs/barbearia-hair-salon.jpg',
    recommendedKeywords: ['salao', 'cabelereiro', 'escova', 'mechas', 'colorimetria', 'unissex']
  },
  {
    id: 'estetica-pureglow-spa',
    name: 'PureGlow — Clínica de Estética, Spa & Harmonização',
    niche: 'Estética',
    category: 'Saúde & Estética Avançada',
    badge: 'Harmonização & Spa',
    description: 'Visual delicado e refinado para clínicas de estética, biomédicas, spas e massoterapia. Destaque para tratamentos faciais e corporais.',
    accentColor: '#ec4899',
    features: [
      'Cards elegantes de protocolos estéticos',
      'Apresentação de tratamentos a laser e botox',
      'Depoimentos com fotos de antes e depois',
      'Agendamento de avaliação personalizada'
    ],
    previewImg: '/templates-thumbs/estetica-pureglow-spa.jpg',
    recommendedKeywords: ['estetica', 'spa', 'botox', 'harmonizacao', 'massagem', 'limpeza de pele', 'dermatologia']
  },
  {
    id: 'odontologia-dentia-clinica',
    name: 'Dentia — Odontologia Estética & Implantes',
    niche: 'Odontologia',
    category: 'Saúde & Odontologia',
    badge: 'Implantes & Sorriso',
    description: 'Autoridade e credibilidade médica para dentistas e clínicas odontológicas. Planos para implantes, lentes de resina/porcelana, ortodontia e clareamento.',
    accentColor: '#0284c7',
    features: [
      'Apresentação de especialidades e tratamentos',
      'Depoimentos e nota de avaliação do Google',
      'Equipe clínica profissional e infraestrutura',
      'Botão direto de agendamento de consulta'
    ],
    previewImg: '/templates-thumbs/odontologia-dentia-clinica.jpg',
    recommendedKeywords: ['dentista', 'odonto', 'implante', 'ortodontia', 'aparelho', 'clareamento', 'lente de contato']
  },
  {
    id: 'medico-medicalguide-clinica',
    name: 'MedicalGuide — Clínica Médica & Consultórios',
    niche: 'Saúde & Medicina',
    category: 'Saúde & Bem-Estar',
    badge: 'Consultas & Exames',
    description: 'Interface limpa, moderna e humana para clínicas médicas multidisciplinares, consultórios particulares, médicos especialistas e laboratórios.',
    accentColor: '#059669',
    features: [
      'Corpo clínico com especialidades e CRM',
      'Lista de exames laboratoriais e diagnósticos',
      'Informações de convênios e horários de atendimento',
      'Agendamento direto pelo WhatsApp oficial'
    ],
    previewImg: '/templates-thumbs/medico-medicalguide-clinica.jpg',
    recommendedKeywords: ['medico', 'clinica', 'cardiologista', 'pediatra', 'ginecologista', 'oftalmologista', 'consulta']
  },
  {
    id: 'restaurante-foores-gourmet',
    name: 'FooRes — Restaurante & Alta Gastronomia',
    niche: 'Gastronomia',
    category: 'Gastronomia Local',
    badge: 'Alta Culinária & Vinhos',
    description: 'Layout gourmet sofisticado para restaurantes, pizzarias e bistrôs com cardápio estruturado, pratos do chef e reservas de mesas.',
    accentColor: '#e11d48',
    features: [
      'Cardápio interativo com categorias e preços',
      'Seção do chef e especialidades da casa',
      'Galeria gastronômica e fotos de ambiente',
      'Reservas e pedidos no WhatsApp'
    ],
    previewImg: '/templates-thumbs/restaurante-foores-gourmet.jpg',
    recommendedKeywords: ['restaurante', 'gastronomia', 'chef', 'jantar', 'almoço', 'rodizio', 'churrascaria']
  },
  {
    id: 'restaurante-sumi-culinaria',
    name: 'Sumi — Gastronomia Asiática & Sushi Bar',
    niche: 'Sushi & Japonês',
    category: 'Gastronomia & Restaurantes',
    badge: 'Oriental & Rodízio',
    description: 'Design moderno de alto impacto visual para restaurantes japoneses, temakerias, sushi bars e culinária asiática. Cardápio com fotos e delivery.',
    accentColor: '#e63946',
    features: [
      'Apresentação de combinados, sushis e pratos quentes',
      'Botão de pedido direto para Delivery no WhatsApp',
      'Horários de atendimento e reservas',
      'Seção de localização com mapa integrado'
    ],
    previewImg: '/templates-thumbs/restaurante-sumi-culinaria.jpg',
    recommendedKeywords: ['sushi', 'japones', 'temaki', 'sashimi', 'rodizio oriental', 'peixe cru', 'comida japonesa']
  },
  {
    id: 'restaurante-elroyale-cafe',
    name: 'El Royale — Alta Gastronomia & Bistrô',
    niche: 'Gastronomia',
    category: 'Gastronomia & Restaurantes',
    badge: 'Bistrô & Alta Classe',
    description: 'Estética refinada e elegante para restaurantes gourmet, bistrôs e cafeterias de luxo. Cardápio categorizado com fotos em alta resolução.',
    accentColor: '#c89d66',
    features: [
      'Cardápio interativo com preços e pratos especiais',
      'Módulo de reservas de mesas e atendimento VIP',
      'Galeria de ambiente e carta de vinhos',
      'Localização no mapa e pedidos via WhatsApp'
    ],
    previewImg: '/templates-thumbs/restaurante-elroyale-cafe.jpg',
    recommendedKeywords: ['bistro', 'gourmet', 'alta gastronomia', 'massa', 'vinhos', 'frances']
  },
  {
    id: 'bar-oldstory-whiskey',
    name: 'Oldstory — Bar, Pub & Hamburgueria Artesanal',
    niche: 'Bar & Hamburgueria',
    category: 'Gastronomia Local',
    badge: 'Pub, Chopp & Burger',
    description: 'Visual rústico e escuro com pegada noturna para pubs, destilarias, cervejarias e hamburguerias de autoridade.',
    accentColor: '#ca8a04',
    features: [
      'Cardápio de bebidas, drinks autorais e porções',
      'Fotos noturnas de ambiente e gastronomia',
      'Mapa integrado e botões de contato',
      'Reservas de mesa e lista VIP'
    ],
    previewImg: '/templates-thumbs/bar-oldstory-whiskey.jpg',
    recommendedKeywords: ['hamburgueria', 'burger', 'bar', 'chopp', 'cervejaria', 'petiscaria', 'pub']
  },
  {
    id: 'pub-tavern-irish',
    name: 'The Lucky Pint — Pub Irlandês & Choperia',
    niche: 'Pub & Cervejaria',
    category: 'Gastronomia Local',
    badge: 'Choperia & Eventos',
    description: 'Design de pub irlandês tradicional com chopes artesanais, programação musical ao vivo, petiscos e reservas para aniversários.',
    accentColor: '#15803d',
    features: [
      'Cardápio de chopps e cervejas especiais',
      'Programação de shows e atrações',
      'Galeria do salão e fotos de chopeiras',
      'Agendamento de mesas e eventos'
    ],
    previewImg: '/templates-thumbs/pub-tavern-irish.jpg',
    recommendedKeywords: ['pub', 'choperia', 'cerveja artesanal', 'musica ao vivo', 'rock', 'happy hour']
  },
  {
    id: 'bistro-granny-cafe',
    name: 'Granny — Bistrô, Café & Confeitaria Artesanal',
    niche: 'Cafeteria & Confeitaria',
    category: 'Gastronomia Local',
    badge: 'Brunch & Doceria',
    description: 'Estilo intimista e aconchegante para docerias, confeitarias artesanais, padarias artesanais e bistrôs de café da manhã.',
    accentColor: '#ea580c',
    features: [
      'Cardápio visual de sobremesas, bolos e cafés',
      'Galeria de fotos de produtos e ambiente',
      'Horários de funcionamento e localização',
      'Pedidos rápidos para retirada e entrega'
    ],
    previewImg: '/templates-thumbs/bistro-granny-cafe.jpg',
    recommendedKeywords: ['confeitaria', 'doceria', 'bolo', 'torta', 'cafe', 'padaria', 'brunch']
  },
  {
    id: 'cafezone-coffee-shop',
    name: 'CafeZone — Cafeteria Especializada & Brunch',
    niche: 'Cafeteria',
    category: 'Gastronomia Local',
    badge: 'Cafés Especiais',
    description: 'Design moderno e limpo para cafeterias, casas de chá, empórios e produtores de grãos especiais com catálogo de delícias.',
    accentColor: '#854d0e',
    features: [
      'Cardápio de cafés expressos, grãos e doces',
      'Destaque para combos matinais e brunch',
      'Galeria de fotos de produtos frescos',
      'Integração de pedidos pelo WhatsApp'
    ],
    previewImg: '/templates-thumbs/cafezone-coffee-shop.jpg',
    recommendedKeywords: ['cafeteria', 'espresso', 'cappuccino', 'graos especiais', 'cafe da manha']
  },
  {
    id: 'petshop-petly-veterinaria',
    name: 'Petly — Pet Shop, Clínica Veterinária & Banho e Tosa',
    niche: 'Pet Shop & Veterinária',
    category: 'Pet Shop & Veterinária',
    badge: 'Banho, Tosa & Vet',
    description: 'Design alegre e afetivo para pet shops, clínicas veterinárias e estética animal. Serviços de banho e tosa, rações, vacinas e emergências.',
    accentColor: '#ff6b6b',
    features: [
      'Tabela de preços de banho, tosa e hotelzinho',
      'Agendamento de consultas veterinárias e vacinas',
      'Galeria de clientes de quatro patas',
      'Botão de emergência 24h no WhatsApp'
    ],
    previewImg: '/templates-thumbs/petshop-petly-veterinaria.jpg',
    recommendedKeywords: ['pet shop', 'veterinaria', 'banho e tosa', 'cao', 'gato', 'filhote', 'racao']
  },
  {
    id: 'autoescola-drivepro',
    name: 'DrivePro — Autoescola & Centro de Formação (CFC)',
    niche: 'Autoescola',
    category: 'Treinamento & Cursos',
    badge: 'Habilitação A/B',
    description: 'Layout moderno e persuasivo para autoescolas e instrutores de trânsito. Planos de 1ª habilitação (CNH A/B), simulados e matrículas via WhatsApp.',
    accentColor: '#ffb400',
    features: [
      'Tabela de pacotes para CNH A, B, AB e D',
      'Apresentação de instrutores e frota de veículos',
      'Estatísticas de aprovação e diferenciais',
      'Botão de matrícula rápida direto no WhatsApp'
    ],
    previewImg: '/templates-thumbs/autoescola-drivepro.jpg',
    recommendedKeywords: ['autoescola', 'cfc', 'cnh', 'carteira de motorista', 'habilitacao', 'instrutor']
  },
  {
    id: 'serralheria-welbim-soldagem',
    name: 'Welbim — Serralheria, Soldagem & Estruturas Metálicas',
    niche: 'Serralheria & Obras',
    category: 'Serviços & Indústria',
    badge: 'Portões & Estruturas',
    description: 'Estrutura robusta e confiável para serralherias, serviços de solda, calhas, portões automáticos e galpões. Catálogo de obras e orçamento rápido.',
    accentColor: '#f77f00',
    features: [
      'Catálogo de projetos: portões, grades e estruturas',
      'Galeria de serviços industriais e residenciais',
      'Pedido de orçamento com envio de medidas pelo WhatsApp',
      'Garantia de fabricação e normas técnicas'
    ],
    previewImg: '/templates-thumbs/serralheria-welbim-soldagem.jpg',
    recommendedKeywords: ['serralheria', 'solda', 'portao', 'grade', 'estrutura metalica', 'corrimão', 'calhas']
  },
  {
    id: 'consultoria-financeira-fo',
    name: 'F&O — Consultoria Empresarial, Advocacia & Contabilidade',
    niche: 'Consultoria & Serviços',
    category: 'Consultoria & Serviços Corporativos',
    badge: 'B2B & Finanças',
    description: 'Visual corporativo de alta autoridade para consultores, contadores, advogados e peritos. Diagnóstico inicial, cases de sucesso e agendamento.',
    accentColor: '#1e73be',
    features: [
      'Apresentação de serviços contábeis e tributários',
      'Depoimentos de clientes e métricas de resultados',
      'Formulário para diagnóstico empresarial',
      'Agendamento de reunião estratégica'
    ],
    previewImg: '/templates-thumbs/consultoria-financeira-fo.jpg',
    recommendedKeywords: [
      'contabilidade',
      'advogado',
      'advocacia',
      'juridico',
      'direito',
      'defesa',
      'oab',
      'escritorio de advocacia',
      'consultoria',
      'financeiro',
      'fiscal',
      'empresarial',
      'pericia',
      'tributario',
      'trabalhista',
      'civel',
      'penal'
    ]
  },
  {
    id: 'commercial-vibrant',
    name: 'Commercial Vibrant — Alta Conversão para Comércios',
    niche: 'Comércio Geral',
    category: 'Comércio, Clínicas & Vendas',
    badge: 'Vendas & Catálogo',
    description: 'Foco total em conversão e captação de leads. Cores vibrantes, CTAs grandes, badges de autoridade, depoimentos e botão WhatsApp de alto contraste.',
    accentColor: '#10b981',
    features: [
      'Otimizado para conversão no celular e desktop',
      'Botão WhatsApp flutuante pulsante',
      'Grid de produtos/serviços com botões de pedido direto',
      'Seção de depoimentos e prova social 5 estrelas'
    ],
    previewImg: '/templates-thumbs/commercial-vibrant.jpg',
    recommendedKeywords: ['comercio', 'loja', 'roupa', 'calcados', 'vendas', 'produtos', 'distribuidora', 'geral', 'mercado', 'servico']
  },
  {
    id: 'portfolio-dark',
    name: 'Dark Elegance — Tatuagem, Fotografia & Artes',
    niche: 'Tatuagem & Arte',
    category: 'Criativo & Fotografia',
    badge: 'Tattoo & Realismo',
    description: 'Visual sofisticado em tons escuros (Zinc/Slate 900), com efeitos de vidro (glassmorphism), tipografia moderna e destaque para fotos de alta qualidade.',
    accentColor: '#8b5cf6',
    features: [
      'Design responsivo dark mode de alta conversão',
      'Hero com avatar circular iluminado por gradiente',
      'Grid de galeria com zoom suave e lightbox nativo',
      'Seção de serviços com cards em glassmorphism'
    ],
    previewImg: '/templates-thumbs/portfolio-dark.jpg',
    recommendedKeywords: ['tattoo', 'tatuagem', 'piercing', 'fotografia', 'designer', 'arte', 'fotografo']
  },
  {
    id: 'studio-minimal',
    name: 'Studio Minimal — Arquitetura & Decoração Clean',
    niche: 'Arquitetura & Interiores',
    category: 'Arquitetura & Design de Interiores',
    badge: 'Minimalismo Editorial',
    description: 'Estética clean, tipografia editorial moderna, espaçamento generoso, tons neutros quentes e layout estilo revista internacional.',
    accentColor: '#3f3f46',
    features: [
      'Design minimalista preto & branco com nuances refinadas',
      'Hero editorial com tipografia refinada',
      'Mosaico assimétrico para fotos de projetos',
      'Chamada para ação sutil e elegante'
    ],
    previewImg: '/templates-thumbs/studio-minimal.jpg',
    recommendedKeywords: ['arquitetura', 'design de interiores', 'marcenaria', 'moveis planejados', 'decoracao']
  }
];

export const BILLY_DESKTOP_TEMPLATES: DesktopTemplate[] = [
  ...BASE_DESKTOP_TEMPLATES,
  ...(DRIVE_TEMPLATES_METADATA as DesktopTemplate[]),
];

export function findTemplateById(id: string): DesktopTemplate {
  return BILLY_DESKTOP_TEMPLATES.find((t) => t.id === id) || BILLY_DESKTOP_TEMPLATES[0];
}

export function recommendTemplateForNiche(nicheText: string): { template: DesktopTemplate; reason: string } {
  const clean = (nicheText || '').toLowerCase();

  // 1. Tatuagem & Piercing
  if (/tattoo|tatuag|piercing|ink|body\s*art/i.test(clean)) {
    const tpl = findTemplateById('tattoo-portfolio-themestarz') || findTemplateById('tattoo-estudio-portfolio-blaxcut') || findTemplateById('portfolio-dark');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado pelo visual escuro autoral com galeria de flashs e agendamento para estúdios de Tatuagem & Piercing.`
    };
  }

  // 2. Pizzarias & Culinária Italiana
  if (/pizz|pizza|pizzaria|calzone|massas/i.test(clean)) {
    const tpl = findTemplateById('pizzaria-clean-royate') || findTemplateById('restaurante-foores-gourmet');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado pelo cardápio gourmet detalhado de pizzas artesanais e delivery.`
    };
  }

  // 3. Cafeterias & Coffee Shops
  if (/cafe|cafeteria|coffee|espresso|graos|barista|padaria|confeitaria/i.test(clean)) {
    const tpl = findTemplateById('coffee-shop-escuro-bruin') || findTemplateById('coffee-shop-moderno-max') || findTemplateById('restaurante-foores-gourmet');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado pelo design acolhedor focado em cafés especiais, doces e ambiente aconchegante.`
    };
  }

  // 4. Restaurantes & Gastronomia Geral
  if (/restaurante|burger|hamburguer|sushi|culinaria|gastronom|bistro|churrascaria/i.test(clean)) {
    const tpl = findTemplateById('restaurante-cafe-heritaste') || findTemplateById('restaurante-cardapio-dbento') || findTemplateById('restaurante-classico-granny') || findTemplateById('restaurante-foores-gourmet');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado pela estrutura de cardápio gourmet e pedidos via WhatsApp.`
    };
  }

  // 5. Dermatologia & Skincare
  if (/dermat|pele|acne|melasma|tricologia|skincare/i.test(clean)) {
    const tpl = findTemplateById('dermato-clean-skincare') || findTemplateById('estetica-pureglow-spa');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado pela credibilidade médica clínica para consultas dermatológicas e tratamentos de pele.`
    };
  }

  // 6. Maquiadora & Noivas
  if (/maqui|makeup|noiva|penteado|make/i.test(clean)) {
    const tpl = findTemplateById('maquiadora-portfolio-makeup') || findTemplateById('estetica-pureglow-spa');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado pelo portfólio visual focado em maquiagem para noivas e eventos.`
    };
  }

  // 7. Massagista & Spa
  if (/massag|drenagem|relaxamento|terapia corporal|shiatsu/i.test(clean)) {
    const tpl = findTemplateById('massagista-portfolio-victoria') || findTemplateById('massagista-clean-beauta') || findTemplateById('estetica-pureglow-spa');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado pelo ambiente de bem-estar, aromaterapia e agendamento de sessões.`
    };
  }

  // 8. Estética Facial & Corporal
  if (/estetic|beleza|depilacao|botox|harmonizacao|limpeza de pele|cilios|sobrancelha/i.test(clean)) {
    const tpl = findTemplateById('estetica-completo-spa') || findTemplateById('estetica-elegante-minimalista') || findTemplateById('estetica-simples-paradise') || findTemplateById('estetica-pureglow-spa');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado para protocolos estéticos, agendamento de avaliação e prova social.`
    };
  }

  // 9. Lutas & Artes Marciais
  if (/luta|boxe|jiu|jud|muay|artes marciais|karate|mma/i.test(clean)) {
    const tpl = findTemplateById('luta-moderno-sword') || findTemplateById('luta-completa-martialarts');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado pelo visual dinâmico e impactante ideal para centros de artes marciais.`
    };
  }

  // 10. Yoga, Meditação & Pilates
  if (/yoga|meditacao|pilates|respiracao|mindfulness/i.test(clean)) {
    const tpl = findTemplateById('yoga-completo-yogana') || findTemplateById('yoga-agendamento-yogazone') || findTemplateById('yoga-fitness-exclusivo');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado pela atmosfera zen e agendamento de aulas experimentais.`
    };
  }

  // 11. Personal Trainer
  if (/personal|treinador|consultoria fitness|treino individual/i.test(clean)) {
    const tpl = findTemplateById('personal-gym-progym') || findTemplateById('personal-claro-moderno') || findTemplateById('personal-moderno-energetico');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado pela apresentação de consultoria individual e planos de treino.`
    };
  }

  // 12. Academias & Crossfit
  if (/academia|crossfit|fitness|musculacao|gym|treino funcional/i.test(clean)) {
    const tpl = findTemplateById('academia-crossfit-fitmax') || findTemplateById('academia-preta-sparta') || findTemplateById('academia-moderna-gymx');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado com foco em planos de mensalidade e estrutura de musculação/crossfit.`
    };
  }

  // 13. Suplementos Esportivos
  if (/suplement|whey|creatina|nutricao esportiva/i.test(clean)) {
    const tpl = findTemplateById('suplementos-fitness-nutri');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado para catálogo de suplementação e nutrição de alta performance.`
    };
  }

  // 14. Arquitetura & Urbanismo
  if (/arquitet|arquiteto|projeto residencial|construcao civil|urbanismo/i.test(clean)) {
    const tpl = findTemplateById('arquiteto-detalhado-shelder') || findTemplateById('arquitetura-elegante-arch') || findTemplateById('studio-minimal');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado pela sofisticação de apresentação de projetos arquitetônicos e portfólio.`
    };
  }

  // 15. Design de Interiores & Decoração
  if (/interiores|decoracao|moveis planejados|marcenaria/i.test(clean)) {
    const tpl = findTemplateById('design-interiores-fauxis') || findTemplateById('studio-minimal');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado pelo design refinado para ambientação de interiores e reformas.`
    };
  }

  // 16. Mecânica & Auto Center
  if (/mecanic|oficina|auto center|troca de oleo|freio|suspensao|motor|injecao/i.test(clean)) {
    const tpl = findTemplateById('mecanica-completo-audeck') || findTemplateById('mecanica-portfolio-automec') || findTemplateById('mecanica-simples-cardinal');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado pelo catálogo de serviços automotivos, revisão preventiva e orçamentos.`
    };
  }

  // 17. Odontologia & Dentistas
  if (/odonto|dentis|sorriso|dental|implante|aparelho|clareamento/i.test(clean)) {
    const tpl = findTemplateById('dentista-criativo-dentia') || findTemplateById('dentista-detalhado-prime') || findTemplateById('dentista-medicina-medicore') || findTemplateById('odontologia-dentia-clinica');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado pela autoridade clínica e apresentação de tratamentos odontológicos.`
    };
  }

  // 18. Pet Shop & Veterinária
  if (/pet|veterin|banho e tosa|cao|gato|animal/i.test(clean)) {
    const tpl = findTemplateById('petshop-completo-petz') || findTemplateById('petshop-petly-veterinaria');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado para serviços de banho, tosa e cuidados veterinários acolhedores.`
    };
  }

  // 19. Marido de Aluguel, Reformas & Reparos
  if (/marido de aluguel|reforma|reparo|encanador|eletricista|pintor|manutencao/i.test(clean)) {
    const tpl = findTemplateById('marido-aluguel-portfolio') || findTemplateById('marido-aluguel-simples-reroof') || findTemplateById('servicos-gerais-limpo-erepair');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado para pedidos rápidos de orçamento e assistência residencial.`
    };
  }

  // 20. Fotografia & Ensaios
  if (/fotograf|foto|ensaio|casamento|evento/i.test(clean)) {
    const tpl = findTemplateById('fotografia-minimalista-elarisse') || findTemplateById('portfolio-dark');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado pelo grid de alta definição para portfólios fotográficos.`
    };
  }

  // 21. Barbearias Clássicas & Modernas
  if (/barbe|barba|navalha|fade|corte masculino/i.test(clean)) {
    const tpl = findTemplateById('barbearia-barberon-moderno') || findTemplateById('barbearia-crop-vintage');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado pela atmosfera de alta conversão para barbearias.`
    };
  }

  // 22. Autoescola & CFC
  if (/autoescola|cfc|cnh|habilitacao/i.test(clean)) {
    const tpl = findTemplateById('autoescola-drivepro');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado com foco em matrículas e pacotes de habilitação.`
    };
  }

  // 23. Serralheria & Estruturas Metálicas
  if (/serralh|solda|portao|grade|estrutura metalica|calha/i.test(clean)) {
    const tpl = findTemplateById('serralheria-welbim-soldagem');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado para catálogo de estruturas metálicas e orçamentos de obras.`
    };
  }

  // Loop dinâmico por palavras-chave
  for (const tpl of BILLY_DESKTOP_TEMPLATES) {
    if (tpl.recommendedKeywords.some((kw) => clean.includes(kw))) {
      return {
        template: tpl,
        reason: `Template "${tpl.name}" selecionado pela IA por ser desenhado especificamente para o nicho de ${nicheText}.`
      };
    }
  }

  // Fallback inteligente: se parecer corporativo/jurídico
  if (/direito|advog|jurid|leis|tribut|fiscal|perito|imobili/i.test(clean)) {
    const tpl = findTemplateById('consultoria-financeira-fo');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado pela autoridade corporativa para o segmento jurídico.`
    };
  }

  // Fallback para saúde
  if (/saude|odonto|dent|medic|clinica|psico|fisio/i.test(clean)) {
    const tpl = findTemplateById('medico-medicalguide-clinica');
    return {
      template: tpl,
      reason: `Template "${tpl.name}" selecionado para clínica e área da saúde.`
    };
  }

  // Fallback geral
  const fallback = findTemplateById('commercial-vibrant');
  return {
    template: fallback,
    reason: `Template "${fallback.name}" selecionado pela alta taxa de conversão em comércios e serviços locais.`
  };
}

/**
 * Gera serviços profissionais estritamente contextualizados ao nicho do lead
 * Evita contaminação de cortes de cabelo para advogados ou dentistas
 */
export function getSuggestedServicesForNiche(nicheText: string, businessName: string): Array<{ name: string; price: string; description: string }> {
  const clean = (nicheText || '').toLowerCase();

  // 1. Advocacia / Jurídico
  if (/advog|jurid|direito|oab|criminal|penal|trabalh|civel|tribut/i.test(clean)) {
    return [
      { name: 'Consulta Jurídica & Parecer Inicial', price: 'Sob Consulta', description: 'Diagnóstico estratégico aprofundado do caso com orientação clara dos direitos e riscos.' },
      { name: 'Assessoria & Acompanhamento Processual', price: 'Sob Consulta', description: 'Representação técnica integral perante fóruns, tribunais e instâncias superiores.' },
      { name: 'Elaboração & Auditoria de Contratos', price: 'Sob Consulta', description: 'Redação blindada e revisão preventiva de acordos comerciais e civis.' },
      { name: 'Atuação Preventiva & Conciliação Extrajudicial', price: 'Sob Consulta', description: 'Soluções rápidas e seguras para resolução de conflitos sem litígios prolongados.' }
    ];
  }

  // 2. Odontologia
  if (/odonto|dent|implante|sorriso|clareamento|ortodont/i.test(clean)) {
    return [
      { name: 'Avaliação & Check-up Digital Completo', price: 'Sob Consulta', description: 'Exame clínico detalhado com tecnologia digital para planejamento do seu sorriso.' },
      { name: 'Implantes Dentários & Próteses de Alta Fixação', price: 'Sob Consulta', description: 'Recupere a mastigação e estética com tecnologia minimamente invasiva.' },
      { name: 'Clareamento Dental a Laser & Estética', price: 'Sob Consulta', description: 'Dentes mais brancos com segurança e acompanhamento profissional.' },
      { name: 'Alinhadores Invisíveis & Ortodontia', price: 'Sob Consulta', description: 'Correção rápida e discreta da mordida e alinhamento dos dentes.' }
    ];
  }

  // 3. Medicina / Clínicas
  if (/medic|clinica|doutor|consulta|pediatr|cardio|oftalmo|dermat/i.test(clean)) {
    return [
      { name: 'Consulta Médica Especializada', price: 'Sob Consulta', description: 'Atendimento humanizado, escuta atenta e investigação diagnóstica de precisão.' },
      { name: 'Exames Preventivos & Check-up de Rotina', price: 'Sob Consulta', description: 'Bateria de exames essenciais para manutenção da sua saúde e longevidade.' },
      { name: 'Acompanhamento Contínuo & Tratamentos', price: 'Sob Consulta', description: 'Planos terapêuticos individualizados focados no seu bem-estar completo.' }
    ];
  }

  // 4. Barbearia
  if (/barbe|barba|cabelo masculino|navalha/i.test(clean)) {
    return [
      { name: 'Corte Tradicional / Degradê Moderno', price: 'R$ 50,00', description: 'Corte na tesoura e máquina com alinhamento perfeito e finalização.' },
      { name: 'Barba Terapia com Toalha Quente', price: 'R$ 45,00', description: 'Toalha quente, óleos hidratantes, esfoliação e navalha descartável.' },
      { name: 'Combo Completo Cabelo + Barba', price: 'R$ 85,00', description: 'Experiência completa com desconto especial e café cortesia.' }
    ];
  }

  // 5. Tatuagem & Piercing
  if (/tatto|tatuag|piercing|estudio de tattoo/i.test(clean)) {
    return [
      { name: 'Projeto Autoral / Tatuagem Personalizada', price: 'Sob Consulta', description: 'Criação exclusiva do desenho com base na sua ideia e anatomia corporal.' },
      { name: 'Cobertura (Cover-up) & Reforma', price: 'Sob Consulta', description: 'Restauração ou transformação de tatuagens antigas com alta técnica.' },
      { name: 'Aplicação de Body Piercing em Titânio', price: 'A partir de R$ 90', description: 'Perfuração com materiais biocompatíveis e assepsia hospitalar.' }
    ];
  }

  // 6. Gastronomia / Restaurantes
  if (/restaurante|burger|pizz|sushi|lanch|bar|pub|gourmet/i.test(clean)) {
    return [
      { name: 'Pratos Principais & Especialidades da Casa', price: 'A partir de R$ 39,90', description: 'Receitas exclusivas preparadas com ingredientes frescos e selecionados.' },
      { name: 'Cardápio Executivo & Combos Promocionais', price: 'A partir de R$ 29,90', description: 'Opção completa e equilibrada perfeita para o seu almoço ou jantar.' },
      { name: 'Sobremesas Artesanais & Bebidas Especiais', price: 'A partir de R$ 16,00', description: 'Finalização perfeita com doces feitos na casa e drinks autorais.' }
    ];
  }

  // 7. Estética & Beleza
  if (/estetic|beleza|salao|spa|massag|cabelereir|unha|lash/i.test(clean)) {
    return [
      { name: 'Procedimentos Faciais & Limpeza Profunda', price: 'Sob Consulta', description: 'Renovação celular, extração suave e hidratação iluminadora.' },
      { name: 'Protocolos Corporais & Massoterapia', price: 'Sob Consulta', description: 'Técnicas exclusivas para modelagem, drenagem e alívio de tensões.' },
      { name: 'Tratamentos Capilares & Estética Completa', price: 'Sob Consulta', description: 'Nutrição intensiva, reconstrução dos fios e cuidados personalizados.' }
    ];
  }

  // 8. Pet Shop & Veterinária
  if (/pet|veterin|banho|tosa|animal|cao|gato/i.test(clean)) {
    return [
      { name: 'Banho & Tosa Higiênica Especializada', price: 'A partir de R$ 60,00', description: 'Produtos hipoalergênicos, toalhas esterilizadas e muito carinho.' },
      { name: 'Consulta Veterinária & Vacinação', price: 'Sob Consulta', description: 'Acompanhamento preventivo e cuidados completos para a saúde do seu pet.' },
      { name: 'Estética Animal & Hidratação de Pelos', price: 'A partir de R$ 45,00', description: 'Pelagem macia, desembaraço suave e perfumação delicada.' }
    ];
  }

  // 9. Comércio & Serviços Gerais (Fallback Seguro)
  return [
    { name: `Atendimento & Serviços em ${nicheText}`, price: 'Sob Consulta', description: `Soluções completas com padrão de qualidade e dedicação total da equipe da ${businessName}.` },
    { name: 'Pacote de Atendimento Completo', price: 'Sob Consulta', description: 'O serviço mais procurado pelos nossos clientes com garantia e suporte ágil.' },
    { name: 'Orçamento Personalizado sem Compromisso', price: 'Gratuito', description: 'Analisamos a sua necessidade e apresentamos a melhor proposta com condições facilitadas.' }
  ];
}

/**
 * Retorna o texto de chamada para ação (CTA) perfeito para o nicho
 */
export function getSuggestedCtaForNiche(nicheText: string): string {
  const clean = (nicheText || '').toLowerCase();
  if (/advog|jurid|direito|oab/i.test(clean)) return 'Falar com Advogado no WhatsApp';
  if (/odonto|dent/i.test(clean)) return 'Agendar Consulta Odontológica';
  if (/medic|clinica|doutor/i.test(clean)) return 'Agendar Consulta Médica';
  if (/barbe/i.test(clean)) return 'Agendar Horário na Barbearia';
  if (/tatto/i.test(clean)) return 'Pedir Orçamento de Tatuagem';
  if (/restaurante|burger|pizz|sushi/i.test(clean)) return 'Ver Cardápio & Pedir no WhatsApp';
  if (/estetic|beleza|spa/i.test(clean)) return 'Agendar Avaliação Estética';
  if (/pet|veterin/i.test(clean)) return 'Agendar Horário para o Pet';
  return 'Falar Conosco no WhatsApp';
}

/**
 * Retorna o slogan/tagline contextualizado
 */
export function getSuggestedTaglineForNiche(nicheText: string, businessName: string, city: string): string {
  const clean = (nicheText || '').toLowerCase();
  if (/advog|jurid|direito/i.test(clean)) {
    return `Defesa estratégica, ética e rigor técnico em ${city}.`;
  }
  if (/odonto|dent/i.test(clean)) {
    return `Transformando sorrisos com tecnologia e acolhimento em ${city}.`;
  }
  if (/medic|clinica/i.test(clean)) {
    return `Cuidado humanizado e medicina de precisão para toda a sua família.`;
  }
  if (/barbe/i.test(clean)) {
    return `Cortes clássicos, barba alinhada e ambiente exclusivo em ${city}.`;
  }
  if (/tatto/i.test(clean)) {
    return `Arte na pele com originalidade, técnica refinada e biossegurança.`;
  }
  if (/restaurante|gastronomia/i.test(clean)) {
    return `Sabores inesquecíveis e momentos marcantes para o seu paladar em ${city}.`;
  }
  return `Excelência, compromisso e atendimento de alto nível em ${city}.`;
}

/**
 * Retorna a descrição de apresentação institucional
 */
export function getSuggestedDescriptionForNiche(nicheText: string, businessName: string): string {
  const clean = (nicheText || '').toLowerCase();
  if (/advog|jurid|direito/i.test(clean)) {
    return `No ${businessName}, aliamos sólida formação técnica, discrição e dedicação incansável à defesa dos interesses de nossos clientes, buscando sempre a solução jurídica mais eficaz.`;
  }
  if (/odonto|dent/i.test(clean)) {
    return `Na ${businessName}, nossa missão é devolver a você a confiança de sorrir livremente, oferecendo tratamentos odontológicos avançados em um ambiente acolhedor e seguro.`;
  }
  if (/medic|clinica/i.test(clean)) {
    return `A ${businessName} nasceu com o compromisso de unir ciência médica de ponta a um acolhimento caloroso e individualizado para cada paciente.`;
  }
  return `Na ${businessName}, trabalhamos diariamente com paixão e excelência para oferecer o mais alto padrão em ${nicheText}, valorizando a pontualidade, a confiança e a satisfação de cada cliente.`;
}

/**
 * Retorna depoimentos coerentes caso o comércio não possua reviews na API
 */
export function getSuggestedReviewsForNiche(nicheText: string): Array<{ author: string; rating: number; text: string }> {
  const clean = (nicheText || '').toLowerCase();
  if (/advog|jurid|direito/i.test(clean)) {
    return [
      { author: 'Dr. Roberto Silveira', rating: 5, text: 'Atendimento impecável! Profissionais extremamente éticos, me mantiveram informado sobre cada andamento do processo.' },
      { author: 'Marcos Vinícius C.', rating: 5, text: 'Segurança e clareza desde a primeira consulta. Resolveram minha questão jurídica com extrema competência e agilidade.' },
      { author: 'Juliana P. Almeida', rating: 5, text: 'Excelente assessoria jurídica. Transmitem muita confiança e demonstraram domínio técnico exemplar.' }
    ];
  }
  if (/odonto|dent/i.test(clean)) {
    return [
      { author: 'Fernanda Martins', rating: 5, text: 'Tinha muito medo de dentista, mas aqui me senti super acolhida! Tratamento sem dor e resultado perfeito no meu sorriso.' },
      { author: 'Lucas Andrade', rating: 5, text: 'Clínica moderna, profissionais atenciosos e pontualidade britânica. Melhor experiência odontológica que já tive.' },
      { author: 'Beatriz Costa', rating: 5, text: 'Fiz meus implantes e clareamento aqui. Mudou minha autoestima! Super recomendo a todos da cidade.' }
    ];
  }
  return [
    { author: 'Guilherme Siqueira', rating: 5, text: 'Atendimento fantástico! Profissionais dedicados, pontuais e com resultado impecável. Recomendo de olhos fechados!' },
    { author: 'Camila Fernandes', rating: 5, text: 'Melhor experiência da cidade! Fui super bem atendida e com certeza voltarei sempre.' },
    { author: 'Rodrigo Medeiros', rating: 5, text: 'Estrutura impecável, preço justo e serviço de altíssima qualidade. Virei cliente fiel!' }
  ];
}
