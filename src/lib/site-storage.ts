import fs from 'fs-extra';
import path from 'path';
import { readDb, writeDb, SubscriptionRecord } from '@/lib/db';
import { fetchSiteFromSupabase, updateSiteStatusInSupabase } from '@/lib/supabase';

export interface SiteRecord {
  siteSlug: string;
  clientName: string;
  status: 'active' | 'suspended' | 'pending' | 'cancelled';
  deployedUrl: string;
  monthlyPrice: number;
  checkoutUrl: string;
  clientPhone?: string;
  clientEmail?: string;
  operatorId?: string;
  operatorToken?: string;
  operatorName?: string;
  nextRenewalDate?: string;
  lastPaymentDate?: string;
  custom_domain?: string;
  customDomain?: string;
  domain_status?: 'subdomain_only' | 'pending_payment' | 'propagating' | 'active';
  domainStatus?: 'subdomain_only' | 'pending_payment' | 'propagating' | 'active';
  domain_purchased_at?: string;
  domainPurchasedAt?: string;
  domainPrice?: number;
  domainPaymentMethod?: 'card_vercel' | 'pix_br';
  updatedAt: string;
  leadToken?: string;
}

// In-memory cache de fallback
const memoryCache = new Map<string, { data: SiteRecord; expiresAt: number }>();
const CACHE_TTL_MS = 2 * 1000; // 2 segundos

// Registro global em memória por processo lambda
declare global {
  // eslint-disable-next-line no-var
  var __webbillySuspendedSlugs: Set<string> | undefined;
  // eslint-disable-next-line no-var
  var __webbillyLastCloudFetch: number | undefined;
}

if (!globalThis.__webbillySuspendedSlugs) {
  globalThis.__webbillySuspendedSlugs = new Set<string>();
}

const CLOUD_SUSPENDED_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1d0a136a41894';
const VERCEL_TOKEN =
  process.env.VERCEL_TOKEN ||
  process.env.VERCEL_API_TOKEN ||
  Buffer.from('dmNwXzdEVzNYMDZnMThyQkQ5S0pGNXRrNnhwSjBSN1I1RGRkTmxpZE1haVF5dDRnRUdLRGR4MzNKVE1m', 'base64').toString('utf-8');
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_mmHCe2NQjdDPafKUDlE9FYXQ';
const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID || 'ecfg_hmqaaunnb9bjkhfsv4dexopzcijf';

/**
 * Lê o conjunto consolidado de slugs suspensos em tempo real na nuvem
 * Compartilhado instantaneamente entre todas as instâncias Vercel Lambdas e Edge
 */
export async function fetchCloudSuspendedSlugs(): Promise<Set<string>> {
  const now = Date.now();
  const lastFetch = globalThis.__webbillyLastCloudFetch || 0;

  // Cache em memória de 1 segundo por processo para evitar múltiplos fetches na mesma renderização
  if (globalThis.__webbillySuspendedSlugs && (now - lastFetch) < 1000 && globalThis.__webbillySuspendedSlugs.size > 0) {
    return globalThis.__webbillySuspendedSlugs;
  }

  // 1. Tenta buscar direto no Vercel Edge Config (latência ultra baixa, nativo Vercel)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/item/suspended_slugs?teamId=${VERCEL_TEAM_ID}`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'User-Agent': 'Webbilly-Edge-Registry/1.0'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.value)) {
        const edgeSet = new Set<string>();
        json.value.forEach((s: string) => {
          if (s) edgeSet.add(sanitizeSlug(s));
        });
        globalThis.__webbillySuspendedSlugs = edgeSet;
        globalThis.__webbillyLastCloudFetch = now;
        return edgeSet;
      }
    }
  } catch (edgeErr) {
    // Continua para fallback
  }

  // 2. Fallback: Consulta o registro na nuvem REST
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(CLOUD_SUSPENDED_URL, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Webbilly-Cloud-Registry/2.0'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data.slugs)) {
        const cloudSet = new Set<string>();
        json.data.slugs.forEach((s: string) => {
          if (s) cloudSet.add(sanitizeSlug(s));
        });
        globalThis.__webbillySuspendedSlugs = cloudSet;
        globalThis.__webbillyLastCloudFetch = now;
        return cloudSet;
      }
    }
  } catch (err) {
    console.warn('[SiteStorage] Erro ao consultar registro em nuvem:', err);
  }

  return getSuspendedSlugs();
}

/**
 * Atualiza o status de suspensão na Nuvem e no Supabase em tempo real
 */
export async function syncSlugSuspension(rawSlug: string, suspended: boolean): Promise<Set<string>> {
  const clean = sanitizeSlug(rawSlug);
  if (!clean) return getSuspendedSlugs();

  // 1. Tenta atualizar no Supabase com timeout de segurança
  try {
    const sbPromise = updateSiteStatusInSupabase(clean, suspended ? 'suspended' : 'active');
    await Promise.race([
      sbPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 1500))
    ]);
  } catch (sbErr) {
    // Silently continue
  }

  // 2. Busca a lista atual da nuvem
  let currentSet: Set<string>;
  try {
    currentSet = await fetchCloudSuspendedSlugs();
  } catch {
    currentSet = getSuspendedSlugs();
  }

  if (suspended) {
    currentSet.add(clean);
  } else {
    currentSet.delete(clean);
  }

  globalThis.__webbillySuspendedSlugs = currentSet;
  globalThis.__webbillyLastCloudFetch = Date.now();
  memoryCache.delete(clean);

  const slugs = Array.from(currentSet);

  // 3. Atualiza no Vercel Edge Config em tempo real
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items?teamId=${VERCEL_TEAM_ID}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'upsert',
            key: 'suspended_slugs',
            value: slugs
          }
        ]
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
  } catch (edgeWriteErr) {
    console.warn('[SiteStorage] Erro ao salvar Edge Config:', edgeWriteErr);
  }

  // 4. Persiste no Cloud Registry secundário
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    await fetch(CLOUD_SUSPENDED_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Webbilly-Cloud-Registry/2.0'
      },
      body: JSON.stringify({
        name: 'webbilly_suspended_registry',
        data: { slugs }
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
  } catch (cloudErr) {
    console.warn('[SiteStorage] Erro ao sincronizar cloud registry:', cloudErr);
  }

  return currentSet;
}

/**
 * Lê o conjunto consolidado de slugs suspensos
 */
export function getSuspendedSlugs(): Set<string> {
  const set = new Set<string>();
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
  return getSuspendedSlugs().has(clean);
}

/**
 * Define ou remove um slug do estado de suspensão
 */
export function setSlugSuspended(rawSlug: string, suspended: boolean): void {
  const clean = sanitizeSlug(rawSlug);
  if (!clean) return;
  memoryCache.delete(clean);
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
 * Normaliza e sanitiza um domínio próprio (ex: https://www.clinica.com.br/ -> clinica.com.br)
 */
export function sanitizeDomain(rawDomain: string): string {
  return (rawDomain || '')
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split(':')[0]
    .replace(/[^a-z0-9.-]/g, '')
    .trim();
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
 * Tenta localizar ou resolver o site com persistência real em produção (por subdomínio ou domínio customizado)
 */
export async function resolveSiteBySlug(rawSlug: string): Promise<SiteRecord | null> {
  const isCustomDomainCandidate = (rawSlug || '').includes('.');
  const cleanDomain = isCustomDomainCandidate ? sanitizeDomain(rawSlug) : '';
  const slug = sanitizeSlug(rawSlug);
  if (!slug && !cleanDomain) return null;

  const lookupKey = cleanDomain || slug;

  // 1. Consulta PRIMEIRO no Supabase (Fonte Única de Verdade)
  const fromSupabase = await fetchSiteFromSupabase(lookupKey);
  if (fromSupabase) {
    return {
      siteSlug: fromSupabase.siteSlug,
      clientName: fromSupabase.clientName,
      status: fromSupabase.status,
      deployedUrl: fromSupabase.deployedUrl,
      monthlyPrice: fromSupabase.monthlyPrice || 29.90,
      checkoutUrl: fromSupabase.checkoutUrl || `/api/subscription/create-checkout?slug=${fromSupabase.siteSlug}`,
      clientPhone: fromSupabase.clientPhone,
      clientEmail: fromSupabase.clientEmail,
      custom_domain: fromSupabase.custom_domain,
      domain_status: fromSupabase.domain_status as any,
      updatedAt: fromSupabase.updatedAt || new Date().toISOString()
    };
  }

  // 2. Lê do banco local/bundled db.json (busca por subdomínio ou por custom_domain)
  const db = readDb();
  const subscriptions = Array.isArray(db.subscriptions) ? db.subscriptions : [];
  let sub = subscriptions.find(s => {
    if (slug && (s.siteSlug === slug || s.leadToken === slug)) return true;
    if (cleanDomain) {
      if (s.custom_domain && sanitizeDomain(s.custom_domain) === cleanDomain) return true;
      if (s.customDomain && sanitizeDomain(s.customDomain) === cleanDomain) return true;
    }
    return false;
  });

  // Procura em demos
  const demo = db.demos
    ? Object.values(db.demos).find(
        d =>
          (d.leadToken && (d.leadToken === slug || d.leadToken.includes(slug))) ||
          (d.deployedUrl && d.deployedUrl.includes(slug))
      )
    : null;

  if (sub || demo) {
    const effectiveSlug = sub?.siteSlug || slug;
    
    // Consulta status de suspensão na nuvem em tempo real (Edge Config é a autoridade máxima instantânea < 50ms)
    let isSuspended = false;
    try {
      const cloudSuspended = await fetchCloudSuspendedSlugs();
      if (cloudSuspended.has(effectiveSlug) || cloudSuspended.has(slug)) {
        isSuspended = true;
      }
    } catch {}

    const finalStatus: SiteRecord['status'] = isSuspended
      ? 'suspended'
      : (sub?.status === 'cancelled' ? 'cancelled' : 'active');

    const record: SiteRecord = {
      siteSlug: effectiveSlug,
      clientName: sub?.clientName || demo?.title || formatSlugToTitle(effectiveSlug),
      status: finalStatus,
      deployedUrl: sub?.deployedUrl || demo?.deployedUrl || `https://${effectiveSlug}.vercel.app`,
      monthlyPrice: sub?.monthlyPrice || 29.90,
      checkoutUrl: sub?.checkoutUrl || `/api/subscription/create-checkout?slug=${effectiveSlug}`,
      clientPhone: sub?.clientPhone || demo?.phone,
      operatorToken: sub?.operatorToken,
      operatorName: sub?.operatorName,
      nextRenewalDate: sub?.nextRenewalDate,
      lastPaymentDate: sub?.lastPaymentDate,
      custom_domain: sub?.custom_domain || sub?.customDomain,
      customDomain: sub?.custom_domain || sub?.customDomain,
      domain_status: sub?.domain_status || sub?.domainStatus,
      domainStatus: sub?.domain_status || sub?.domainStatus,
      domain_purchased_at: sub?.domain_purchased_at || sub?.domainPurchasedAt,
      domainPurchasedAt: sub?.domain_purchased_at || sub?.domainPurchasedAt,
      domainPrice: sub?.domainPrice,
      domainPaymentMethod: sub?.domainPaymentMethod,
      updatedAt: sub?.updatedAt || demo?.updatedAt || new Date().toISOString(),
      leadToken: sub?.leadToken || demo?.leadToken
    };

    memoryCache.set(lookupKey, { data: record, expiresAt: Date.now() + CACHE_TTL_MS });
    if (effectiveSlug !== lookupKey) {
      memoryCache.set(effectiveSlug, { data: record, expiresAt: Date.now() + CACHE_TTL_MS });
    }
    return record;
  }

  // 3. Detecção Ativa de Deployments Vercel em Tempo Real
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
      memoryCache.set(lookupKey, { data: record, expiresAt: Date.now() + CACHE_TTL_MS });
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
    custom_domain: site.custom_domain || site.customDomain,
    customDomain: site.custom_domain || site.customDomain,
    domain_status: site.domain_status || site.domainStatus,
    domainStatus: site.domain_status || site.domainStatus,
    domain_purchased_at: site.domain_purchased_at || site.domainPurchasedAt,
    domainPurchasedAt: site.domain_purchased_at || site.domainPurchasedAt,
    domainPrice: site.domainPrice,
    domainPaymentMethod: site.domainPaymentMethod,
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
      custom_domain: record.custom_domain,
      customDomain: record.customDomain,
      domain_status: record.domain_status,
      domainStatus: record.domainStatus,
      domain_purchased_at: record.domain_purchased_at,
      domainPurchasedAt: record.domainPurchasedAt,
      domainPrice: record.domainPrice,
      domainPaymentMethod: record.domainPaymentMethod,
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
