// CATÁLOGO UNIFICADO DE TEMPLATES BILLY STUDIO
import { TATUAGEM_TEMPLATES } from './tatuagem';
import { GASTRONOMIA_TEMPLATES } from './gastronomia';
import { ESTETICA_TEMPLATES } from './estetica';
import { FITNESS_TEMPLATES } from './fitness';
import { ARQUITETURA_TEMPLATES } from './arquitetura';
import { AUTOMOTIVO_TEMPLATES } from './automotivo';
import { SAUDE_TEMPLATES } from './saude';
import { PET_TEMPLATES } from './pet';
import { SERVICOS_TEMPLATES } from './servicos';
import { PORTFOLIO_TEMPLATES } from './portfolio';

export const ALL_DRIVE_TEMPLATES = [
  ...TATUAGEM_TEMPLATES,
  ...GASTRONOMIA_TEMPLATES,
  ...ESTETICA_TEMPLATES,
  ...FITNESS_TEMPLATES,
  ...ARQUITETURA_TEMPLATES,
  ...AUTOMOTIVO_TEMPLATES,
  ...SAUDE_TEMPLATES,
  ...PET_TEMPLATES,
  ...SERVICOS_TEMPLATES,
  ...PORTFOLIO_TEMPLATES,
];

let _templateMap: Record<string, string> | null = null;

function getMap(): Record<string, string> {
  if (!_templateMap) {
    _templateMap = {};
    TATUAGEM_TEMPLATES.forEach(t => { _templateMap![t.id] = t.html; });
    GASTRONOMIA_TEMPLATES.forEach(t => { _templateMap![t.id] = t.html; });
    ESTETICA_TEMPLATES.forEach(t => { _templateMap![t.id] = t.html; });
    FITNESS_TEMPLATES.forEach(t => { _templateMap![t.id] = t.html; });
    ARQUITETURA_TEMPLATES.forEach(t => { _templateMap![t.id] = t.html; });
    AUTOMOTIVO_TEMPLATES.forEach(t => { _templateMap![t.id] = t.html; });
    SAUDE_TEMPLATES.forEach(t => { _templateMap![t.id] = t.html; });
    PET_TEMPLATES.forEach(t => { _templateMap![t.id] = t.html; });
    SERVICOS_TEMPLATES.forEach(t => { _templateMap![t.id] = t.html; });
    PORTFOLIO_TEMPLATES.forEach(t => { _templateMap![t.id] = t.html; });
  }
  return _templateMap;
}

export function getDriveTemplateHtml(id: string): string | null {
  if (!id) return null;
  const clean = id.toLowerCase().trim();
  const map = getMap();
  if (map[clean]) return map[clean];

  for (const [key, html] of Object.entries(map)) {
    if (key.includes(clean) || clean.includes(key)) {
      return html;
    }
  }
  return null;
}
