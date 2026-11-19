/**
 * Registro Central de Templates React Tipados (Webbilly)
 * Mapeia cada slug a seu respectivo componente e Blueprint JSON.
 */

import React from 'react';
import { BusinessSiteData, TemplateBlueprint } from '@/types/site-template-data';

import { TemplateComponent as tattoo_portfolio_themestarz } from './tattoo-portfolio-themestarz';
import { TemplateComponent as tattoo_estudio_portfolio_blaxcut } from './tattoo-estudio-portfolio-blaxcut';
import { TemplateComponent as tattoo_estudio_moderno } from './tattoo-estudio-moderno';
import { TemplateComponent as pizzaria_clean_royate } from './pizzaria-clean-royate';
import { TemplateComponent as restaurante_cafe_heritaste } from './restaurante-cafe-heritaste';
import { TemplateComponent as restaurante_cardapio_dbento } from './restaurante-cardapio-dbento';
import { TemplateComponent as restaurante_classico_granny } from './restaurante-classico-granny';
import { TemplateComponent as restaurante_portfolio_grandrestaurant } from './restaurante-portfolio-grandrestaurant';
import { TemplateComponent as restaurante_elegante_elegencia } from './restaurante-elegante-elegencia';
import { TemplateComponent as coffee_shop_escuro_bruin } from './coffee-shop-escuro-bruin';
import { TemplateComponent as coffee_shop_moderno_max } from './coffee-shop-moderno-max';
import { TemplateComponent as coffee_estilo_barista } from './coffee-estilo-barista';
import { TemplateComponent as estetica_completo_spa } from './estetica-completo-spa';
import { TemplateComponent as estetica_elegante_minimalista } from './estetica-elegante-minimalista';
import { TemplateComponent as estetica_simples_paradise } from './estetica-simples-paradise';
import { TemplateComponent as estetica_detalhado_sparelax } from './estetica-detalhado-sparelax';
import { TemplateComponent as dermato_clean_skincare } from './dermato-clean-skincare';
import { TemplateComponent as maquiadora_portfolio_makeup } from './maquiadora-portfolio-makeup';
import { TemplateComponent as massagista_portfolio_victoria } from './massagista-portfolio-victoria';
import { TemplateComponent as massagista_clean_beauta } from './massagista-clean-beauta';
import { TemplateComponent as academia_crossfit_fitmax } from './academia-crossfit-fitmax';
import { TemplateComponent as personal_gym_progym } from './personal-gym-progym';
import { TemplateComponent as personal_claro_moderno } from './personal-claro-moderno';
import { TemplateComponent as personal_moderno_energetico } from './personal-moderno-energetico';
import { TemplateComponent as luta_moderno_sword } from './luta-moderno-sword';
import { TemplateComponent as luta_completa_martialarts } from './luta-completa-martialarts';
import { TemplateComponent as yoga_completo_yogana } from './yoga-completo-yogana';
import { TemplateComponent as yoga_fitness_exclusivo } from './yoga-fitness-exclusivo';
import { TemplateComponent as yoga_agendamento_yogazone } from './yoga-agendamento-yogazone';
import { TemplateComponent as yoga_moderno_clean_yogava } from './yoga-moderno-clean-yogava';
import { TemplateComponent as loja_suplementos_purefit } from './loja-suplementos-purefit';
import { TemplateComponent as arquitetura_elegante_tecture } from './arquitetura-elegante-tecture';
import { TemplateComponent as arquitetura_portfolio_moderno } from './arquitetura-portfolio-moderno';
import { TemplateComponent as arquiteto_detalhado_shelder } from './arquiteto-detalhado-shelder';
import { TemplateComponent as design_interiores_fauxis } from './design-interiores-fauxis';
import { TemplateComponent as mecanica_completo_audeck } from './mecanica-completo-audeck';
import { TemplateComponent as mecanica_portfolio_automec } from './mecanica-portfolio-automec';
import { TemplateComponent as mecanica_simples_cardinal } from './mecanica-simples-cardinal';
import { TemplateComponent as mecanica_detalhado_axemobile } from './mecanica-detalhado-axemobile';
import { TemplateComponent as dentista_criativo_dentia } from './dentista-criativo-dentia';
import { TemplateComponent as dentista_detalhado_prime } from './dentista-detalhado-prime';
import { TemplateComponent as dentista_medicina_medicore } from './dentista-medicina-medicore';
import { TemplateComponent as petshop_completo_petz } from './petshop-completo-petz';
import { TemplateComponent as marido_aluguel_portfolio } from './marido-aluguel-portfolio';
import { TemplateComponent as marido_aluguel_simples_reroof } from './marido-aluguel-simples-reroof';
import { TemplateComponent as servicos_gerais_limpo_erepair } from './servicos-gerais-limpo-erepair';
import { TemplateComponent as fotografia_minimalista_elarisse } from './fotografia-minimalista-elarisse';
import { TemplateComponent as design_minimalista_anglo } from './design-minimalista-anglo';
import { TemplateComponent as portfolio_moderno_jonna } from './portfolio-moderno-jonna';
import { TemplateComponent as portfolio_simples_slider } from './portfolio-simples-slider';

export interface SiteTemplateEntry {
  slug: string;
  name: string;
  niche: string;
  category: string;
  blueprint: TemplateBlueprint;
  component: React.ComponentType<{ data: BusinessSiteData }>;
}

export const SITE_TEMPLATES: Record<string, SiteTemplateEntry> = {

  'tattoo-portfolio-themestarz': {
    slug: 'tattoo-portfolio-themestarz',
    name: "Tattoo Artist — Portfólio Dark Autoral",
    niche: "Tatuagem",
    category: "Tatuagem & Piercing",
    blueprint: {
  "slug": "tattoo-portfolio-themestarz",
  "name": "Tattoo Artist — Portfólio Dark Autoral",
  "niche": "Tatuagem",
  "category": "Tatuagem & Piercing",
  "styleMode": "dark",
  "typography": {
    "headingFont": "Oswald",
    "bodyFont": "Inter"
  },
  "defaultPalette": {
    "primary": "#e11d48",
    "secondary": "#10b981",
    "background": "#09090b",
    "surface": "#18181b",
    "text": "#f4f4f5"
  },
  "heroRatio": "full",
  "features": [
    "Galeria de flashs e artes autorais",
    "Tabela de estilos",
    "Biossegurança ANVISA",
    "Botão WhatsApp direto"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800&auto=format&fit=crop&q=80"
},
    component: tattoo_portfolio_themestarz
  },

  'tattoo-estudio-portfolio-blaxcut': {
    slug: 'tattoo-estudio-portfolio-blaxcut',
    name: "Blaxcut — Estúdio Tattoo & Piercing Portfólio",
    niche: "Tatuagem",
    category: "Tatuagem & Piercing",
    blueprint: {
  "slug": "tattoo-estudio-portfolio-blaxcut",
  "name": "Blaxcut — Estúdio Tattoo & Piercing Portfólio",
  "niche": "Tatuagem",
  "category": "Tatuagem & Piercing",
  "styleMode": "dark",
  "typography": {
    "headingFont": "Playfair Display",
    "bodyFont": "Inter"
  },
  "defaultPalette": {
    "primary": "#f59e0b",
    "secondary": "#10b981",
    "background": "#0c0a09",
    "surface": "#1c1917",
    "text": "#fafaf9"
  },
  "heroRatio": "full",
  "features": [
    "Grade de tatuadores residentes",
    "Catálogo de piercings em titânio",
    "Depoimentos de clientes",
    "Orçamento instantâneo"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=800&auto=format&fit=crop&q=80"
},
    component: tattoo_estudio_portfolio_blaxcut
  },

  'tattoo-estudio-moderno': {
    slug: 'tattoo-estudio-moderno',
    name: "UrbanInk — Estúdio Tattoo Moderno & Street",
    niche: "Tatuagem",
    category: "Tatuagem & Piercing",
    blueprint: {
  "slug": "tattoo-estudio-moderno",
  "name": "UrbanInk — Estúdio Tattoo Moderno & Street",
  "niche": "Tatuagem",
  "category": "Tatuagem & Piercing",
  "styleMode": "dark",
  "typography": {
    "headingFont": "Oswald",
    "bodyFont": "Montserrat"
  },
  "defaultPalette": {
    "primary": "#a855f7",
    "secondary": "#10b981",
    "background": "#09090b",
    "surface": "#18181b",
    "text": "#f4f4f5"
  },
  "heroRatio": "full",
  "features": [
    "Design arrojado street",
    "Cuidados pós-tatuagem",
    "Fotos reais de trabalhos",
    "Atendimento rápido"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&auto=format&fit=crop&q=80"
},
    component: tattoo_estudio_moderno
  },

  'pizzaria-clean-royate': {
    slug: 'pizzaria-clean-royate',
    name: "Royate — Pizzaria Artesanal & Forno a Lenha",
    niche: "Pizzaria",
    category: "Gastronomia, Cafés & Pizzarias",
    blueprint: {
  "slug": "pizzaria-clean-royate",
  "name": "Royate — Pizzaria Artesanal & Forno a Lenha",
  "niche": "Pizzaria",
  "category": "Gastronomia, Cafés & Pizzarias",
  "styleMode": "warm",
  "typography": {
    "headingFont": "Playfair Display",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#dc2626",
    "secondary": "#10b981",
    "background": "#1c1917",
    "surface": "#292524",
    "text": "#fafaf9"
  },
  "heroRatio": "full",
  "features": [
    "Cardápio de pizzas artesanais",
    "Bordas recheadas e sobremesas",
    "Delivery via WhatsApp",
    "Depoimentos reais"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80"
},
    component: pizzaria_clean_royate
  },

  'restaurante-cafe-heritaste': {
    slug: 'restaurante-cafe-heritaste',
    name: "Heritaste — Restaurante & Café Moderno",
    niche: "Gastronomia",
    category: "Gastronomia, Cafés & Pizzarias",
    blueprint: {
  "slug": "restaurante-cafe-heritaste",
  "name": "Heritaste — Restaurante & Café Moderno",
  "niche": "Gastronomia",
  "category": "Gastronomia, Cafés & Pizzarias",
  "styleMode": "warm",
  "typography": {
    "headingFont": "Playfair Display",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#d97706",
    "secondary": "#10b981",
    "background": "#1c1917",
    "surface": "#292524",
    "text": "#fafaf9"
  },
  "heroRatio": "full",
  "features": [
    "Cardápio de pratos e cafés especiais",
    "Ambiente aconchegante",
    "Horário e reservas",
    "Localização privilegiada"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80"
},
    component: restaurante_cafe_heritaste
  },

  'restaurante-cardapio-dbento': {
    slug: 'restaurante-cardapio-dbento',
    name: "DBento — Restaurante Cardápio Digital & Buffet",
    niche: "Gastronomia",
    category: "Gastronomia, Cafés & Pizzarias",
    blueprint: {
  "slug": "restaurante-cardapio-dbento",
  "name": "DBento — Restaurante Cardápio Digital & Buffet",
  "niche": "Gastronomia",
  "category": "Gastronomia, Cafés & Pizzarias",
  "styleMode": "warm",
  "typography": {
    "headingFont": "Montserrat",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#ea580c",
    "secondary": "#10b981",
    "background": "#18181b",
    "surface": "#27272a",
    "text": "#fafaf9"
  },
  "heroRatio": "full",
  "features": [
    "Pratos mais pedidos",
    "Preços transparentes",
    "Visualização fácil no celular",
    "Pedidos diretos no WhatsApp"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80"
},
    component: restaurante_cardapio_dbento
  },

  'restaurante-classico-granny': {
    slug: 'restaurante-classico-granny',
    name: "Granny — Restaurante Tradicional & Cozinha Afetiva",
    niche: "Gastronomia",
    category: "Gastronomia, Cafés & Pizzarias",
    blueprint: {
  "slug": "restaurante-classico-granny",
  "name": "Granny — Restaurante Tradicional & Cozinha Afetiva",
  "niche": "Gastronomia",
  "category": "Gastronomia, Cafés & Pizzarias",
  "styleMode": "warm",
  "typography": {
    "headingFont": "Playfair Display",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#b45309",
    "secondary": "#10b981",
    "background": "#1c1917",
    "surface": "#292524",
    "text": "#fafaf9"
  },
  "heroRatio": "full",
  "features": [
    "Receitas clássicas da casa",
    "Carta de bebidas selecionadas",
    "Galeria de fotos do salão",
    "Reserva de mesas"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80"
},
    component: restaurante_classico_granny
  },

  'restaurante-portfolio-grandrestaurant': {
    slug: 'restaurante-portfolio-grandrestaurant',
    name: "GrandRestaurant — Alta Gastronomia & Experiência",
    niche: "Gastronomia",
    category: "Gastronomia, Cafés & Pizzarias",
    blueprint: {
  "slug": "restaurante-portfolio-grandrestaurant",
  "name": "GrandRestaurant — Alta Gastronomia & Experiência",
  "niche": "Gastronomia",
  "category": "Gastronomia, Cafés & Pizzarias",
  "styleMode": "editorial",
  "typography": {
    "headingFont": "Playfair Display",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#ca8a04",
    "secondary": "#10b981",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text": "#f8fafc"
  },
  "heroRatio": "full",
  "features": [
    "Menu degustação assinado",
    "Iluminação artística dos pratos",
    "Avaliações de clientes",
    "Agendamento de jantares"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80"
},
    component: restaurante_portfolio_grandrestaurant
  },

  'restaurante-elegante-elegencia': {
    slug: 'restaurante-elegante-elegencia',
    name: "Elegancia — Bistrô & Eventos Gastronômicos",
    niche: "Gastronomia",
    category: "Gastronomia, Cafés & Pizzarias",
    blueprint: {
  "slug": "restaurante-elegante-elegencia",
  "name": "Elegancia — Bistrô & Eventos Gastronômicos",
  "niche": "Gastronomia",
  "category": "Gastronomia, Cafés & Pizzarias",
  "styleMode": "editorial",
  "typography": {
    "headingFont": "Playfair Display",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#9333ea",
    "secondary": "#10b981",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text": "#f8fafc"
  },
  "heroRatio": "full",
  "features": [
    "Harmonização de pratos e drinks",
    "Espaço para eventos especiais",
    "Galeria de ambiente",
    "Contato direto no WhatsApp"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80"
},
    component: restaurante_elegante_elegencia
  },

  'coffee-shop-escuro-bruin': {
    slug: 'coffee-shop-escuro-bruin',
    name: "Bruin — Coffee Shop Escuro & Grãos Especiais",
    niche: "Cafeteria",
    category: "Gastronomia, Cafés & Pizzarias",
    blueprint: {
  "slug": "coffee-shop-escuro-bruin",
  "name": "Bruin — Coffee Shop Escuro & Grãos Especiais",
  "niche": "Cafeteria",
  "category": "Gastronomia, Cafés & Pizzarias",
  "styleMode": "warm",
  "typography": {
    "headingFont": "Oswald",
    "bodyFont": "Inter"
  },
  "defaultPalette": {
    "primary": "#78350f",
    "secondary": "#10b981",
    "background": "#1c1917",
    "surface": "#292524",
    "text": "#fafaf9"
  },
  "heroRatio": "full",
  "features": [
    "Grãos selecionados e métodos especiais",
    "Cardápio de cafés e doces",
    "Espaço aconchegante",
    "Atendimento para viagem e balcão"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80"
},
    component: coffee_shop_escuro_bruin
  },

  'coffee-shop-moderno-max': {
    slug: 'coffee-shop-moderno-max',
    name: "MaxCoffee — Cafeteria & Coworking Moderno",
    niche: "Cafeteria",
    category: "Gastronomia, Cafés & Pizzarias",
    blueprint: {
  "slug": "coffee-shop-moderno-max",
  "name": "MaxCoffee — Cafeteria & Coworking Moderno",
  "niche": "Cafeteria",
  "category": "Gastronomia, Cafés & Pizzarias",
  "styleMode": "light",
  "typography": {
    "headingFont": "Montserrat",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#059669",
    "secondary": "#10b981",
    "background": "#f8fafc",
    "surface": "#ffffff",
    "text": "#0f172a"
  },
  "heroRatio": "full",
  "features": [
    "Cafés especiais e lattes gelados",
    "Ambiente para reuniões",
    "Opções saudáveis e doces",
    "Faça seu pedido no WhatsApp"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80"
},
    component: coffee_shop_moderno_max
  },

  'coffee-estilo-barista': {
    slug: 'coffee-estilo-barista',
    name: "Barista — Boutique de Café & Confeitaria",
    niche: "Cafeteria",
    category: "Gastronomia, Cafés & Pizzarias",
    blueprint: {
  "slug": "coffee-estilo-barista",
  "name": "Barista — Boutique de Café & Confeitaria",
  "niche": "Cafeteria",
  "category": "Gastronomia, Cafés & Pizzarias",
  "styleMode": "warm",
  "typography": {
    "headingFont": "Playfair Display",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#d97706",
    "secondary": "#10b981",
    "background": "#1c1917",
    "surface": "#292524",
    "text": "#fafaf9"
  },
  "heroRatio": "full",
  "features": [
    "Latte art e experiências personalizadas",
    "Croissants e confeitaria fina",
    "Galeria de fotos do salão",
    "Pedidos antecipados"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80"
},
    component: coffee_estilo_barista
  },

  'estetica-completo-spa': {
    slug: 'estetica-completo-spa',
    name: "Lumina — Clínica de Estética & Harmonização Completa",
    niche: "Estética",
    category: "Estética & Saúde",
    blueprint: {
  "slug": "estetica-completo-spa",
  "name": "Lumina — Clínica de Estética & Harmonização Completa",
  "niche": "Estética",
  "category": "Estética & Saúde",
  "styleMode": "light",
  "typography": {
    "headingFont": "Plus Jakarta Sans",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#db2777",
    "secondary": "#10b981",
    "background": "#fdf2f8",
    "surface": "#ffffff",
    "text": "#0f172a"
  },
  "heroRatio": "full",
  "features": [
    "Procedimentos faciais e corporais",
    "Avaliação estética personalizada",
    "Corpo clínico qualificado",
    "Agendamento imediato"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80"
},
    component: estetica_completo_spa
  },

  'estetica-elegante-minimalista': {
    slug: 'estetica-elegante-minimalista',
    name: "AuraGlow — Estética Integrativa & Spa Facial",
    niche: "Estética",
    category: "Estética & Saúde",
    blueprint: {
  "slug": "estetica-elegante-minimalista",
  "name": "AuraGlow — Estética Integrativa & Spa Facial",
  "niche": "Estética",
  "category": "Estética & Saúde",
  "styleMode": "light",
  "typography": {
    "headingFont": "Plus Jakarta Sans",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#ec4899",
    "secondary": "#10b981",
    "background": "#f8fafc",
    "surface": "#ffffff",
    "text": "#0f172a"
  },
  "heroRatio": "full",
  "features": [
    "Protocolos faciais exclusivos",
    "Ambiente relaxante com aromaterapia",
    "Produtos dermatológicos selecionados",
    "Avaliação com hora marcada"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80"
},
    component: estetica_elegante_minimalista
  },

  'estetica-simples-paradise': {
    slug: 'estetica-simples-paradise',
    name: "Paradise — Centro de Beleza & Estética Express",
    niche: "Estética",
    category: "Estética & Saúde",
    blueprint: {
  "slug": "estetica-simples-paradise",
  "name": "Paradise — Centro de Beleza & Estética Express",
  "niche": "Estética",
  "category": "Estética & Saúde",
  "styleMode": "light",
  "typography": {
    "headingFont": "Plus Jakarta Sans",
    "bodyFont": "Inter"
  },
  "defaultPalette": {
    "primary": "#f43f5e",
    "secondary": "#10b981",
    "background": "#ffffff",
    "surface": "#f8fafc",
    "text": "#0f172a"
  },
  "heroRatio": "full",
  "features": [
    "Design de sobrancelhas e estética rápida",
    "Preços acessíveis e pacotes",
    "Atendimento sem burocracia",
    "Agendamento direto"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80"
},
    component: estetica_simples_paradise
  },

  'estetica-detalhado-sparelax': {
    slug: 'estetica-detalhado-sparelax',
    name: "SpaRelax — Clínica de Estética Médica & Tratamentos",
    niche: "Estética",
    category: "Estética & Saúde",
    blueprint: {
  "slug": "estetica-detalhado-sparelax",
  "name": "SpaRelax — Clínica de Estética Médica & Tratamentos",
  "niche": "Estética",
  "category": "Estética & Saúde",
  "styleMode": "light",
  "typography": {
    "headingFont": "Plus Jakarta Sans",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#be185d",
    "secondary": "#10b981",
    "background": "#f8fafc",
    "surface": "#ffffff",
    "text": "#0f172a"
  },
  "heroRatio": "full",
  "features": [
    "Tecnologia certificada",
    "Tratamentos de contorno corporal",
    "Avaliações de pacientes",
    "Agendamento imediato"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80"
},
    component: estetica_detalhado_sparelax
  },

  'dermato-clean-skincare': {
    slug: 'dermato-clean-skincare',
    name: "DermatoClean — Dermatologia & Tricologia Clínica",
    niche: "Dermatologia",
    category: "Estética & Saúde",
    blueprint: {
  "slug": "dermato-clean-skincare",
  "name": "DermatoClean — Dermatologia & Tricologia Clínica",
  "niche": "Dermatologia",
  "category": "Estética & Saúde",
  "styleMode": "light",
  "typography": {
    "headingFont": "Plus Jakarta Sans",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#0284c7",
    "secondary": "#10b981",
    "background": "#f8fafc",
    "surface": "#ffffff",
    "text": "#0f172a"
  },
  "heroRatio": "full",
  "features": [
    "Consulta com especialista",
    "Tratamento de manchas e acne",
    "Tricologia capilar",
    "Atendimento com hora marcada"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80"
},
    component: dermato_clean_skincare
  },

  'maquiadora-portfolio-makeup': {
    slug: 'maquiadora-portfolio-makeup',
    name: "GlowGlam — Maquiagem Profissional & Noivas",
    niche: "Maquiagem",
    category: "Estética & Beleza",
    blueprint: {
  "slug": "maquiadora-portfolio-makeup",
  "name": "GlowGlam — Maquiagem Profissional & Noivas",
  "niche": "Maquiagem",
  "category": "Estética & Beleza",
  "styleMode": "editorial",
  "typography": {
    "headingFont": "Playfair Display",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#e11d48",
    "secondary": "#10b981",
    "background": "#09090b",
    "surface": "#18181b",
    "text": "#f4f4f5"
  },
  "heroRatio": "full",
  "features": [
    "Pacotes para noivas e formandas",
    "Galeria de fotos em alta definição",
    "Produtos de alta durabilidade",
    "Orçamentos rápidos"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80"
},
    component: maquiadora_portfolio_makeup
  },

  'massagista-portfolio-victoria': {
    slug: 'massagista-portfolio-victoria',
    name: "Victoria Spa — Massoterapia & Terapias Holísticas",
    niche: "Massagem",
    category: "Estética & Saúde",
    blueprint: {
  "slug": "massagista-portfolio-victoria",
  "name": "Victoria Spa — Massoterapia & Terapias Holísticas",
  "niche": "Massagem",
  "category": "Estética & Saúde",
  "styleMode": "warm",
  "typography": {
    "headingFont": "Playfair Display",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#0d9488",
    "secondary": "#10b981",
    "background": "#1c1917",
    "surface": "#292524",
    "text": "#fafaf9"
  },
  "heroRatio": "full",
  "features": [
    "Sessões relaxantes e terapêuticas",
    "Alívio de dores musculares",
    "Ambiente climatizado e aconchegante",
    "Agende seu horário relaxante"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80"
},
    component: massagista_portfolio_victoria
  },

  'massagista-clean-beauta': {
    slug: 'massagista-clean-beauta',
    name: "Beauta — Massagem Estética & Drenagem Modeladora",
    niche: "Massagem",
    category: "Estética & Saúde",
    blueprint: {
  "slug": "massagista-clean-beauta",
  "name": "Beauta — Massagem Estética & Drenagem Modeladora",
  "niche": "Massagem",
  "category": "Estética & Saúde",
  "styleMode": "light",
  "typography": {
    "headingFont": "Plus Jakarta Sans",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#10b981",
    "secondary": "#10b981",
    "background": "#f8fafc",
    "surface": "#ffffff",
    "text": "#0f172a"
  },
  "heroRatio": "full",
  "features": [
    "Drenagem linfática especializada",
    "Massagem modeladora eficaz",
    "Planos de sessões",
    "Agendamento rápido"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80"
},
    component: massagista_clean_beauta
  },

  'academia-crossfit-fitmax': {
    slug: 'academia-crossfit-fitmax',
    name: "FitMax — Academia, Musculação & Box de Crossfit",
    niche: "Academia",
    category: "Academias & Esportes",
    blueprint: {
  "slug": "academia-crossfit-fitmax",
  "name": "FitMax — Academia, Musculação & Box de Crossfit",
  "niche": "Academia",
  "category": "Academias & Esportes",
  "styleMode": "energetic",
  "typography": {
    "headingFont": "Oswald",
    "bodyFont": "Montserrat"
  },
  "defaultPalette": {
    "primary": "#eab308",
    "secondary": "#10b981",
    "background": "#111827",
    "surface": "#1f2937",
    "text": "#f9fafb"
  },
  "heroRatio": "full",
  "features": [
    "Quadro de horários e modalidades",
    "Aparelhos modernos",
    "Professores dedicados",
    "Aula experimental grátis"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80"
},
    component: academia_crossfit_fitmax
  },

  'personal-gym-progym': {
    slug: 'personal-gym-progym',
    name: "ProGym — Personal Trainer & Assessoria Fitness",
    niche: "Personal Trainer",
    category: "Academias & Esportes",
    blueprint: {
  "slug": "personal-gym-progym",
  "name": "ProGym — Personal Trainer & Assessoria Fitness",
  "niche": "Personal Trainer",
  "category": "Academias & Esportes",
  "styleMode": "energetic",
  "typography": {
    "headingFont": "Oswald",
    "bodyFont": "Montserrat"
  },
  "defaultPalette": {
    "primary": "#ef4444",
    "secondary": "#10b981",
    "background": "#111827",
    "surface": "#1f2937",
    "text": "#f9fafb"
  },
  "heroRatio": "full",
  "features": [
    "Treinos individualizados",
    "Avaliação física e postural",
    "Resultados comprovados",
    "Solicite orçamento no WhatsApp"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80"
},
    component: personal_gym_progym
  },

  'personal-claro-moderno': {
    slug: 'personal-claro-moderno',
    name: "VitalFit — Personal Trainer & Saúde Funcional",
    niche: "Personal Trainer",
    category: "Academias & Esportes",
    blueprint: {
  "slug": "personal-claro-moderno",
  "name": "VitalFit — Personal Trainer & Saúde Funcional",
  "niche": "Personal Trainer",
  "category": "Academias & Esportes",
  "styleMode": "light",
  "typography": {
    "headingFont": "Montserrat",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#0284c7",
    "secondary": "#10b981",
    "background": "#f8fafc",
    "surface": "#ffffff",
    "text": "#0f172a"
  },
  "heroRatio": "full",
  "features": [
    "Treinos funcionais personalizados",
    "Foco em saúde e mobilidade",
    "Planos sob medida",
    "Atendimento presencial e online"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80"
},
    component: personal_claro_moderno
  },

  'personal-moderno-energetico': {
    slug: 'personal-moderno-energetico',
    name: "PowerIron — Personal de Alta Performance",
    niche: "Personal Trainer",
    category: "Academias & Esportes",
    blueprint: {
  "slug": "personal-moderno-energetico",
  "name": "PowerIron — Personal de Alta Performance",
  "niche": "Personal Trainer",
  "category": "Academias & Esportes",
  "styleMode": "energetic",
  "typography": {
    "headingFont": "Oswald",
    "bodyFont": "Montserrat"
  },
  "defaultPalette": {
    "primary": "#f97316",
    "secondary": "#10b981",
    "background": "#111827",
    "surface": "#1f2937",
    "text": "#f9fafb"
  },
  "heroRatio": "full",
  "features": [
    "Preparação física específica",
    "Metodologia de alto rendimento",
    "Alunos transformados",
    "Consultoria rápida"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80"
},
    component: personal_moderno_energetico
  },

  'luta-moderno-sword': {
    slug: 'luta-moderno-sword',
    name: "SwordFight — Centro de Treinamento de Lutas & MMA",
    niche: "Lutas & Artes Marciais",
    category: "Academias & Esportes",
    blueprint: {
  "slug": "luta-moderno-sword",
  "name": "SwordFight — Centro de Treinamento de Lutas & MMA",
  "niche": "Lutas & Artes Marciais",
  "category": "Academias & Esportes",
  "styleMode": "energetic",
  "typography": {
    "headingFont": "Oswald",
    "bodyFont": "Montserrat"
  },
  "defaultPalette": {
    "primary": "#dc2626",
    "secondary": "#10b981",
    "background": "#111827",
    "surface": "#1f2937",
    "text": "#f9fafb"
  },
  "heroRatio": "full",
  "features": [
    "Aulas para adultos e kids",
    "Tatame oficial espaçoso",
    "Professores certificados",
    "Aula experimental gratuita"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80"
},
    component: luta_moderno_sword
  },

  'luta-completa-martialarts': {
    slug: 'luta-completa-martialarts',
    name: "DojoMaster — Academia de Jiu-Jitsu & Judô",
    niche: "Lutas & Artes Marciais",
    category: "Academias & Esportes",
    blueprint: {
  "slug": "luta-completa-martialarts",
  "name": "DojoMaster — Academia de Jiu-Jitsu & Judô",
  "niche": "Lutas & Artes Marciais",
  "category": "Academias & Esportes",
  "styleMode": "dark",
  "typography": {
    "headingFont": "Oswald",
    "bodyFont": "Inter"
  },
  "defaultPalette": {
    "primary": "#1e3a8a",
    "secondary": "#10b981",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text": "#f8fafc"
  },
  "heroRatio": "full",
  "features": [
    "Filosofia marcial e disciplina",
    "Turmas femininas e infantil",
    "Acompanhamento graduado",
    "Conheça nosso dojo"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80"
},
    component: luta_completa_martialarts
  },

  'yoga-completo-yogana': {
    slug: 'yoga-completo-yogana',
    name: "Yogana — Espaço de Yoga, Meditação & Mindfulness",
    niche: "Yoga & Meditação",
    category: "Academias & Esportes",
    blueprint: {
  "slug": "yoga-completo-yogana",
  "name": "Yogana — Espaço de Yoga, Meditação & Mindfulness",
  "niche": "Yoga & Meditação",
  "category": "Academias & Esportes",
  "styleMode": "warm",
  "typography": {
    "headingFont": "Playfair Display",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#059669",
    "secondary": "#10b981",
    "background": "#1c1917",
    "surface": "#292524",
    "text": "#fafaf9"
  },
  "heroRatio": "full",
  "features": [
    "Aulas guiadas com mestres",
    "Ambiente silencioso e relaxante",
    "Práticas matinais e noturnas",
    "Planos mensais acessíveis"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80"
},
    component: yoga_completo_yogana
  },

  'yoga-fitness-exclusivo': {
    slug: 'yoga-fitness-exclusivo',
    name: "ZenFit — Yoga Funcional & Pilates Solo",
    niche: "Yoga & Pilates",
    category: "Academias & Esportes",
    blueprint: {
  "slug": "yoga-fitness-exclusivo",
  "name": "ZenFit — Yoga Funcional & Pilates Solo",
  "niche": "Yoga & Pilates",
  "category": "Academias & Esportes",
  "styleMode": "light",
  "typography": {
    "headingFont": "Plus Jakarta Sans",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#0ea5e9",
    "secondary": "#10b981",
    "background": "#f8fafc",
    "surface": "#ffffff",
    "text": "#0f172a"
  },
  "heroRatio": "full",
  "features": [
    "Fortalecimento e postura",
    "Turmas reduzidas",
    "Ambiente acolhedor",
    "Agende aula experimental"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80"
},
    component: yoga_fitness_exclusivo
  },

  'yoga-agendamento-yogazone': {
    slug: 'yoga-agendamento-yogazone',
    name: "YogaZone — Estúdio de Yoga com Agendamento Fácil",
    niche: "Yoga",
    category: "Academias & Esportes",
    blueprint: {
  "slug": "yoga-agendamento-yogazone",
  "name": "YogaZone — Estúdio de Yoga com Agendamento Fácil",
  "niche": "Yoga",
  "category": "Academias & Esportes",
  "styleMode": "light",
  "typography": {
    "headingFont": "Plus Jakarta Sans",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#14b8a6",
    "secondary": "#10b981",
    "background": "#f8fafc",
    "surface": "#ffffff",
    "text": "#0f172a"
  },
  "heroRatio": "full",
  "features": [
    "Grade de horários semanal",
    "Planos flexíveis",
    "Materiais inclusos no estúdio",
    "Reserve sua vaga agora"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80"
},
    component: yoga_agendamento_yogazone
  },

  'yoga-moderno-clean-yogava': {
    slug: 'yoga-moderno-clean-yogava',
    name: "Yogava — Studio Clean de Yoga & Respiração",
    niche: "Yoga",
    category: "Academias & Esportes",
    blueprint: {
  "slug": "yoga-moderno-clean-yogava",
  "name": "Yogava — Studio Clean de Yoga & Respiração",
  "niche": "Yoga",
  "category": "Academias & Esportes",
  "styleMode": "light",
  "typography": {
    "headingFont": "Plus Jakarta Sans",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#10b981",
    "secondary": "#10b981",
    "background": "#ffffff",
    "surface": "#f8fafc",
    "text": "#0f172a"
  },
  "heroRatio": "full",
  "features": [
    "Práticas antiestresse",
    "Meditação para iniciantes",
    "Comunidade acolhedora",
    "Fale conosco no WhatsApp"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80"
},
    component: yoga_moderno_clean_yogava
  },

  'loja-suplementos-purefit': {
    slug: 'loja-suplementos-purefit',
    name: "PureFit — Suplementos Nutricionais & Vitaminas",
    niche: "Suplementos",
    category: "Academias & Esportes",
    blueprint: {
  "slug": "loja-suplementos-purefit",
  "name": "PureFit — Suplementos Nutricionais & Vitaminas",
  "niche": "Suplementos",
  "category": "Academias & Esportes",
  "styleMode": "dark",
  "typography": {
    "headingFont": "Oswald",
    "bodyFont": "Montserrat"
  },
  "defaultPalette": {
    "primary": "#f59e0b",
    "secondary": "#10b981",
    "background": "#111827",
    "surface": "#1f2937",
    "text": "#f9fafb"
  },
  "heroRatio": "full",
  "features": [
    "Marcas de confiança com laudo",
    "Combos de massa e definição",
    "Consultoria pelo WhatsApp",
    "Entrega no mesmo dia"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800&auto=format&fit=crop&q=80"
},
    component: loja_suplementos_purefit
  },

  'arquitetura-elegante-tecture': {
    slug: 'arquitetura-elegante-tecture',
    name: "Tecture — Arquitetura de Alto Padrão & Construção",
    niche: "Arquitetura",
    category: "Arquitetura & Construção",
    blueprint: {
  "slug": "arquitetura-elegante-tecture",
  "name": "Tecture — Arquitetura de Alto Padrão & Construção",
  "niche": "Arquitetura",
  "category": "Arquitetura & Construção",
  "styleMode": "editorial",
  "typography": {
    "headingFont": "Playfair Display",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#c59a63",
    "secondary": "#10b981",
    "background": "#09090b",
    "surface": "#18181b",
    "text": "#f4f4f5"
  },
  "heroRatio": "full",
  "features": [
    "Projetos residenciais modernos",
    "Renderizações 3D realistas",
    "Acompanhamento de obras",
    "Solicite estudo preliminar"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80"
},
    component: arquitetura_elegante_tecture
  },

  'arquitetura-portfolio-moderno': {
    slug: 'arquitetura-portfolio-moderno',
    name: "ArchStudio — Portfólio de Projetos & Obras",
    niche: "Arquitetura",
    category: "Arquitetura & Construção",
    blueprint: {
  "slug": "arquitetura-portfolio-moderno",
  "name": "ArchStudio — Portfólio de Projetos & Obras",
  "niche": "Arquitetura",
  "category": "Arquitetura & Construção",
  "styleMode": "minimalist",
  "typography": {
    "headingFont": "Montserrat",
    "bodyFont": "Inter"
  },
  "defaultPalette": {
    "primary": "#2563eb",
    "secondary": "#10b981",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text": "#f8fafc"
  },
  "heroRatio": "full",
  "features": [
    "Projetos comerciais e clínicas",
    "Soluções de iluminação e conforto",
    "Equipe multidisciplinar",
    "Agende uma reunião"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80"
},
    component: arquitetura_portfolio_moderno
  },

  'arquiteto-detalhado-shelder': {
    slug: 'arquiteto-detalhado-shelder',
    name: "Shelder — Escritório de Arquitetura & Interiores",
    niche: "Arquitetura",
    category: "Arquitetura & Construção",
    blueprint: {
  "slug": "arquiteto-detalhado-shelder",
  "name": "Shelder — Escritório de Arquitetura & Interiores",
  "niche": "Arquitetura",
  "category": "Arquitetura & Construção",
  "styleMode": "editorial",
  "typography": {
    "headingFont": "Playfair Display",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#d97706",
    "secondary": "#10b981",
    "background": "#1c1917",
    "surface": "#292524",
    "text": "#fafaf9"
  },
  "heroRatio": "full",
  "features": [
    "Cronograma transparente",
    "Detalhamento de marcenaria",
    "Acompanhamento rigoroso",
    "Fale com o arquiteto"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80"
},
    component: arquiteto_detalhado_shelder
  },

  'design-interiores-fauxis': {
    slug: 'design-interiores-fauxis',
    name: "Fauxis — Design de Interiores & Decoração Minimalista",
    niche: "Design de Interiores",
    category: "Arquitetura & Construção",
    blueprint: {
  "slug": "design-interiores-fauxis",
  "name": "Fauxis — Design de Interiores & Decoração Minimalista",
  "niche": "Design de Interiores",
  "category": "Arquitetura & Construção",
  "styleMode": "light",
  "typography": {
    "headingFont": "Plus Jakarta Sans",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#14b8a6",
    "secondary": "#10b981",
    "background": "#f8fafc",
    "surface": "#ffffff",
    "text": "#0f172a"
  },
  "heroRatio": "full",
  "features": [
    "Paleta de cores acolhedora",
    "Moodboards e lista de compras",
    "Decoração sob medida",
    "Consultoria express de interiores"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80"
},
    component: design_interiores_fauxis
  },

  'mecanica-completo-audeck': {
    slug: 'mecanica-completo-audeck',
    name: "AuDeck — Centro Automotivo & Oficina Mecânica",
    niche: "Mecânica",
    category: "Mecânica & Automotivo",
    blueprint: {
  "slug": "mecanica-completo-audeck",
  "name": "AuDeck — Centro Automotivo & Oficina Mecânica",
  "niche": "Mecânica",
  "category": "Mecânica & Automotivo",
  "styleMode": "dark",
  "typography": {
    "headingFont": "Oswald",
    "bodyFont": "Montserrat"
  },
  "defaultPalette": {
    "primary": "#dc2626",
    "secondary": "#10b981",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text": "#f8fafc"
  },
  "heroRatio": "full",
  "features": [
    "Scanner eletrônico de última geração",
    "Troca de óleo e fluidos com garantia",
    "Alinhamento 3D e balanceamento",
    "Orçamento detalhado no WhatsApp"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80"
},
    component: mecanica_completo_audeck
  },

  'mecanica-portfolio-automec': {
    slug: 'mecanica-portfolio-automec',
    name: "AutoMec — Mecânica Geral, Câmbio & Motor",
    niche: "Mecânica",
    category: "Mecânica & Automotivo",
    blueprint: {
  "slug": "mecanica-portfolio-automec",
  "name": "AutoMec — Mecânica Geral, Câmbio & Motor",
  "niche": "Mecânica",
  "category": "Mecânica & Automotivo",
  "styleMode": "dark",
  "typography": {
    "headingFont": "Oswald",
    "bodyFont": "Inter"
  },
  "defaultPalette": {
    "primary": "#f97316",
    "secondary": "#10b981",
    "background": "#09090b",
    "surface": "#18181b",
    "text": "#f4f4f5"
  },
  "heroRatio": "full",
  "features": [
    "Especialistas em câmbio e motor",
    "Peças originais de reposição",
    "Garantia formal de serviços",
    "Agende sua revisão"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80"
},
    component: mecanica_portfolio_automec
  },

  'mecanica-simples-cardinal': {
    slug: 'mecanica-simples-cardinal',
    name: "Cardinal — Oficina Rápida & Auto Center",
    niche: "Mecânica",
    category: "Mecânica & Automotivo",
    blueprint: {
  "slug": "mecanica-simples-cardinal",
  "name": "Cardinal — Oficina Rápida & Auto Center",
  "niche": "Mecânica",
  "category": "Mecânica & Automotivo",
  "styleMode": "dark",
  "typography": {
    "headingFont": "Montserrat",
    "bodyFont": "Inter"
  },
  "defaultPalette": {
    "primary": "#2563eb",
    "secondary": "#10b981",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text": "#f8fafc"
  },
  "heroRatio": "full",
  "features": [
    "Troca de bateria com teste de carga",
    "Higienização de ar condicionado",
    "Preço transparente",
    "Fale agora com o mecânico"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80"
},
    component: mecanica_simples_cardinal
  },

  'mecanica-detalhado-axemobile': {
    slug: 'mecanica-detalhado-axemobile',
    name: "AxeMobile — Manutenção Automotiva & Elétrica",
    niche: "Mecânica",
    category: "Mecânica & Automotivo",
    blueprint: {
  "slug": "mecanica-detalhado-axemobile",
  "name": "AxeMobile — Manutenção Automotiva & Elétrica",
  "niche": "Mecânica",
  "category": "Mecânica & Automotivo",
  "styleMode": "dark",
  "typography": {
    "headingFont": "Oswald",
    "bodyFont": "Montserrat"
  },
  "defaultPalette": {
    "primary": "#eab308",
    "secondary": "#10b981",
    "background": "#111827",
    "surface": "#1f2937",
    "text": "#f9fafb"
  },
  "heroRatio": "full",
  "features": [
    "Especialistas em elétrica e injeção",
    "Limpeza de bicos e sistema de combustível",
    "Mão de obra capacitada",
    "Sala de espera climatizada"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80"
},
    component: mecanica_detalhado_axemobile
  },

  'dentista-criativo-dentia': {
    slug: 'dentista-criativo-dentia',
    name: "Dentia — Odontologia Estética, Lentes & Harmonização",
    niche: "Odontologia",
    category: "Odontologia & Saúde",
    blueprint: {
  "slug": "dentista-criativo-dentia",
  "name": "Dentia — Odontologia Estética, Lentes & Harmonização",
  "niche": "Odontologia",
  "category": "Odontologia & Saúde",
  "styleMode": "light",
  "typography": {
    "headingFont": "Plus Jakarta Sans",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#0284c7",
    "secondary": "#10b981",
    "background": "#f8fafc",
    "surface": "#ffffff",
    "text": "#0f172a"
  },
  "heroRatio": "full",
  "features": [
    "Planejamento digital do sorriso",
    "Lentes de porcelana ultrafina",
    "Clareamento seguro e sem dor",
    "Avaliação personalizada"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80"
},
    component: dentista_criativo_dentia
  },

  'dentista-detalhado-prime': {
    slug: 'dentista-detalhado-prime',
    name: "PrimeDental — Clínica Odontológica Integrada & Implantes",
    niche: "Odontologia",
    category: "Odontologia & Saúde",
    blueprint: {
  "slug": "dentista-detalhado-prime",
  "name": "PrimeDental — Clínica Odontológica Integrada & Implantes",
  "niche": "Odontologia",
  "category": "Odontologia & Saúde",
  "styleMode": "light",
  "typography": {
    "headingFont": "Plus Jakarta Sans",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#0d9488",
    "secondary": "#10b981",
    "background": "#f8fafc",
    "surface": "#ffffff",
    "text": "#0f172a"
  },
  "heroRatio": "full",
  "features": [
    "Implantes com tecnologia guiada",
    "Alinhadores transparentes",
    "Ambiente confortável",
    "Agende sua avaliação"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80"
},
    component: dentista_detalhado_prime
  },

  'dentista-medicina-medicore': {
    slug: 'dentista-medicina-medicore',
    name: "MediCore — Centro Médico & Odontologia Geral",
    niche: "Saúde & Medicina",
    category: "Odontologia & Saúde",
    blueprint: {
  "slug": "dentista-medicina-medicore",
  "name": "MediCore — Centro Médico & Odontologia Geral",
  "niche": "Saúde & Medicina",
  "category": "Odontologia & Saúde",
  "styleMode": "light",
  "typography": {
    "headingFont": "Plus Jakarta Sans",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#2563eb",
    "secondary": "#10b981",
    "background": "#f8fafc",
    "surface": "#ffffff",
    "text": "#0f172a"
  },
  "heroRatio": "full",
  "features": [
    "Consultas humanizadas e pontuais",
    "Estrutura moderna e esterilizada",
    "Atendimento para toda família",
    "Fácil acesso na cidade"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80"
},
    component: dentista_medicina_medicore
  },

  'petshop-completo-petz': {
    slug: 'petshop-completo-petz',
    name: "Petz Care — Banho, Tosa, Veterinária & Acessórios",
    niche: "Pet Shop",
    category: "Pet Shop",
    blueprint: {
  "slug": "petshop-completo-petz",
  "name": "Petz Care — Banho, Tosa, Veterinária & Acessórios",
  "niche": "Pet Shop",
  "category": "Pet Shop",
  "styleMode": "warm",
  "typography": {
    "headingFont": "Montserrat",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#f97316",
    "secondary": "#10b981",
    "background": "#fdf4ff",
    "surface": "#ffffff",
    "text": "#0f172a"
  },
  "heroRatio": "full",
  "features": [
    "Banho e tosa climatizados",
    "Produtos hipoalergênicos",
    "Consultas veterinárias",
    "Agendamento no WhatsApp"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop&q=80"
},
    component: petshop_completo_petz
  },

  'marido-aluguel-portfolio': {
    slug: 'marido-aluguel-portfolio',
    name: "FazTudo — Marido de Aluguel & Reparos Rápidos",
    niche: "Serviços Gerais",
    category: "Serviços Gerais",
    blueprint: {
  "slug": "marido-aluguel-portfolio",
  "name": "FazTudo — Marido de Aluguel & Reparos Rápidos",
  "niche": "Serviços Gerais",
  "category": "Serviços Gerais",
  "styleMode": "dark",
  "typography": {
    "headingFont": "Oswald",
    "bodyFont": "Montserrat"
  },
  "defaultPalette": {
    "primary": "#eab308",
    "secondary": "#10b981",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text": "#f8fafc"
  },
  "heroRatio": "full",
  "features": [
    "Instalação de tomadas e luminárias",
    "Conserto de vazamentos",
    "Montagem de móveis",
    "Orçamento rápido sem compromisso"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80"
},
    component: marido_aluguel_portfolio
  },

  'marido-aluguel-simples-reroof': {
    slug: 'marido-aluguel-simples-reroof',
    name: "FixMaster — Manutenção Residencial Express",
    niche: "Serviços Gerais",
    category: "Serviços Gerais",
    blueprint: {
  "slug": "marido-aluguel-simples-reroof",
  "name": "FixMaster — Manutenção Residencial Express",
  "niche": "Serviços Gerais",
  "category": "Serviços Gerais",
  "styleMode": "dark",
  "typography": {
    "headingFont": "Montserrat",
    "bodyFont": "Inter"
  },
  "defaultPalette": {
    "primary": "#2563eb",
    "secondary": "#10b981",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text": "#f8fafc"
  },
  "heroRatio": "full",
  "features": [
    "Pontualidade e ferramentas próprias",
    "Limpeza do local após o serviço",
    "Preço combinado previamente",
    "Chame pelo WhatsApp agora"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80"
},
    component: marido_aluguel_simples_reroof
  },

  'servicos-gerais-limpo-erepair': {
    slug: 'servicos-gerais-limpo-erepair',
    name: "ERepair — Serviços Gerais, Reformas & Pinturas",
    niche: "Serviços Gerais",
    category: "Serviços Gerais",
    blueprint: {
  "slug": "servicos-gerais-limpo-erepair",
  "name": "ERepair — Serviços Gerais, Reformas & Pinturas",
  "niche": "Serviços Gerais",
  "category": "Serviços Gerais",
  "styleMode": "light",
  "typography": {
    "headingFont": "Montserrat",
    "bodyFont": "Inter"
  },
  "defaultPalette": {
    "primary": "#10b981",
    "secondary": "#10b981",
    "background": "#f8fafc",
    "surface": "#ffffff",
    "text": "#0f172a"
  },
  "heroRatio": "full",
  "features": [
    "Equipe especializada",
    "Garantia de acabamento",
    "Materiais certificados",
    "Solicite visita técnica"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80"
},
    component: servicos_gerais_limpo_erepair
  },

  'fotografia-minimalista-elarisse': {
    slug: 'fotografia-minimalista-elarisse',
    name: "Elarisse — Fotografia Autoral, Ensaios & Eventos",
    niche: "Fotografia",
    category: "Portfólio & Criativos",
    blueprint: {
  "slug": "fotografia-minimalista-elarisse",
  "name": "Elarisse — Fotografia Autoral, Ensaios & Eventos",
  "niche": "Fotografia",
  "category": "Portfólio & Criativos",
  "styleMode": "minimalist",
  "typography": {
    "headingFont": "Playfair Display",
    "bodyFont": "Plus Jakarta Sans"
  },
  "defaultPalette": {
    "primary": "#c59a63",
    "secondary": "#10b981",
    "background": "#09090b",
    "surface": "#18181b",
    "text": "#f4f4f5"
  },
  "heroRatio": "full",
  "features": [
    "Ensaios externos e em estúdio",
    "Tratamento de cor profissional",
    "Posicionamento de imagem",
    "Consulte pacotes disponíveis"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"
},
    component: fotografia_minimalista_elarisse
  },

  'design-minimalista-anglo': {
    slug: 'design-minimalista-anglo',
    name: "Anglo — Estúdio de Design, Branding & Identidade",
    niche: "Design & Branding",
    category: "Portfólio & Criativos",
    blueprint: {
  "slug": "design-minimalista-anglo",
  "name": "Anglo — Estúdio de Design, Branding & Identidade",
  "niche": "Design & Branding",
  "category": "Portfólio & Criativos",
  "styleMode": "minimalist",
  "typography": {
    "headingFont": "Montserrat",
    "bodyFont": "Inter"
  },
  "defaultPalette": {
    "primary": "#3b82f6",
    "secondary": "#10b981",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text": "#f8fafc"
  },
  "heroRatio": "full",
  "features": [
    "Identidade visual estratégica",
    "Logotipos exclusivos",
    "Apresentação de cases",
    "Solicite uma proposta"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80"
},
    component: design_minimalista_anglo
  },

  'portfolio-moderno-jonna': {
    slug: 'portfolio-moderno-jonna',
    name: "Jonna — Portfólio Criativo & Profissional Autônomo",
    niche: "Portfólio",
    category: "Portfólio & Criativos",
    blueprint: {
  "slug": "portfolio-moderno-jonna",
  "name": "Jonna — Portfólio Criativo & Profissional Autônomo",
  "niche": "Portfólio",
  "category": "Portfólio & Criativos",
  "styleMode": "minimalist",
  "typography": {
    "headingFont": "Montserrat",
    "bodyFont": "Inter"
  },
  "defaultPalette": {
    "primary": "#8b5cf6",
    "secondary": "#10b981",
    "background": "#09090b",
    "surface": "#18181b",
    "text": "#f4f4f5"
  },
  "heroRatio": "full",
  "features": [
    "Biografia profissional",
    "Galeria de projetos concluídos",
    "Depoimentos de clientes",
    "Contato direto no WhatsApp"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80"
},
    component: portfolio_moderno_jonna
  },

  'portfolio-simples-slider': {
    slug: 'portfolio-simples-slider',
    name: "SliderStudio — Portfólio Limpo com Slideshow",
    niche: "Portfólio",
    category: "Portfólio & Criativos",
    blueprint: {
  "slug": "portfolio-simples-slider",
  "name": "SliderStudio — Portfólio Limpo com Slideshow",
  "niche": "Portfólio",
  "category": "Portfólio & Criativos",
  "styleMode": "minimalist",
  "typography": {
    "headingFont": "Montserrat",
    "bodyFont": "Inter"
  },
  "defaultPalette": {
    "primary": "#06b6d4",
    "secondary": "#10b981",
    "background": "#0f172a",
    "surface": "#1e293b",
    "text": "#f8fafc"
  },
  "heroRatio": "full",
  "features": [
    "Carrossel fluido de fotos",
    "Design responsivo ultrarrápido",
    "Informações de contato acessíveis",
    "Fácil de personalizar"
  ],
  "thumbnail": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80"
},
    component: portfolio_simples_slider
  },
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
