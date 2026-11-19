/**
 * Contrato Único de Dados Reais para Templates React + Tailwind (Webbilly)
 * Estritamente tipado com trava anti-invenção.
 */

export interface SitePalette {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
}

export interface SiteHero {
  title: string;
  subtitle: string;
  ctaLabel: string;
  backgroundImage?: string;
}

export interface SiteAbout {
  title: string;
  paragraphs: string[];
  image?: string;
  highlights?: string[];
}

export interface SiteService {
  title: string;
  description: string;
  priceTag?: string; // Omitido quando não houver preço real informado
  icon?: string;
}

export interface SiteGalleryItem {
  url: string;
  alt: string;
}

export interface SiteTestimonial {
  author: string;
  rating: number;
  text: string;
}

export interface SiteContact {
  whatsappUrl: string;
  phoneDisplay: string;
  address?: string;
  mapsUrl?: string;
  mapsEmbedUrl?: string;
  hours?: string[];
}

export interface SiteSeo {
  title: string;
  description: string;
}

export interface BusinessSiteData {
  brandName: string;
  niche: string;
  palette: SitePalette;
  hero: SiteHero;
  about: SiteAbout;
  services: SiteService[];
  gallery: SiteGalleryItem[];
  testimonials: SiteTestimonial[]; // [] se não houver depoimentos reais
  contact: SiteContact;
  seo: SiteSeo;
}

export interface TemplateBlueprint {
  slug: string;
  name: string;
  niche: string;
  category: string;
  styleMode: 'dark' | 'light' | 'warm' | 'editorial' | 'energetic' | 'minimalist';
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  defaultPalette: SitePalette;
  heroRatio: 'full' | 'split' | 'centered';
  features: string[];
  thumbnail: string;
}
