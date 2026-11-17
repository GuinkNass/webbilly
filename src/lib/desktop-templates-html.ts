/**
 * Catálogo Oficial dos 20 Templates Estruturais do Billy Desktop
 * Mapeamento 1:1 autêntico dos layouts, tipografias e grids estruturais reais.
 */
import { BILLY_REAL_TEMPLATES_HTML, getBillyRealTemplateHtml } from './billy-real-templates';

export interface DesktopTemplateDefinition {
  id: string;
  name: string;
  niche: string;
  category: string;
  defaultPrimary: string;
  defaultBg: string;
  defaultSurface: string;
  defaultText: string;
  html: string;
}

export const DESKTOP_TEMPLATE_HTML: Record<string, string> = BILLY_REAL_TEMPLATES_HTML;

export const getDesktopTemplateHtml = getBillyRealTemplateHtml;
