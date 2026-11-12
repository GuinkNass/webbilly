import fs from 'fs-extra';
import path from 'path';
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
const CACHE_TTL_MS = 15 * 1000; // 15 segundos de cache em memória

const IS_VERCEL = !!process.env.VERCEL;
const BUNDLED_SUSPENDED_PATH = path.join(process.cwd(), 'src', 'data', 'suspended_slugs.json');
const RUNTIME_SUSPENDED_PATH = IS_VERCEL ? path.join('/tmp', 'webbilly_suspended_slugs.json') : BUNDLED_SUSPENDED_PATH;

// Registro global em memória
declare global {
  // eslint-disable-next-line no-var
  var __webbillySuspendedSlugs: Set<string> | undefined;
}

if (!globalThis.__webbillySuspendedSlugs) {
  globalThis.__webbillySuspendedSlugs = new Set<string>();
}

/**
 * Lê o conjunto consolidado de slugs suspensos
 */
export function getSuspendedSlugs(): Set<string> {
  const set = new Set<string>(globalThis.__webbillySuspendedSlugs || []);

  // 1. Lê do arquivo em runtime (/tmp ou data)
  try {
    const fileToRead = fs.existsSync(RUNTIME_SUSPENDED_PATH)
      ? RUNTIME_SUSPENDED_PATH
      : (fs.existsSync(BUNDLED_SUSPENDED_PATH) ? BUNDLED_SUSPENDED_PATH : null);

    if (fileToRead) {
      const slugsArray = fs.readJsonSync(fileToRead, { throws: false });
      if (Array.isArray(slugsArray)) {
        slugsArray.forEach((s: string) => {
          if (s) set.add(sanitizeSlug(s));
        });
      }
    }
  } catch {}

  // 2. Lê do DB local
  try {
    const db = readDb();
    if (Array.isArray(db.subscriptions)) {
      db.subscriptions.forEach(sub => {
        if (sub.status === 'suspended' || sub.status === 'cancelled') {
          if (sub.siteSlug) set.add(sanitizeSlug(sub.siteSlug));
        }
      });
    }
  } catch {}

  return set;
}

/**
 * Verifica se um slug está com publicação suspensa
 */
export function isSlugSuspended(rawSlug: string): boolean {
  const clean = sanitizeSlug(rawSlug);
  if (!clean) return false;
  const suspendedSet = getSuspendedSlugs();
  return suspendedSet.has(clean);
}

/**
 * Define ou remove um slug do estado de suspensão com persistência
 */
export function setSlugSuspended(rawSlug: string, suspended: boolean): void {
  const clean = sanitizeSlug(rawSlug);
  if (!clean) return;

  if (!globalThis.__webbillySuspendedSlugs) {
    globalThis.__webbillySuspendedSlugs = new Set<string>();
  }

  const currentSet = getSuspendedSlugs();
  if (suspended) {
    currentSet.add(clean);
    globalThis.__webbillySuspendedSlugs.add(clean);
  } else {
    currentSet.delete(clean);
    globalThis.__webbillySuspendedSlugs.delete(clean);
  }

  // Limpa cache imediato
  memoryCache.delete(clean);

  // Persiste em arquivo
  try {
    const list = Array.from(currentSet);
    fs.ensureDirSync(path.dirname(RUNTIME_SUSPENDED_PATH));
    fs.writeJsonSync(RUNTIME_SUSPENDED_PATH, list, { spaces: 2 });
    if (!IS_VERCEL) {
      try {
        fs.ensureDirSync(path.dirname(BUNDLED_SUSPENDED_PATH));
        fs.writeJsonSync(BUNDLED_SUSPENDED_PATH, list, { spaces: 2 });
      } catch {}
    }
  } catch (err) {
    console.warn('[SiteStorage] Erro ao gravar suspended_slugs:', err);
  }
}

/**
 * Limpa o cache de resolução de um site ou de todos
 */
export function clearSiteCache(slug?: string): void {
  if (slug) {
    memoryCache.delete(sanitizeSlug(slug));
  } else {
    memoryCache.clear();
  }
}

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

  const isSuspended = isSlugSuspended(slug);

  // 1. Verifica cache em memória rápido
  const cached = memoryCache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    // Se o slug foi marcado como suspenso após o cache, força o status suspenso
    if (isSuspended && cached.data.status !== 'suspended') {
      cached.data.status = 'suspended';
    }
    return cached.data;
  }

  // 2. Tenta ler do Vercel KV / Redis se configurado
  const fromKv = await getFromKv(`site:${slug}`);
  if (fromKv && fromKv.deployedUrl) {
    if (isSuspended) {
      fromKv.status = 'suspended';
    }
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
    const finalStatus: SiteRecord['status'] = isSuspended
      ? 'suspended'
      : (sub?.status || 'active');

    const record: SiteRecord = {
      siteSlug: slug,
      clientName: sub?.clientName || demo?.title || formatSlugToTitle(slug),
      status: finalStatus,
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

  // Se o slug está na lista de suspensos mas não tem sub/demo, retorna o registro suspenso direto
  if (isSuspended) {
    const suspendedRecord: SiteRecord = {
      siteSlug: slug,
      clientName: formatSlugToTitle(slug),
      status: 'suspended',
      deployedUrl: `https://${slug}.vercel.app`,
      monthlyPrice: 29.90,
      checkoutUrl: `/api/subscription/create-checkout?slug=${slug}`,
      updatedAt: new Date().toISOString()
    };
    memoryCache.set(slug, { data: suspendedRecord, expiresAt: Date.now() + CACHE_TTL_MS });
    return suspendedRecord;
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
        status: isSuspended ? 'suspended' : 'active',
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

  // 1. Salva na memória e no registro de status suspenso
  if (record.status === 'suspended' || record.status === 'cancelled') {
    setSlugSuspended(cleanSlug, true);
  } else if (record.status === 'active') {
    setSlugSuspended(cleanSlug, false);
  }
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
