import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega JSZip do repositório BILLY
const JSZipModule = await import('file:///C:/Users/conta/Desktop/BILLY/node_modules/jszip/lib/index.js');
const JSZip = JSZipModule.default || JSZipModule;

const DRIVE_DIR = 'C:/Users/conta/Desktop/BILLY/NOVOS_TEMPLATES_DRIVE';
const WEB_ROOT = path.resolve(__dirname, '..');
const THUMBS_DIR = path.resolve(WEB_ROOT, 'public/templates-thumbs');
const CATALOG_DIR = path.resolve(WEB_ROOT, 'src/lib/templates-catalog');

if (!fs.existsSync(THUMBS_DIR)) fs.mkdirSync(THUMBS_DIR, { recursive: true });
if (!fs.existsSync(CATALOG_DIR)) fs.mkdirSync(CATALOG_DIR, { recursive: true });

// Fallback Unsplash por nicho caso o zip não contenha imagem de thumbnail de boa qualidade
const NICHE_FALLBACK_IMGS = {
  'Tatuagem': 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800&auto=format&fit=crop&q=80',
  'Pizzaria': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
  'Gastronomia': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
  'Cafeteria': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
  'Estética': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80',
  'Dermatologia': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
  'Maquiagem': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80',
  'Massagem': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80',
  'Academia': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
  'Personal Trainer': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80',
  'Lutas & Artes Marciais': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
  'Yoga & Meditação': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
  'Yoga & Pilates': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80',
  'Yoga': 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80',
  'Suplementos': 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800&auto=format&fit=crop&q=80',
  'Arquitetura': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
  'Design de Interiores': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
  'Mecânica': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
  'Odontologia': 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80',
  'Saúde & Medicina': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
  'Pet Shop': 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop&q=80',
  'Serviços Gerais': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
  'Fotografia': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
  'Design & Branding': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
  'Portfólio': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80'
};

export const DRIVE_TEMPLATE_METADATA = {
  // 1. Tatuagem & Piercing
  'portfólio tattoo.zip': {
    id: 'tattoo-portfolio-themestarz',
    name: 'Tattoo Artist — Portfólio Dark Autoral',
    niche: 'Tatuagem',
    category: 'Tatuagem & Piercing',
    categorySlug: 'tatuagem',
    badge: 'Autoral & Dark',
    accentColor: '#e11d48',
    description: 'Design escuro cinematográfico focado em portfólio de tatuagens autorais, flashs, biossegurança e agendamentos diretos.',
    features: ['Galeria de flashs e artes autorais', 'Tabela de estilos (Blackwork, Realismo, Fineline)', 'Biossegurança e normas ANVISA', 'Botão WhatsApp para orçamentos'],
    recommendedKeywords: ['tattoo', 'tatuagem', 'tatuador', 'piercing', 'blackwork', 'fineline', 'flash', 'ink']
  },
  'estudio tattoo portfólio.zip': {
    id: 'tattoo-estudio-portfolio-blaxcut',
    name: 'Blaxcut — Estúdio Tattoo & Piercing Portfólio',
    niche: 'Tatuagem',
    category: 'Tatuagem & Piercing',
    categorySlug: 'tatuagem',
    badge: 'Estúdio & Piercing',
    accentColor: '#f59e0b',
    description: 'Layout moderno com tipografia expressiva para estúdios consolidados de tatuagem e aplicação de piercing em titânio.',
    features: ['Grade de tatuadores residentes e convidados', 'Catálogo de piercings e joias', 'Depoimentos de clientes satisfeitos', 'Orçamento instantâneo'],
    recommendedKeywords: ['estudio tattoo', 'piercing titanio', 'tatuador sp', 'body piercing', 'microdermal']
  },
  'estudio tattoo moderno .zip': {
    id: 'tattoo-estudio-moderno',
    name: 'UrbanInk — Estúdio Tattoo Moderno & Street',
    niche: 'Tatuagem',
    category: 'Tatuagem & Piercing',
    categorySlug: 'tatuagem',
    badge: 'Urbano & Street',
    accentColor: '#a855f7',
    description: 'Estética street art e underground com alto contraste, animações suaves e seções de cuidados pós-tatuagem.',
    features: ['Design arrojado com alto impacto visual', 'Guia de cuidados pós-procedimento', 'Fotos de cicatrização e trabalhos reais', 'Atendimento rápido'],
    recommendedKeywords: ['urban tattoo', 'tatuagem moderna', 'cobertura tattoo', 'cover up', 'oriental tattoo']
  },

  // 2. Gastronomia, Cafés & Pizzarias
  'pizzaria restaurante clean detalhado.zip': {
    id: 'pizzaria-clean-royate',
    name: 'Royate — Pizzaria Artesanal & Forno a Lenha',
    niche: 'Pizzaria',
    category: 'Gastronomia, Cafés & Pizzarias',
    categorySlug: 'gastronomia',
    badge: 'Forno a Lenha',
    accentColor: '#dc2626',
    description: 'Apresentação refinada para pizzarias italianas, delivery premium e massas artesanais com cardápio completo de sabores.',
    features: ['Cardápio ilustrado de pizzas tradicionais e especiais', 'Bordas recheadas e sobremesas artesanais', 'Área de entrega e delivery via WhatsApp', 'Depoimentos de clientes'],
    recommendedKeywords: ['pizzaria', 'pizza artesanal', 'forno a lenha', 'calzone', 'delivery pizza', 'rodizio']
  },
  'restaurante e cafe moderno.zip': {
    id: 'restaurante-cafe-heritaste',
    name: 'Heritaste — Restaurante & Café Moderno',
    niche: 'Gastronomia',
    category: 'Gastronomia, Cafés & Pizzarias',
    categorySlug: 'gastronomia',
    badge: 'Gourmet & Café',
    accentColor: '#d97706',
    description: 'Ambiente aconchegante para bistrôs contemporâneos, cafés coloniais e restaurantes à la carte.',
    features: ['Cardápio de pratos executivos e sobremesas', 'Carta especial de cafés e bebidas', 'Horário de funcionamento e reservas', 'Localização privilegiada'],
    recommendedKeywords: ['restaurante', 'cafe moderno', 'bistro', 'almoco executivo', 'cafeteria', 'brunch']
  },
  'restaurante cardapio.zip': {
    id: 'restaurante-cardapio-dbento',
    name: 'DBento — Restaurante Cardápio Digital & Buffet',
    niche: 'Gastronomia',
    category: 'Gastronomia, Cafés & Pizzarias',
    categorySlug: 'gastronomia',
    badge: 'Cardápio Completo',
    accentColor: '#ea580c',
    description: 'Cardápio digital dinâmico com fotos de pratos, preços por porção, marmitas gourmet e bebidas geladas.',
    features: ['Grade de pratos e porções mais pedidas', 'Preços transparentes e combos da casa', 'Fácil visualização no celular', 'Pedidos diretos no WhatsApp'],
    recommendedKeywords: ['cardapio restaurante', 'marmita gourmet', 'almoco', 'prato feito', 'restaurante por quilo']
  },
  'restaurante .zip': {
    id: 'restaurante-classico-granny',
    name: 'Granny — Restaurante Tradicional & Cozinha Afetiva',
    niche: 'Gastronomia',
    category: 'Gastronomia, Cafés & Pizzarias',
    categorySlug: 'gastronomia',
    badge: 'Cozinha Tradicional',
    accentColor: '#b45309',
    description: 'Estilo acolhedor com tradição culinária familiar, pratos caseiros, carnes nobres e massas frescas.',
    features: ['Destaque para receitas clássicas de família', 'Carta de vinhos e bebidas selecionadas', 'Galeria de fotos do salão e buffet', 'Reserva de mesas'],
    recommendedKeywords: ['comida caseira', 'restaurante familia', 'churrascaria', 'fogao a lenha', 'almoco de domingo']
  },
  'restaurante portfolio.zip': {
    id: 'restaurante-portfolio-grandrestaurant',
    name: 'GrandRestaurant — Alta Gastronomia & Experiência',
    niche: 'Gastronomia',
    category: 'Gastronomia, Cafés & Pizzarias',
    categorySlug: 'gastronomia',
    badge: 'Alta Gastronomia',
    accentColor: '#ca8a04',
    description: 'Experiência sensorial de luxo para restaurantes conceituais, chefs renomados e jantares exclusivos.',
    features: ['Menu degustação assinado pelo Chef', 'Galeria de pratos com iluminação artística', 'Avaliações de críticos e clientes VIP', 'Agendamento de jantares'],
    recommendedKeywords: ['alta gastronomia', 'chef de cozinha', 'jantar romantico', 'menu degustacao', 'restaurante luxo']
  },
  'restaurante elegante.zip': {
    id: 'restaurante-elegante-elegencia',
    name: 'Elegancia — Bistrô & Eventos Gastronômicos',
    niche: 'Gastronomia',
    category: 'Gastronomia, Cafés & Pizzarias',
    categorySlug: 'gastronomia',
    badge: 'Bistrô Sofisticado',
    accentColor: '#9333ea',
    description: 'Design minimalista e requintado com tipografia serifada de alto padrão para bistrôs e eventos fechados.',
    features: ['Harmonização de pratos e drinks autorais', 'Espaço para eventos corporativos e casamentos', 'Galeria de arquitetura e decoração', 'Contato direto com sommelier'],
    recommendedKeywords: ['bistro elegante', 'restaurante fino', 'drinks autorais', 'sommelier', 'cozinha contemporanea']
  },
  'coffe shop esuro .zip': {
    id: 'coffee-shop-escuro-bruin',
    name: 'Bruin — Coffee Shop Escuro & Grãos Especiais',
    niche: 'Cafeteria',
    category: 'Gastronomia, Cafés & Pizzarias',
    categorySlug: 'gastronomia',
    badge: 'Grãos Especiais',
    accentColor: '#78350f',
    description: 'Ambiente escuro estilizado para torrefações de café artesanal, espressos premiados e doces finos.',
    features: ['Origens de grãos 100% arábica certificados', 'Métodos de extração (V60, Prensa, Aeropress)', 'Menu de confeitaria artesanal e salgados', 'Localização e take away'],
    recommendedKeywords: ['coffee shop', 'cafe especial', 'torrefacao', 'espresso', 'barista', 'graos selecionados']
  },
  'coffe shop moderno.zip': {
    id: 'coffee-shop-moderno-max',
    name: 'MaxCoffee — Cafeteria & Coworking Moderno',
    niche: 'Cafeteria',
    category: 'Gastronomia, Cafés & Pizzarias',
    categorySlug: 'gastronomia',
    badge: 'Café & Coworking',
    accentColor: '#059669',
    description: 'Atmosfera jovem e produtiva para cafeterias com internet rápida, mesas compartilhadas e lanches rápidos.',
    features: ['Menu de cafés gelados, lattes e frappés', 'Opções veganas e sem glúten', 'Ambiente preparado para reuniões e trabalho', 'Faça seu pedido no balcão'],
    recommendedKeywords: ['cafeteria moderna', 'coworking cafe', 'iced coffee', 'frappuccino', 'cookies artesanais']
  },
  'coffee estilo.zip': {
    id: 'coffee-estilo-barista',
    name: 'Barista — Boutique de Café & Confeitaria',
    niche: 'Cafeteria',
    category: 'Gastronomia, Cafés & Pizzarias',
    categorySlug: 'gastronomia',
    badge: 'Boutique de Café',
    accentColor: '#d97706',
    description: 'Charme rústico europeu com croissants quentinhos, bolos caseiros e xícaras de café latte com arte.',
    features: ['Latte art e experiências personalizadas', 'Cesta de cafés da manhã sob encomenda', 'Galeria de clientes e xícaras especiais', 'Pedidos antecipados no WhatsApp'],
    recommendedKeywords: ['croissant', 'cafe da manha', 'padaria gourmet', 'bolo caseiro', 'confeitaria']
  },

  // 3. Estética, Dermato, Maquiagem & Massagem
  'estetica completo.zip': {
    id: 'estetica-completo-spa',
    name: 'Lumina — Clínica de Estética & Harmonização Completa',
    niche: 'Estética',
    category: 'Estética, Dermato, Maquiagem & Massagem',
    categorySlug: 'estetica',
    badge: 'Estética Avançada',
    accentColor: '#db2777',
    description: 'Solução completa para clínicas biomédicas, harmonização facial, preenchimentos, bioestimuladores e lasers.',
    features: ['Procedimentos faciais e corporais detalhados', 'Antes e depois de clientes reais', 'Corpo clínico e pós-graduações', 'Agendamento de avaliação facial'],
    recommendedKeywords: ['clinica de estetica', 'harmonizacao facial', 'botox', 'bioestimulador', 'preenchimento labial', 'fios de pdo']
  },
  'estetica elegante e minimalista.zip': {
    id: 'estetica-elegante-minimalista',
    name: 'AuraGlow — Estética Integrativa & Spa Facial',
    niche: 'Estética',
    category: 'Estética, Dermato, Maquiagem & Massagem',
    categorySlug: 'estetica',
    badge: 'Elegante & Clean',
    accentColor: '#ec4899',
    description: 'Tons pasteis refinados com foco em bem-estar, limpeza de pele profunda, drenagem e rejuvenescimento.',
    features: ['Protocolos exclusivos de hidratação e peeling', 'Ambiente relaxante com aromaterapia', 'Produtos dermatológicos selecionados', 'Avaliação personalizada'],
    recommendedKeywords: ['spa facial', 'limpeza de pele', 'peeling', 'rejuvenescimento', 'drenagem linfatica']
  },
  'estetica simples.zip': {
    id: 'estetica-simples-paradise',
    name: 'Paradise — Centro de Beleza & Estética Express',
    niche: 'Estética',
    category: 'Estética, Dermato, Maquiagem & Massagem',
    categorySlug: 'estetica',
    badge: 'Beleza & Express',
    accentColor: '#f43f5e',
    description: 'Rápido, objetivo e altamente focado na conversão de agendamentos no WhatsApp para depilação e estética rápida.',
    features: ['Depilação a laser e cera', 'Design de sobrancelhas e micropigmentação', 'Tabela de preços acessíveis e pacotes', 'Agendamento sem burocracia'],
    recommendedKeywords: ['depilacao laser', 'sobrancelhas', 'micropigmentacao', 'cilios', 'estetica rapida']
  },
  'estetica detalhado.zip': {
    id: 'estetica-detalhado-sparelax',
    name: 'SpaRelax — Clínica de Estética Médica & Tratamentos',
    niche: 'Estética',
    category: 'Estética, Dermato, Maquiagem & Massagem',
    categorySlug: 'estetica',
    badge: 'Médico & Tecnológico',
    accentColor: '#be185d',
    description: 'Design técnico e confiável para tratamentos corporais com equipamentos de criolipólise, ultrassom e radiofrequência.',
    features: ['Tecnologia de ponta e equipamentos certificados', 'Redução de medidas e combate à celulite', 'Relatos de pacientes em tratamento', 'Agendamento imediato'],
    recommendedKeywords: ['criolipolise', 'radiofrequencia', 'gordura localizada', 'flacidez', 'estetica corporal']
  },
  'dermato clean.zip': {
    id: 'dermato-clean-skincare',
    name: 'DermatoClean — Dermatologia & Tricologia Clínica',
    niche: 'Dermatologia',
    category: 'Estética, Dermato, Maquiagem & Massagem',
    categorySlug: 'estetica',
    badge: 'Dermatologia Clínica',
    accentColor: '#0284c7',
    description: 'Credibilidade médica máxima para consultórios dermatológicos, tratamentos de acne, manchas, melasma e queda capilar.',
    features: ['Consulta com médico dermatologista especialista', 'Mapeamento de pintas e sinais corporais', 'Tratamento de melasma e cicatrizes', 'Consulta de tricologia'],
    recommendedKeywords: ['dermatologista', 'dermato', 'tricologia', 'queda de cabelo', 'melasma', 'acne', 'manchas']
  },
  'maquiadora portfólio.zip': {
    id: 'maquiadora-portfolio-makeup',
    name: 'GlowGlam — Maquiagem Profissional & Noivas',
    niche: 'Maquiagem',
    category: 'Estética, Dermato, Maquiagem & Massagem',
    categorySlug: 'estetica',
    badge: 'Noivas & Social',
    accentColor: '#e11d48',
    description: 'Portfólio visual exuberante para maquiadoras sociais, atendimento a noivas, madrinhas e ensaios fotográficos.',
    features: ['Pacotes de Dia da Noiva e Debutantes', 'Galeria em alta definição de makes sociais', 'Produtos importados de alta durabilidade', 'Consultoria de visagismo'],
    recommendedKeywords: ['maquiadora', 'make noiva', 'maquiagem social', 'dia da noiva', 'visagismo', 'make madrinha']
  },
  'massagista portfólio.zip': {
    id: 'massagista-portfolio-victoria',
    name: 'Victoria Spa — Massoterapia & Terapias Holísticas',
    niche: 'Massagem',
    category: 'Estética, Dermato, Maquiagem & Massagem',
    categorySlug: 'estetica',
    badge: 'Massoterapia & Spa',
    accentColor: '#0d9488',
    description: 'Alívio de dores, estresse e relaxamento profundo com massagem relaxante, desportiva, shiatsu e pedras quentes.',
    features: ['Sessões de massagem relaxante e terapêutica', 'Alívio de contraturas musculares e dores lombares', 'Maca aquecida e óleos essenciais', 'Agende seu horário relaxante'],
    recommendedKeywords: ['massoterapia', 'massagista', 'massagem relaxante', 'shiatsu', 'pedras quentes', 'ventosaterapia']
  },
  'massagista  clean.zip': {
    id: 'massagista-clean-beauta',
    name: 'Beauta — Massagem Estética & Drenagem Modeladora',
    niche: 'Massagem',
    category: 'Estética, Dermato, Maquiagem & Massagem',
    categorySlug: 'estetica',
    badge: 'Modeladora & Drenagem',
    accentColor: '#10b981',
    description: 'Focado em resultados visíveis de contorno corporal, pós-operatório cirúrgico, drenagem método Renata França e modeladora.',
    features: ['Drenagem linfática pós-cirúrgica especializada', 'Massagem modeladora com resultados imediatos', 'Tratamentos de retenção de líquido', 'Planos de 5 e 10 sessões'],
    recommendedKeywords: ['drenagem pos operatorio', 'massagem modeladora', 'renata franca', 'desinchar', 'retencao de liquidos']
  },

  // 4. Academias, Yoga, Lutas & Suplementos
  'academias e crossfit completo.zip': {
    id: 'academia-crossfit-fitmax',
    name: 'FitMax — Academia, Musculação & Box de Crossfit',
    niche: 'Academia',
    category: 'Academias, Yoga, Lutas & Suplementos',
    categorySlug: 'fitness',
    badge: 'Musculação & Crossfit',
    accentColor: '#eab308',
    description: 'Energia máxima para academias completas, box de crossfit, áreas de cardio e musculação com planos mensais e anuais.',
    features: ['Quadro de horários de aulas e treinos livres', 'Aparelhos importados de biomecânica avançada', 'Acompanhamento com professores de salão', 'Aula experimental grátis'],
    recommendedKeywords: ['academia', 'crossfit', 'musculacao', 'treino funcional', 'box crossfit', 'aula experimental']
  },
  'personal e gym mais completo.zip': {
    id: 'personal-gym-progym',
    name: 'ProGym — Personal Trainer & Assessoria Fitness',
    niche: 'Personal Trainer',
    category: 'Academias, Yoga, Lutas & Suplementos',
    categorySlug: 'fitness',
    badge: 'Personal & Treino',
    accentColor: '#ef4444',
    description: 'Consultoria e assessoria personalizada de treino para emagrecimento rápido, hipertrofia e reabilitação postural.',
    features: ['Treinos individualizados presenciais e online', 'Avaliação física por bioimpedância e dobras', 'Periodização de carga e resultados', 'Solicite orçamento no WhatsApp'],
    recommendedKeywords: ['personal trainer', 'consultoria fitness', 'treino online', 'hipertrofia', 'emagrecimento rapido']
  },
  'personal visual claro e moderno.zip': {
    id: 'personal-claro-moderno',
    name: 'VitalFit — Personal Trainer & Saúde Funcional',
    niche: 'Personal Trainer',
    category: 'Academias, Yoga, Lutas & Suplementos',
    categorySlug: 'fitness',
    badge: 'Saúde & Funcional',
    accentColor: '#0284c7',
    description: 'Abordagem equilibrada e moderna para qualidade de vida, mobilidade articular, terceira idade e pós-reabilitação.',
    features: ['Treinos funcionais leves e moderados', 'Foco em saúde articular e postural', 'Planos para iniciantes e intermediários', 'Atendimento em domicílio ou estúdio'],
    recommendedKeywords: ['personal saude', 'treino terceira idade', 'funcional', 'postura', 'alongamento', 'mobilidade']
  },
  'personal visual moderno e nergetico.zip': {
    id: 'personal-moderno-energetico',
    name: 'PowerIron — Personal de Alta Performance',
    niche: 'Personal Trainer',
    category: 'Academias, Yoga, Lutas & Suplementos',
    categorySlug: 'fitness',
    badge: 'Alta Performance',
    accentColor: '#f97316',
    description: 'Visual dinâmico e motivador para atletas de alto rendimento, corrida, provas e superação de limites.',
    features: ['Preparação física para competições e TAF', 'Acompanhamento nutricional integrado', 'Resultados expressivos em 90 dias', 'Depoimentos de alunos campeões'],
    recommendedKeywords: ['preparador fisico', 'treino performance', 'corrida de rua', 'taf policial', 'musculacao avancada']
  },
  'luta moderno e agressivo.zip': {
    id: 'luta-moderno-sword',
    name: 'SwordFight — Centro de Treinamento de Lutas & MMA',
    niche: 'Lutas & Artes Marciais',
    category: 'Academias, Yoga, Lutas & Suplementos',
    categorySlug: 'fitness',
    badge: 'Muay Thai & MMA',
    accentColor: '#dc2626',
    description: 'Design escuro e impactante para academias de artes marciais, Muay Thai, Jiu Jitsu, Boxe e Defesa Pessoal.',
    features: ['Grade de aulas para adultos e crianças (kids)', 'Tatame de 200m² com equipamentos oficiais', 'Mestres faixas-pretas certificados', 'Agende sua primeira aula gratuita'],
    recommendedKeywords: ['muay thai', 'jiu jitsu', 'boxe', 'mma', 'defesa pessoal', 'artes marciais', 'tatame']
  },
  'luta estrutura completa.zip': {
    id: 'luta-completa-martialarts',
    name: 'DojoMaster — Academia de Jiu-Jitsu & Judô',
    niche: 'Lutas & Artes Marciais',
    category: 'Academias, Yoga, Lutas & Suplementos',
    categorySlug: 'fitness',
    badge: 'Dojo Tradicional',
    accentColor: '#1e3a8a',
    description: 'Respeito, disciplina e formação de campeões no tatame com tradição milenar japonesa e brasileira.',
    features: ['Filosofia marcial e disciplina de vida', 'Turmas femininas exclusivas e infantil', 'Quimono e graduação oficial de faixas', 'Conheça o dojo presencialmente'],
    recommendedKeywords: ['dojo', 'jiu jitsu feminino', 'judo', 'karate', 'turma kids', 'graduacao faixas']
  },
  'yoga completo.zip': {
    id: 'yoga-completo-yogana',
    name: 'Yogana — Espaço de Yoga, Meditação & Mindfulness',
    niche: 'Yoga & Meditação',
    category: 'Academias, Yoga, Lutas & Suplementos',
    categorySlug: 'fitness',
    badge: 'Yoga & Mindfulness',
    accentColor: '#059669',
    description: 'Paz interior, equilíbrio e flexibilidade com aulas presenciais de Hatha Yoga, Vinyasa Flow e respiração consciente.',
    features: ['Aulas guiadas com professores formados na Índia', 'Ambiente silencioso e perfumado com óleos essenciais', 'Práticas matinais e ao pôr do sol', 'Conheça nossos planos mensais'],
    recommendedKeywords: ['yoga', 'hatha yoga', 'vinyasa', 'meditacao', 'mindfulness', 'pranayama', 'paz interior']
  },
  'yoga e fitness simples e exclusivo.zip': {
    id: 'yoga-fitness-exclusivo',
    name: 'ZenFit — Yoga Funcional & Pilates Solo',
    niche: 'Yoga & Pilates',
    category: 'Academias, Yoga, Lutas & Suplementos',
    categorySlug: 'fitness',
    badge: 'Yoga & Pilates',
    accentColor: '#0ea5e9',
    description: 'Harmonia perfeita entre força muscular e relaxamento mental com sessões de Pilates no solo e Yoga dinâmico.',
    features: ['Fortalecimento do abdômen e coluna sem impacto', 'Turmas reduzidas de no máximo 6 alunos', 'Aulas de flexibilidade e postura', 'Agende sua aula experimental'],
    recommendedKeywords: ['pilates solo', 'yoga funcional', 'flexibilidade', 'coluna sem dor', 'turmas reduzidas']
  },
  'yoga land voltada para agendamento.zip': {
    id: 'yoga-agendamento-yogazone',
    name: 'YogaZone — Estúdio de Yoga com Agendamento Fácil',
    niche: 'Yoga',
    category: 'Academias, Yoga, Lutas & Suplementos',
    categorySlug: 'fitness',
    badge: 'Agendamento Direto',
    accentColor: '#14b8a6',
    description: 'Landing page focada na conversão com grade interativa de horários, valores de mensalidade e clique direto para reservar.',
    features: ['Tabela semanal de horários atualizada', 'Planos de 2x e 3x por semana ou livre', 'Espaço com tapetes e blocos inclusos', 'Reserve sua vaga no WhatsApp'],
    recommendedKeywords: ['estudio yoga', 'aulas yoga', 'horarios yoga', 'reserva de aula', 'plano mensal']
  },
  'yoga moder e clean.zip': {
    id: 'yoga-moderno-clean-yogava',
    name: 'Yogava — Studio Clean de Yoga & Respiração',
    niche: 'Yoga',
    category: 'Academias, Yoga, Lutas & Suplementos',
    categorySlug: 'fitness',
    badge: 'Clean & Zen',
    accentColor: '#10b981',
    description: 'Design minimalista e claro transmitindo leveza espiritual, descompressão do dia a dia e renovação energética.',
    features: ['Práticas antiestresse e sono restaurador', 'Workshop de meditação nos fins de semana', 'Comunidade acolhedora e inclusiva', 'Comece sua jornada hoje'],
    recommendedKeywords: ['yoga clean', 'yoga iniciantes', 'respira', 'antiestresse', 'bem estar']
  },
  'loja de suplement.zip': {
    id: 'loja-suplementos-purefit',
    name: 'PureFit — Suplementos Nutricionais & Vitaminas',
    niche: 'Suplementos',
    category: 'Academias, Yoga, Lutas & Suplementos',
    categorySlug: 'fitness',
    badge: 'Suplementos Premium',
    accentColor: '#f59e0b',
    description: 'Whey Protein, Creatina monohidratada pura, Pré-treinos, Vitaminas e acessórios esportivos com entrega rápida na cidade.',
    features: ['Marcas nacionais e importadas com laudos aprovados', 'Combos de ganho de massa e queima de gordura', 'Consultoria de suplementação pelo WhatsApp', 'Entrega no mesmo dia'],
    recommendedKeywords: ['suplementos', 'whey protein', 'creatina', 'pre treino', 'bcaa', 'glutamina', 'loja de suplementos']
  },

  // 5. Arquitetura & Design de Interiores
  'arquitetura elegante.zip': {
    id: 'arquitetura-elegante-tecture',
    name: 'Tecture — Arquitetura de Alto Padrão & Construção',
    niche: 'Arquitetura',
    category: 'Arquitetura & Design de Interiores',
    categorySlug: 'arquitetura',
    badge: 'Alto Padrão',
    accentColor: '#c59a63',
    description: 'Sofisticação e linguagem contemporânea para escritórios de arquitetura residencial e comercial de luxo.',
    features: ['Projetos arquitetônicos residenciais modernos', 'Renderizações 3D realistas e maquetes', 'Acompanhamento e gerenciamento de obras', 'Solicite um estudo preliminar'],
    recommendedKeywords: ['arquitetura', 'arquiteto alto padrao', 'projeto residencial', 'casa moderna', 'obra de luxo']
  },
  'arquitetura portfolio.zip': {
    id: 'arquitetura-portfolio-moderno',
    name: 'ArchStudio — Portfólio de Projetos & Obras',
    niche: 'Arquitetura',
    category: 'Arquitetura & Design de Interiores',
    categorySlug: 'arquitetura',
    badge: 'Portfólio & Obras',
    accentColor: '#2563eb',
    description: 'Foco nos projetos executados com fotos em tela cheia, plantas humanizadas e detalhes de engenharia.',
    features: ['Projetos comerciais, corporativos e clínicas', 'Soluções de iluminação, ventilação e sustentabilidade', 'Equipe multidisciplinar de engenheiros', 'Agende uma reunião presencial'],
    recommendedKeywords: ['portfolio arquitetura', 'projeto comercial', 'arquiteto corporativo', 'fachada moderna', 'reforma']
  },
  'arquiteto detalhado.zip': {
    id: 'arquiteto-detalhado-shelder',
    name: 'Shelder — Escritório de Arquitetura & Interiores',
    niche: 'Arquitetura',
    category: 'Arquitetura & Design de Interiores',
    categorySlug: 'arquitetura',
    badge: 'Projetos Detalhados',
    accentColor: '#d97706',
    description: 'Clareza em todas as etapas: briefing, conceito, projeto executivo, aprovação na prefeitura e entrega de chaves.',
    features: ['Cronograma transparente e sem surpresas no orçamento', 'Consultoria de compra de imóveis e terrenos', 'Detalhamento de marcenaria e acabamentos', 'Fale com o arquiteto chefe'],
    recommendedKeywords: ['escritorio arquitetura', 'aprovacao prefeitura', 'projeto executivo', 'marcenaria sob medida']
  },
  'design de interiores minimalista.zip': {
    id: 'design-interiores-fauxis',
    name: 'Fauxis — Design de Interiores & Decoração Minimalista',
    niche: 'Design de Interiores',
    category: 'Arquitetura & Design de Interiores',
    categorySlug: 'arquitetura',
    badge: 'Interiores & Decor',
    accentColor: '#14b8a6',
    description: 'Transformação de ambientes residenciais e comerciais com funcionalidade, iluminação cênica e mobiliário refinado.',
    features: ['Paleta de cores e texturas acolhedoras', 'Moodboards conceituais e lista de compras', 'Decoração de salas, quartos e cozinhas', 'Consultoria express de interiores'],
    recommendedKeywords: ['design de interiores', 'decoradora', 'decoracao minimalista', 'design de ambientes', 'reforma apartamento']
  },

  // 6. Mecânica & Automotivo
  'Mecânica completo .zip': {
    id: 'mecanica-completo-audeck',
    name: 'AuDeck — Centro Automotivo & Oficina Mecânica',
    niche: 'Mecânica',
    category: 'Mecânica & Automotivo',
    categorySlug: 'automotivo',
    badge: 'Centro Automotivo',
    accentColor: '#dc2626',
    description: 'Mecânica de precisão, injeção eletrônica computadorizada, suspensão, freios ABS e revisão preventiva completa.',
    features: ['Diagnóstico com scanner eletrônico de última geração', 'Troca de óleo, filtros e fluidos com garantia', 'Alinhamento 3D e balanceamento a laser', 'Orçamento detalhado no WhatsApp'],
    recommendedKeywords: ['mecanica', 'oficina mecanica', 'centro automotivo', 'injecao eletronica', 'suspensao', 'freios', 'troca de oleo']
  },
  'mecanica portfolio.zip': {
    id: 'mecanica-portfolio-automec',
    name: 'AutoMec — Mecânica Geral, Câmbio & Motor',
    niche: 'Mecânica',
    category: 'Mecânica & Automotivo',
    categorySlug: 'automotivo',
    badge: 'Câmbio & Motor',
    accentColor: '#f97316',
    description: 'Especialista em retífica de motores, reparo de câmbio automático e manual e mecânica de nacionais e importados.',
    features: ['Especialistas em câmbio automático e dupla embreagem', 'Peças originais de reposição com garantia formal', 'Socorro mecânico e guincho parceiro', 'Agende sua revisão'],
    recommendedKeywords: ['cambio automatico', 'retifica de motor', 'mecanica importados', 'oficina especializada']
  },
  'mecanica simples.zip': {
    id: 'mecanica-simples-cardinal',
    name: 'Cardinal — Oficina Rápida & Auto Center',
    niche: 'Mecânica',
    category: 'Mecânica & Automotivo',
    categorySlug: 'automotivo',
    badge: 'Oficina Rápida',
    accentColor: '#2563eb',
    description: 'Atendimento ágil para manutenção preventiva: pastilhas de freio, bateria, ar-condicionado automotivo e escapamento.',
    features: ['Troca de bateria com teste de alternador gratuito', 'Higienização de ar-condicionado com ozônio', 'Preços justos e transparentes sem pegadinhas', 'Fale agora com o mecânico'],
    recommendedKeywords: ['auto center', 'bateria de carro', 'ar condicionado automotivo', 'freio', 'revisao express']
  },
  'mecanica detalhado.zip': {
    id: 'mecanica-detalhado-axemobile',
    name: 'AxeMobile — Manutenção Automotiva & Elétrica',
    niche: 'Mecânica',
    category: 'Mecânica & Automotivo',
    categorySlug: 'automotivo',
    badge: 'Elétrica & Injeção',
    accentColor: '#eab308',
    description: 'Diagnóstico complexo de elétrica automotiva, módulos eletrônicos, partida a frio, arrefecimento e direção elétrica.',
    features: ['Especialistas em pane elétrica e curto-circuito', 'Limpeza de bicos injetores e sistema de combustível', 'Mão de obra treinada e especializada', 'Localização fácil com sala de espera'],
    recommendedKeywords: ['eletrica automotiva', 'motor de arranque', 'alternador', 'direcao hidraulica', 'painel do carro']
  },

  // 7. Odontologia & Saúde
  'dentista visual criativo estilo portfólio.zip': {
    id: 'dentista-criativo-dentia',
    name: 'Dentia — Odontologia Estética, Lentes & Harmonização',
    niche: 'Odontologia',
    category: 'Odontologia & Saúde',
    categorySlug: 'saude',
    badge: 'Lentes & Estética',
    accentColor: '#0284c7',
    description: 'Design refinado e moderno focado em transformações de sorriso, lentes de contato dental, clareamento a laser e facetas.',
    features: ['Planejamento digital do sorriso (DSD)', 'Lentes de resina composta e porcelana ultrafina', 'Clareamento dental seguro e sem dor', 'Avaliação estética personalizada'],
    recommendedKeywords: ['dentista', 'lentes de contato dental', 'clareamento dental', 'odontologia estetica', 'sorriso perfeito']
  },
  'dentista detalhado.zip': {
    id: 'dentista-detalhado-prime',
    name: 'PrimeDental — Clínica Odontológica Integrada & Implantes',
    niche: 'Odontologia',
    category: 'Odontologia & Saúde',
    categorySlug: 'saude',
    badge: 'Implantes & Aparelho',
    accentColor: '#0d9488',
    description: 'Atendimento familiar completo com ortodontia, alinhadores invisíveis, implantes dentários com carga rápida e próteses.',
    features: ['Implantes com tecnologia guiada sem cortes', 'Alinhadores transparentes modernos e confortáveis', 'Odontopediatria dedicada para crianças', 'Agende sua consulta odontológica'],
    recommendedKeywords: ['implante dentario', 'ortodontia', 'alinhador invisivel', 'clinica odontologica', 'dentista crianca']
  },
  'dentista_medicina em geral.zip': {
    id: 'dentista-medicina-medicore',
    name: 'MediCore — Centro Médico & Odontologia Geral',
    niche: 'Saúde & Medicina',
    category: 'Odontologia & Saúde',
    categorySlug: 'saude',
    badge: 'Clínica Integrada',
    accentColor: '#2563eb',
    description: 'Consultório multifuncional com consultas médicas gerais, exames de rotina, check-up preventivo e saúde bucal.',
    features: ['Consultas médicas pontuais e acolhedoras', 'Equipamentos esterilizados e normas de saúde', 'Atendimento para convênios e particular', 'Localização central e acessível'],
    recommendedKeywords: ['clinica medica', 'consultorio medico', 'checkup', 'medico da familia', 'saude geral']
  },

  // 8. Pet Shop
  'pet shop .zip': {
    id: 'petshop-completo-petz',
    name: 'Petz Care — Banho, Tosa, Veterinária & Acessórios',
    niche: 'Pet Shop',
    category: 'Pet Shop',
    categorySlug: 'pet',
    badge: 'Banho & Veterinária',
    accentColor: '#f97316',
    description: 'Acolhimento com carinho total para cães e gatos: banho com produtos hipoalergênicos, tosa na tesoura, vacinas e rações premium.',
    features: ['Banho e tosa com água morna e ambiente climatizado', 'Táxi-pet para buscar e levar seu pet em segurança', 'Consultas veterinárias e vacinas importadas', 'Agende o banho do seu pet pelo WhatsApp'],
    recommendedKeywords: ['pet shop', 'banho e tosa', 'veterinario', 'tosa bebe', 'taxi pet', 'racao premium', 'cuidados pet']
  },

  // 9. Serviços Gerais & Marido de Aluguel
  'marido de aluguel portfolio.zip': {
    id: 'marido-aluguel-portfolio',
    name: 'FazTudo — Marido de Aluguel & Reparos Rápidos',
    niche: 'Serviços Gerais',
    category: 'Serviços Gerais & Marido de Aluguel',
    categorySlug: 'servicos',
    badge: 'Reparos & Instalações',
    accentColor: '#eab308',
    description: 'Pequenos reparos residenciais e comerciais com rapidez, segurança e profissionalismo: elétrica, hidráulica, pintura e montagem.',
    features: ['Instalação de ventiladores, chuveiros e tomadas', 'Conserto de vazamentos, torneiras e válvulas', 'Montagem e desmontagem de móveis planejados', 'Orçamento sem compromisso no WhatsApp'],
    recommendedKeywords: ['marido de aluguel', 'pequenos reparos', 'eletricista', 'encanador', 'montador de moveis', 'consertos']
  },
  'marido de aluguel simples.zip': {
    id: 'marido-aluguel-simples-reroof',
    name: 'FixMaster — Manutenção Residencial Express',
    niche: 'Serviços Gerais',
    category: 'Serviços Gerais & Marido de Aluguel',
    categorySlug: 'servicos',
    badge: 'Manutenção Express',
    accentColor: '#2563eb',
    description: 'Solução rápida para emergências domésticas: desentupimento, fechaduras, fixação de suportes de TV, quadros e cortinas.',
    features: ['Atendimento com pontualidade e ferramentas completas', 'Limpeza do ambiente após o término do serviço', 'Preço combinado previamente sem surpresas', 'Chame pelo WhatsApp agora mesmo'],
    recommendedKeywords: ['reparos domesticos', 'instalacao tv', 'conserto torneira', 'fechadura', 'desentupidora']
  },
  'serviços geral limpo.zip': {
    id: 'servicos-gerais-limpo-erepair',
    name: 'ERepair — Serviços Gerais, Reformas & Pinturas',
    niche: 'Serviços Gerais',
    category: 'Serviços Gerais & Marido de Aluguel',
    categorySlug: 'servicos',
    badge: 'Reformas & Pintura',
    accentColor: '#10b981',
    description: 'Reformas completas de imóveis, colocação de pisos, porcelanato, drywall, textura, pintura interna e externa.',
    features: ['Equipe especializada com acompanhamento diário', 'Contrato de prestação de serviços com garantia', 'Material de primeira linha e acabamento refinado', 'Solicite visita técnica'],
    recommendedKeywords: ['reforma residencial', 'pintor', 'drywall', 'colocacao de piso', 'porcelanato', 'servicos gerais']
  },

  // 10. Portfólio, Fotografia & Minimalista
  'fotografia limpo e minimalista.zip': {
    id: 'fotografia-minimalista-elarisse',
    name: 'Elarisse — Fotografia Autoral, Ensaios & Eventos',
    niche: 'Fotografia',
    category: 'Portfólio, Fotografia & Minimalista',
    categorySlug: 'portfolio',
    badge: 'Ensaios & Eventos',
    accentColor: '#c59a63',
    description: 'Sensibilidade artística para ensaios femininos, gestantes, casamentos, formaturas e fotos corporativas de alto impacto.',
    features: ['Ensaios externos e em estúdio climatizado', 'Tratamento de cor profissional e álbuns encadernados', 'Fotografia para posicionamento de imagem e marcas', 'Consulte pacotes disponíveis'],
    recommendedKeywords: ['fotografo', 'ensaio fotografico', 'foto gestante', 'casamento', 'ensaio corporativo', 'book']
  },
  'design minimalista modero.zip': {
    id: 'design-minimalista-anglo',
    name: 'Anglo — Estúdio de Design, Branding & Identidade',
    niche: 'Design & Branding',
    category: 'Portfólio, Fotografia & Minimalista',
    categorySlug: 'portfolio',
    badge: 'Branding & Design',
    accentColor: '#3b82f6',
    description: 'Criação de marcas marcantes, design gráfico, identidade visual, embalagens e websites elegantes.',
    features: ['Projetos de identidade visual estratégica', 'Design de logotipos exclusivos e manuais de marca', 'Apresentação de cases de sucesso e clientes', 'Solicite uma proposta'],
    recommendedKeywords: ['design grafico', 'agencia de design', 'criacao de logo', 'identidade visual', 'branding']
  },
  'portfolio moderno.zip': {
    id: 'portfolio-moderno-jonna',
    name: 'Jonna — Portfólio Criativo & Profissional Autônomo',
    niche: 'Portfólio',
    category: 'Portfólio, Fotografia & Minimalista',
    categorySlug: 'portfolio',
    badge: 'Criativo & Moderno',
    accentColor: '#8b5cf6',
    description: 'Apresentação profissional impecável para consultores, designers, criadores de conteúdo e profissionais liberais.',
    features: ['Biografia profissional e trajetória de destaque', 'Galeria de trabalhos e projetos concluídos', 'Depoimentos de parceiros e clientes', 'Links de contato direto'],
    recommendedKeywords: ['portfolio profissional', 'consultor', 'freelancer', 'apresentacao profissional', 'curriculo online']
  },
  'portfolio simples.zip': {
    id: 'portfolio-simples-slider',
    name: 'SliderStudio — Portfólio Limpo com Slideshow',
    niche: 'Portfólio',
    category: 'Portfólio, Fotografia & Minimalista',
    categorySlug: 'portfolio',
    badge: 'Slideshow Limpo',
    accentColor: '#06b6d4',
    description: 'Interface limpa e objetiva com carrossel dinâmico de projetos para rápido impacto visual e contato no WhatsApp.',
    features: ['Carrossel fluido de fotos e destaques', 'Design responsivo ultrarrápido', 'Informações de contato sempre acessíveis', 'Fácil de personalizar'],
    recommendedKeywords: ['portfolio simples', 'portfolio clean', 'slider portfolio', 'apresentacao clean']
  }
};

/**
 * Função utilitária para resolver a instância do zip correta, desempacotando zips aninhados se houver.
 */
async function resolveTemplateZip(zipBuffer) {
  let zip = await JSZip.loadAsync(zipBuffer);
  const fileKeys = Object.keys(zip.files);

  // Procura por zips aninhados relevantes (ignorando svg.zip de plugins como slider revolution)
  const nestedZipKeys = fileKeys.filter(k => 
    k.endsWith('.zip') && 
    !k.includes('__MACOSX') && 
    !k.toLowerCase().includes('svg.zip') &&
    !k.toLowerCase().includes('/assets/') &&
    !k.toLowerCase().includes('documentation') && 
    !k.toLowerCase().includes('doc.')
  );

  if (nestedZipKeys.length > 0) {
    // Dá preferência para zips com nomes como 'html', 'main', 'xhtml', 'shelder', 'fitmax', 'bruin', etc.
    const chosenZipKey = nestedZipKeys.find(k => 
      k.toLowerCase().includes('html') || 
      k.toLowerCase().includes('xhtml') || 
      k.toLowerCase().includes('main') ||
      k.toLowerCase().includes('shelder') ||
      k.toLowerCase().includes('fitmax') ||
      k.toLowerCase().includes('bruin') ||
      k.toLowerCase().includes('cardinal')
    ) || nestedZipKeys[0];

    const innerZipBuf = await zip.files[chosenZipKey].async('nodebuffer');
    zip = await JSZip.loadAsync(innerZipBuf);
  }

  return zip;
}

/**
 * Localiza o arquivo HTML principal da landing page dentro do zip
 */
function findMainHtmlKey(zip) {
  const fileKeys = Object.keys(zip.files).filter(k => 
    !k.includes('__MACOSX') && 
    !zip.files[k].dir
  );

  const htmlFiles = fileKeys.filter(k => {
    const lk = k.toLowerCase();
    return lk.endsWith('.html') && 
      !lk.includes('documentation') && 
      !lk.includes('/doc/') && 
      !lk.includes('/documantation/') &&
      !lk.includes('/fonts/') && 
      !lk.includes('/vendor/syntaxhighlighter') &&
      !lk.includes('demo.html') &&
      !lk.includes('404');
  });

  if (htmlFiles.length === 0) {
    // Tenta fallback com qualquer html não-doc
    const anyHtml = fileKeys.filter(k => k.endsWith('.html') && !k.toLowerCase().includes('documentation'));
    if (anyHtml.length > 0) return anyHtml[0];
    return null;
  }

  // Prioridade de seleção de landing page
  const indexKey = htmlFiles.find(k => /(^|\/)index\.html$/i.test(k));
  if (indexKey) return indexKey;

  const index1Key = htmlFiles.find(k => /(^|\/)index-1\.html$/i.test(k));
  if (index1Key) return index1Key;

  const index2Key = htmlFiles.find(k => /(^|\/)index-2\.html$/i.test(k));
  if (index2Key) return index2Key;

  const homeKey = htmlFiles.find(k => /(^|\/)home\.html$/i.test(k));
  if (homeKey) return homeKey;

  return htmlFiles[0];
}

/**
 * Extrai a melhor imagem de thumbnail/hero do zip
 */
async function extractThumbnail(zip, meta) {
  const fileKeys = Object.keys(zip.files).filter(k => 
    !k.includes('__MACOSX') && 
    !zip.files[k].dir &&
    /\.(jpe?g|png|webp)$/i.test(k) &&
    !k.toLowerCase().includes('documentation') &&
    !k.toLowerCase().includes('doc/') &&
    !k.toLowerCase().includes('icon') &&
    !k.toLowerCase().includes('avatar')
  );

  if (fileKeys.length === 0) {
    return NICHE_FALLBACK_IMGS[meta.niche] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';
  }

  // Critério de pontuação para a imagem de capa perfeita
  let bestKey = fileKeys[0];
  let maxScore = -1;

  for (const k of fileKeys) {
    const lk = k.toLowerCase();
    let score = 0;
    if (lk.includes('preview') || lk.includes('screenshot') || lk.includes('thumb')) score += 100;
    if (lk.includes('hero') || lk.includes('banner') || lk.includes('slider') || lk.includes('slide')) score += 50;
    if (lk.includes('bg') || lk.includes('background')) score += 30;
    if (lk.includes('about') || lk.includes('portfolio') || lk.includes('gallery')) score += 20;

    // Prefere arquivos maiores (> 30KB) para garantir resolução
    const fObj = zip.files[k];
    if (fObj && (fObj._data?.uncompressedSize || 0) > 30000) score += 15;

    if (score > maxScore) {
      maxScore = score;
      bestKey = k;
    }
  }

  try {
    const thumbBuf = await zip.files[bestKey].async('nodebuffer');
    if (thumbBuf && thumbBuf.length > 5000) {
      const outPath = path.join(THUMBS_DIR, `${meta.id}.jpg`);
      fs.writeFileSync(outPath, thumbBuf);
      return `/templates-thumbs/${meta.id}.jpg`;
    }
  } catch (err) {
    console.warn(`Erro ao extrair thumbnail de ${meta.id}:`, err?.message);
  }

  return NICHE_FALLBACK_IMGS[meta.niche] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80';
}

/**
 * Embutir CSS local nas tags <style> do <head> e preservar fontes / animações
 */
async function bundleHtmlStylesAndFonts(rawHtml, htmlKey, zip, meta) {
  const htmlDir = path.dirname(htmlKey);
  let html = rawHtml;

  // Garante meta charset e viewport
  if (!/<meta[^>]+charset/i.test(html)) {
    html = html.replace(/<head>/i, '<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
  }

  // Garante FontAwesome 6 e Google Fonts base
  const essentialHeadLinks = `
  <!-- BILLY STUDIO FONTS & ICONS -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Oswald:wght@500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  `;

  html = html.replace(/<head>/i, `<head>\n${essentialHeadLinks}`);

  // Encontra todas as tags <link rel="stylesheet">
  const linkRegex = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
  const links = [...html.matchAll(linkRegex)];

  let collectedCss = '';

  for (const match of links) {
    const fullTag = match[0];
    const hrefMatch = fullTag.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) continue;

    const href = hrefMatch[1].trim();

    // Se for URL remota (Google Fonts, cdnjs, etc), mantém intacto
    if (/^(https?:)?\/\//i.test(href)) {
      continue;
    }

    // Resolve o caminho do CSS dentro do zip
    let normalizedPath = path.posix.normalize(path.posix.join(htmlDir === '.' ? '' : htmlDir, href)).replace(/^\.\//, '');
    
    // Tenta variações de caminho se não achar direto
    let cssFile = zip.files[normalizedPath];
    if (!cssFile) {
      const baseName = path.posix.basename(href);
      const matchedKey = Object.keys(zip.files).find(k => k.endsWith(baseName) && !k.includes('__MACOSX'));
      if (matchedKey) cssFile = zip.files[matchedKey];
    }

    if (cssFile) {
      try {
        let cssContent = await cssFile.async('string');
        
        // Remove fontes relativas problemáticas e @import que causem 404
        cssContent = cssContent.replace(/@import\s+url\([^)]+\);?/gi, '');
        cssContent = cssContent.replace(/url\(['"]?(?:\.\.\/|\.\/)?(?:fonts?|webfonts?)\/[^'")]+['"]?\)/gi, 'none');

        collectedCss += `\n/* === BUNDLED CSS: ${path.posix.basename(href)} === */\n` + cssContent;
        // Remove o link local original para evitar 404
        html = html.replace(fullTag, '');
      } catch (e) {
        console.warn(`Erro ao ler CSS ${href}:`, e?.message);
      }
    }
  }

  // CSS dinâmico das variáveis de paleta do Billy Web Studio
  const studioRootVariables = `
  /* BILLY STUDIO PALETTE & NATIVE RESPONSIVE BASE */
  :root {
    --primary-color: {{PRIMARY_COLOR}};
    --primary: {{PRIMARY_COLOR}};
    --bg-color: {{BG_COLOR}};
    --surface-color: {{SURFACE_COLOR}};
    --text-color: {{TEXT_COLOR}};
  }
  .accent-bg { background-color: var(--primary-color, ${meta.accentColor}) !important; }
  .accent-color { color: var(--primary-color, ${meta.accentColor}) !important; }
  .accent-border { border-color: var(--primary-color, ${meta.accentColor}) !important; }
  `;

  // Insere os estilos compilados antes do fechamento de </head>
  if (collectedCss.length > 0) {
    // Trunca CSS excessivo para não sobrecarregar arquivo (> 350KB)
    if (collectedCss.length > 350000) {
      collectedCss = collectedCss.slice(0, 350000);
    }
    const styleTag = `\n<style type="text/css">\n${studioRootVariables}\n${collectedCss}\n</style>\n`;
    html = html.replace(/<\/head>/i, `${styleTag}</head>`);
  } else {
    const styleTag = `\n<style type="text/css">\n${studioRootVariables}\n</style>\n`;
    html = html.replace(/<\/head>/i, `${styleTag}</head>`);
  }

  // Substitui scripts locais quebrados de bibliotecas conhecidas por CDNs oficiais estáveis
  html = html.replace(/<script[^>]+src=["'][^"']*jquery(?:\.min)?\.js["'][^>]*><\/script>/gi, '<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>');
  html = html.replace(/<script[^>]+src=["'][^"']*bootstrap(?:\.bundle)?(?:\.min)?\.js["'][^>]*><\/script>/gi, '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>');
  html = html.replace(/<script[^>]+src=["'][^"']*swiper(?:\.min)?\.js["'][^>]*><\/script>/gi, '<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>');
  html = html.replace(/<script[^>]+src=["'][^"']*aos(?:\.min)?\.js["'][^>]*><\/script>/gi, '<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>');

  // Script vanilla ultra-resiliente para menus mobile, abas e animações sem erros
  const interactiveRuntimeJs = `
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Menu Mobile Toggle
      var togglers = document.querySelectorAll('.navbar-toggler, .mobile-nav-toggle, [data-toggle="collapse"], [data-bs-toggle="collapse"]');
      togglers.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          var targetId = btn.getAttribute('data-target') || btn.getAttribute('data-bs-target') || '.navbar-collapse';
          var target = document.querySelector(targetId);
          if (target) {
            target.classList.toggle('show');
            target.classList.toggle('active');
            if (target.style.display === 'block') {
              target.style.display = 'none';
            } else {
              target.style.display = 'block';
            }
          }
        });
      });

      // Smooth Scroll
      document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
          var href = this.getAttribute('href');
          if (href && href.length > 1) {
            var el = document.querySelector(href);
            if (el) {
              e.preventDefault();
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }
        });
      });

      // Inicializa AOS se presente
      if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true });
      }
    });
  </script>
  `;

  html = html.replace(/<\/body>/i, `${interactiveRuntimeJs}\n</body>`);

  return html;
}

/**
 * Normaliza os slots de substituição dinâmica no HTML sem desestruturar o design
 */
function normalizeTemplateSlots(html, meta) {
  let res = html;

  // Substituição de Title
  res = res.replace(/<title>[\s\S]*?<\/title>/i, `<title>{{BUSINESS_NAME}} | {{TAGLINE}}</title>`);

  // Substituição de Marca / Logo em header
  res = res.replace(/(<a[^>]*class=["'][^"']*(?:navbar-brand|logo|brand)[^"']*["'][^>]*>)([\s\S]*?)(<\/a>)/i, (match, open, inner, close) => {
    return `${open}<span class="font-bold text-xl uppercase tracking-wider text-white font-heading">{{BUSINESS_NAME}}</span>${close}`;
  });

  // Substitui primeiro h1 (Hero Headline)
  res = res.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/i, '<h1$1>{{HERO_TITLE}}</h1>');

  // Adiciona slots essenciais estruturais se ainda não existirem no corpo
  if (!res.includes('{{SERVICES_CARDS}}')) {
    // Procura por seção de serviços ou produtos
    const servicesMatch = res.match(/<(?:section|div)[^>]*(?:id|class)=["'][^"']*(?:service|servico|procedimento|cardapio|menu|tratamento)[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|div)>/i);
    if (servicesMatch) {
      // Injeta container estilizado do Billy
      res = res.replace(servicesMatch[0], `
      <section id="servicos" class="py-16 px-4 max-w-7xl mx-auto">
        <div class="text-center mb-10">
          <span class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider accent-bg text-black mb-2">{{NICHE_LABEL}}</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-white font-heading">{{SERVICES_TITLE}}</h2>
          <p class="text-xs text-zinc-400 mt-2 max-w-xl mx-auto">{{SERVICES_SUBTITLE}}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {{SERVICES_CARDS}}
        </div>
      </section>
      `);
    } else {
      // Adiciona antes do footer
      res = res.replace(/<(?:footer|div[^>]*class=["'][^"']*footer)/i, `
      <section id="servicos" class="py-16 px-4 max-w-7xl mx-auto">
        <div class="text-center mb-10">
          <span class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider accent-bg text-black mb-2">{{NICHE_LABEL}}</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-white font-heading">{{SERVICES_TITLE}}</h2>
          <p class="text-xs text-zinc-400 mt-2 max-w-xl mx-auto">{{SERVICES_SUBTITLE}}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {{SERVICES_CARDS}}
        </div>
      </section>
      $&`);
    }
  }

  // Galeria de Fotos Reais
  if (!res.includes('{{GALLERY_GRID}}')) {
    res = res.replace(/<(?:footer|div[^>]*class=["'][^"']*footer)/i, `
    <section id="galeria" class="py-16 px-4 max-w-7xl mx-auto border-t border-white/[0.08]">
      <div class="text-center mb-10">
        <span class="text-xs uppercase tracking-wider font-bold accent-color">Fotos Reais do Estabelecimento</span>
        <h2 class="text-3xl font-bold text-white mt-1 font-heading">Estrutura & Resultados</h2>
        <p class="text-xs text-zinc-400 mt-1 max-w-lg mx-auto">{{GALLERY_SUBTITLE}}</p>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {{GALLERY_GRID}}
      </div>
    </section>
    $&`);
  }

  // Avaliações de Clientes
  if (!res.includes('{{REVIEWS_CARDS}}')) {
    res = res.replace(/<(?:footer|div[^>]*class=["'][^"']*footer)/i, `
    <section id="depoimentos" class="py-16 px-4 max-w-7xl mx-auto border-t border-white/[0.08]">
      <div class="text-center mb-10">
        <span class="text-xs uppercase tracking-wider font-bold accent-color">Depoimentos Verificados</span>
        <h2 class="text-3xl font-bold text-white mt-1 font-heading">O Que Nossos Clientes Dizem</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {{REVIEWS_CARDS}}
      </div>
    </section>
    $&`);
  }

  // Perguntas Frequentes (FAQ)
  if (!res.includes('{{FAQ_CARDS}}')) {
    res = res.replace(/<(?:footer|div[^>]*class=["'][^"']*footer)/i, `
    <section id="faq" class="py-16 px-4 max-w-4xl mx-auto border-t border-white/[0.08]">
      <div class="text-center mb-10">
        <span class="text-xs uppercase tracking-wider font-bold accent-color">Dúvidas Frequentes</span>
        <h2 class="text-3xl font-bold text-white mt-1 font-heading">Informações Úteis</h2>
      </div>
      <div class="space-y-4">
        {{FAQ_CARDS}}
      </div>
    </section>
    $&`);
  }

  // Botão flutuante de WhatsApp oficial
  const floatingWhatsAppHtml = `
  <!-- BOTÃO FLUTUANTE DE WHATSAPP OFICIAL BILLY -->
  <a href="{{WHATSAPP_LINK}}" target="_blank" rel="noopener noreferrer" class="fixed bottom-6 right-6 z-50 bg-[#25d366] hover:bg-[#20ba59] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all duration-300 hover:scale-110 font-bold text-xs uppercase tracking-wider border-2 border-white/20">
    <i class="fab fa-whatsapp text-2xl"></i>
    <span class="hidden sm:inline">Falar no WhatsApp</span>
  </a>
  `;

  if (!res.includes('fab fa-whatsapp text-2xl')) {
    res = res.replace(/<\/body>/i, `${floatingWhatsAppHtml}\n</body>`);
  }

  // Blindagem de imagens vazias ou inexistentes
  res = res.replace(/<img(?![^>]*\bonerror=)([^>]*?)>/gi, '<img$1 onerror="this.style.display=\'none\'">');

  return res;
}

/**
 * Função Principal de Importação, Compilação e Catálogo
 */
async function runImport() {
  console.log('Iniciando extração e compilação dos templates do Google Drive...');
  
  const entries = Object.entries(DRIVE_TEMPLATE_METADATA);
  const catalogByCategory = {};
  const allCompiledTemplates = [];

  for (const [zipFileName, meta] of entries) {
    const fullZipPath = path.join(DRIVE_DIR, zipFileName);
    if (!fs.existsSync(fullZipPath)) {
      console.warn(`Arquivo não encontrado: ${zipFileName}`);
      continue;
    }

    try {
      console.log(`\n[Processando] ${zipFileName} -> ${meta.id}`);
      const zipBuf = fs.readFileSync(fullZipPath);
      const zip = await resolveTemplateZip(zipBuf);

      const htmlKey = findMainHtmlKey(zip);
      if (!htmlKey) {
        console.warn(`Nenhum HTML de landing page localizado em ${zipFileName}`);
        continue;
      }

      console.log(`  HTML Selecionado: ${htmlKey}`);
      const rawHtml = await zip.files[htmlKey].async('string');

      // Extrai thumbnail real
      const thumbUrl = await extractThumbnail(zip, meta);
      meta.previewImg = thumbUrl;

      // Compila CSS e Fontes
      const bundledHtml = await bundleHtmlStylesAndFonts(rawHtml, htmlKey, zip, meta);

      // Normaliza Tokens de Conteúdo
      const finalizedHtml = normalizeTemplateSlots(bundledHtml, meta);

      // Organiza por categoria
      if (!catalogByCategory[meta.categorySlug]) {
        catalogByCategory[meta.categorySlug] = [];
      }

      catalogByCategory[meta.categorySlug].push({
        meta,
        html: finalizedHtml
      });

      allCompiledTemplates.push({
        meta,
        html: finalizedHtml
      });

      console.log(`  ✓ Template ${meta.id} compilado com sucesso! (${finalizedHtml.length} bytes, thumb: ${thumbUrl})`);
    } catch (err) {
      console.error(`Erro ao processar template ${zipFileName}:`, err);
    }
  }

  console.log(`\nGerando módulos de catálogo em ${CATALOG_DIR}...`);

  // Gera um arquivo .ts por categoria
  for (const [catSlug, items] of Object.entries(catalogByCategory)) {
    const catFilePath = path.join(CATALOG_DIR, `${catSlug}.ts`);
    const varName = catSlug.toUpperCase().replace(/-/g, '_') + '_TEMPLATES';
    
    let tsContent = `// Catálogo Oficial Billy Studio: ${catSlug}\n`;
    tsContent += `export const ${varName} = [\n`;

    for (const item of items) {
      tsContent += `  {\n`;
      tsContent += `    id: ${JSON.stringify(item.meta.id)},\n`;
      tsContent += `    name: ${JSON.stringify(item.meta.name)},\n`;
      tsContent += `    niche: ${JSON.stringify(item.meta.niche)},\n`;
      tsContent += `    category: ${JSON.stringify(item.meta.category)},\n`;
      tsContent += `    badge: ${JSON.stringify(item.meta.badge)},\n`;
      tsContent += `    description: ${JSON.stringify(item.meta.description)},\n`;
      tsContent += `    accentColor: ${JSON.stringify(item.meta.accentColor)},\n`;
      tsContent += `    features: ${JSON.stringify(item.meta.features)},\n`;
      tsContent += `    previewImg: ${JSON.stringify(item.meta.previewImg)},\n`;
      tsContent += `    recommendedKeywords: ${JSON.stringify(item.meta.recommendedKeywords)},\n`;
      tsContent += `    html: ${JSON.stringify(item.html)}\n`;
      tsContent += `  },\n`;
    }

    tsContent += `];\n`;
    fs.writeFileSync(catFilePath, tsContent, 'utf-8');
    console.log(`  Gravado: ${catSlug}.ts (${items.length} templates)`);
  }

  // Gera o index.ts unificador do catálogo
  const indexImports = Object.keys(catalogByCategory).map(catSlug => {
    const varName = catSlug.toUpperCase().replace(/-/g, '_') + '_TEMPLATES';
    return `import { ${varName} } from './${catSlug}';`;
  }).join('\n');

  const indexExports = Object.keys(catalogByCategory).map(catSlug => {
    return `  ...${catSlug.toUpperCase().replace(/-/g, '_')}_TEMPLATES,`;
  }).join('\n');

  const indexHtmlMap = Object.keys(catalogByCategory).map(catSlug => {
    const varName = catSlug.toUpperCase().replace(/-/g, '_') + '_TEMPLATES';
    return `  ${varName}.forEach(t => { map[t.id] = t.html; });`;
  }).join('\n');

  const indexContent = `// CATÁLOGO UNIFICADO DE TEMPLATES BILLY STUDIO
${indexImports}

export const ALL_DRIVE_TEMPLATES = [
${indexExports}
];

export function getDriveTemplateHtml(id: string): string | null {
  const map: Record<string, string> = {};
${indexHtmlMap}
  return map[id] || null;
}
`;

  // Gera metadata.ts leve (sem os payloads HTML) para importação no frontend e no seletor de templates
  const metadataList = allCompiledTemplates.map(item => ({
    id: item.meta.id,
    name: item.meta.name,
    niche: item.meta.niche,
    category: item.meta.category,
    badge: item.meta.badge,
    description: item.meta.description,
    accentColor: item.meta.accentColor,
    features: item.meta.features,
    previewImg: item.meta.previewImg,
    recommendedKeywords: item.meta.recommendedKeywords
  }));

  const metadataContent = `// METADADOS LEVES DOS TEMPLATES DO GOOGLE DRIVE (Para frontend e seletor)
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

export const DRIVE_TEMPLATES_METADATA: DesktopTemplateMetadata[] = ${JSON.stringify(metadataList, null, 2)};
`;

  fs.writeFileSync(path.join(CATALOG_DIR, 'metadata.ts'), metadataContent, 'utf-8');
  console.log(`  Gravado: metadata.ts com ${metadataList.length} itens.`);

  fs.writeFileSync(path.join(CATALOG_DIR, 'index.ts'), indexContent, 'utf-8');
  console.log(`  Gravado: index.ts unificado com ${allCompiledTemplates.length} templates.`);

  console.log('\n[CONCLUÍDO] Todos os templates foram compilados e catalogados com sucesso!');
}

runImport();
