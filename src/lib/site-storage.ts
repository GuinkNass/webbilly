import { readDb, writeDb, SubscriptionRecord } from '@/lib/db';

export interface SiteRecord {
  siteSlug: string;
  clientName: string;
  status: 'active' | 'suspended' | 'pending' | 'cancelled';
  deployedUrl: string;
  monthlyPrice: number;
  checkoutUrl: string;
  clientPhone?: string;
  clientEmail?: string;
  operatorToken?: string;
  operatorName?: string;
  nextRenewalDate?: string;
  lastPaymentDate?: string;
  updatedAt: string;
  leadToken?: string;
}

// In-memory cache de fallback para evitar requisições redundantes no mesmo ciclo de vida
const memoryCache = new Map<string, { data: SiteRecord; expiresAt: number }>();
const CACHE_TTL_MS = 30 * 1000; // 30 segundos de cache em memória

/**
 * Normaliza e sanitiza o slug de qualquer subdomínio
 */
export function sanitizeSlug(rawSlug: string): string {
  return (rawSlug || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Formata um slug para título amigável caso não haja nome cadastrado
 */
export function formatSlugToTitle(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Lê do Vercel KV / Upstash Redis se configurado no ambiente
 */
async function getFromKv(key: string): Promise<any | null> {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!kvUrl || !kvToken) return null;

  try {
    const res = await fetch(`${kvUrl}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${kvToken}` },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.result) return null;
    return typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
  } catch (err) {
    console.warn('[SiteStorage KV Warning]:', err);
    return null;
  }
}

/**
 * Salva no Vercel KV / Upstash Redis se configurado
 */
async function saveToKv(key: string, value: any): Promise<boolean> {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!kvUrl || !kvToken) return false;

  try {
    const res = await fetch(`${kvUrl}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(value),
      cache: 'no-store'
    });
    return res.ok;
  } catch (err) {
    console.warn('[SiteStorage KV Set Warning]:', err);
    return false;
  }
}

/**
 * Tenta localizar ou resolver o site com persistência real em produção
 */
export async function resolveSiteBySlug(rawSlug: string): Promise<SiteRecord | null> {
  const slug = sanitizeSlug(rawSlug);
  if (!slug) return null;

  // 1. Verifica cache em memória rápido
  const cached = memoryCache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // 2. Tenta ler do Vercel KV / Redis se configurado
  const fromKv = await getFromKv(`site:${slug}`);
  if (fromKv && fromKv.deployedUrl) {
    memoryCache.set(slug, { data: fromKv, expiresAt: Date.now() + CACHE_TTL_MS });
    return fromKv;
  }

  // 3. Lê do banco local/bundled db.json
  const db = readDb();
  const subscriptions = Array.isArray(db.subscriptions) ? db.subscriptions : [];
  let sub = subscriptions.find(s => s.siteSlug === slug || s.leadToken === slug);

  // Procura em demos
  const demo = db.demos
    ? Object.values(db.demos).find(
        d =>
          (d.leadToken && (d.leadToken === slug || d.leadToken.includes(slug))) ||
          (d.deployedUrl && d.deployedUrl.includes(slug))
      )
    : null;

  if (sub || demo) {
    const record: SiteRecord = {
      siteSlug: slug,
      clientName: sub?.clientName || demo?.title || formatSlugToTitle(slug),
      status: sub?.status || 'active',
      deployedUrl: sub?.deployedUrl || demo?.deployedUrl || `https://${slug}.vercel.app`,
      monthlyPrice: sub?.monthlyPrice || 29.90,
      checkoutUrl: sub?.checkoutUrl || `/api/subscription/create-checkout?slug=${slug}`,
      clientPhone: sub?.clientPhone || demo?.phone,
      operatorToken: sub?.operatorToken,
      operatorName: sub?.operatorName,
      nextRenewalDate: sub?.nextRenewalDate,
      lastPaymentDate: sub?.lastPaymentDate,
      updatedAt: sub?.updatedAt || demo?.updatedAt || new Date().toISOString(),
      leadToken: sub?.leadToken || demo?.leadToken
    };

    memoryCache.set(slug, { data: record, expiresAt: Date.now() + CACHE_TTL_MS });
    return record;
  }

  // 4. Detecção Ativa de Deployments Vercel em Tempo Real
  // Todo site compilado pelo desktop app é publicado em https://${slug}.vercel.app
  try {
    const vercelTarget = `https://${slug}.vercel.app`;
    const res = await fetch(vercelTarget, {
      method: 'GET',
      headers: { 'User-Agent': 'WebbillySiteResolver/2.0' },
      cache: 'no-store'
    });

    if (res.ok) {
      const html = await res.text();
      let extractedTitle = '';
      const match = html.match(/<title>([^<]+)<\/title>/i);
      if (match && match[1]) {
        extractedTitle = match[1].split('|')[0].split('-')[0].trim();
      }

      const clientName = extractedTitle || formatSlugToTitle(slug);
      const record: SiteRecord = {
        siteSlug: slug,
        clientName,
        status: 'active',
        deployedUrl: vercelTarget,
        monthlyPrice: 29.90,
        checkoutUrl: `/api/subscription/create-checkout?slug=${slug}`,
        updatedAt: new Date().toISOString()
      };

      // Auto-cura e salva nos armazenamentos para persistência
      await persistSite(record);
      memoryCache.set(slug, { data: record, expiresAt: Date.now() + CACHE_TTL_MS });
      return record;
    }
  } catch (probeErr) {
    console.warn(`[SiteStorage Probe Error for ${slug}]:`, probeErr);
  }

  return null;
}

/**
 * Grava ou atualiza um site garantindo persistência no runtime e KV
 */
export async function persistSite(site: Partial<SiteRecord> & { siteSlug: string }): Promise<SiteRecord> {
  const cleanSlug = sanitizeSlug(site.siteSlug);
  const nowIso = new Date().toISOString();

  const record: SiteRecord = {
    siteSlug: cleanSlug,
    clientName: site.clientName || formatSlugToTitle(cleanSlug),
    status: site.status || 'active',
    deployedUrl: site.deployedUrl || `https://${cleanSlug}.vercel.app`,
    monthlyPrice: site.monthlyPrice || 29.90,
    checkoutUrl: site.checkoutUrl || `/api/subscription/create-checkout?slug=${cleanSlug}`,
    clientPhone: site.clientPhone,
    clientEmail: site.clientEmail,
    operatorToken: site.operatorToken,
    operatorName: site.operatorName,
    nextRenewalDate: site.nextRenewalDate,
    lastPaymentDate: site.lastPaymentDate,
    updatedAt: nowIso,
    leadToken: site.leadToken
  };

  // 1. Salva na memória
  memoryCache.set(cleanSlug, { data: record, expiresAt: Date.now() + CACHE_TTL_MS });

  // 2. Salva no Vercel KV / Upstash Redis
  await saveToKv(`site:${cleanSlug}`, record);

  // 3. Salva no DB local/runtime
  try {
    const db = readDb();
    if (!Array.isArray(db.subscriptions)) {
      db.subscriptions = [];
    }
    const idx = db.subscriptions.findIndex(s => s.siteSlug === cleanSlug);
    const subRecord: SubscriptionRecord = {
      id: `sub_${cleanSlug}`,
      siteSlug: cleanSlug,
      clientName: record.clientName,
      clientPhone: record.clientPhone || '',
      clientEmail: record.clientEmail,
      operatorToken: record.operatorToken,
      operatorName: record.operatorName,
      monthlyPrice: record.monthlyPrice,
      status: record.status,
      deployedUrl: record.deployedUrl,
      checkoutUrl: record.checkoutUrl,
      lastPaymentDate: record.lastPaymentDate,
      nextRenewalDate: record.nextRenewalDate,
      createdAt: nowIso,
      updatedAt: nowIso,
      leadToken: record.leadToken
    };

    if (idx >= 0) {
      db.subscriptions[idx] = { ...db.subscriptions[idx], ...subRecord };
    } else {
      db.subscriptions.unshift(subRecord);
    }

    if (!db.demos) db.demos = {};
    db.demos[cleanSlug] = {
      leadToken: cleanSlug,
      title: record.clientName,
      deployedUrl: record.deployedUrl,
      updatedAt: nowIso
    };

    writeDb(db);
  } catch (dbErr) {
    console.warn('[SiteStorage Local DB Write Error]:', dbErr);
  }

  return record;
}
