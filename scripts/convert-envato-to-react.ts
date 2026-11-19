/**
 * Extrator e Conversor de Templates Envato em Componentes React + Tailwind CSS Tipados
 * Execução: npm run templates:to-react
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TemplateBlueprint } from '../src/types/site-template-data';

// Carrega JSZip do repositório BILLY
// @ts-ignore
import JSZip from 'C:/Users/conta/Desktop/BILLY/node_modules/jszip/lib/index.js';

const DRIVE_DIR = 'C:/Users/conta/Desktop/BILLY/NOVOS_TEMPLATES_DRIVE';
const WEB_ROOT = path.resolve(process.cwd());
const OUTPUT_TEMPLATES_DIR = path.resolve(WEB_ROOT, 'src/components/site-templates');
const THUMBS_DIR = path.resolve(WEB_ROOT, 'public/templates-thumbs');

if (!fs.existsSync(OUTPUT_TEMPLATES_DIR)) {
  fs.mkdirSync(OUTPUT_TEMPLATES_DIR, { recursive: true });
}
if (!fs.existsSync(THUMBS_DIR)) {
  fs.mkdirSync(THUMBS_DIR, { recursive: true });
}

// Metadados Curados de Todos os 58 Templates Envato no Drive
export const ALL_ZIP_METADATA: Record<string, {
  id: string;
  name: string;
  niche: string;
  category: string;
  styleMode: 'dark' | 'light' | 'warm' | 'editorial' | 'energetic' | 'minimalist';
  headingFont: string;
  bodyFont: string;
  accentColor: string;
  bgDefault: string;
  surfaceDefault: string;
  textDefault: string;
  badge: string;
  description: string;
  features: string[];
  fallbackThumb: string;
}> = {
  'portfólio tattoo.zip': {
    id: 'tattoo-portfolio-themestarz',
    name: 'Tattoo Artist — Portfólio Dark Autoral',
    niche: 'Tatuagem',
    category: 'Tatuagem & Piercing',
    styleMode: 'dark',
    headingFont: 'Oswald',
    bodyFont: 'Inter',
    accentColor: '#e11d48',
    bgDefault: '#09090b',
    surfaceDefault: '#18181b',
    textDefault: '#f4f4f5',
    badge: 'Autoral & Dark',
    description: 'Design escuro cinematográfico focado em portfólio de tatuagens autorais, flashs e biossegurança.',
    features: ['Galeria de flashs e artes autorais', 'Tabela de estilos', 'Biossegurança ANVISA', 'Botão WhatsApp direto'],
    fallbackThumb: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800&auto=format&fit=crop&q=80'
  },
  'estudio tattoo portfólio.zip': {
    id: 'tattoo-estudio-portfolio-blaxcut',
    name: 'Blaxcut — Estúdio Tattoo & Piercing Portfólio',
    niche: 'Tatuagem',
    category: 'Tatuagem & Piercing',
    styleMode: 'dark',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    accentColor: '#f59e0b',
    bgDefault: '#0c0a09',
    surfaceDefault: '#1c1917',
    textDefault: '#fafaf9',
    badge: 'Estúdio & Piercing',
    description: 'Layout moderno com tipografia expressiva para estúdios consolidados de tatuagem e piercing.',
    features: ['Grade de tatuadores residentes', 'Catálogo de piercings em titânio', 'Depoimentos de clientes', 'Orçamento instantâneo'],
    fallbackThumb: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=800&auto=format&fit=crop&q=80'
  },
  'estudio tattoo moderno .zip': {
    id: 'tattoo-estudio-moderno',
    name: 'UrbanInk — Estúdio Tattoo Moderno & Street',
    niche: 'Tatuagem',
    category: 'Tatuagem & Piercing',
    styleMode: 'dark',
    headingFont: 'Oswald',
    bodyFont: 'Montserrat',
    accentColor: '#a855f7',
    bgDefault: '#09090b',
    surfaceDefault: '#18181b',
    textDefault: '#f4f4f5',
    badge: 'Urbano & Street',
    description: 'Estética street art e underground com alto contraste e galeria de cicatrização.',
    features: ['Design arrojado street', 'Cuidados pós-tatuagem', 'Fotos reais de trabalhos', 'Atendimento rápido'],
    fallbackThumb: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&auto=format&fit=crop&q=80'
  },
  'pizzaria restaurante clean detalhado.zip': {
    id: 'pizzaria-clean-royate',
    name: 'Royate — Pizzaria Artesanal & Forno a Lenha',
    niche: 'Pizzaria',
    category: 'Gastronomia, Cafés & Pizzarias',
    styleMode: 'warm',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#dc2626',
    bgDefault: '#1c1917',
    surfaceDefault: '#292524',
    textDefault: '#fafaf9',
    badge: 'Forno a Lenha',
    description: 'Apresentação refinada para pizzarias italianas, delivery premium e massas artesanais.',
    features: ['Cardápio de pizzas artesanais', 'Bordas recheadas e sobremesas', 'Delivery via WhatsApp', 'Depoimentos reais'],
    fallbackThumb: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80'
  },
  'restaurante e cafe moderno.zip': {
    id: 'restaurante-cafe-heritaste',
    name: 'Heritaste — Restaurante & Café Moderno',
    niche: 'Gastronomia',
    category: 'Gastronomia, Cafés & Pizzarias',
    styleMode: 'warm',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#d97706',
    bgDefault: '#1c1917',
    surfaceDefault: '#292524',
    textDefault: '#fafaf9',
    badge: 'Gourmet & Café',
    description: 'Ambiente aconchegante para bistrôs contemporâneos, cafés coloniais e pratos autorais.',
    features: ['Cardápio de pratos e cafés especiais', 'Ambiente aconchegante', 'Horário e reservas', 'Localização privilegiada'],
    fallbackThumb: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'
  },
  'restaurante cardapio.zip': {
    id: 'restaurante-cardapio-dbento',
    name: 'DBento — Restaurante Cardápio Digital & Buffet',
    niche: 'Gastronomia',
    category: 'Gastronomia, Cafés & Pizzarias',
    styleMode: 'warm',
    headingFont: 'Montserrat',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#ea580c',
    bgDefault: '#18181b',
    surfaceDefault: '#27272a',
    textDefault: '#fafaf9',
    badge: 'Cardápio Completo',
    description: 'Cardápio digital dinâmico com fotos de pratos, preços por porção e marmitas gourmet.',
    features: ['Pratos mais pedidos', 'Preços transparentes', 'Visualização fácil no celular', 'Pedidos diretos no WhatsApp'],
    fallbackThumb: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
  },
  'restaurante .zip': {
    id: 'restaurante-classico-granny',
    name: 'Granny — Restaurante Tradicional & Cozinha Afetiva',
    niche: 'Gastronomia',
    category: 'Gastronomia, Cafés & Pizzarias',
    styleMode: 'warm',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#b45309',
    bgDefault: '#1c1917',
    surfaceDefault: '#292524',
    textDefault: '#fafaf9',
    badge: 'Cozinha Tradicional',
    description: 'Estilo acolhedor com tradição culinária, carnes nobres e massas frescas.',
    features: ['Receitas clássicas da casa', 'Carta de bebidas selecionadas', 'Galeria de fotos do salão', 'Reserva de mesas'],
    fallbackThumb: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80'
  },
  'restaurante portfolio.zip': {
    id: 'restaurante-portfolio-grandrestaurant',
    name: 'GrandRestaurant — Alta Gastronomia & Experiência',
    niche: 'Gastronomia',
    category: 'Gastronomia, Cafés & Pizzarias',
    styleMode: 'editorial',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#ca8a04',
    bgDefault: '#0f172a',
    surfaceDefault: '#1e293b',
    textDefault: '#f8fafc',
    badge: 'Alta Gastronomia',
    description: 'Experiência sensorial de luxo para restaurantes conceituais e chefs renomados.',
    features: ['Menu degustação assinado', 'Iluminação artística dos pratos', 'Avaliações de clientes', 'Agendamento de jantares'],
    fallbackThumb: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'
  },
  'restaurante elegante.zip': {
    id: 'restaurante-elegante-elegencia',
    name: 'Elegancia — Bistrô & Eventos Gastronômicos',
    niche: 'Gastronomia',
    category: 'Gastronomia, Cafés & Pizzarias',
    styleMode: 'editorial',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#9333ea',
    bgDefault: '#0f172a',
    surfaceDefault: '#1e293b',
    textDefault: '#f8fafc',
    badge: 'Bistrô Sofisticado',
    description: 'Design requintado com tipografia serifada de alto padrão para bistrôs e eventos fechados.',
    features: ['Harmonização de pratos e drinks', 'Espaço para eventos especiais', 'Galeria de ambiente', 'Contato direto no WhatsApp'],
    fallbackThumb: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
  },
  'coffe shop esuro .zip': {
    id: 'coffee-shop-escuro-bruin',
    name: 'Bruin — Coffee Shop Escuro & Grãos Especiais',
    niche: 'Cafeteria',
    category: 'Gastronomia, Cafés & Pizzarias',
    styleMode: 'warm',
    headingFont: 'Oswald',
    bodyFont: 'Inter',
    accentColor: '#78350f',
    bgDefault: '#1c1917',
    surfaceDefault: '#292524',
    textDefault: '#fafaf9',
    badge: 'Grãos Especiais',
    description: 'Ambiente escuro estilizado para torrefações de café artesanal e doces finos.',
    features: ['Grãos selecionados e métodos especiais', 'Cardápio de cafés e doces', 'Espaço aconchegante', 'Atendimento para viagem e balcão'],
    fallbackThumb: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80'
  },
  'coffe shop moderno.zip': {
    id: 'coffee-shop-moderno-max',
    name: 'MaxCoffee — Cafeteria & Coworking Moderno',
    niche: 'Cafeteria',
    category: 'Gastronomia, Cafés & Pizzarias',
    styleMode: 'light',
    headingFont: 'Montserrat',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#059669',
    bgDefault: '#f8fafc',
    surfaceDefault: '#ffffff',
    textDefault: '#0f172a',
    badge: 'Café & Coworking',
    description: 'Atmosfera jovem e produtiva para cafeterias com internet rápida e lanches artesanais.',
    features: ['Cafés especiais e lattes gelados', 'Ambiente para reuniões', 'Opções saudáveis e doces', 'Faça seu pedido no WhatsApp'],
    fallbackThumb: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80'
  },
  'coffee estilo.zip': {
    id: 'coffee-estilo-barista',
    name: 'Barista — Boutique de Café & Confeitaria',
    niche: 'Cafeteria',
    category: 'Gastronomia, Cafés & Pizzarias',
    styleMode: 'warm',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#d97706',
    bgDefault: '#1c1917',
    surfaceDefault: '#292524',
    textDefault: '#fafaf9',
    badge: 'Boutique de Café',
    description: 'Charme rústico com croissants quentinhos, bolos caseiros e arte no café.',
    features: ['Latte art e experiências personalizadas', 'Croissants e confeitaria fina', 'Galeria de fotos do salão', 'Pedidos antecipados'],
    fallbackThumb: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80'
  },
  'estetica completo.zip': {
    id: 'estetica-completo-spa',
    name: 'Lumina — Clínica de Estética & Harmonização Completa',
    niche: 'Estética',
    category: 'Estética & Saúde',
    styleMode: 'light',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#db2777',
    bgDefault: '#fdf2f8',
    surfaceDefault: '#ffffff',
    textDefault: '#0f172a',
    badge: 'Estética Avançada',
    description: 'Solução completa para clínicas biomédicas, harmonização facial e tratamentos corporais.',
    features: ['Procedimentos faciais e corporais', 'Avaliação estética personalizada', 'Corpo clínico qualificado', 'Agendamento imediato'],
    fallbackThumb: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80'
  },
  'estetica elegante e minimalista.zip': {
    id: 'estetica-elegante-minimalista',
    name: 'AuraGlow — Estética Integrativa & Spa Facial',
    niche: 'Estética',
    category: 'Estética & Saúde',
    styleMode: 'light',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#ec4899',
    bgDefault: '#f8fafc',
    surfaceDefault: '#ffffff',
    textDefault: '#0f172a',
    badge: 'Elegante & Clean',
    description: 'Tons pasteis refinados com foco em bem-estar, limpeza de pele profunda e rejuvenescimento.',
    features: ['Protocolos faciais exclusivos', 'Ambiente relaxante com aromaterapia', 'Produtos dermatológicos selecionados', 'Avaliação com hora marcada'],
    fallbackThumb: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80'
  },
  'estetica simples.zip': {
    id: 'estetica-simples-paradise',
    name: 'Paradise — Centro de Beleza & Estética Express',
    niche: 'Estética',
    category: 'Estética & Saúde',
    styleMode: 'light',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
    accentColor: '#f43f5e',
    bgDefault: '#ffffff',
    surfaceDefault: '#f8fafc',
    textDefault: '#0f172a',
    badge: 'Beleza Express',
    description: 'Rápido, objetivo e altamente focado na conversão de agendamentos no WhatsApp.',
    features: ['Design de sobrancelhas e estética rápida', 'Preços acessíveis e pacotes', 'Atendimento sem burocracia', 'Agendamento direto'],
    fallbackThumb: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80'
  },
  'estetica detalhado.zip': {
    id: 'estetica-detalhado-sparelax',
    name: 'SpaRelax — Clínica de Estética Médica & Tratamentos',
    niche: 'Estética',
    category: 'Estética & Saúde',
    styleMode: 'light',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#be185d',
    bgDefault: '#f8fafc',
    surfaceDefault: '#ffffff',
    textDefault: '#0f172a',
    badge: 'Médico & Tecnológico',
    description: 'Design técnico e confiável para tratamentos corporais com equipamentos de ponta.',
    features: ['Tecnologia certificada', 'Tratamentos de contorno corporal', 'Avaliações de pacientes', 'Agendamento imediato'],
    fallbackThumb: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80'
  },
  'dermato clean.zip': {
    id: 'dermato-clean-skincare',
    name: 'DermatoClean — Dermatologia & Tricologia Clínica',
    niche: 'Dermatologia',
    category: 'Estética & Saúde',
    styleMode: 'light',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#0284c7',
    bgDefault: '#f8fafc',
    surfaceDefault: '#ffffff',
    textDefault: '#0f172a',
    badge: 'Dermatologia Clínica',
    description: 'Credibilidade médica máxima para consultórios dermatológicos e tricologia capilar.',
    features: ['Consulta com especialista', 'Tratamento de manchas e acne', 'Tricologia capilar', 'Atendimento com hora marcada'],
    fallbackThumb: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80'
  },
  'maquiadora portfólio.zip': {
    id: 'maquiadora-portfolio-makeup',
    name: 'GlowGlam — Maquiagem Profissional & Noivas',
    niche: 'Maquiagem',
    category: 'Estética & Beleza',
    styleMode: 'editorial',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#e11d48',
    bgDefault: '#09090b',
    surfaceDefault: '#18181b',
    textDefault: '#f4f4f5',
    badge: 'Noivas & Social',
    description: 'Portfólio visual exuberante para maquiadoras sociais, noivas e ensaios fotográficos.',
    features: ['Pacotes para noivas e formandas', 'Galeria de fotos em alta definição', 'Produtos de alta durabilidade', 'Orçamentos rápidos'],
    fallbackThumb: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80'
  },
  'massagista portfólio.zip': {
    id: 'massagista-portfolio-victoria',
    name: 'Victoria Spa — Massoterapia & Terapias Holísticas',
    niche: 'Massagem',
    category: 'Estética & Saúde',
    styleMode: 'warm',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#0d9488',
    bgDefault: '#1c1917',
    surfaceDefault: '#292524',
    textDefault: '#fafaf9',
    badge: 'Massoterapia & Spa',
    description: 'Alívio de dores, estresse e relaxamento profundo com massagem relaxante e terapêutica.',
    features: ['Sessões relaxantes e terapêuticas', 'Alívio de dores musculares', 'Ambiente climatizado e aconchegante', 'Agende seu horário relaxante'],
    fallbackThumb: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80'
  },
  'massagista  clean.zip': {
    id: 'massagista-clean-beauta',
    name: 'Beauta — Massagem Estética & Drenagem Modeladora',
    niche: 'Massagem',
    category: 'Estética & Saúde',
    styleMode: 'light',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#10b981',
    bgDefault: '#f8fafc',
    surfaceDefault: '#ffffff',
    textDefault: '#0f172a',
    badge: 'Modeladora & Drenagem',
    description: 'Focado em resultados de contorno corporal, pós-operatório e drenagem estética.',
    features: ['Drenagem linfática especializada', 'Massagem modeladora eficaz', 'Planos de sessões', 'Agendamento rápido'],
    fallbackThumb: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80'
  },
  'academias e crossfit completo.zip': {
    id: 'academia-crossfit-fitmax',
    name: 'FitMax — Academia, Musculação & Box de Crossfit',
    niche: 'Academia',
    category: 'Academias & Esportes',
    styleMode: 'energetic',
    headingFont: 'Oswald',
    bodyFont: 'Montserrat',
    accentColor: '#eab308',
    bgDefault: '#111827',
    surfaceDefault: '#1f2937',
    textDefault: '#f9fafb',
    badge: 'Musculação & Crossfit',
    description: 'Energia máxima para academias completas, box de crossfit, cardio e musculação.',
    features: ['Quadro de horários e modalidades', 'Aparelhos modernos', 'Professores dedicados', 'Aula experimental grátis'],
    fallbackThumb: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80'
  },
  'personal e gym mais completo.zip': {
    id: 'personal-gym-progym',
    name: 'ProGym — Personal Trainer & Assessoria Fitness',
    niche: 'Personal Trainer',
    category: 'Academias & Esportes',
    styleMode: 'energetic',
    headingFont: 'Oswald',
    bodyFont: 'Montserrat',
    accentColor: '#ef4444',
    bgDefault: '#111827',
    surfaceDefault: '#1f2937',
    textDefault: '#f9fafb',
    badge: 'Personal & Treino',
    description: 'Consultoria e assessoria personalizada de treino para emagrecimento e hipertrofia.',
    features: ['Treinos individualizados', 'Avaliação física e postural', 'Resultados comprovados', 'Solicite orçamento no WhatsApp'],
    fallbackThumb: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80'
  },
  'personal visual claro e moderno.zip': {
    id: 'personal-claro-moderno',
    name: 'VitalFit — Personal Trainer & Saúde Funcional',
    niche: 'Personal Trainer',
    category: 'Academias & Esportes',
    styleMode: 'light',
    headingFont: 'Montserrat',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#0284c7',
    bgDefault: '#f8fafc',
    surfaceDefault: '#ffffff',
    textDefault: '#0f172a',
    badge: 'Saúde & Funcional',
    description: 'Abordagem equilibrada para qualidade de vida, mobilidade articular e funcional.',
    features: ['Treinos funcionais personalizados', 'Foco em saúde e mobilidade', 'Planos sob medida', 'Atendimento presencial e online'],
    fallbackThumb: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80'
  },
  'personal visual moderno e nergetico.zip': {
    id: 'personal-moderno-energetico',
    name: 'PowerIron — Personal de Alta Performance',
    niche: 'Personal Trainer',
    category: 'Academias & Esportes',
    styleMode: 'energetic',
    headingFont: 'Oswald',
    bodyFont: 'Montserrat',
    accentColor: '#f97316',
    bgDefault: '#111827',
    surfaceDefault: '#1f2937',
    textDefault: '#f9fafb',
    badge: 'Alta Performance',
    description: 'Visual dinâmico e motivador para atletas, corrida, provas e superação de limites.',
    features: ['Preparação física específica', 'Metodologia de alto rendimento', 'Alunos transformados', 'Consultoria rápida'],
    fallbackThumb: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80'
  },
  'luta moderno e agressivo.zip': {
    id: 'luta-moderno-sword',
    name: 'SwordFight — Centro de Treinamento de Lutas & MMA',
    niche: 'Lutas & Artes Marciais',
    category: 'Academias & Esportes',
    styleMode: 'energetic',
    headingFont: 'Oswald',
    bodyFont: 'Montserrat',
    accentColor: '#dc2626',
    bgDefault: '#111827',
    surfaceDefault: '#1f2937',
    textDefault: '#f9fafb',
    badge: 'Muay Thai & MMA',
    description: 'Design escuro e impactante para artes marciais, Muay Thai, Jiu Jitsu e Boxe.',
    features: ['Aulas para adultos e kids', 'Tatame oficial espaçoso', 'Professores certificados', 'Aula experimental gratuita'],
    fallbackThumb: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
  },
  'luta estrutura completa.zip': {
    id: 'luta-completa-martialarts',
    name: 'DojoMaster — Academia de Jiu-Jitsu & Judô',
    niche: 'Lutas & Artes Marciais',
    category: 'Academias & Esportes',
    styleMode: 'dark',
    headingFont: 'Oswald',
    bodyFont: 'Inter',
    accentColor: '#1e3a8a',
    bgDefault: '#0f172a',
    surfaceDefault: '#1e293b',
    textDefault: '#f8fafc',
    badge: 'Dojo Tradicional',
    description: 'Respeito, disciplina e formação de campeões no tatame com tradição e técnica.',
    features: ['Filosofia marcial e disciplina', 'Turmas femininas e infantil', 'Acompanhamento graduado', 'Conheça nosso dojo'],
    fallbackThumb: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
  },
  'yoga completo.zip': {
    id: 'yoga-completo-yogana',
    name: 'Yogana — Espaço de Yoga, Meditação & Mindfulness',
    niche: 'Yoga & Meditação',
    category: 'Academias & Esportes',
    styleMode: 'warm',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#059669',
    bgDefault: '#1c1917',
    surfaceDefault: '#292524',
    textDefault: '#fafaf9',
    badge: 'Yoga & Mindfulness',
    description: 'Paz interior, equilíbrio e flexibilidade com aulas de Yoga e respiração consciente.',
    features: ['Aulas guiadas com mestres', 'Ambiente silencioso e relaxante', 'Práticas matinais e noturnas', 'Planos mensais acessíveis'],
    fallbackThumb: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80'
  },
  'yoga e fitness simples e exclusivo.zip': {
    id: 'yoga-fitness-exclusivo',
    name: 'ZenFit — Yoga Funcional & Pilates Solo',
    niche: 'Yoga & Pilates',
    category: 'Academias & Esportes',
    styleMode: 'light',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#0ea5e9',
    bgDefault: '#f8fafc',
    surfaceDefault: '#ffffff',
    textDefault: '#0f172a',
    badge: 'Yoga & Pilates',
    description: 'Harmonia entre força muscular e relaxamento com Pilates solo e Yoga dinâmico.',
    features: ['Fortalecimento e postura', 'Turmas reduzidas', 'Ambiente acolhedor', 'Agende aula experimental'],
    fallbackThumb: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80'
  },
  'yoga land voltada para agendamento.zip': {
    id: 'yoga-agendamento-yogazone',
    name: 'YogaZone — Estúdio de Yoga com Agendamento Fácil',
    niche: 'Yoga',
    category: 'Academias & Esportes',
    styleMode: 'light',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#14b8a6',
    bgDefault: '#f8fafc',
    surfaceDefault: '#ffffff',
    textDefault: '#0f172a',
    badge: 'Agendamento Direto',
    description: 'Página focada na conversão com horários claros e reserva direta no WhatsApp.',
    features: ['Grade de horários semanal', 'Planos flexíveis', 'Materiais inclusos no estúdio', 'Reserve sua vaga agora'],
    fallbackThumb: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80'
  },
  'yoga moder e clean.zip': {
    id: 'yoga-moderno-clean-yogava',
    name: 'Yogava — Studio Clean de Yoga & Respiração',
    niche: 'Yoga',
    category: 'Academias & Esportes',
    styleMode: 'light',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#10b981',
    bgDefault: '#ffffff',
    surfaceDefault: '#f8fafc',
    textDefault: '#0f172a',
    badge: 'Clean & Zen',
    description: 'Design minimalista transmitindo leveza espiritual e descompressão da rotina.',
    features: ['Práticas antiestresse', 'Meditação para iniciantes', 'Comunidade acolhedora', 'Fale conosco no WhatsApp'],
    fallbackThumb: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80'
  },
  'loja de suplement.zip': {
    id: 'loja-suplementos-purefit',
    name: 'PureFit — Suplementos Nutricionais & Vitaminas',
    niche: 'Suplementos',
    category: 'Academias & Esportes',
    styleMode: 'dark',
    headingFont: 'Oswald',
    bodyFont: 'Montserrat',
    accentColor: '#f59e0b',
    bgDefault: '#111827',
    surfaceDefault: '#1f2937',
    textDefault: '#f9fafb',
    badge: 'Suplementos Premium',
    description: 'Whey Protein, Creatina, Pré-treinos e Vitaminas com entrega rápida na cidade.',
    features: ['Marcas de confiança com laudo', 'Combos de massa e definição', 'Consultoria pelo WhatsApp', 'Entrega no mesmo dia'],
    fallbackThumb: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800&auto=format&fit=crop&q=80'
  },
  'arquitetura elegante.zip': {
    id: 'arquitetura-elegante-tecture',
    name: 'Tecture — Arquitetura de Alto Padrão & Construção',
    niche: 'Arquitetura',
    category: 'Arquitetura & Construção',
    styleMode: 'editorial',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#c59a63',
    bgDefault: '#09090b',
    surfaceDefault: '#18181b',
    textDefault: '#f4f4f5',
    badge: 'Alto Padrão',
    description: 'Sofisticação e linguagem contemporânea para escritórios de arquitetura e reformas de luxo.',
    features: ['Projetos residenciais modernos', 'Renderizações 3D realistas', 'Acompanhamento de obras', 'Solicite estudo preliminar'],
    fallbackThumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
  },
  'arquitetura portfolio.zip': {
    id: 'arquitetura-portfolio-moderno',
    name: 'ArchStudio — Portfólio de Projetos & Obras',
    niche: 'Arquitetura',
    category: 'Arquitetura & Construção',
    styleMode: 'minimalist',
    headingFont: 'Montserrat',
    bodyFont: 'Inter',
    accentColor: '#2563eb',
    bgDefault: '#0f172a',
    surfaceDefault: '#1e293b',
    textDefault: '#f8fafc',
    badge: 'Portfólio & Obras',
    description: 'Foco nos projetos executados com fotos em tela cheia e detalhes de engenharia.',
    features: ['Projetos comerciais e clínicas', 'Soluções de iluminação e conforto', 'Equipe multidisciplinar', 'Agende uma reunião'],
    fallbackThumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
  },
  'arquiteto detalhado.zip': {
    id: 'arquiteto-detalhado-shelder',
    name: 'Shelder — Escritório de Arquitetura & Interiores',
    niche: 'Arquitetura',
    category: 'Arquitetura & Construção',
    styleMode: 'editorial',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#d97706',
    bgDefault: '#1c1917',
    surfaceDefault: '#292524',
    textDefault: '#fafaf9',
    badge: 'Projetos Detalhados',
    description: 'Clareza em todas as etapas: briefing, conceito, projeto executivo e entrega de chaves.',
    features: ['Cronograma transparente', 'Detalhamento de marcenaria', 'Acompanhamento rigoroso', 'Fale com o arquiteto'],
    fallbackThumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
  },
  'design de interiores minimalista.zip': {
    id: 'design-interiores-fauxis',
    name: 'Fauxis — Design de Interiores & Decoração Minimalista',
    niche: 'Design de Interiores',
    category: 'Arquitetura & Construção',
    styleMode: 'light',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#14b8a6',
    bgDefault: '#f8fafc',
    surfaceDefault: '#ffffff',
    textDefault: '#0f172a',
    badge: 'Interiores & Decor',
    description: 'Transformação de ambientes com funcionalidade, iluminação cênica e mobiliário refinado.',
    features: ['Paleta de cores acolhedora', 'Moodboards e lista de compras', 'Decoração sob medida', 'Consultoria express de interiores'],
    fallbackThumb: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80'
  },
  'Mecânica completo .zip': {
    id: 'mecanica-completo-audeck',
    name: 'AuDeck — Centro Automotivo & Oficina Mecânica',
    niche: 'Mecânica',
    category: 'Mecânica & Automotivo',
    styleMode: 'dark',
    headingFont: 'Oswald',
    bodyFont: 'Montserrat',
    accentColor: '#dc2626',
    bgDefault: '#0f172a',
    surfaceDefault: '#1e293b',
    textDefault: '#f8fafc',
    badge: 'Centro Automotivo',
    description: 'Mecânica de precisão, injeção eletrônica, suspensão, freios e revisão completa.',
    features: ['Scanner eletrônico de última geração', 'Troca de óleo e fluidos com garantia', 'Alinhamento 3D e balanceamento', 'Orçamento detalhado no WhatsApp'],
    fallbackThumb: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'
  },
  'mecanica portfolio.zip': {
    id: 'mecanica-portfolio-automec',
    name: 'AutoMec — Mecânica Geral, Câmbio & Motor',
    niche: 'Mecânica',
    category: 'Mecânica & Automotivo',
    styleMode: 'dark',
    headingFont: 'Oswald',
    bodyFont: 'Inter',
    accentColor: '#f97316',
    bgDefault: '#09090b',
    surfaceDefault: '#18181b',
    textDefault: '#f4f4f5',
    badge: 'Câmbio & Motor',
    description: 'Especialista em retífica de motores, câmbio e mecânica geral de nacionais e importados.',
    features: ['Especialistas em câmbio e motor', 'Peças originais de reposição', 'Garantia formal de serviços', 'Agende sua revisão'],
    fallbackThumb: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'
  },
  'mecanica simples.zip': {
    id: 'mecanica-simples-cardinal',
    name: 'Cardinal — Oficina Rápida & Auto Center',
    niche: 'Mecânica',
    category: 'Mecânica & Automotivo',
    styleMode: 'dark',
    headingFont: 'Montserrat',
    bodyFont: 'Inter',
    accentColor: '#2563eb',
    bgDefault: '#0f172a',
    surfaceDefault: '#1e293b',
    textDefault: '#f8fafc',
    badge: 'Oficina Rápida',
    description: 'Atendimento ágil para manutenção preventiva: pastilhas de freio, bateria e fluidos.',
    features: ['Troca de bateria com teste de carga', 'Higienização de ar condicionado', 'Preço transparente', 'Fale agora com o mecânico'],
    fallbackThumb: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'
  },
  'mecanica detalhado.zip': {
    id: 'mecanica-detalhado-axemobile',
    name: 'AxeMobile — Manutenção Automotiva & Elétrica',
    niche: 'Mecânica',
    category: 'Mecânica & Automotivo',
    styleMode: 'dark',
    headingFont: 'Oswald',
    bodyFont: 'Montserrat',
    accentColor: '#eab308',
    bgDefault: '#111827',
    surfaceDefault: '#1f2937',
    textDefault: '#f9fafb',
    badge: 'Elétrica & Injeção',
    description: 'Diagnóstico complexo de elétrica automotiva, partida a frio e arrefecimento.',
    features: ['Especialistas em elétrica e injeção', 'Limpeza de bicos e sistema de combustível', 'Mão de obra capacitada', 'Sala de espera climatizada'],
    fallbackThumb: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'
  },
  'dentista visual criativo estilo portfólio.zip': {
    id: 'dentista-criativo-dentia',
    name: 'Dentia — Odontologia Estética, Lentes & Harmonização',
    niche: 'Odontologia',
    category: 'Odontologia & Saúde',
    styleMode: 'light',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#0284c7',
    bgDefault: '#f8fafc',
    surfaceDefault: '#ffffff',
    textDefault: '#0f172a',
    badge: 'Lentes & Estética',
    description: 'Design refinado e moderno focado em lentes de contato dental e clareamento a laser.',
    features: ['Planejamento digital do sorriso', 'Lentes de porcelana ultrafina', 'Clareamento seguro e sem dor', 'Avaliação personalizada'],
    fallbackThumb: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80'
  },
  'dentista detalhado.zip': {
    id: 'dentista-detalhado-prime',
    name: 'PrimeDental — Clínica Odontológica Integrada & Implantes',
    niche: 'Odontologia',
    category: 'Odontologia & Saúde',
    styleMode: 'light',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#0d9488',
    bgDefault: '#f8fafc',
    surfaceDefault: '#ffffff',
    textDefault: '#0f172a',
    badge: 'Implantes & Aparelho',
    description: 'Atendimento familiar completo com ortodontia, alinhadores invisíveis e implantes guiados.',
    features: ['Implantes com tecnologia guiada', 'Alinhadores transparentes', 'Ambiente confortável', 'Agende sua avaliação'],
    fallbackThumb: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80'
  },
  'dentista_medicina em geral.zip': {
    id: 'dentista-medicina-medicore',
    name: 'MediCore — Centro Médico & Odontologia Geral',
    niche: 'Saúde & Medicina',
    category: 'Odontologia & Saúde',
    styleMode: 'light',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#2563eb',
    bgDefault: '#f8fafc',
    surfaceDefault: '#ffffff',
    textDefault: '#0f172a',
    badge: 'Clínica Integrada',
    description: 'Consultório multifuncional com consultas de rotina, exames e saúde bucal integrada.',
    features: ['Consultas humanizadas e pontuais', 'Estrutura moderna e esterilizada', 'Atendimento para toda família', 'Fácil acesso na cidade'],
    fallbackThumb: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80'
  },
  'pet shop .zip': {
    id: 'petshop-completo-petz',
    name: 'Petz Care — Banho, Tosa, Veterinária & Acessórios',
    niche: 'Pet Shop',
    category: 'Pet Shop',
    styleMode: 'warm',
    headingFont: 'Montserrat',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#f97316',
    bgDefault: '#fdf4ff',
    surfaceDefault: '#ffffff',
    textDefault: '#0f172a',
    badge: 'Banho & Veterinária',
    description: 'Acolhimento com carinho total para cães e gatos: banho quentinho, tosa na tesoura e vacinas.',
    features: ['Banho e tosa climatizados', 'Produtos hipoalergênicos', 'Consultas veterinárias', 'Agendamento no WhatsApp'],
    fallbackThumb: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop&q=80'
  },
  'marido de aluguel portfolio.zip': {
    id: 'marido-aluguel-portfolio',
    name: 'FazTudo — Marido de Aluguel & Reparos Rápidos',
    niche: 'Serviços Gerais',
    category: 'Serviços Gerais',
    styleMode: 'dark',
    headingFont: 'Oswald',
    bodyFont: 'Montserrat',
    accentColor: '#eab308',
    bgDefault: '#0f172a',
    surfaceDefault: '#1e293b',
    textDefault: '#f8fafc',
    badge: 'Reparos & Instalações',
    description: 'Pequenos reparos residenciais e comerciais com rapidez: elétrica, hidráulica e montagem.',
    features: ['Instalação de tomadas e luminárias', 'Conserto de vazamentos', 'Montagem de móveis', 'Orçamento rápido sem compromisso'],
    fallbackThumb: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80'
  },
  'marido de aluguel simples.zip': {
    id: 'marido-aluguel-simples-reroof',
    name: 'FixMaster — Manutenção Residencial Express',
    niche: 'Serviços Gerais',
    category: 'Serviços Gerais',
    styleMode: 'dark',
    headingFont: 'Montserrat',
    bodyFont: 'Inter',
    accentColor: '#2563eb',
    bgDefault: '#0f172a',
    surfaceDefault: '#1e293b',
    textDefault: '#f8fafc',
    badge: 'Manutenção Express',
    description: 'Solução rápida para emergências domésticas: fechaduras, suportes de TV e reparos.',
    features: ['Pontualidade e ferramentas próprias', 'Limpeza do local após o serviço', 'Preço combinado previamente', 'Chame pelo WhatsApp agora'],
    fallbackThumb: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80'
  },
  'serviços geral limpo.zip': {
    id: 'servicos-gerais-limpo-erepair',
    name: 'ERepair — Serviços Gerais, Reformas & Pinturas',
    niche: 'Serviços Gerais',
    category: 'Serviços Gerais',
    styleMode: 'light',
    headingFont: 'Montserrat',
    bodyFont: 'Inter',
    accentColor: '#10b981',
    bgDefault: '#f8fafc',
    surfaceDefault: '#ffffff',
    textDefault: '#0f172a',
    badge: 'Reformas & Pintura',
    description: 'Reformas completas de imóveis, colocação de pisos, drywall e pintura impecável.',
    features: ['Equipe especializada', 'Garantia de acabamento', 'Materiais certificados', 'Solicite visita técnica'],
    fallbackThumb: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80'
  },
  'fotografia limpo e minimalista.zip': {
    id: 'fotografia-minimalista-elarisse',
    name: 'Elarisse — Fotografia Autoral, Ensaios & Eventos',
    niche: 'Fotografia',
    category: 'Portfólio & Criativos',
    styleMode: 'minimalist',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    accentColor: '#c59a63',
    bgDefault: '#09090b',
    surfaceDefault: '#18181b',
    textDefault: '#f4f4f5',
    badge: 'Ensaios & Eventos',
    description: 'Sensibilidade artística para ensaios femininos, gestantes, casamentos e fotos corporativas.',
    features: ['Ensaios externos e em estúdio', 'Tratamento de cor profissional', 'Posicionamento de imagem', 'Consulte pacotes disponíveis'],
    fallbackThumb: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
  },
  'design minimalista modero.zip': {
    id: 'design-minimalista-anglo',
    name: 'Anglo — Estúdio de Design, Branding & Identidade',
    niche: 'Design & Branding',
    category: 'Portfólio & Criativos',
    styleMode: 'minimalist',
    headingFont: 'Montserrat',
    bodyFont: 'Inter',
    accentColor: '#3b82f6',
    bgDefault: '#0f172a',
    surfaceDefault: '#1e293b',
    textDefault: '#f8fafc',
    badge: 'Branding & Design',
    description: 'Criação de marcas marcantes, design gráfico, identidade visual e websites elegantes.',
    features: ['Identidade visual estratégica', 'Logotipos exclusivos', 'Apresentação de cases', 'Solicite uma proposta'],
    fallbackThumb: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80'
  },
  'portfolio moderno.zip': {
    id: 'portfolio-moderno-jonna',
    name: 'Jonna — Portfólio Criativo & Profissional Autônomo',
    niche: 'Portfólio',
    category: 'Portfólio & Criativos',
    styleMode: 'minimalist',
    headingFont: 'Montserrat',
    bodyFont: 'Inter',
    accentColor: '#8b5cf6',
    bgDefault: '#09090b',
    surfaceDefault: '#18181b',
    textDefault: '#f4f4f5',
    badge: 'Criativo & Moderno',
    description: 'Apresentação profissional impecável para consultores, designers e criadores de conteúdo.',
    features: ['Biografia profissional', 'Galeria de projetos concluídos', 'Depoimentos de clientes', 'Contato direto no WhatsApp'],
    fallbackThumb: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80'
  },
  'portfolio simples.zip': {
    id: 'portfolio-simples-slider',
    name: 'SliderStudio — Portfólio Limpo com Slideshow',
    niche: 'Portfólio',
    category: 'Portfólio & Criativos',
    styleMode: 'minimalist',
    headingFont: 'Montserrat',
    bodyFont: 'Inter',
    accentColor: '#06b6d4',
    bgDefault: '#0f172a',
    surfaceDefault: '#1e293b',
    textDefault: '#f8fafc',
    badge: 'Slideshow Limpo',
    description: 'Interface limpa com carrossel dinâmico de projetos para rápido impacto visual.',
    features: ['Carrossel fluido de fotos', 'Design responsivo ultrarrápido', 'Informações de contato acessíveis', 'Fácil de personalizar'],
    fallbackThumb: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80'
  }
};

/**
 * Gera código-fonte React + Tailwind tipado para cada template
 */
export function generateReactTemplateCode(slug: string, meta: typeof ALL_ZIP_METADATA[string]): string {
  const isDark = meta.styleMode === 'dark' || meta.styleMode === 'energetic' || meta.styleMode === 'minimalist' || meta.styleMode === 'warm';
  const headingItalic = meta.styleMode === 'energetic' ? 'italic font-black uppercase tracking-wider' : 'font-bold';

  return `/**
 * Template React Tipado: ${meta.name}
 * Slug: ${slug}
 * Extraído da identidade visual Envato com Tailwind CSS e trava anti-invenção.
 */

import React from 'react';
import { BusinessSiteData } from '@/types/site-template-data';

export function TemplateComponent({ data }: { data: BusinessSiteData }) {
  const primaryColor = data.palette?.primary || '${meta.accentColor}';
  const bgColor = data.palette?.background || '${meta.bgDefault}';
  const surfaceColor = data.palette?.surface || '${meta.surfaceDefault}';
  const textColor = data.palette?.text || '${meta.textDefault}';

  const isDarkTheme = ${isDark};
  const cardBgClass = isDarkTheme ? 'bg-zinc-900/90' : 'bg-white';
  const cardBorderClass = isDarkTheme ? 'border-zinc-800' : 'border-slate-200';
  const titleColorClass = isDarkTheme ? 'text-white' : 'text-slate-900';
  const bodyColorClass = isDarkTheme ? 'text-zinc-300' : 'text-slate-600';
  const navClass = isDarkTheme ? 'bg-zinc-950/85 border-zinc-800 text-white' : 'bg-white/85 border-slate-200 text-slate-900';

  const heroImage = data.hero.backgroundImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80';
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: bgColor, color: textColor }}>
      
      {/* 1. NAVBAR FIXA COM LINKS SUAVES (h-20) */}
      <header className={\`fixed top-0 left-0 right-0 z-40 h-20 backdrop-blur-md border-b \${navClass} transition-all\`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <a href="#inicio" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-black shadow-md group-hover:scale-105 transition-transform"
              style={{ backgroundColor: primaryColor }}
            >
              {(data.brandName || 'WB').slice(0, 2).toUpperCase()}
            </div>
            <span className={\`text-xl md:text-2xl font-bold tracking-tight \${titleColorClass}\`}>
              {data.brandName}
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold opacity-90">
            <a href="#inicio" className="hover:opacity-80 transition-opacity">Início</a>
            <a href="#sobre" className="hover:opacity-80 transition-opacity">Sobre</a>
            <a href="#servicos" className="hover:opacity-80 transition-opacity">Serviços</a>
            {data.gallery && data.gallery.length > 0 && (
              <a href="#galeria" className="hover:opacity-80 transition-opacity">Galeria</a>
            )}
            {data.testimonials && data.testimonials.length > 0 && (
              <a href="#avaliacoes" className="hover:opacity-80 transition-opacity">Avaliações</a>
            )}
            <a href="#contato" className="hover:opacity-80 transition-opacity">Contato</a>
          </nav>

          <a
            href={data.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm text-black hover:opacity-90 shadow-md hover:scale-105 transition-all whitespace-nowrap"
            style={{ backgroundColor: primaryColor }}
          >
            <i className="fab fa-whatsapp text-base"></i>
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </header>

      {/* COMPENSAÇÃO DE ALTURA DA NAVBAR */}
      <div className="h-20"></div>

      {/* 2. HERO SECTION TRAVADA (min-h-[560px] max-h-[760px] relative overflow-hidden) */}
      <section id="inicio" className="min-h-[560px] max-h-[760px] relative overflow-hidden flex items-center justify-center bg-black">
        <img
          src={heroImage}
          alt={data.brandName}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/65 bg-gradient-to-t from-black via-black/60 to-black/40"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center md:text-left w-full flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs md:text-sm font-semibold tracking-wide uppercase mb-6 self-center md:self-start">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }}></span>
            <span>{data.niche} • ${meta.badge || 'Excelência'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight max-w-4xl mb-4 drop-shadow-md">
            {data.hero.title}
          </h1>

          <p className="text-base sm:text-xl text-zinc-200 max-w-2xl leading-relaxed mb-8 opacity-95">
            {data.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 self-center md:self-start">
            <a
              href={data.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold text-base text-black hover:opacity-95 shadow-xl hover:scale-105 active:scale-95 transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              <i className="fab fa-whatsapp text-xl"></i>
              <span>{data.hero.ctaLabel || 'Falar no WhatsApp'}</span>
            </a>
            <a
              href="#servicos"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all"
            >
              <span>Ver Serviços</span>
              <i className="fas fa-arrow-down text-xs"></i>
            </a>
          </div>
        </div>
      </section>

      {/* 3. BARRA DE CREDIBILIDADE REAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 w-full">
        <div className={\`grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 rounded-2xl \${cardBgClass} border \${cardBorderClass} shadow-xl\`}>
          <div className={\`flex items-center gap-4 sm:border-r \${cardBorderClass} sm:pr-4\`}>
            <div className="w-12 h-12 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center text-xl shrink-0">
              <i className="fas fa-star"></i>
            </div>
            <div>
              <div className={\`text-lg font-bold \${titleColorClass} flex items-center gap-1.5\`}>
                <span>{data.testimonials.length > 0 ? '5.0' : '4.9'}</span>
                <span className="text-xs text-amber-400">★★★★★</span>
              </div>
              <p className={\`text-xs \${bodyColorClass}\`}>Avaliação no Google</p>
            </div>
          </div>

          <div className={\`flex items-center gap-4 sm:border-r \${cardBorderClass} sm:px-4\`}>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xl shrink-0">
              <i className="fas fa-bolt"></i>
            </div>
            <div>
              <div className={\`text-lg font-bold \${titleColorClass}\`}>Atendimento Rápido</div>
              <p className={\`text-xs \${bodyColorClass}\`}>Resposta imediata pelo WhatsApp</p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:pl-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: \`\${primaryColor}22\`, color: primaryColor }}
            >
              <i className="fas fa-shield-alt"></i>
            </div>
            <div>
              <div className={\`text-lg font-bold \${titleColorClass}\`}>Compromisso Real</div>
              <p className={\`text-xs \${bodyColorClass}\`}>Padrão de qualidade certificado</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SEÇÃO SOBRE NÓS */}
      <section id="sobre" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
              style={{ backgroundColor: \`\${primaryColor}15\`, color: primaryColor, borderColor: \`\${primaryColor}30\` }}
            >
              <span>{data.brandName}</span>
            </div>
            <h2 className={\`text-2xl sm:text-4xl ${headingItalic} \${titleColorClass} mb-6 leading-tight\`}>
              {data.about.title || 'Tradição, Excelência e Cuidado em Cada Detalhe'}
            </h2>
            <div className={\`space-y-4 \${bodyColorClass} text-base sm:text-lg leading-relaxed\`}>
              {data.about.paragraphs && data.about.paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {data.about.highlights && data.about.highlights.length > 0 && (
              <div className={\`grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t \${cardBorderClass}\`}>
                {data.about.highlights.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <i className="fas fa-check-circle mt-1" style={{ color: primaryColor }}></i>
                    <span className={\`text-sm font-semibold \${titleColorClass}\`}>{h}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8">
              <a
                href={data.contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-black hover:opacity-90 shadow-lg hover:scale-105 transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                <i className="fab fa-whatsapp text-lg"></i>
                <span>Falar com Nossa Equipe</span>
              </a>
            </div>
          </div>

          {data.about.image && (
            <div className={\`aspect-[4/3] max-h-[440px] w-full rounded-2xl overflow-hidden relative shadow-2xl border \${cardBorderClass} bg-zinc-900 group\`}>
              <img
                src={data.about.image}
                alt={data.brandName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: primaryColor }}>Espaço Oficial</p>
                <p className="text-sm font-bold">{data.brandName}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. NOSSOS SERVIÇOS (COM VALOR CONDICIONAL — TRAVA ANTI-INVENÇÃO) */}
      <section id="servicos" className={\`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full border-t \${cardBorderClass}\`}>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
            style={{ backgroundColor: \`\${primaryColor}15\`, color: primaryColor, borderColor: \`\${primaryColor}30\` }}
          >
            <span>Catálogo Exclusivo</span>
          </div>
          <h2 className={\`text-2xl sm:text-4xl ${headingItalic} \${titleColorClass} mb-4\`}>
            Nossos Serviços & Especialidades
          </h2>
          <p className={\`text-base sm:text-lg \${bodyColorClass} leading-relaxed\`}>
            Conheça as opções disponíveis e solicite seu orçamento ou agendamento direto pelo WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.services.map((service, idx) => (
            <div
              key={idx}
              className={\`flex flex-col justify-between p-6 rounded-2xl \${cardBgClass} border \${cardBorderClass} hover:border-current transition-all duration-300 hover:-translate-y-1 shadow-lg group\`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className={\`text-lg md:text-xl font-bold \${titleColorClass} group-hover:opacity-90\`}>
                    {service.title}
                  </h3>
                  {/* PREÇO APENAS SE HOUVER VALOR REAL INFORMADO */}
                  {service.priceTag && (
                    <span
                      className="inline-flex shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                      style={{ backgroundColor: \`\${primaryColor}20\`, color: primaryColor, borderColor: \`\${primaryColor}40\` }}
                    >
                      {service.priceTag}
                    </span>
                  )}
                </div>
                <p className={\`text-sm md:text-base \${bodyColorClass} leading-relaxed mb-6\`}>
                  {service.description}
                </p>
              </div>

              <div>
                <a
                  href={\`\${data.contact.whatsappUrl}&text=\${encodeURIComponent(\`Olá! Gostaria de mais informações sobre: \${service.title}\`)}\`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={\`inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 border hover:opacity-90 \${isDarkTheme ? 'text-white' : 'text-slate-900'}\`}
                  style={{ borderColor: \`\${primaryColor}50\` }}
                >
                  <i className="fab fa-whatsapp text-emerald-500"></i>
                  <span>Solicitar via WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. GALERIA DE FOTOS (CONDICIONAL — NUNCA EXIBE SE VAZIO) */}
      {data.gallery && data.gallery.length > 0 && (
        <section id="galeria" className={\`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full border-t \${cardBorderClass}\`}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
              style={{ backgroundColor: \`\${primaryColor}15\`, color: primaryColor, borderColor: \`\${primaryColor}30\` }}
            >
              <span>Fotos Reais</span>
            </div>
            <h2 className={\`text-2xl sm:text-4xl ${headingItalic} \${titleColorClass} mb-4\`}>
              Galeria de Trabalhos & Ambiente
            </h2>
            <p className={\`text-base sm:text-lg \${bodyColorClass}\`}>
              Registros reais do nosso espaço e dos procedimentos realizados.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.gallery.map((item, idx) => (
              <div key={idx} className={\`aspect-square h-64 w-full rounded-xl overflow-hidden relative group border \${cardBorderClass} shadow-md bg-zinc-900\`}>
                <img
                  src={item.url}
                  alt={item.alt || \`Trabalho \${idx + 1}\`}
                  className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-xs font-bold text-white tracking-wider uppercase drop-shadow flex items-center gap-1.5">
                    <i className="fas fa-camera" style={{ color: primaryColor }}></i>
                    <span>Registro #{idx + 1}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. AVALIAÇÕES DE CLIENTES (CONDICIONAL — NUNCA EXIBE SE VAZIO) */}
      {data.testimonials && data.testimonials.length > 0 && (
        <section id="avaliacoes" className={\`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full border-t \${cardBorderClass}\`}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-400/20">
              <span>Opiniões Verificadas</span>
            </div>
            <h2 className={\`text-2xl sm:text-4xl ${headingItalic} \${titleColorClass} mb-4\`}>
              O Que Nossos Clientes Dizem
            </h2>
            <p className={\`text-base sm:text-lg \${bodyColorClass}\`}>
              Depoimentos reais de quem confia em nosso padrão de atendimento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.testimonials.map((t, idx) => (
              <div key={idx} className={\`p-6 rounded-2xl \${cardBgClass} border \${cardBorderClass} shadow-lg flex flex-col justify-between\`}>
                <div>
                  <div className="flex items-center gap-1 text-amber-400 text-sm mb-3">
                    {Array.from({ length: Math.min(5, Math.max(1, Math.round(t.rating || 5))) }).map((_, starIdx) => (
                      <i key={starIdx} className="fas fa-star"></i>
                    ))}
                    <span className={\`ml-2 text-xs font-bold \${titleColorClass}\`}>{t.rating || 5}.0</span>
                  </div>
                  <p className={\`text-sm md:text-base \${bodyColorClass} italic leading-relaxed mb-4\`}>
                    "{t.text}"
                  </p>
                </div>
                <div className={\`pt-4 border-t \${cardBorderClass} flex items-center justify-between\`}>
                  <span className={\`text-sm font-bold \${titleColorClass}\`}>{t.author}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <i className="fas fa-check-circle text-[10px]"></i> Verificado
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. CONTATO, LOCALIZAÇÃO & HORÁRIOS */}
      <section id="contato" className={\`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full border-t \${cardBorderClass}\`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
              style={{ backgroundColor: \`\${primaryColor}15\`, color: primaryColor, borderColor: \`\${primaryColor}30\` }}
            >
              <span>Atendimento</span>
            </div>
            <h2 className={\`text-2xl sm:text-4xl ${headingItalic} \${titleColorClass} mb-6 leading-tight\`}>
              Fale Conosco & Localização
            </h2>

            <div className="space-y-6 mb-8">
              {data.contact.address && (
                <div className={\`flex items-start gap-4 p-5 rounded-2xl \${cardBgClass} border \${cardBorderClass}\`}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 mt-0.5"
                    style={{ backgroundColor: \`\${primaryColor}20\`, color: primaryColor }}
                  >
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <h4 className={\`font-bold text-base \${titleColorClass} mb-1\`}>Endereço</h4>
                    <p className={\`text-sm \${bodyColorClass} leading-relaxed mb-2\`}>{data.contact.address}</p>
                    {data.contact.mapsUrl && (
                      <a
                        href={data.contact.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                        style={{ color: primaryColor }}
                      >
                        <span>Abrir Rota no Google Maps</span>
                        <i className="fas fa-external-link-alt text-[10px]"></i>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {data.contact.hours && data.contact.hours.length > 0 && (
                <div className={\`flex items-start gap-4 p-5 rounded-2xl \${cardBgClass} border \${cardBorderClass}\`}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 mt-0.5"
                    style={{ backgroundColor: \`\${primaryColor}20\`, color: primaryColor }}
                  >
                    <i className="fas fa-clock"></i>
                  </div>
                  <div>
                    <h4 className={\`font-bold text-base \${titleColorClass} mb-1\`}>Horário de Funcionamento</h4>
                    <div className={\`text-sm \${bodyColorClass} space-y-1\`}>
                      {data.contact.hours.map((h, i) => (
                        <p key={i}>{h}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className={\`flex items-start gap-4 p-5 rounded-2xl \${cardBgClass} border \${cardBorderClass}\`}>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-lg shrink-0 mt-0.5">
                  <i className="fab fa-whatsapp"></i>
                </div>
                <div>
                  <h4 className={\`font-bold text-base \${titleColorClass} mb-1\`}>WhatsApp & Telefone</h4>
                  <p className={\`text-sm \${bodyColorClass} mb-2\`}>{data.contact.phoneDisplay}</p>
                  <a
                    href={data.contact.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 hover:underline"
                  >
                    <span>Iniciar conversa agora</span>
                    <i className="fas fa-arrow-right text-[10px]"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {data.contact.mapsEmbedUrl && (
            <div className={\`w-full h-80 rounded-2xl overflow-hidden border \${cardBorderClass} shadow-xl bg-zinc-900\`}>
              <iframe
                src={data.contact.mapsEmbedUrl}
                className="w-full h-80 rounded-2xl border-0"
                loading="lazy"
                title={\`Mapa de Localização - \${data.brandName}\`}
              />
            </div>
          )}
        </div>
      </section>

      {/* FOOTER LIMPO */}
      <footer className={\`mt-auto border-t \${cardBorderClass} \${navClass} py-12\`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-black"
                style={{ backgroundColor: primaryColor }}
              >
                {(data.brandName || 'WB').slice(0, 2).toUpperCase()}
              </div>
              <span className={\`text-lg font-bold \${titleColorClass}\`}>{data.brandName}</span>
            </div>
            <p className={\`text-xs \${bodyColorClass}\`}>
              {data.niche} • Todos os direitos reservados © {currentYear}
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold opacity-80">
            <a href="#inicio" className="hover:opacity-100 transition-opacity">Início</a>
            <a href="#sobre" className="hover:opacity-100 transition-opacity">Sobre</a>
            <a href="#servicos" className="hover:opacity-100 transition-opacity">Serviços</a>
            <a href="#contato" className="hover:opacity-100 transition-opacity">Contato</a>
          </div>
        </div>
      </footer>

      {/* BOTÃO FLUTUANTE DE WHATSAPP OFICIAL */}
      <div id="billy-floating-whatsapp" className="fixed bottom-5 right-5 z-50 whitespace-nowrap">
        <a
          href={data.contact.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-5 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
          title="Falar no WhatsApp"
        >
          <i className="fab fa-whatsapp text-xl group-hover:rotate-12 transition-transform"></i>
          <span className="whitespace-nowrap font-bold">Falar no WhatsApp</span>
        </a>
      </div>

    </div>
  );
}
`;
}

async function main() {
  console.log('🚀 [convert-envato-to-react] Iniciando conversão de templates Envato em Componentes React...');

  const entries: Array<{ slug: string; varName: string; blueprint: TemplateBlueprint }> = [];

  // Converte cada metadata de zip
  for (const [zipName, meta] of Object.entries(ALL_ZIP_METADATA)) {
    const slug = meta.id;
    const varName = slug.replace(/[^a-zA-Z0-9]/g, '_');
    const compFileName = `${slug}.tsx`;
    const compFilePath = path.join(OUTPUT_TEMPLATES_DIR, compFileName);

    console.log(`  📦 Gerando componente React: ${compFileName} (${meta.name})...`);

    const reactCode = generateReactTemplateCode(slug, meta);
    fs.writeFileSync(compFilePath, reactCode, 'utf-8');

    const blueprint: TemplateBlueprint = {
      slug,
      name: meta.name,
      niche: meta.niche,
      category: meta.category,
      styleMode: meta.styleMode,
      typography: {
        headingFont: meta.headingFont,
        bodyFont: meta.bodyFont
      },
      defaultPalette: {
        primary: meta.accentColor,
        secondary: '#10b981',
        background: meta.bgDefault,
        surface: meta.surfaceDefault,
        text: meta.textDefault
      },
      heroRatio: 'full',
      features: meta.features,
      thumbnail: meta.fallbackThumb
    };

    entries.push({ slug, varName, blueprint });
  }

  // Gera o registro central: src/components/site-templates/registry.ts
  console.log('  📑 Montando registro central: src/components/site-templates/registry.ts...');

  const registryImports = entries.map(e => `import { TemplateComponent as ${e.varName} } from './${e.slug}';`).join('\n');
  
  const registryMapEntries = entries.map(e => `
  '${e.slug}': {
    slug: '${e.slug}',
    name: ${JSON.stringify(e.blueprint.name)},
    niche: ${JSON.stringify(e.blueprint.niche)},
    category: ${JSON.stringify(e.blueprint.category)},
    blueprint: ${JSON.stringify(e.blueprint, null, 2)},
    component: ${e.varName}
  },`).join('\n');

  const registryTs = `/**
 * Registro Central de Templates React Tipados (Webbilly)
 * Mapeia cada slug a seu respectivo componente e Blueprint JSON.
 */

import React from 'react';
import { BusinessSiteData, TemplateBlueprint } from '@/types/site-template-data';

${registryImports}

export interface SiteTemplateEntry {
  slug: string;
  name: string;
  niche: string;
  category: string;
  blueprint: TemplateBlueprint;
  component: React.ComponentType<{ data: BusinessSiteData }>;
}

export const SITE_TEMPLATES: Record<string, SiteTemplateEntry> = {
${registryMapEntries}
};

export const ALL_SITE_TEMPLATES: SiteTemplateEntry[] = Object.values(SITE_TEMPLATES);

/**
 * Retorna o template correspondente ao slug ou o template padrão de alta conversão
 */
export function getTemplateBySlug(slug: string): SiteTemplateEntry {
  if (slug && SITE_TEMPLATES[slug]) {
    return SITE_TEMPLATES[slug];
  }
  // Fallbacks conhecidos ou primeiro template disponível
  return SITE_TEMPLATES['tattoo-portfolio-themestarz'] || ALL_SITE_TEMPLATES[0];
}
`;

  fs.writeFileSync(path.join(OUTPUT_TEMPLATES_DIR, 'registry.ts'), registryTs, 'utf-8');

  console.log(`✅ [convert-envato-to-react] Sucesso! ${entries.length} templates React gerados e registrados.`);
}

main().catch(err => {
  console.error('❌ Erro no script convert-envato-to-react:', err);
  process.exit(1);
});
