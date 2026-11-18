export type BlockCategory = 'heroes' | 'abouts' | 'services' | 'galleries' | 'testimonials' | 'contacts';

export type BlockStyle =
  | 'minimalista'
  | 'dark-editorial'
  | 'corporativo-clean'
  | 'moderno-vibrante'
  | 'classico-sofisticado';

export interface ModularBlockContext {
  businessName: string;
  shortName?: string;
  niche: string;
  city: string;
  subdomain: string;
  phone: string;
  whatsapp: string;
  whatsappLink: string;
  instagram?: string;
  address?: string;
  hours?: string;
  tagline?: string;
  description?: string;
  heroPhoto: string;
  galleryPhotos: string[];
  services: Array<{ name: string; price: string; description?: string }>;
  reviews: Array<{ author: string; rating: number; text: string; date?: string }>;
  accentColor?: string;
  primaryColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  fontFamily?: string;
  mapEmbedUrl?: string;
}

export interface ModularBlockDefinition {
  id: string;
  name: string;
  category: BlockCategory;
  style: BlockStyle;
  description: string;
  render: (ctx: ModularBlockContext) => string;
}

export interface ArchitectSelection {
  heroId: string;
  aboutId: string;
  servicesId: string;
  galleryId: string;
  testimonialsId: string;
  contactId: string;
  reason: string;
}
