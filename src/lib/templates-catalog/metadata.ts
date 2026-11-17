// METADADOS LEVES DOS TEMPLATES DO GOOGLE DRIVE (Para frontend e seletor)
export interface DesktopTemplateMetadata {
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

export const DRIVE_TEMPLATES_METADATA: DesktopTemplateMetadata[] = [
  {
    "id": "tattoo-portfolio-themestarz",
    "name": "Tattoo Artist — Portfólio Dark Autoral",
    "niche": "Tatuagem",
    "category": "Tatuagem & Piercing",
    "badge": "Autoral & Dark",
    "description": "Design escuro cinematográfico focado em portfólio de tatuagens autorais, flashs, biossegurança e agendamentos diretos.",
    "accentColor": "#e11d48",
    "features": [
      "Galeria de flashs e artes autorais",
      "Tabela de estilos (Blackwork, Realismo, Fineline)",
      "Biossegurança e normas ANVISA",
      "Botão WhatsApp para orçamentos"
    ],
    "previewImg": "/templates-thumbs/tattoo-portfolio-themestarz.jpg",
    "recommendedKeywords": [
      "tattoo",
      "tatuagem",
      "tatuador",
      "piercing",
      "blackwork",
      "fineline",
      "flash",
      "ink"
    ]
  },
  {
    "id": "tattoo-estudio-portfolio-blaxcut",
    "name": "Blaxcut — Estúdio Tattoo & Piercing Portfólio",
    "niche": "Tatuagem",
    "category": "Tatuagem & Piercing",
    "badge": "Estúdio & Piercing",
    "description": "Layout moderno com tipografia expressiva para estúdios consolidados de tatuagem e aplicação de piercing em titânio.",
    "accentColor": "#f59e0b",
    "features": [
      "Grade de tatuadores residentes e convidados",
      "Catálogo de piercings e joias",
      "Depoimentos de clientes satisfeitos",
      "Orçamento instantâneo"
    ],
    "previewImg": "/templates-thumbs/tattoo-estudio-portfolio-blaxcut.jpg",
    "recommendedKeywords": [
      "estudio tattoo",
      "piercing titanio",
      "tatuador sp",
      "body piercing",
      "microdermal"
    ]
  },
  {
    "id": "tattoo-estudio-moderno",
    "name": "UrbanInk — Estúdio Tattoo Moderno & Street",
    "niche": "Tatuagem",
    "category": "Tatuagem & Piercing",
    "badge": "Urbano & Street",
    "description": "Estética street art e underground com alto contraste, animações suaves e seções de cuidados pós-tatuagem.",
    "accentColor": "#a855f7",
    "features": [
      "Design arrojado com alto impacto visual",
      "Guia de cuidados pós-procedimento",
      "Fotos de cicatrização e trabalhos reais",
      "Atendimento rápido"
    ],
    "previewImg": "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "urban tattoo",
      "tatuagem moderna",
      "cobertura tattoo",
      "cover up",
      "oriental tattoo"
    ]
  },
  {
    "id": "pizzaria-clean-royate",
    "name": "Royate — Pizzaria Artesanal & Forno a Lenha",
    "niche": "Pizzaria",
    "category": "Gastronomia, Cafés & Pizzarias",
    "badge": "Forno a Lenha",
    "description": "Apresentação refinada para pizzarias italianas, delivery premium e massas artesanais com cardápio completo de sabores.",
    "accentColor": "#dc2626",
    "features": [
      "Cardápio ilustrado de pizzas tradicionais e especiais",
      "Bordas recheadas e sobremesas artesanais",
      "Área de entrega e delivery via WhatsApp",
      "Depoimentos de clientes"
    ],
    "previewImg": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "pizzaria",
      "pizza artesanal",
      "forno a lenha",
      "calzone",
      "delivery pizza",
      "rodizio"
    ]
  },
  {
    "id": "restaurante-cafe-heritaste",
    "name": "Heritaste — Restaurante & Café Moderno",
    "niche": "Gastronomia",
    "category": "Gastronomia, Cafés & Pizzarias",
    "badge": "Gourmet & Café",
    "description": "Ambiente aconchegante para bistrôs contemporâneos, cafés coloniais e restaurantes à la carte.",
    "accentColor": "#d97706",
    "features": [
      "Cardápio de pratos executivos e sobremesas",
      "Carta especial de cafés e bebidas",
      "Horário de funcionamento e reservas",
      "Localização privilegiada"
    ],
    "previewImg": "/templates-thumbs/restaurante-cafe-heritaste.jpg",
    "recommendedKeywords": [
      "restaurante",
      "cafe moderno",
      "bistro",
      "almoco executivo",
      "cafeteria",
      "brunch"
    ]
  },
  {
    "id": "restaurante-cardapio-dbento",
    "name": "DBento — Restaurante Cardápio Digital & Buffet",
    "niche": "Gastronomia",
    "category": "Gastronomia, Cafés & Pizzarias",
    "badge": "Cardápio Completo",
    "description": "Cardápio digital dinâmico com fotos de pratos, preços por porção, marmitas gourmet e bebidas geladas.",
    "accentColor": "#ea580c",
    "features": [
      "Grade de pratos e porções mais pedidas",
      "Preços transparentes e combos da casa",
      "Fácil visualização no celular",
      "Pedidos diretos no WhatsApp"
    ],
    "previewImg": "/templates-thumbs/restaurante-cardapio-dbento.jpg",
    "recommendedKeywords": [
      "cardapio restaurante",
      "marmita gourmet",
      "almoco",
      "prato feito",
      "restaurante por quilo"
    ]
  },
  {
    "id": "restaurante-classico-granny",
    "name": "Granny — Restaurante Tradicional & Cozinha Afetiva",
    "niche": "Gastronomia",
    "category": "Gastronomia, Cafés & Pizzarias",
    "badge": "Cozinha Tradicional",
    "description": "Estilo acolhedor com tradição culinária familiar, pratos caseiros, carnes nobres e massas frescas.",
    "accentColor": "#b45309",
    "features": [
      "Destaque para receitas clássicas de família",
      "Carta de vinhos e bebidas selecionadas",
      "Galeria de fotos do salão e buffet",
      "Reserva de mesas"
    ],
    "previewImg": "/templates-thumbs/restaurante-classico-granny.jpg",
    "recommendedKeywords": [
      "comida caseira",
      "restaurante familia",
      "churrascaria",
      "fogao a lenha",
      "almoco de domingo"
    ]
  },
  {
    "id": "restaurante-portfolio-grandrestaurant",
    "name": "GrandRestaurant — Alta Gastronomia & Experiência",
    "niche": "Gastronomia",
    "category": "Gastronomia, Cafés & Pizzarias",
    "badge": "Alta Gastronomia",
    "description": "Experiência sensorial de luxo para restaurantes conceituais, chefs renomados e jantares exclusivos.",
    "accentColor": "#ca8a04",
    "features": [
      "Menu degustação assinado pelo Chef",
      "Galeria de pratos com iluminação artística",
      "Avaliações de críticos e clientes VIP",
      "Agendamento de jantares"
    ],
    "previewImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "alta gastronomia",
      "chef de cozinha",
      "jantar romantico",
      "menu degustacao",
      "restaurante luxo"
    ]
  },
  {
    "id": "restaurante-elegante-elegencia",
    "name": "Elegancia — Bistrô & Eventos Gastronômicos",
    "niche": "Gastronomia",
    "category": "Gastronomia, Cafés & Pizzarias",
    "badge": "Bistrô Sofisticado",
    "description": "Design minimalista e requintado com tipografia serifada de alto padrão para bistrôs e eventos fechados.",
    "accentColor": "#9333ea",
    "features": [
      "Harmonização de pratos e drinks autorais",
      "Espaço para eventos corporativos e casamentos",
      "Galeria de arquitetura e decoração",
      "Contato direto com sommelier"
    ],
    "previewImg": "/templates-thumbs/restaurante-elegante-elegencia.jpg",
    "recommendedKeywords": [
      "bistro elegante",
      "restaurante fino",
      "drinks autorais",
      "sommelier",
      "cozinha contemporanea"
    ]
  },
  {
    "id": "coffee-shop-escuro-bruin",
    "name": "Bruin — Coffee Shop Escuro & Grãos Especiais",
    "niche": "Cafeteria",
    "category": "Gastronomia, Cafés & Pizzarias",
    "badge": "Grãos Especiais",
    "description": "Ambiente escuro estilizado para torrefações de café artesanal, espressos premiados e doces finos.",
    "accentColor": "#78350f",
    "features": [
      "Origens de grãos 100% arábica certificados",
      "Métodos de extração (V60, Prensa, Aeropress)",
      "Menu de confeitaria artesanal e salgados",
      "Localização e take away"
    ],
    "previewImg": "/templates-thumbs/coffee-shop-escuro-bruin.jpg",
    "recommendedKeywords": [
      "coffee shop",
      "cafe especial",
      "torrefacao",
      "espresso",
      "barista",
      "graos selecionados"
    ]
  },
  {
    "id": "coffee-shop-moderno-max",
    "name": "MaxCoffee — Cafeteria & Coworking Moderno",
    "niche": "Cafeteria",
    "category": "Gastronomia, Cafés & Pizzarias",
    "badge": "Café & Coworking",
    "description": "Atmosfera jovem e produtiva para cafeterias com internet rápida, mesas compartilhadas e lanches rápidos.",
    "accentColor": "#059669",
    "features": [
      "Menu de cafés gelados, lattes e frappés",
      "Opções veganas e sem glúten",
      "Ambiente preparado para reuniões e trabalho",
      "Faça seu pedido no balcão"
    ],
    "previewImg": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "cafeteria moderna",
      "coworking cafe",
      "iced coffee",
      "frappuccino",
      "cookies artesanais"
    ]
  },
  {
    "id": "estetica-completo-spa",
    "name": "Lumina — Clínica de Estética & Harmonização Completa",
    "niche": "Estética",
    "category": "Estética, Dermato, Maquiagem & Massagem",
    "badge": "Estética Avançada",
    "description": "Solução completa para clínicas biomédicas, harmonização facial, preenchimentos, bioestimuladores e lasers.",
    "accentColor": "#db2777",
    "features": [
      "Procedimentos faciais e corporais detalhados",
      "Antes e depois de clientes reais",
      "Corpo clínico e pós-graduações",
      "Agendamento de avaliação facial"
    ],
    "previewImg": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "clinica de estetica",
      "harmonizacao facial",
      "botox",
      "bioestimulador",
      "preenchimento labial",
      "fios de pdo"
    ]
  },
  {
    "id": "estetica-elegante-minimalista",
    "name": "AuraGlow — Estética Integrativa & Spa Facial",
    "niche": "Estética",
    "category": "Estética, Dermato, Maquiagem & Massagem",
    "badge": "Elegante & Clean",
    "description": "Tons pasteis refinados com foco em bem-estar, limpeza de pele profunda, drenagem e rejuvenescimento.",
    "accentColor": "#ec4899",
    "features": [
      "Protocolos exclusivos de hidratação e peeling",
      "Ambiente relaxante com aromaterapia",
      "Produtos dermatológicos selecionados",
      "Avaliação personalizada"
    ],
    "previewImg": "/templates-thumbs/estetica-elegante-minimalista.jpg",
    "recommendedKeywords": [
      "spa facial",
      "limpeza de pele",
      "peeling",
      "rejuvenescimento",
      "drenagem linfatica"
    ]
  },
  {
    "id": "estetica-simples-paradise",
    "name": "Paradise — Centro de Beleza & Estética Express",
    "niche": "Estética",
    "category": "Estética, Dermato, Maquiagem & Massagem",
    "badge": "Beleza & Express",
    "description": "Rápido, objetivo e altamente focado na conversão de agendamentos no WhatsApp para depilação e estética rápida.",
    "accentColor": "#f43f5e",
    "features": [
      "Depilação a laser e cera",
      "Design de sobrancelhas e micropigmentação",
      "Tabela de preços acessíveis e pacotes",
      "Agendamento sem burocracia"
    ],
    "previewImg": "/templates-thumbs/estetica-simples-paradise.jpg",
    "recommendedKeywords": [
      "depilacao laser",
      "sobrancelhas",
      "micropigmentacao",
      "cilios",
      "estetica rapida"
    ]
  },
  {
    "id": "dermato-clean-skincare",
    "name": "DermatoClean — Dermatologia & Tricologia Clínica",
    "niche": "Dermatologia",
    "category": "Estética, Dermato, Maquiagem & Massagem",
    "badge": "Dermatologia Clínica",
    "description": "Credibilidade médica máxima para consultórios dermatológicos, tratamentos de acne, manchas, melasma e queda capilar.",
    "accentColor": "#0284c7",
    "features": [
      "Consulta com médico dermatologista especialista",
      "Mapeamento de pintas e sinais corporais",
      "Tratamento de melasma e cicatrizes",
      "Consulta de tricologia"
    ],
    "previewImg": "/templates-thumbs/dermato-clean-skincare.jpg",
    "recommendedKeywords": [
      "dermatologista",
      "dermato",
      "tricologia",
      "queda de cabelo",
      "melasma",
      "acne",
      "manchas"
    ]
  },
  {
    "id": "maquiadora-portfolio-makeup",
    "name": "GlowGlam — Maquiagem Profissional & Noivas",
    "niche": "Maquiagem",
    "category": "Estética, Dermato, Maquiagem & Massagem",
    "badge": "Noivas & Social",
    "description": "Portfólio visual exuberante para maquiadoras sociais, atendimento a noivas, madrinhas e ensaios fotográficos.",
    "accentColor": "#e11d48",
    "features": [
      "Pacotes de Dia da Noiva e Debutantes",
      "Galeria em alta definição de makes sociais",
      "Produtos importados de alta durabilidade",
      "Consultoria de visagismo"
    ],
    "previewImg": "/templates-thumbs/maquiadora-portfolio-makeup.jpg",
    "recommendedKeywords": [
      "maquiadora",
      "make noiva",
      "maquiagem social",
      "dia da noiva",
      "visagismo",
      "make madrinha"
    ]
  },
  {
    "id": "massagista-portfolio-victoria",
    "name": "Victoria Spa — Massoterapia & Terapias Holísticas",
    "niche": "Massagem",
    "category": "Estética, Dermato, Maquiagem & Massagem",
    "badge": "Massoterapia & Spa",
    "description": "Alívio de dores, estresse e relaxamento profundo com massagem relaxante, desportiva, shiatsu e pedras quentes.",
    "accentColor": "#0d9488",
    "features": [
      "Sessões de massagem relaxante e terapêutica",
      "Alívio de contraturas musculares e dores lombares",
      "Maca aquecida e óleos essenciais",
      "Agende seu horário relaxante"
    ],
    "previewImg": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "massoterapia",
      "massagista",
      "massagem relaxante",
      "shiatsu",
      "pedras quentes",
      "ventosaterapia"
    ]
  },
  {
    "id": "massagista-clean-beauta",
    "name": "Beauta — Massagem Estética & Drenagem Modeladora",
    "niche": "Massagem",
    "category": "Estética, Dermato, Maquiagem & Massagem",
    "badge": "Modeladora & Drenagem",
    "description": "Focado em resultados visíveis de contorno corporal, pós-operatório cirúrgico, drenagem método Renata França e modeladora.",
    "accentColor": "#10b981",
    "features": [
      "Drenagem linfática pós-cirúrgica especializada",
      "Massagem modeladora com resultados imediatos",
      "Tratamentos de retenção de líquido",
      "Planos de 5 e 10 sessões"
    ],
    "previewImg": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "drenagem pos operatorio",
      "massagem modeladora",
      "renata franca",
      "desinchar",
      "retencao de liquidos"
    ]
  },
  {
    "id": "academia-crossfit-fitmax",
    "name": "FitMax — Academia, Musculação & Box de Crossfit",
    "niche": "Academia",
    "category": "Academias, Yoga, Lutas & Suplementos",
    "badge": "Musculação & Crossfit",
    "description": "Energia máxima para academias completas, box de crossfit, áreas de cardio e musculação com planos mensais e anuais.",
    "accentColor": "#eab308",
    "features": [
      "Quadro de horários de aulas e treinos livres",
      "Aparelhos importados de biomecânica avançada",
      "Acompanhamento com professores de salão",
      "Aula experimental grátis"
    ],
    "previewImg": "/templates-thumbs/academia-crossfit-fitmax.jpg",
    "recommendedKeywords": [
      "academia",
      "crossfit",
      "musculacao",
      "treino funcional",
      "box crossfit",
      "aula experimental"
    ]
  },
  {
    "id": "personal-gym-progym",
    "name": "ProGym — Personal Trainer & Assessoria Fitness",
    "niche": "Personal Trainer",
    "category": "Academias, Yoga, Lutas & Suplementos",
    "badge": "Personal & Treino",
    "description": "Consultoria e assessoria personalizada de treino para emagrecimento rápido, hipertrofia e reabilitação postural.",
    "accentColor": "#ef4444",
    "features": [
      "Treinos individualizados presenciais e online",
      "Avaliação física por bioimpedância e dobras",
      "Periodização de carga e resultados",
      "Solicite orçamento no WhatsApp"
    ],
    "previewImg": "/templates-thumbs/personal-gym-progym.jpg",
    "recommendedKeywords": [
      "personal trainer",
      "consultoria fitness",
      "treino online",
      "hipertrofia",
      "emagrecimento rapido"
    ]
  },
  {
    "id": "personal-claro-moderno",
    "name": "VitalFit — Personal Trainer & Saúde Funcional",
    "niche": "Personal Trainer",
    "category": "Academias, Yoga, Lutas & Suplementos",
    "badge": "Saúde & Funcional",
    "description": "Abordagem equilibrada e moderna para qualidade de vida, mobilidade articular, terceira idade e pós-reabilitação.",
    "accentColor": "#0284c7",
    "features": [
      "Treinos funcionais leves e moderados",
      "Foco em saúde articular e postural",
      "Planos para iniciantes e intermediários",
      "Atendimento em domicílio ou estúdio"
    ],
    "previewImg": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "personal saude",
      "treino terceira idade",
      "funcional",
      "postura",
      "alongamento",
      "mobilidade"
    ]
  },
  {
    "id": "personal-moderno-energetico",
    "name": "PowerIron — Personal de Alta Performance",
    "niche": "Personal Trainer",
    "category": "Academias, Yoga, Lutas & Suplementos",
    "badge": "Alta Performance",
    "description": "Visual dinâmico e motivador para atletas de alto rendimento, corrida, provas e superação de limites.",
    "accentColor": "#f97316",
    "features": [
      "Preparação física para competições e TAF",
      "Acompanhamento nutricional integrado",
      "Resultados expressivos em 90 dias",
      "Depoimentos de alunos campeões"
    ],
    "previewImg": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "preparador fisico",
      "treino performance",
      "corrida de rua",
      "taf policial",
      "musculacao avancada"
    ]
  },
  {
    "id": "luta-moderno-sword",
    "name": "SwordFight — Centro de Treinamento de Lutas & MMA",
    "niche": "Lutas & Artes Marciais",
    "category": "Academias, Yoga, Lutas & Suplementos",
    "badge": "Muay Thai & MMA",
    "description": "Design escuro e impactante para academias de artes marciais, Muay Thai, Jiu Jitsu, Boxe e Defesa Pessoal.",
    "accentColor": "#dc2626",
    "features": [
      "Grade de aulas para adultos e crianças (kids)",
      "Tatame de 200m² com equipamentos oficiais",
      "Mestres faixas-pretas certificados",
      "Agende sua primeira aula gratuita"
    ],
    "previewImg": "/templates-thumbs/luta-moderno-sword.jpg",
    "recommendedKeywords": [
      "muay thai",
      "jiu jitsu",
      "boxe",
      "mma",
      "defesa pessoal",
      "artes marciais",
      "tatame"
    ]
  },
  {
    "id": "luta-completa-martialarts",
    "name": "DojoMaster — Academia de Jiu-Jitsu & Judô",
    "niche": "Lutas & Artes Marciais",
    "category": "Academias, Yoga, Lutas & Suplementos",
    "badge": "Dojo Tradicional",
    "description": "Respeito, disciplina e formação de campeões no tatame com tradição milenar japonesa e brasileira.",
    "accentColor": "#1e3a8a",
    "features": [
      "Filosofia marcial e disciplina de vida",
      "Turmas femininas exclusivas e infantil",
      "Quimono e graduação oficial de faixas",
      "Conheça o dojo presencialmente"
    ],
    "previewImg": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "dojo",
      "jiu jitsu feminino",
      "judo",
      "karate",
      "turma kids",
      "graduacao faixas"
    ]
  },
  {
    "id": "yoga-completo-yogana",
    "name": "Yogana — Espaço de Yoga, Meditação & Mindfulness",
    "niche": "Yoga & Meditação",
    "category": "Academias, Yoga, Lutas & Suplementos",
    "badge": "Yoga & Mindfulness",
    "description": "Paz interior, equilíbrio e flexibilidade com aulas presenciais de Hatha Yoga, Vinyasa Flow e respiração consciente.",
    "accentColor": "#059669",
    "features": [
      "Aulas guiadas com professores formados na Índia",
      "Ambiente silencioso e perfumado com óleos essenciais",
      "Práticas matinais e ao pôr do sol",
      "Conheça nossos planos mensais"
    ],
    "previewImg": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "yoga",
      "hatha yoga",
      "vinyasa",
      "meditacao",
      "mindfulness",
      "pranayama",
      "paz interior"
    ]
  },
  {
    "id": "yoga-fitness-exclusivo",
    "name": "ZenFit — Yoga Funcional & Pilates Solo",
    "niche": "Yoga & Pilates",
    "category": "Academias, Yoga, Lutas & Suplementos",
    "badge": "Yoga & Pilates",
    "description": "Harmonia perfeita entre força muscular e relaxamento mental com sessões de Pilates no solo e Yoga dinâmico.",
    "accentColor": "#0ea5e9",
    "features": [
      "Fortalecimento do abdômen e coluna sem impacto",
      "Turmas reduzidas de no máximo 6 alunos",
      "Aulas de flexibilidade e postura",
      "Agende sua aula experimental"
    ],
    "previewImg": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "pilates solo",
      "yoga funcional",
      "flexibilidade",
      "coluna sem dor",
      "turmas reduzidas"
    ]
  },
  {
    "id": "yoga-agendamento-yogazone",
    "name": "YogaZone — Estúdio de Yoga com Agendamento Fácil",
    "niche": "Yoga",
    "category": "Academias, Yoga, Lutas & Suplementos",
    "badge": "Agendamento Direto",
    "description": "Landing page focada na conversão com grade interativa de horários, valores de mensalidade e clique direto para reservar.",
    "accentColor": "#14b8a6",
    "features": [
      "Tabela semanal de horários atualizada",
      "Planos de 2x e 3x por semana ou livre",
      "Espaço com tapetes e blocos inclusos",
      "Reserve sua vaga no WhatsApp"
    ],
    "previewImg": "/templates-thumbs/yoga-agendamento-yogazone.jpg",
    "recommendedKeywords": [
      "estudio yoga",
      "aulas yoga",
      "horarios yoga",
      "reserva de aula",
      "plano mensal"
    ]
  },
  {
    "id": "yoga-moderno-clean-yogava",
    "name": "Yogava — Studio Clean de Yoga & Respiração",
    "niche": "Yoga",
    "category": "Academias, Yoga, Lutas & Suplementos",
    "badge": "Clean & Zen",
    "description": "Design minimalista e claro transmitindo leveza espiritual, descompressão do dia a dia e renovação energética.",
    "accentColor": "#10b981",
    "features": [
      "Práticas antiestresse e sono restaurador",
      "Workshop de meditação nos fins de semana",
      "Comunidade acolhedora e inclusiva",
      "Comece sua jornada hoje"
    ],
    "previewImg": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "yoga clean",
      "yoga iniciantes",
      "respira",
      "antiestresse",
      "bem estar"
    ]
  },
  {
    "id": "loja-suplementos-purefit",
    "name": "PureFit — Suplementos Nutricionais & Vitaminas",
    "niche": "Suplementos",
    "category": "Academias, Yoga, Lutas & Suplementos",
    "badge": "Suplementos Premium",
    "description": "Whey Protein, Creatina monohidratada pura, Pré-treinos, Vitaminas e acessórios esportivos com entrega rápida na cidade.",
    "accentColor": "#f59e0b",
    "features": [
      "Marcas nacionais e importadas com laudos aprovados",
      "Combos de ganho de massa e queima de gordura",
      "Consultoria de suplementação pelo WhatsApp",
      "Entrega no mesmo dia"
    ],
    "previewImg": "/templates-thumbs/loja-suplementos-purefit.jpg",
    "recommendedKeywords": [
      "suplementos",
      "whey protein",
      "creatina",
      "pre treino",
      "bcaa",
      "glutamina",
      "loja de suplementos"
    ]
  },
  {
    "id": "arquitetura-elegante-tecture",
    "name": "Tecture — Arquitetura de Alto Padrão & Construção",
    "niche": "Arquitetura",
    "category": "Arquitetura & Design de Interiores",
    "badge": "Alto Padrão",
    "description": "Sofisticação e linguagem contemporânea para escritórios de arquitetura residencial e comercial de luxo.",
    "accentColor": "#c59a63",
    "features": [
      "Projetos arquitetônicos residenciais modernos",
      "Renderizações 3D realistas e maquetes",
      "Acompanhamento e gerenciamento de obras",
      "Solicite um estudo preliminar"
    ],
    "previewImg": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "arquitetura",
      "arquiteto alto padrao",
      "projeto residencial",
      "casa moderna",
      "obra de luxo"
    ]
  },
  {
    "id": "arquitetura-portfolio-moderno",
    "name": "ArchStudio — Portfólio de Projetos & Obras",
    "niche": "Arquitetura",
    "category": "Arquitetura & Design de Interiores",
    "badge": "Portfólio & Obras",
    "description": "Foco nos projetos executados com fotos em tela cheia, plantas humanizadas e detalhes de engenharia.",
    "accentColor": "#2563eb",
    "features": [
      "Projetos comerciais, corporativos e clínicas",
      "Soluções de iluminação, ventilação e sustentabilidade",
      "Equipe multidisciplinar de engenheiros",
      "Agende uma reunião presencial"
    ],
    "previewImg": "/templates-thumbs/arquitetura-portfolio-moderno.jpg",
    "recommendedKeywords": [
      "portfolio arquitetura",
      "projeto comercial",
      "arquiteto corporativo",
      "fachada moderna",
      "reforma"
    ]
  },
  {
    "id": "arquiteto-detalhado-shelder",
    "name": "Shelder — Escritório de Arquitetura & Interiores",
    "niche": "Arquitetura",
    "category": "Arquitetura & Design de Interiores",
    "badge": "Projetos Detalhados",
    "description": "Clareza em todas as etapas: briefing, conceito, projeto executivo, aprovação na prefeitura e entrega de chaves.",
    "accentColor": "#d97706",
    "features": [
      "Cronograma transparente e sem surpresas no orçamento",
      "Consultoria de compra de imóveis e terrenos",
      "Detalhamento de marcenaria e acabamentos",
      "Fale com o arquiteto chefe"
    ],
    "previewImg": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "escritorio arquitetura",
      "aprovacao prefeitura",
      "projeto executivo",
      "marcenaria sob medida"
    ]
  },
  {
    "id": "design-interiores-fauxis",
    "name": "Fauxis — Design de Interiores & Decoração Minimalista",
    "niche": "Design de Interiores",
    "category": "Arquitetura & Design de Interiores",
    "badge": "Interiores & Decor",
    "description": "Transformação de ambientes residenciais e comerciais com funcionalidade, iluminação cênica e mobiliário refinado.",
    "accentColor": "#14b8a6",
    "features": [
      "Paleta de cores e texturas acolhedoras",
      "Moodboards conceituais e lista de compras",
      "Decoração de salas, quartos e cozinhas",
      "Consultoria express de interiores"
    ],
    "previewImg": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "design de interiores",
      "decoradora",
      "decoracao minimalista",
      "design de ambientes",
      "reforma apartamento"
    ]
  },
  {
    "id": "mecanica-completo-audeck",
    "name": "AuDeck — Centro Automotivo & Oficina Mecânica",
    "niche": "Mecânica",
    "category": "Mecânica & Automotivo",
    "badge": "Centro Automotivo",
    "description": "Mecânica de precisão, injeção eletrônica computadorizada, suspensão, freios ABS e revisão preventiva completa.",
    "accentColor": "#dc2626",
    "features": [
      "Diagnóstico com scanner eletrônico de última geração",
      "Troca de óleo, filtros e fluidos com garantia",
      "Alinhamento 3D e balanceamento a laser",
      "Orçamento detalhado no WhatsApp"
    ],
    "previewImg": "/templates-thumbs/mecanica-completo-audeck.jpg",
    "recommendedKeywords": [
      "mecanica",
      "oficina mecanica",
      "centro automotivo",
      "injecao eletronica",
      "suspensao",
      "freios",
      "troca de oleo"
    ]
  },
  {
    "id": "mecanica-portfolio-automec",
    "name": "AutoMec — Mecânica Geral, Câmbio & Motor",
    "niche": "Mecânica",
    "category": "Mecânica & Automotivo",
    "badge": "Câmbio & Motor",
    "description": "Especialista em retífica de motores, reparo de câmbio automático e manual e mecânica de nacionais e importados.",
    "accentColor": "#f97316",
    "features": [
      "Especialistas em câmbio automático e dupla embreagem",
      "Peças originais de reposição com garantia formal",
      "Socorro mecânico e guincho parceiro",
      "Agende sua revisão"
    ],
    "previewImg": "/templates-thumbs/mecanica-portfolio-automec.jpg",
    "recommendedKeywords": [
      "cambio automatico",
      "retifica de motor",
      "mecanica importados",
      "oficina especializada"
    ]
  },
  {
    "id": "mecanica-simples-cardinal",
    "name": "Cardinal — Oficina Rápida & Auto Center",
    "niche": "Mecânica",
    "category": "Mecânica & Automotivo",
    "badge": "Oficina Rápida",
    "description": "Atendimento ágil para manutenção preventiva: pastilhas de freio, bateria, ar-condicionado automotivo e escapamento.",
    "accentColor": "#2563eb",
    "features": [
      "Troca de bateria com teste de alternador gratuito",
      "Higienização de ar-condicionado com ozônio",
      "Preços justos e transparentes sem pegadinhas",
      "Fale agora com o mecânico"
    ],
    "previewImg": "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "auto center",
      "bateria de carro",
      "ar condicionado automotivo",
      "freio",
      "revisao express"
    ]
  },
  {
    "id": "dentista-criativo-dentia",
    "name": "Dentia — Odontologia Estética, Lentes & Harmonização",
    "niche": "Odontologia",
    "category": "Odontologia & Saúde",
    "badge": "Lentes & Estética",
    "description": "Design refinado e moderno focado em transformações de sorriso, lentes de contato dental, clareamento a laser e facetas.",
    "accentColor": "#0284c7",
    "features": [
      "Planejamento digital do sorriso (DSD)",
      "Lentes de resina composta e porcelana ultrafina",
      "Clareamento dental seguro e sem dor",
      "Avaliação estética personalizada"
    ],
    "previewImg": "/templates-thumbs/dentista-criativo-dentia.jpg",
    "recommendedKeywords": [
      "dentista",
      "lentes de contato dental",
      "clareamento dental",
      "odontologia estetica",
      "sorriso perfeito"
    ]
  },
  {
    "id": "dentista-detalhado-prime",
    "name": "PrimeDental — Clínica Odontológica Integrada & Implantes",
    "niche": "Odontologia",
    "category": "Odontologia & Saúde",
    "badge": "Implantes & Aparelho",
    "description": "Atendimento familiar completo com ortodontia, alinhadores invisíveis, implantes dentários com carga rápida e próteses.",
    "accentColor": "#0d9488",
    "features": [
      "Implantes com tecnologia guiada sem cortes",
      "Alinhadores transparentes modernos e confortáveis",
      "Odontopediatria dedicada para crianças",
      "Agende sua consulta odontológica"
    ],
    "previewImg": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "implante dentario",
      "ortodontia",
      "alinhador invisivel",
      "clinica odontologica",
      "dentista crianca"
    ]
  },
  {
    "id": "dentista-medicina-medicore",
    "name": "MediCore — Centro Médico & Odontologia Geral",
    "niche": "Saúde & Medicina",
    "category": "Odontologia & Saúde",
    "badge": "Clínica Integrada",
    "description": "Consultório multifuncional com consultas médicas gerais, exames de rotina, check-up preventivo e saúde bucal.",
    "accentColor": "#2563eb",
    "features": [
      "Consultas médicas pontuais e acolhedoras",
      "Equipamentos esterilizados e normas de saúde",
      "Atendimento para convênios e particular",
      "Localização central e acessível"
    ],
    "previewImg": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "clinica medica",
      "consultorio medico",
      "checkup",
      "medico da familia",
      "saude geral"
    ]
  },
  {
    "id": "petshop-completo-petz",
    "name": "Petz Care — Banho, Tosa, Veterinária & Acessórios",
    "niche": "Pet Shop",
    "category": "Pet Shop",
    "badge": "Banho & Veterinária",
    "description": "Acolhimento com carinho total para cães e gatos: banho com produtos hipoalergênicos, tosa na tesoura, vacinas e rações premium.",
    "accentColor": "#f97316",
    "features": [
      "Banho e tosa com água morna e ambiente climatizado",
      "Táxi-pet para buscar e levar seu pet em segurança",
      "Consultas veterinárias e vacinas importadas",
      "Agende o banho do seu pet pelo WhatsApp"
    ],
    "previewImg": "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "pet shop",
      "banho e tosa",
      "veterinario",
      "tosa bebe",
      "taxi pet",
      "racao premium",
      "cuidados pet"
    ]
  },
  {
    "id": "marido-aluguel-portfolio",
    "name": "FazTudo — Marido de Aluguel & Reparos Rápidos",
    "niche": "Serviços Gerais",
    "category": "Serviços Gerais & Marido de Aluguel",
    "badge": "Reparos & Instalações",
    "description": "Pequenos reparos residenciais e comerciais com rapidez, segurança e profissionalismo: elétrica, hidráulica, pintura e montagem.",
    "accentColor": "#eab308",
    "features": [
      "Instalação de ventiladores, chuveiros e tomadas",
      "Conserto de vazamentos, torneiras e válvulas",
      "Montagem e desmontagem de móveis planejados",
      "Orçamento sem compromisso no WhatsApp"
    ],
    "previewImg": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "marido de aluguel",
      "pequenos reparos",
      "eletricista",
      "encanador",
      "montador de moveis",
      "consertos"
    ]
  },
  {
    "id": "marido-aluguel-simples-reroof",
    "name": "FixMaster — Manutenção Residencial Express",
    "niche": "Serviços Gerais",
    "category": "Serviços Gerais & Marido de Aluguel",
    "badge": "Manutenção Express",
    "description": "Solução rápida para emergências domésticas: desentupimento, fechaduras, fixação de suportes de TV, quadros e cortinas.",
    "accentColor": "#2563eb",
    "features": [
      "Atendimento com pontualidade e ferramentas completas",
      "Limpeza do ambiente após o término do serviço",
      "Preço combinado previamente sem surpresas",
      "Chame pelo WhatsApp agora mesmo"
    ],
    "previewImg": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "reparos domesticos",
      "instalacao tv",
      "conserto torneira",
      "fechadura",
      "desentupidora"
    ]
  },
  {
    "id": "servicos-gerais-limpo-erepair",
    "name": "ERepair — Serviços Gerais, Reformas & Pinturas",
    "niche": "Serviços Gerais",
    "category": "Serviços Gerais & Marido de Aluguel",
    "badge": "Reformas & Pintura",
    "description": "Reformas completas de imóveis, colocação de pisos, porcelanato, drywall, textura, pintura interna e externa.",
    "accentColor": "#10b981",
    "features": [
      "Equipe especializada com acompanhamento diário",
      "Contrato de prestação de serviços com garantia",
      "Material de primeira linha e acabamento refinado",
      "Solicite visita técnica"
    ],
    "previewImg": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80",
    "recommendedKeywords": [
      "reforma residencial",
      "pintor",
      "drywall",
      "colocacao de piso",
      "porcelanato",
      "servicos gerais"
    ]
  },
  {
    "id": "fotografia-minimalista-elarisse",
    "name": "Elarisse — Fotografia Autoral, Ensaios & Eventos",
    "niche": "Fotografia",
    "category": "Portfólio, Fotografia & Minimalista",
    "badge": "Ensaios & Eventos",
    "description": "Sensibilidade artística para ensaios femininos, gestantes, casamentos, formaturas e fotos corporativas de alto impacto.",
    "accentColor": "#c59a63",
    "features": [
      "Ensaios externos e em estúdio climatizado",
      "Tratamento de cor profissional e álbuns encadernados",
      "Fotografia para posicionamento de imagem e marcas",
      "Consulte pacotes disponíveis"
    ],
    "previewImg": "/templates-thumbs/fotografia-minimalista-elarisse.jpg",
    "recommendedKeywords": [
      "fotografo",
      "ensaio fotografico",
      "foto gestante",
      "casamento",
      "ensaio corporativo",
      "book"
    ]
  },
  {
    "id": "design-minimalista-anglo",
    "name": "Anglo — Estúdio de Design, Branding & Identidade",
    "niche": "Design & Branding",
    "category": "Portfólio, Fotografia & Minimalista",
    "badge": "Branding & Design",
    "description": "Criação de marcas marcantes, design gráfico, identidade visual, embalagens e websites elegantes.",
    "accentColor": "#3b82f6",
    "features": [
      "Projetos de identidade visual estratégica",
      "Design de logotipos exclusivos e manuais de marca",
      "Apresentação de cases de sucesso e clientes",
      "Solicite uma proposta"
    ],
    "previewImg": "/templates-thumbs/design-minimalista-anglo.jpg",
    "recommendedKeywords": [
      "design grafico",
      "agencia de design",
      "criacao de logo",
      "identidade visual",
      "branding"
    ]
  },
  {
    "id": "portfolio-moderno-jonna",
    "name": "Jonna — Portfólio Criativo & Profissional Autônomo",
    "niche": "Portfólio",
    "category": "Portfólio, Fotografia & Minimalista",
    "badge": "Criativo & Moderno",
    "description": "Apresentação profissional impecável para consultores, designers, criadores de conteúdo e profissionais liberais.",
    "accentColor": "#8b5cf6",
    "features": [
      "Biografia profissional e trajetória de destaque",
      "Galeria de trabalhos e projetos concluídos",
      "Depoimentos de parceiros e clientes",
      "Links de contato direto"
    ],
    "previewImg": "/templates-thumbs/portfolio-moderno-jonna.jpg",
    "recommendedKeywords": [
      "portfolio profissional",
      "consultor",
      "freelancer",
      "apresentacao profissional",
      "curriculo online"
    ]
  },
  {
    "id": "portfolio-simples-slider",
    "name": "SliderStudio — Portfólio Limpo com Slideshow",
    "niche": "Portfólio",
    "category": "Portfólio, Fotografia & Minimalista",
    "badge": "Slideshow Limpo",
    "description": "Interface limpa e objetiva com carrossel dinâmico de projetos para rápido impacto visual e contato no WhatsApp.",
    "accentColor": "#06b6d4",
    "features": [
      "Carrossel fluido de fotos e destaques",
      "Design responsivo ultrarrápido",
      "Informações de contato sempre acessíveis",
      "Fácil de personalizar"
    ],
    "previewImg": "/templates-thumbs/portfolio-simples-slider.jpg",
    "recommendedKeywords": [
      "portfolio simples",
      "portfolio clean",
      "slider portfolio",
      "apresentacao clean"
    ]
  }
];
