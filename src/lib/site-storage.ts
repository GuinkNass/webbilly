import fs from 'fs-extra';
import path from 'path';
import { readDb, writeDb, SubscriptionRecord } from '@/lib/db';
import { fetchSiteFromSupabase, updateSiteStatusInSupabase, getSupabaseAdmin } from '@/lib/supabase';

export interface SiteRecord {
  siteSlug: string;
  clientName: string;
  status: 'active' | 'suspended' | 'pending' | 'cancelled' | 'draft' | 'awaiting_first_payment' | 'abandoned_checkout';
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

export interface SiteCloudData {
  slug: string;
  businessName?: string;
  niche?: string;
  city?: string;
  isPublished: boolean;
  status: 'draft' | 'published' | 'suspended' | 'cancelled' | 'active';
  html?: string;
  publishedAt?: string;
  updatedAt: string;
}

/**
 * Salva o HTML e os metadados do site no Supabase Storage (Bucket 'webbilly-sites')
 * e sincroniza de forma idempotente com disco local e banco de dados.
 */
export async function saveSiteToCloudStorage(
  slug: string,
  html: string,
  meta: Partial<SiteCloudData>
): Promise<boolean> {
  const cleanSlug = sanitizeSlug(slug);
  if (!cleanSlug) return false;

  const nowIso = new Date().toISOString();
  const isPublished = meta.isPublished ?? false;
  const status = meta.status || (isPublished ? 'published' : 'draft');

  const cloudMeta: SiteCloudData = {
    slug: cleanSlug,
    businessName: meta.businessName || formatSlugToTitle(cleanSlug),
    niche: meta.niche || 'Comércio Local',
    city: meta.city || 'São Paulo - SP',
    isPublished,
    status,
    publishedAt: meta.publishedAt || (isPublished ? nowIso : undefined),
    updatedAt: nowIso
  };

  // 1. Tenta gravar no Supabase Storage
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      // Salva o JSON de metadados
      await supabase.storage.from('webbilly-sites').upload(
        `${cleanSlug}.json`,
        JSON.stringify(cloudMeta, null, 2),
        { contentType: 'application/json; charset=utf-8', upsert: true }
      );

      // Salva o HTML
      const htmlFilename = isPublished ? `${cleanSlug}.html` : `${cleanSlug}_draft.html`;
      await supabase.storage.from('webbilly-sites').upload(
        htmlFilename,
        html,
        { contentType: 'text/html; charset=utf-8', upsert: true }
      );

      // Se foi publicado, garante também a cópia em ${cleanSlug}.html
      if (isPublished) {
        await supabase.storage.from('webbilly-sites').upload(
          `${cleanSlug}.html`,
          html,
          { contentType: 'text/html; charset=utf-8', upsert: true }
        );
      }
    }
  } catch (stErr) {
    console.warn('[SiteStorage] Erro ao salvar no Supabase Storage:', stErr);
  }

  // 2. Salva no disco local (se disponível)
  try {
    const diskDir = path.join(process.cwd(), 'public', 'generated-sites', cleanSlug);
    fs.ensureDirSync(diskDir);
    fs.writeFileSync(path.join(diskDir, 'index.html'), html, 'utf-8');
    fs.writeFileSync(path.join(diskDir, 'meta.json'), JSON.stringify(cloudMeta, null, 2), 'utf-8');
  } catch (_) {}

  // 3. Salva no db.json local
  try {
    const db = readDb();
    if (!db.generatedSites) db.generatedSites = {};
    db.generatedSites[cleanSlug] = html;
    writeDb(db);
  } catch (_) {}

  return true;
}

/**
 * Recupera o HTML e os metadados do site a partir do Supabase Storage / disco / db.json
 */
export async function getSiteFromCloudStorage(slug: string): Promise<SiteCloudData | null> {
  const cleanSlug = sanitizeSlug(slug);
  if (!cleanSlug) return null;

  let cloudMeta: SiteCloudData | null = null;
  let htmlContent: string | null = null;

  // 1. Tenta carregar do Supabase Storage
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      // Download do JSON de metadados
      const { data: metaBlob, error: metaErr } = await supabase.storage
        .from('webbilly-sites')
        .download(`${cleanSlug}.json`);

      if (!metaErr && metaBlob) {
        const metaText = await metaBlob.text();
        cloudMeta = JSON.parse(metaText);
      }

      // Download do HTML
      const htmlFile = cloudMeta?.isPublished ? `${cleanSlug}.html` : `${cleanSlug}_draft.html`;
      const { data: htmlBlob, error: htmlErr } = await supabase.storage
        .from('webbilly-sites')
        .download(htmlFile);

      if (!htmlErr && htmlBlob) {
        htmlContent = await htmlBlob.text();
      } else if (!cloudMeta?.isPublished) {
        // Tenta também ${cleanSlug}.html como fallback
        const { data: fallbackBlob } = await supabase.storage
          .from('webbilly-sites')
          .download(`${cleanSlug}.html`);
        if (fallbackBlob) {
          htmlContent = await fallbackBlob.text();
        }
      }
    }
  } catch (err) {
    console.warn('[SiteStorage] Erro ao recuperar do Supabase Storage:', err);
  }

  // 2. Fallback de disco local
  if (!htmlContent) {
    try {
      const diskPath = path.join(process.cwd(), 'public', 'generated-sites', cleanSlug, 'index.html');
      if (fs.existsSync(diskPath)) {
        htmlContent = fs.readFileSync(diskPath, 'utf-8');
      }
      const metaDiskPath = path.join(process.cwd(), 'public', 'generated-sites', cleanSlug, 'meta.json');
      if (!cloudMeta && fs.existsSync(metaDiskPath)) {
        cloudMeta = JSON.parse(fs.readFileSync(metaDiskPath, 'utf-8'));
      }
    } catch (_) {}
  }

  // 3. Fallback de db.json
  if (!htmlContent) {
    try {
      const db = readDb();
      if (db.generatedSites?.[cleanSlug]) {
        htmlContent = db.generatedSites[cleanSlug];
      }
    } catch (_) {}
  }

  if (!cloudMeta && !htmlContent) {
    return null;
  }

  return {
    slug: cleanSlug,
    businessName: cloudMeta?.businessName || formatSlugToTitle(cleanSlug),
    niche: cloudMeta?.niche || 'Comércio Local',
    city: cloudMeta?.city || 'São Paulo - SP',
    isPublished: cloudMeta?.isPublished ?? (cloudMeta?.status === 'published' || cloudMeta?.status === 'active'),
    status: cloudMeta?.status || (cloudMeta?.isPublished ? 'published' : 'draft'),
    html: htmlContent || undefined,
    publishedAt: cloudMeta?.publishedAt,
    updatedAt: cloudMeta?.updatedAt || new Date().toISOString()
  };
}

/**
 * Renderiza a página oficial e elegante de Site em Preparação (Rascunho / Aguardando Deploy)
 */
export function renderPreparationHtml(businessName: string, slug: string): string {
  const formattedName = businessName || formatSlugToTitle(slug);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formattedName} | Site em Preparação</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #07090e; color: #f8fafc; }
  </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden bg-[#07090e]">
  <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#84cc16]/10 rounded-full blur-[140px] pointer-events-none"></div>

  <div class="max-w-lg w-full bg-[#0e121b]/95 border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 text-center space-y-6 backdrop-blur-md">
    <div class="flex items-center justify-center gap-1.5 pb-2">
      <span class="font-extrabold text-lg tracking-tight text-white">
        Web<span class="text-[#84cc16]">billy</span>
      </span>
      <span class="text-zinc-600">•</span>
      <span class="text-zinc-400 text-xs font-mono">Presença Digital</span>
    </div>

    <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
      <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
      <span>Site em Preparação</span>
    </div>

    <div class="space-y-3">
      <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
        ${formattedName}
      </h1>
      <p class="text-xs text-zinc-400 font-mono bg-black/50 py-1 px-3 rounded-lg inline-block border border-white/[0.06]">
        ${slug}.webbilly.com.br
      </p>
      <p class="text-sm text-zinc-300 leading-relaxed pt-2">
        Este site oficial está sendo preparado e finalizado pela equipe Webbilly.
      </p>
      <p class="text-xs text-zinc-400">
        A publicação oficial com todos os serviços e agendamento online ocorrerá em breve.
      </p>
    </div>

    <div class="pt-4 border-t border-white/[0.08] text-[11px] text-zinc-500">
      Webbilly Plataforma de Presença Digital • Todos os direitos reservados.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Baixa uma imagem externa (Google, Instagram, etc) pelo servidor e faz upload permanente no Supabase Storage (bucket 'site-assets')
 * Retorna a URL pública permanente ou a original como fallback seguro.
 */
export async function persistImageToSupabaseStorage(
  imageUrl: string,
  slug: string,
  index: number = 0
): Promise<string> {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // Se já for uma URL do nosso próprio Supabase Storage, não precisa reprocessar
  if (imageUrl.includes('supabase.co/storage/v1/object/public/site-assets/')) {
    return imageUrl;
  }

  const cleanSlug = sanitizeSlug(slug) || 'site';

  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return imageUrl;

    // Garante que o bucket 'site-assets' exista
    try {
      await supabase.storage.createBucket('site-assets', { public: true });
    } catch (_) {}

    // Baixa o arquivo da imagem pelo servidor (sem Referer do cliente)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      redirect: 'follow',
      signal: controller.signal,
      cache: 'no-store'
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (!res || !res.ok) {
      console.warn(`[PersistImage] Falha ao baixar imagem externa (${res?.status}):`, imageUrl);
      return imageUrl;
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    if (contentType.includes('text/html') || contentType.includes('application/json')) {
      console.warn('[PersistImage] Resposta não é imagem válida:', contentType);
      return imageUrl;
    }

    // Determina a extensão do arquivo
    let ext = 'jpg';
    if (contentType.includes('png')) ext = 'png';
    else if (contentType.includes('webp')) ext = 'webp';
    else if (contentType.includes('avif')) ext = 'avif';

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Nome único do arquivo
    const filePath = `${cleanSlug}/${Date.now()}-${index}.${ext}`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('site-assets')
      .upload(filePath, buffer, {
        contentType,
        upsert: true
      });

    if (uploadErr || !uploadData) {
      console.warn('[PersistImage] Erro ao fazer upload no Supabase Storage:', uploadErr?.message);
      return imageUrl;
    }

    const { data: pubUrlData } = supabase.storage
      .from('site-assets')
      .getPublicUrl(filePath);

    if (pubUrlData?.publicUrl) {
      console.log(`[PersistImage] Imagem persistida com sucesso: ${imageUrl} -> ${pubUrlData.publicUrl}`);
      return pubUrlData.publicUrl;
    }
  } catch (err: any) {
    console.warn('[PersistImage] Erro ao persistir imagem:', err?.message || err);
  }

  return imageUrl;
}

/**
 * Persiste um conjunto de fotos (heroPhoto e galleryPhotos) no Supabase Storage em paralelo
 */
export async function persistSiteImages(
  heroPhoto: string,
  galleryPhotos: string[],
  slug: string
): Promise<{ heroPhoto: string; galleryPhotos: string[] }> {
  let persistedHero = heroPhoto;
  if (
    heroPhoto &&
    (heroPhoto.includes('googleusercontent.com') ||
      heroPhoto.includes('places.googleapis.com') ||
      heroPhoto.includes('cdninstagram.com') ||
      heroPhoto.includes('fbcdn.net') ||
      heroPhoto.includes('duckduckgo.com'))
  ) {
    persistedHero = await persistImageToSupabaseStorage(heroPhoto, slug, 0);
  }

  const persistedGallery: string[] = [];
  if (Array.isArray(galleryPhotos) && galleryPhotos.length > 0) {
    const promises = galleryPhotos.map((url, idx) => {
      if (
        url &&
        (url.includes('googleusercontent.com') ||
          url.includes('places.googleapis.com') ||
          url.includes('cdninstagram.com') ||
          url.includes('fbcdn.net') ||
          url.includes('duckduckgo.com'))
      ) {
        return persistImageToSupabaseStorage(url, slug, idx + 1);
      }
      return Promise.resolve(url);
    });
    const results = await Promise.allSettled(promises);
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled' && r.value) {
        persistedGallery.push(r.value);
      } else {
        persistedGallery.push(galleryPhotos[idx]);
      }
    });
  }

  return {
    heroPhoto: persistedHero,
    galleryPhotos: persistedGallery
  };
}
