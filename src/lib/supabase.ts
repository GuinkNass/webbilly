import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase URL & Keys
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://iyxtdmluebjhapqheova.supabase.co';

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  'sb_publishable_IHaHqWIayexZFdlWtDDfLA_wPARgNw-';

let supabaseAdmin: SupabaseClient | null = null;

/**
 * Retorna o cliente Supabase com Service Role (bypassing RLS)
 * e fetch configurado com cache: 'no-store' para garantir leitura em tempo real sem cache do Next.js
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            cache: 'no-store',
          });
        },
      },
    });
  }
  return supabaseAdmin;
}

export interface SupabaseSiteRecord {
  id: string;
  siteSlug: string;
  clientName: string;
  status: 'active' | 'suspended' | 'pending' | 'cancelled';
  deployedUrl: string;
  monthlyPrice?: number;
  checkoutUrl?: string;
  clientPhone?: string;
  clientEmail?: string;
  custom_domain?: string;
  domain_status?: string;
  updatedAt?: string;
}

/**
 * Consulta o site diretamente no Supabase por slug ou domínio próprio em tempo real
 */
export async function fetchSiteFromSupabase(slugOrDomain: string): Promise<SupabaseSiteRecord | null> {
  if (!slugOrDomain) return null;
  const clean = slugOrDomain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '');

  try {
    const supabase = getSupabaseAdmin();

    // 1. Tenta buscar na tabela 'subscriptions'
    const { data: subData, error: subErr } = await supabase
      .from('subscriptions')
      .select('*')
      .or(`siteSlug.eq.${clean},site_slug.eq.${clean},custom_domain.eq.${clean},customDomain.eq.${clean}`)
      .limit(1)
      .maybeSingle();

    if (!subErr && subData) {
      return {
        id: subData.id || `sub_${clean}`,
        siteSlug: subData.siteSlug || subData.site_slug || clean,
        clientName: subData.clientName || subData.client_name || clean.toUpperCase(),
        status: (subData.status || subData.site_status || 'active').toLowerCase(),
        deployedUrl: subData.deployedUrl || subData.deployed_url || `https://${clean}.vercel.app`,
        monthlyPrice: subData.monthlyPrice || subData.monthly_price || 29.90,
        checkoutUrl: subData.checkoutUrl || subData.checkout_url || `/api/subscription/create-checkout?slug=${clean}`,
        clientPhone: subData.clientPhone || subData.client_phone,
        clientEmail: subData.clientEmail || subData.client_email,
        custom_domain: subData.custom_domain || subData.customDomain,
        domain_status: subData.domain_status || subData.domainStatus,
        updatedAt: subData.updatedAt || subData.updated_at
      };
    }

    // 2. Tenta buscar na tabela 'sites' (caso seja o nome no schema Supabase)
    const { data: siteData, error: siteErr } = await supabase
      .from('sites')
      .select('*')
      .or(`subdomain.eq.${clean},slug.eq.${clean},custom_domain.eq.${clean}`)
      .limit(1)
      .maybeSingle();

    if (!siteErr && siteData) {
      return {
        id: siteData.id || `site_${clean}`,
        siteSlug: siteData.subdomain || siteData.slug || clean,
        clientName: siteData.client_name || siteData.name || clean.toUpperCase(),
        status: (siteData.status || siteData.site_status || 'active').toLowerCase(),
        deployedUrl: siteData.deployed_url || siteData.url || `https://${clean}.vercel.app`,
        monthlyPrice: siteData.monthly_price || 29.90,
        checkoutUrl: siteData.checkout_url || `/api/subscription/create-checkout?slug=${clean}`,
        clientPhone: siteData.client_phone || siteData.phone,
        clientEmail: siteData.client_email || siteData.email,
        custom_domain: siteData.custom_domain,
        domain_status: siteData.domain_status,
        updatedAt: siteData.updated_at
      };
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao consultar site no Supabase:', err);
  }

  return null;
}

/**
 * Atualiza o status do site no Supabase com service_role (bypassing RLS)
 */
export async function updateSiteStatusInSupabase(
  identifier: string,
  newStatus: 'active' | 'suspended'
): Promise<boolean> {
  if (!identifier) return false;
  const clean = identifier.toLowerCase().trim();

  try {
    const supabase = getSupabaseAdmin();
    const nowIso = new Date().toISOString();

    // 1. Tenta atualizar na tabela 'subscriptions'
    const { error: subErr } = await supabase
      .from('subscriptions')
      .update({
        status: newStatus,
        site_status: newStatus,
        updated_at: nowIso,
        updatedAt: nowIso
      })
      .or(`id.eq.${clean},siteSlug.eq.${clean},site_slug.eq.${clean}`);

    if (!subErr) {
      return true;
    }

    // 2. Tenta atualizar na tabela 'sites'
    const { error: siteErr } = await supabase
      .from('sites')
      .update({
        status: newStatus,
        site_status: newStatus,
        updated_at: nowIso
      })
      .or(`id.eq.${clean},subdomain.eq.${clean},slug.eq.${clean}`);

    if (!siteErr) {
      return true;
    }
  } catch (err) {
    console.warn('[Supabase] Erro ao atualizar status no Supabase:', err);
  }

  return false;
}
