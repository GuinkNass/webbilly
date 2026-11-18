import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  readDb,
  writeDb,
  SubscriptionRecord,
  Operator,
  AffiliateCommissionRecord,
  SiteChangeRequestRecord,
  ClientAccountRecord,
  SiteEditRequestRecord,
  AdminAffiliateToolRecord
} from './db';
import { extractInstagramHandleFromUrl } from './instagram-extractor';

// Supabase URL & Service Role Key
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
 * e fetch configurado com cache: 'no-store' para garantir leitura em tempo real
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
  status: 'active' | 'suspended' | 'pending' | 'cancelled' | 'draft' | 'awaiting_first_payment' | 'abandoned_checkout';
  deployedUrl: string;
  monthlyPrice?: number;
  checkoutUrl?: string;
  clientPhone?: string;
  clientEmail?: string;
  operatorId?: string;
  operatorName?: string;
  operatorToken?: string;
  custom_domain?: string;
  domain_status?: string;
  domain_purchased_at?: string;
  accepted_terms_at?: string;
  accepted_terms_ip?: string;
  accepted_terms_version?: string;
  updatedAt?: string;
  createdAt?: string;
}

/**
 * Converte linha do Supabase (snake_case) para SubscriptionRecord do sistema
 */
export function mapRowToSubscription(row: any): SubscriptionRecord {
  return {
    id: row.id,
    leadToken: row.lead_token || row.leadToken || '',
    siteSlug: row.site_slug || row.siteSlug || '',
    clientName: row.client_name || row.clientName || '',
    clientPhone: row.client_phone || row.clientPhone || '',
    clientEmail: row.client_email || row.clientEmail || '',
    operatorId: row.operator_id || row.operatorId || '',
    operatorName: row.operator_name || row.operatorName || '',
    operatorToken: row.operator_token || row.operatorToken || '',
    monthlyPrice: Number(row.monthly_price || row.monthlyPrice || 29.90),
    commissionMonthly: Number(row.commission_monthly || row.commissionMonthly || 10.00),
    status: (row.status || row.site_status || 'active').toLowerCase() as any,
    deployedUrl: row.deployed_url || row.deployedUrl || `https://${row.site_slug || row.siteSlug}.vercel.app`,
    checkoutUrl: row.checkout_url || row.checkoutUrl || `/api/subscription/create-checkout?slug=${row.site_slug || row.siteSlug}`,
    lastPaymentDate: row.last_payment_date || row.lastPaymentDate || '',
    nextRenewalDate: row.next_renewal_date || row.nextRenewalDate || '',
    custom_domain: row.custom_domain || row.customDomain || undefined,
    customDomain: row.custom_domain || row.customDomain || undefined,
    domain_status: row.domain_status || row.domainStatus || 'subdomain_only',
    domainStatus: row.domain_status || row.domainStatus || 'subdomain_only',
    domain_purchased_at: row.domain_purchased_at || row.domainPurchasedAt || undefined,
    domainPurchasedAt: row.domain_purchased_at || row.domainPurchasedAt || undefined,
    asaasCustomerId: row.asaas_customer_id || row.asaasCustomerId || undefined,
    asaas_customer_id: row.asaas_customer_id || row.asaasCustomerId || undefined,
    asaasSubscriptionId: row.asaas_subscription_id || row.asaasSubscriptionId || undefined,
    asaas_subscription_id: row.asaas_subscription_id || row.asaasSubscriptionId || undefined,
    vercelProjectId: row.vercel_project_id || row.vercelProjectId || undefined,
    vercel_project_id: row.vercel_project_id || row.vercelProjectId || undefined,
    cancellationRequested: Boolean(row.cancellation_requested ?? row.cancellationRequested ?? false),
    cancellation_requested: Boolean(row.cancellation_requested ?? row.cancellationRequested ?? false),
    cancellationReason: row.cancellation_reason || row.cancellationReason || undefined,
    cancellation_reason: row.cancellation_reason || row.cancellationReason || undefined,
    cancellationRequestedAt: row.cancellation_requested_at || row.cancellationRequestedAt || undefined,
    cancellation_requested_at: row.cancellation_requested_at || row.cancellationRequestedAt || undefined,
    cancelledAt: row.cancelled_at || row.cancelledAt || undefined,
    cancelled_at: row.cancelled_at || row.cancelledAt || undefined,
    siteStatus: row.site_status || row.siteStatus || undefined,
    site_status: row.site_status || row.siteStatus || undefined,
    accepted_terms_at: row.accepted_terms_at || undefined,
    accepted_terms_ip: row.accepted_terms_ip || undefined,
    accepted_terms_version: row.accepted_terms_version || undefined,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

/**
 * Converte linha do Supabase para SiteChangeRequestRecord
 */
export function mapRowToSiteChangeRequest(row: any): SiteChangeRequestRecord {
  let parsedPayload = {};
  try {
    parsedPayload = typeof row.changes_payload === 'string'
      ? JSON.parse(row.changes_payload)
      : (row.changes_payload || row.changesPayload || {});
  } catch {
    parsedPayload = row.changes_payload || {};
  }

  return {
    id: row.id,
    siteSlug: row.site_slug || row.siteSlug || '',
    site_slug: row.site_slug || row.siteSlug || '',
    clientName: row.client_name || row.clientName || undefined,
    client_name: row.client_name || row.clientName || undefined,
    clientWhatsapp: row.client_whatsapp || row.clientWhatsapp || undefined,
    client_whatsapp: row.client_whatsapp || row.clientWhatsapp || undefined,
    operatorId: row.operator_id || row.operatorId || undefined,
    operator_id: row.operator_id || row.operatorId || undefined,
    status: (row.status || 'pending').toLowerCase() as any,
    changesPayload: parsedPayload,
    changes_payload: parsedPayload,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    created_at: row.created_at || row.createdAt || new Date().toISOString(),
    completedAt: row.completed_at || row.completedAt || undefined,
    completed_at: row.completed_at || row.completedAt || undefined
  };
}

/**
 * Converte linha do Supabase para Operator
 */
export function mapRowToOperator(row: any): Operator {
  return {
    id: row.id,
    candidateId: row.candidate_id || row.candidateId,
    name: row.name || '',
    cpf: row.cpf,
    email: row.email || '',
    passwordHash: row.password_hash || row.passwordHash || '',
    tempPasswordPlain: row.temp_password_plain || row.tempPasswordPlain,
    mustChangePassword: Boolean(row.must_change_password === true || row.mustChangePassword === true),
    must_change_password: Boolean(row.must_change_password === true || row.mustChangePassword === true),
    corporate_email: row.corporate_email || row.corporateEmail || undefined,
    corporateEmail: row.corporate_email || row.corporateEmail || undefined,
    lark_provisioned: Boolean(row.lark_provisioned ?? row.larkProvisioned ?? false),
    larkProvisioned: Boolean(row.lark_provisioned ?? row.larkProvisioned ?? false),
    whatsapp: row.whatsapp || '',
    pixType: row.pix_type || row.pixType || 'cpf',
    pixKey: row.pix_key || row.pixKey || '',
    pix_type: row.pix_type || row.pixType || 'cpf',
    pix_key: row.pix_key || row.pixKey || '',
    serialToken: row.serial_token || row.serialToken || '',
    status: row.status || 'ATIVO',
    cep: row.cep || undefined,
    address: row.address || undefined,
    neighborhood: row.neighborhood || undefined,
    city_state: row.city_state || row.cityState || undefined,
    cityState: row.city_state || row.cityState || undefined,
    experience: row.experience || undefined,
    machineId: row.machine_id || row.machineId,
    osInfo: row.os_info || row.osInfo,
    operatorIp: row.operator_ip || row.operatorIp,
    lastSync: row.last_sync || row.lastSync,
    dailyLimit: Number(row.daily_limit || row.dailyLimit || 50),
    todayGenerations: Number(row.today_generations || row.todayGenerations || 0),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    affiliate_enabled: row.affiliate_enabled ?? false,
    affiliate_code: row.affiliate_code || undefined,
    referred_by_operator_id: row.referred_by_operator_id || null,
    accepted_terms_at: row.accepted_terms_at || undefined,
    accepted_terms_ip: row.accepted_terms_ip || undefined,
    accepted_terms_version: row.accepted_terms_version || undefined,
    avatar_config: row.avatar_config || row.avatarConfig || undefined,
    avatarConfig: row.avatar_config || row.avatarConfig || undefined,
    avatar_svg: row.avatar_svg || row.avatarSvg || undefined,
    avatarSvg: row.avatar_svg || row.avatarSvg || undefined
  };
}

/**
 * Converte linha do Supabase para AffiliateCommissionRecord
 */
export function mapRowToAffiliateCommission(row: any): AffiliateCommissionRecord {
  return {
    id: row.id,
    affiliate_operator_id: row.affiliate_operator_id,
    invited_operator_id: row.invited_operator_id,
    invited_operator_name: row.invited_operator_name || '',
    lead_or_sale_id: row.lead_or_sale_id,
    sale_amount: Number(row.sale_amount || 490.00),
    commission_rate: Number(row.commission_rate || 0.05),
    commission_amount: Number(row.commission_amount || 24.50),
    month_ref: row.month_ref,
    payout_status: row.payout_status || 'available',
    created_at: row.created_at || new Date().toISOString()
  };
}

let isSeeding = false;

/**
 * Importa automaticamente os dados existentes em db.json para o Supabase
 * se as tabelas estiverem vazias (upsert idempotente).
 */
export async function seedSupabaseFromLocalDb(): Promise<void> {
  if (isSeeding) return;
  isSeeding = true;

  try {
    const supabase = getSupabaseAdmin();
    const db = readDb();

    // 1. Seed Subscriptions
    const { count: subCount } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true });

    if (subCount === 0 && Array.isArray(db.subscriptions) && db.subscriptions.length > 0) {
      console.log(`[Supabase Seed] Importando ${db.subscriptions.length} assinaturas locais...`);
      for (const sub of db.subscriptions) {
        await upsertSubscriptionInSupabase(sub);
      }
    }

    // 2. Seed Operators
    const { count: opCount } = await supabase
      .from('operators')
      .select('*', { count: 'exact', head: true });

    if (opCount === 0 && Array.isArray(db.operators) && db.operators.length > 0) {
      console.log(`[Supabase Seed] Importando ${db.operators.length} operadores locais...`);
      for (const op of db.operators) {
        await upsertOperatorInSupabase(op);
      }
    }

    // 3. Seed Affiliate Commissions
    const { count: affCount } = await supabase
      .from('affiliate_commissions')
      .select('*', { count: 'exact', head: true });

    if (affCount === 0 && Array.isArray(db.affiliateCommissions) && db.affiliateCommissions.length > 0) {
      console.log(`[Supabase Seed] Importando ${db.affiliateCommissions.length} comissões de afiliados locais...`);
      for (const aff of db.affiliateCommissions) {
        await upsertAffiliateCommissionInSupabase(aff);
      }
    }
  } catch (err) {
    console.warn('[Supabase Seed] Aviso ao sincronizar seed inicial:', err);
  } finally {
    isSeeding = false;
  }
}

/**
 * Consulta todas as assinaturas diretamente no Supabase em tempo real.
 * Se a tabela estiver vazia, aciona o seed inicial a partir do db.json.
 */
export async function fetchAllSubscriptionsFromSupabase(): Promise<SubscriptionRecord[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      if (data.length === 0) {
        // Tabela vazia: executa seed inicial
        await seedSupabaseFromLocalDb();
        const db = readDb();
        return Array.isArray(db.subscriptions) ? db.subscriptions : [];
      }
      return data.map(mapRowToSubscription);
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao buscar assinaturas no Supabase:', err);
  }

  // Fallback seguro para banco local
  const db = readDb();
  return Array.isArray(db.subscriptions) ? db.subscriptions : [];
}

/**
 * Consulta todos os operadores no Supabase em tempo real
 */
export async function fetchAllOperatorsFromSupabase(): Promise<Operator[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && Array.isArray(data)) {
      if (data.length === 0) {
        await seedSupabaseFromLocalDb();
        const db = readDb();
        return Array.isArray(db.operators) ? db.operators : [];
      }
      return data.map(mapRowToOperator);
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao buscar operadores no Supabase:', err);
  }

  const db = readDb();
  return Array.isArray(db.operators) ? db.operators : [];
}

/**
 * Consulta todas as comissões de afiliados no Supabase em tempo real
 */
export async function fetchAllAffiliateCommissionsFromSupabase(): Promise<AffiliateCommissionRecord[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('affiliate_commissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map(mapRowToAffiliateCommission);
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao buscar comissões de afiliados no Supabase:', err);
  }

  const db = readDb();
  return Array.isArray(db.affiliateCommissions) ? db.affiliateCommissions : [];
}

/**
 * Consulta um site diretamente no Supabase por slug ou domínio próprio
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
      .or(`site_slug.eq.${clean},custom_domain.eq.${clean},id.eq.${clean}`)
      .limit(1)
      .maybeSingle();

    if (!subErr && subData) {
      return {
        id: subData.id || `sub_${clean}`,
        siteSlug: subData.site_slug || clean,
        clientName: subData.client_name || clean.toUpperCase(),
        status: (subData.status || subData.site_status || 'active').toLowerCase() as any,
        deployedUrl: subData.deployed_url || `https://${clean}.vercel.app`,
        monthlyPrice: Number(subData.monthly_price || 29.90),
        checkoutUrl: subData.checkout_url || `/api/subscription/create-checkout?slug=${clean}`,
        clientPhone: subData.client_phone,
        clientEmail: subData.client_email,
        operatorId: subData.operator_id,
        operatorName: subData.operator_name,
        operatorToken: subData.operator_token,
        custom_domain: subData.custom_domain,
        domain_status: subData.domain_status,
        domain_purchased_at: subData.domain_purchased_at,
        accepted_terms_at: subData.accepted_terms_at,
        accepted_terms_ip: subData.accepted_terms_ip,
        accepted_terms_version: subData.accepted_terms_version,
        updatedAt: subData.updated_at,
        createdAt: subData.created_at
      };
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao consultar site no Supabase:', err);
  }

  return null;
}

/**
 * Insere ou atualiza uma assinatura no Supabase (upsert idempotente)
 */
export async function upsertSubscriptionInSupabase(sub: Partial<SubscriptionRecord>): Promise<boolean> {
  if (!sub || (!sub.id && !sub.siteSlug)) return false;

  const id = sub.id || `sub_${sub.siteSlug}`;
  const nowIso = new Date().toISOString();

  const payload: any = {
    id,
    lead_token: sub.leadToken || null,
    site_slug: sub.siteSlug || id.replace('sub_', ''),
    client_name: sub.clientName || sub.siteSlug || 'Cliente Webbilly',
    client_phone: sub.clientPhone || null,
    client_email: sub.clientEmail || null,
    operator_id: sub.operatorId || null,
    operator_name: sub.operatorName || null,
    operator_token: sub.operatorToken || null,
    monthly_price: sub.monthlyPrice ?? 29.90,
    commission_monthly: sub.commissionMonthly ?? 10.00,
    status: (sub.status || 'active').toLowerCase(),
    site_status: (sub.status || 'active').toLowerCase(),
    custom_domain: sub.custom_domain || sub.customDomain || null,
    domain_status: sub.domain_status || sub.domainStatus || 'subdomain_only',
    domain_purchased_at: sub.domain_purchased_at || sub.domainPurchasedAt || null,
    deployed_url: sub.deployedUrl || `https://${sub.siteSlug}.vercel.app`,
    checkout_url: sub.checkoutUrl || `/api/subscription/create-checkout?slug=${sub.siteSlug}`,
    asaas_customer_id: (sub as any).asaasCustomerId || (sub as any).asaas_customer_id || null,
    asaas_payment_id: (sub as any).asaasPaymentId || (sub as any).asaas_payment_id || null,
    asaas_subscription_id: (sub as any).asaasSubscriptionId || (sub as any).asaas_subscription_id || null,
    updated_at: sub.updatedAt || nowIso
  };

  if (sub.accepted_terms_at) {
    payload.accepted_terms_at = sub.accepted_terms_at;
    payload.accepted_terms_ip = sub.accepted_terms_ip || null;
    payload.accepted_terms_version = sub.accepted_terms_version || 'v1.0';
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('subscriptions')
      .upsert(payload, { onConflict: 'id' });

    if (!error) return true;
    console.warn('[Supabase] Erro ao upsert em subscriptions:', error);
  } catch (err) {
    console.warn('[Supabase] Falha de conexão no upsert de assinatura:', err);
  }

  return false;
}

/**
 * Insere ou atualiza um operador no Supabase (Fonte de Verdade dos operadores)
 */
export async function upsertOperatorInSupabase(op: Partial<Operator>): Promise<boolean> {
  if (!op || (!op.id && !op.email)) return false;

  const id = op.id || `OP-${Date.now().toString(36).toUpperCase()}`;
  const nowIso = new Date().toISOString();

  // Colunas compatíveis estritamente validadas na tabela public.operators
  const payload: any = {
    id,
    name: op.name || 'Operador Webbilly',
    email: op.email || '',
    whatsapp: op.whatsapp || null,
    pix_type: op.pix_type || op.pixType || 'cpf',
    pix_key: op.pix_key || op.pixKey || '',
    serial_token: op.serialToken || null,
    status: op.status || 'ATIVO',
    affiliate_enabled: Boolean(op.affiliate_enabled),
    affiliate_code: op.affiliate_code || null,
    referred_by_operator_id: op.referred_by_operator_id || null,
    updated_at: nowIso
  };

  if (op.accepted_terms_at) {
    payload.accepted_terms_at = op.accepted_terms_at;
    payload.accepted_terms_ip = op.accepted_terms_ip || null;
    payload.accepted_terms_version = op.accepted_terms_version || 'v1.0';
  }

  if (op.avatar_config || (op as any).avatarConfig) {
    payload.avatar_config = op.avatar_config || (op as any).avatarConfig;
  }
  if (op.avatar_svg || (op as any).avatarSvg) {
    payload.avatar_svg = op.avatar_svg || (op as any).avatarSvg;
  }

  if (op.mustChangePassword !== undefined || op.must_change_password !== undefined) {
    payload.must_change_password = Boolean(op.must_change_password ?? op.mustChangePassword ?? false);
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('operators')
      .upsert(payload, { onConflict: 'id' });

    if (!error) return true;
    console.warn('[Supabase] Erro ao upsert em operators:', error);
  } catch (err) {
    console.warn('[Supabase] Falha de conexão no upsert de operador:', err);
  }

  return false;
}

/**
 * Insere uma comissão de afiliado no Supabase de forma idempotente
 */
export async function upsertAffiliateCommissionInSupabase(comm: AffiliateCommissionRecord): Promise<boolean> {
  if (!comm || !comm.lead_or_sale_id) return false;

  const payload = {
    id: comm.id || `AFF-${comm.lead_or_sale_id}`,
    affiliate_operator_id: comm.affiliate_operator_id,
    invited_operator_id: comm.invited_operator_id,
    invited_operator_name: comm.invited_operator_name || '',
    lead_or_sale_id: comm.lead_or_sale_id,
    sale_amount: Number(comm.sale_amount || 490.00),
    commission_rate: Number(comm.commission_rate || 0.05),
    commission_amount: Number(comm.commission_amount || 24.50),
    month_ref: comm.month_ref,
    payout_status: comm.payout_status || 'available',
    created_at: comm.created_at || new Date().toISOString()
  };

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('affiliate_commissions')
      .upsert(payload, { onConflict: 'lead_or_sale_id' });

    if (!error) return true;
    console.warn('[Supabase] Erro ao upsert em affiliate_commissions:', error);
  } catch (err) {
    console.warn('[Supabase] Falha de conexão no upsert de comissão de afiliado:', err);
  }

  return false;
}

/**
 * Atualiza o status do site no Supabase com service_role
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

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: newStatus,
        site_status: newStatus,
        updated_at: nowIso
      })
      .or(`id.eq.${clean},site_slug.eq.${clean},custom_domain.eq.${clean}`);

    if (!error) return true;
  } catch (err) {
    console.warn('[Supabase] Erro ao atualizar status no Supabase:', err);
  }

  return false;
}

/**
 * Registra prova digital e auditoria jurídica de aceite eletrônico no Supabase
 */
export async function recordTermsAcceptanceInSupabase({
  targetType,
  identifier,
  ip,
  version = 'v1.0'
}: {
  targetType: 'operator' | 'candidate' | 'subscription' | 'lead' | 'site';
  identifier: string;
  ip: string;
  version?: string;
}): Promise<boolean> {
  if (!identifier) return false;
  const cleanId = identifier.trim();
  const nowIso = new Date().toISOString();
  const payload = {
    accepted_terms_at: nowIso,
    accepted_terms_ip: ip || '127.0.0.1',
    accepted_terms_version: version
  };

  try {
    const supabase = getSupabaseAdmin();

    if (targetType === 'operator') {
      await supabase
        .from('operators')
        .update(payload)
        .or(`id.eq.${cleanId},email.eq.${cleanId},serial_token.eq.${cleanId}`);
      return true;
    }

    if (targetType === 'subscription' || targetType === 'site' || targetType === 'lead') {
      await supabase
        .from('subscriptions')
        .update(payload)
        .or(`id.eq.${cleanId},site_slug.eq.${cleanId},lead_token.eq.${cleanId},custom_domain.eq.${cleanId}`);
      return true;
    }
  } catch (err) {
    console.warn('[Supabase Terms] Aviso ao gravar aceite eletrônico no Supabase:', err);
  }

  return false;
}

/**
 * Registra solicitação de cancelamento de assinatura no Supabase (iniciada pelo operador)
 */
export async function requestCancellationInSupabase(
  siteSlug: string,
  reason: string
): Promise<boolean> {
  const clean = siteSlug.toLowerCase().trim();
  const nowIso = new Date().toISOString();

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('subscriptions')
      .update({
        cancellation_requested: true,
        cancellation_reason: reason,
        cancellation_requested_at: nowIso,
        updated_at: nowIso
      })
      .or(`site_slug.eq.${clean},id.eq.${clean}`);

    if (!error) return true;
  } catch (err) {
    console.warn('[Supabase] Erro ao registrar solicitação de cancelamento:', err);
  }

  return false;
}

/**
 * Conclui cancelamento definitivo de assinatura no Supabase (efetuado pelo Admin)
 */
export async function cancelDefinitiveInSupabase(
  siteSlugOrId: string
): Promise<boolean> {
  const clean = siteSlugOrId.toLowerCase().trim();
  const nowIso = new Date().toISOString();

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        site_status: 'deleted',
        cancellation_requested: false,
        cancelled_at: nowIso,
        updated_at: nowIso
      })
      .or(`site_slug.eq.${clean},id.eq.${clean}`);

    if (!error) return true;
  } catch (err) {
    console.warn('[Supabase] Erro ao concluir cancelamento definitivo:', err);
  }

  return false;
}

/**
 * Consulta solicitações de alteração de site
 */
export async function getSiteChangeRequestsFromSupabase(
  filter?: { siteSlug?: string; status?: string }
): Promise<SiteChangeRequestRecord[]> {
  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('site_change_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter?.siteSlug) {
      query = query.eq('site_slug', filter.siteSlug.toLowerCase().trim());
    }
    if (filter?.status) {
      query = query.eq('status', filter.status);
    }

    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      return data.map(mapRowToSiteChangeRequest);
    }
  } catch (err) {
    console.warn('[Supabase] Erro ao buscar site_change_requests:', err);
  }

  // Fallback: lê do db.json
  const db = readDb();
  let list = db.siteChangeRequests || [];
  if (filter?.siteSlug) {
    list = list.filter(r => (r.siteSlug || '').toLowerCase() === filter.siteSlug!.toLowerCase());
  }
  if (filter?.status) {
    list = list.filter(r => r.status === filter.status);
  }
  return list;
}

/**
 * Cria nova solicitação de alteração de site
 */
export async function createSiteChangeRequestInSupabase(
  record: SiteChangeRequestRecord
): Promise<boolean> {
  const nowIso = new Date().toISOString();
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('site_change_requests')
      .insert({
        id: record.id,
        site_slug: record.siteSlug.toLowerCase().trim(),
        client_name: record.clientName || null,
        client_whatsapp: record.clientWhatsapp || null,
        operator_id: record.operatorId || null,
        status: record.status || 'pending',
        changes_payload: record.changesPayload || {},
        created_at: record.createdAt || nowIso
      });

    if (!error) return true;
  } catch (err) {
    console.warn('[Supabase] Erro ao inserir site_change_requests:', err);
  }

  // Fallback db.json
  const db = readDb();
  if (!Array.isArray(db.siteChangeRequests)) {
    db.siteChangeRequests = [];
  }
  db.siteChangeRequests.unshift(record);
  writeDb(db);
  return true;
}

/**
 * Marca solicitação de alteração como concluída
 */
export async function completeSiteChangeRequestInSupabase(
  id: string
): Promise<boolean> {
  const nowIso = new Date().toISOString();
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('site_change_requests')
      .update({
        status: 'completed',
        completed_at: nowIso
      })
      .eq('id', id);

    if (!error) return true;
  } catch (err) {
    console.warn('[Supabase] Erro ao concluir site_change_requests:', err);
  }

  // Fallback db.json
  const db = readDb();
  if (Array.isArray(db.siteChangeRequests)) {
    const target = db.siteChangeRequests.find(r => r.id === id);
    if (target) {
      target.status = 'completed';
      target.completedAt = nowIso;
      writeDb(db);
      return true;
    }
  }
  return false;
}

/**
 * Salva avatar (configuração JSONB e SVG gerado) do operador ou admin no Supabase
 * Utiliza update com fallback de upsert/insert caso a linha ainda não exista
 */
export async function saveOperatorAvatarInSupabase(
  identifier: string,
  avatarConfig: any,
  avatarSvg: string,
  extra?: { email?: string; name?: string }
): Promise<boolean> {
  if (!identifier) return false;
  const cleanId = identifier.trim();
  const cleanEmail = extra?.email?.trim().toLowerCase() || (cleanId.includes('@') ? cleanId.toLowerCase() : '');
  const cleanName = extra?.name?.trim() || cleanId;
  let persistedInSupabase = false;

  try {
    const supabase = getSupabaseAdmin();
    const nowIso = new Date().toISOString();

    // 1. Tenta atualizar registro existente por id, email ou serial_token
    let updateQuery = supabase
      .from('operators')
      .update({
        avatar_config: avatarConfig,
        avatar_svg: avatarSvg,
        updated_at: nowIso
      });

    if (cleanEmail) {
      updateQuery = updateQuery.or(`id.eq.${cleanId},email.eq.${cleanEmail},serial_token.eq.${cleanId}`);
    } else {
      updateQuery = updateQuery.or(`id.eq.${cleanId},serial_token.eq.${cleanId}`);
    }

    const { data: updatedRows, error: updateErr } = await updateQuery.select('id');

    if (!updateErr && updatedRows && updatedRows.length > 0) {
      persistedInSupabase = true;
    } else {
      // 2. Se nenhuma linha foi atualizada, tenta realizar upsert/insert com os dados do operador
      const db = readDb();
      const localOp = (db.operators || []).find(
        o => o.id === cleanId || (cleanEmail && o.email?.toLowerCase() === cleanEmail)
      );
      const localAdmin = (db.adminUsers || []).find(
        a => a.id === cleanId || (cleanEmail && a.email?.toLowerCase() === cleanEmail)
      );

      const effectiveId = localOp?.id || (cleanId === 'admin' ? 'OP-0001' : cleanId);
      const effectiveEmail = localOp?.email || localAdmin?.email || cleanEmail || (effectiveId === 'OP-0001' ? 'admin@billysuite.com.br' : `${cleanId.toLowerCase()}@webbilly.com.br`);
      const effectiveName = localOp?.name || localAdmin?.name || cleanName;
      const effectiveToken = localOp?.serialToken || (effectiveId === 'OP-0001' ? 'BILLY-OP-ADMIN-MASTER-2026' : `BILLY-OP-${cleanId}`);

      const upsertPayload: any = {
        id: effectiveId,
        name: effectiveName,
        email: effectiveEmail,
        serial_token: effectiveToken,
        status: 'ATIVO',
        avatar_config: avatarConfig,
        avatar_svg: avatarSvg,
        updated_at: nowIso,
        created_at: localOp?.createdAt || nowIso
      };

      if (localOp?.whatsapp) upsertPayload.whatsapp = localOp.whatsapp;
      if (localOp?.pixKey) upsertPayload.pix_key = localOp.pixKey;
      if (localOp?.pixType) upsertPayload.pix_type = localOp.pixType;
      if (localOp?.passwordHash) upsertPayload.password_hash = localOp.passwordHash;

      const { error: upsertErr } = await supabase
        .from('operators')
        .upsert(upsertPayload, { onConflict: 'id' });

      if (!upsertErr) {
        persistedInSupabase = true;
      } else {
        console.warn('[Supabase Avatar] Aviso ao realizar upsert:', upsertErr.message);
      }
    }
  } catch (err: any) {
    console.warn('[Supabase Avatar] Erro de conexão com Supabase:', err?.message || err);
  }

  // 3. Fallback e redundância em db.json
  let persistedInDb = false;
  try {
    const db = readDb();
    if (Array.isArray(db.operators)) {
      const op = db.operators.find(
        o => o.id === cleanId || (cleanEmail && o.email?.toLowerCase() === cleanEmail) || o.serialToken === cleanId
      );
      if (op) {
        op.avatar_config = avatarConfig;
        op.avatarConfig = avatarConfig;
        op.avatar_svg = avatarSvg;
        op.avatarSvg = avatarSvg;
        persistedInDb = true;
      }
    }
    // Caso seja admin master
    const adminUserMatch = (db.adminUsers || []).find(
      u => u.id === cleanId ||
           (u.email && u.email.toLowerCase() === cleanEmail) ||
           ((u as any).personal_email && (u as any).personal_email.toLowerCase() === cleanEmail) ||
           (cleanId === 'admin' && u.role === 'MASTER')
    );
    if (adminUserMatch) {
      adminUserMatch.avatar_config = avatarConfig;
      adminUserMatch.avatarConfig = avatarConfig;
      adminUserMatch.avatar_svg = avatarSvg;
      adminUserMatch.avatarSvg = avatarSvg;
      persistedInDb = true;
    }
    if (persistedInDb) {
      writeDb(db);
    }
  } catch (dbErr) {
    console.warn('[Avatar Save] Erro ao gravar no db.json:', dbErr);
  }

  return persistedInSupabase || persistedInDb;
}

/**
 * Salva leads prospectados no Supabase (tabela prospected_leads) e db.json local para reuso sem gastar API
 */
export async function upsertProspectedLeadsInSupabase(leads: any[], operatorId: string = 'OP-BILLY-01'): Promise<boolean> {
  if (!Array.isArray(leads) || leads.length === 0) return false;

  const nowIso = new Date().toISOString();

  // 1. Persiste no Supabase
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const records = leads.map((l, idx) => {
        const placeId = l.place_id || l.placeId || l.id || `lead_${Date.now()}_${idx}`;
        const photos = Array.isArray(l.photos) ? l.photos.slice(0, 10) : [];
        const coverPhoto = l.cover_photo || (photos.length > 0 ? photos[0] : null);

        return {
          id: l.id || `lead_${Date.now()}_${idx}`,
          place_id: placeId,
          operator_id: operatorId,
          business_name: l.name || l.business_name || 'Comércio Local',
          niche: l.niche || l.category || 'Comércio Local',
          city: l.city || '',
          address: l.address || '',
          phone: l.phone || '',
          whatsapp: l.whatsapp || (l.phone ? String(l.phone).replace(/\D/g, '') : ''),
          rating: Number(l.rating || 5.0),
          reviews_count: Number(l.reviewsCount || l.reviews || 0),
          website_uri: l.website || l.website_uri || null,
          cover_photo: coverPhoto,
          photos_json: photos,
          opening_hours: l.hours || l.openingHours || '',
          reviews_json: Array.isArray(l.realReviews) ? l.realReviews : (Array.isArray(l.reviews_json) ? l.reviews_json : []),
          status: l.status || 'new',
          updated_at: nowIso
        };
      });

      // Upsert com onConflict por place_id se a constraint existir, ou por id
      const { error } = await supabase
        .from('prospected_leads')
        .upsert(records, { onConflict: 'place_id' });

      if (error) {
        try {
          await supabase.from('prospected_leads').upsert(records, { onConflict: 'id' });
        } catch {}
      }
    }
  } catch (err: any) {
    console.warn('[Supabase Leads] Aviso ao salvar leads no Supabase:', err?.message || err);
  }

  // 2. Persiste em db.json local como redundância
  try {
    const db = readDb();
    if (!Array.isArray((db as any).prospectedLeads)) {
      (db as any).prospectedLeads = [];
    }
    const currentList: any[] = (db as any).prospectedLeads;

    for (const l of leads) {
      const key = l.place_id || l.id || l.name;
      const existingIdx = currentList.findIndex(
        (item: any) =>
          (item.place_id && item.place_id === key) ||
          (item.id && item.id === key) ||
          (item.name === (l.name || l.business_name) && item.city === l.city)
      );
      const photos = Array.isArray(l.photos) ? l.photos.slice(0, 10) : [];
      const coverPhoto = l.cover_photo || (photos.length > 0 ? photos[0] : null);

      const formatted = {
        id: l.id || `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        place_id: l.place_id || l.id,
        operator_id: operatorId,
        business_name: l.name || l.business_name,
        name: l.name || l.business_name,
        niche: l.niche || l.category || 'Comércio Local',
        category: l.category || l.niche || 'Comércio Local',
        city: l.city || '',
        address: l.address || '',
        phone: l.phone || '',
        whatsapp: l.whatsapp || (l.phone ? String(l.phone).replace(/\D/g, '') : ''),
        rating: Number(l.rating || 5.0),
        reviewsCount: Number(l.reviewsCount || l.reviews || 0),
        website: l.website || l.website_uri || null,
        cover_photo: coverPhoto,
        photos,
        hours: l.hours || l.openingHours || '',
        openingHours: l.hours || l.openingHours || '',
        realReviews: l.realReviews || l.reviews_json || [],
        status: l.status || 'new',
        updated_at: nowIso,
        created_at: l.created_at || nowIso
      };

      if (existingIdx >= 0) {
        currentList[existingIdx] = { ...currentList[existingIdx], ...formatted };
      } else {
        currentList.unshift(formatted);
      }
    }

    // Mantém os 300 leads mais recentes no cache local
    (db as any).prospectedLeads = currentList.slice(0, 300);
    writeDb(db);
  } catch (dbErr) {
    console.warn('[DB Leads] Aviso db.json:', dbErr);
  }

  return true;
}

/**
 * Consulta leads salvos no Supabase (ou db.json local) para reutilização sem gastar APIs externas
 */
export async function fetchProspectedLeadsFromSupabase(params?: {
  niche?: string;
  city?: string;
  query?: string;
  operatorId?: string;
  role?: string;
}): Promise<any[]> {
  const { niche, city, query, operatorId, role } = params || {};
  let supaLeads: any[] = [];

  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      let q = supabase
        .from('prospected_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const isAdmin = role === 'admin' || (operatorId && (operatorId.toLowerCase().includes('admin') || operatorId === 'all'));
      if (operatorId && !isAdmin) {
        q = q.eq('operator_id', operatorId);
      }
      if (niche && niche.trim()) {
        q = q.ilike('niche', `%${niche.trim()}%`);
      }
      if (city && city.trim()) {
        q = q.ilike('city', `%${city.trim()}%`);
      }

      const { data, error } = await q;
      if (!error && Array.isArray(data) && data.length > 0) {
        supaLeads = data.map((row: any) => {
          const insta = extractInstagramHandleFromUrl(row.website_uri);
          return {
            id: row.id,
            place_id: row.place_id,
            placeId: row.place_id || row.id,
            name: row.business_name || row.name,
            business_name: row.business_name || row.name,
            niche: row.niche,
            category: row.niche,
            city: row.city,
            address: row.address,
            phone: row.phone,
            whatsapp: row.whatsapp,
            website: row.website_uri,
            websiteUri: row.website_uri,
            instagram: insta ? `@${insta}` : undefined,
            instagramHandle: insta || undefined,
            rating: Number(row.rating || 5.0),
            reviewsCount: Number(row.reviews_count || 0),
            reviews: Number(row.reviews_count || 0),
            cover_photo: row.cover_photo,
            photos: Array.isArray(row.photos_json) ? row.photos_json : (row.cover_photo ? [row.cover_photo] : []),
            hours: row.opening_hours,
            openingHours: row.opening_hours,
            realReviews: Array.isArray(row.reviews_json) ? row.reviews_json : [],
            status: row.status || 'new',
            created_at: row.created_at
          };
        });
      }
    }
  } catch (err: any) {
    console.warn('[Supabase Leads] Erro ao buscar prospected_leads:', err?.message || err);
  }

  // Se o Supabase retornou leads, filtra por texto caso haja query
  if (supaLeads.length > 0) {
    if (query && query.trim()) {
      const qLower = query.toLowerCase().trim();
      return supaLeads.filter(
        (l) =>
          l.name.toLowerCase().includes(qLower) ||
          (l.niche && l.niche.toLowerCase().includes(qLower)) ||
          (l.city && l.city.toLowerCase().includes(qLower))
      );
    }
    return supaLeads;
  }

  // Fallback: db.json local
  try {
    const db = readDb();
    let localLeads: any[] = (db as any).prospectedLeads || [];
    if (niche && niche.trim()) {
      const nLower = niche.toLowerCase().trim();
      localLeads = localLeads.filter((l) => (l.niche || l.category || '').toLowerCase().includes(nLower));
    }
    if (city && city.trim()) {
      const cLower = city.toLowerCase().trim();
      localLeads = localLeads.filter((l) => (l.city || '').toLowerCase().includes(cLower));
    }
    if (query && query.trim()) {
      const qLower = query.toLowerCase().trim();
      localLeads = localLeads.filter(
        (l) =>
          (l.name || l.business_name || '').toLowerCase().includes(qLower) ||
          (l.niche || l.category || '').toLowerCase().includes(qLower) ||
          (l.city || '').toLowerCase().includes(qLower)
      );
    }
    return localLeads;
  } catch {
    return [];
  }
}

// ==============================================================================
// 1. CLIENT ACCOUNTS (Portal do Cliente Final)
// ==============================================================================

export function mapRowToClientAccount(row: any): ClientAccountRecord {
  return {
    id: row.id,
    site_id: row.site_id || row.siteId,
    site_slug: row.site_slug || row.siteSlug || '',
    siteSlug: row.site_slug || row.siteSlug || '',
    lead_id: row.lead_id || row.leadId || null,
    leadId: row.lead_id || row.leadId || null,
    operator_id: row.operator_id || row.operatorId || null,
    operatorId: row.operator_id || row.operatorId || null,
    business_name: row.business_name || row.businessName || 'Meu Negócio',
    businessName: row.business_name || row.businessName || 'Meu Negócio',
    domain_login: row.domain_login || row.domainLogin || '',
    domainLogin: row.domain_login || row.domainLogin || '',
    email: row.email || null,
    phone: row.phone || null,
    password_hash: row.password_hash || row.passwordHash || '',
    passwordHash: row.password_hash || row.passwordHash || '',
    initial_password_plain: row.initial_password_plain || row.initialPasswordPlain || null,
    initialPasswordPlain: row.initial_password_plain || row.initialPasswordPlain || null,
    plan_type: row.plan_type || row.planType || 'monthly_29_90',
    planType: row.plan_type || row.planType || 'monthly_29_90',
    status: row.status || 'active',
    monthly_edits_limit: Number(row.monthly_edits_limit ?? 3),
    monthly_edits_used: Number(row.monthly_edits_used ?? 0),
    extra_edit_credits: Number(row.extra_edit_credits ?? 0),
    edits_reset_at: row.edits_reset_at || row.editsResetAt || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    asaas_customer_id: row.asaas_customer_id || row.asaasCustomerId || null,
    asaasCustomerId: row.asaas_customer_id || row.asaasCustomerId || null,
    asaas_subscription_id: row.asaas_subscription_id || row.asaasSubscriptionId || null,
    asaasSubscriptionId: row.asaas_subscription_id || row.asaasSubscriptionId || null,
    created_at: row.created_at || row.createdAt || new Date().toISOString(),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updated_at: row.updated_at || row.updatedAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString()
  };
}

/**
 * Reseta o contador de alterações mensais se já completou 30 dias desde o último ciclo
 */
export async function checkAndResetClientEdits(account: ClientAccountRecord): Promise<ClientAccountRecord> {
  if (account.plan_type !== 'monthly_29_90') {
    return account;
  }
  const now = new Date();
  const resetAt = account.edits_reset_at ? new Date(account.edits_reset_at) : new Date(0);
  if (now >= resetAt) {
    const nextReset = new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString();
    const updated = {
      ...account,
      monthly_edits_used: 0,
      edits_reset_at: nextReset,
      updated_at: now.toISOString()
    };
    try {
      const supabase = getSupabaseAdmin();
      await supabase
        .from('client_accounts')
        .update({
          monthly_edits_used: 0,
          edits_reset_at: nextReset,
          updated_at: now.toISOString()
        })
        .eq('id', account.id);
    } catch (_) {}

    try {
      const db = readDb();
      if (db.clientAccounts) {
        const idx = db.clientAccounts.findIndex(c => c.id === account.id);
        if (idx >= 0) {
          db.clientAccounts[idx] = updated;
          writeDb(db);
        }
      }
    } catch (_) {}

    return updated;
  }
  return account;
}

export async function findClientAccountByDomain(domainOrSlug: string): Promise<ClientAccountRecord | null> {
  const clean = domainOrSlug.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const slugOnly = clean.replace(/\.webbilly\.com\.br$/, '').replace(/\.com\.br$/, '');

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('client_accounts')
      .select('*')
      .or(`domain_login.eq.${clean},domain_login.eq.${slugOnly},site_slug.eq.${slugOnly},domain_login.ilike.%${slugOnly}%`)
      .limit(1);

    if (!error && data && data.length > 0) {
      const acc = mapRowToClientAccount(data[0]);
      return await checkAndResetClientEdits(acc);
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao consultar client_accounts por domínio:', err);
  }

  // Fallback db.json
  try {
    const db = readDb();
    const local = (db.clientAccounts || []).find(
      c =>
        c.domain_login?.toLowerCase() === clean ||
        c.domain_login?.toLowerCase() === slugOnly ||
        c.site_slug?.toLowerCase() === slugOnly ||
        c.domain_login?.toLowerCase().includes(slugOnly)
    );
    if (local) {
      return await checkAndResetClientEdits(local);
    }
  } catch (_) {}

  return null;
}

export async function findClientAccountById(id: string): Promise<ClientAccountRecord | null> {
  if (!id) return null;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('client_accounts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      const acc = mapRowToClientAccount(data);
      return await checkAndResetClientEdits(acc);
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao consultar client_accounts por id:', err);
  }

  try {
    const db = readDb();
    const local = (db.clientAccounts || []).find(c => c.id === id);
    if (local) return await checkAndResetClientEdits(local);
  } catch (_) {}

  return null;
}

export async function findClientAccountBySlug(slug: string): Promise<ClientAccountRecord | null> {
  if (!slug) return null;
  const clean = slug.trim().toLowerCase();
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('client_accounts')
      .select('*')
      .eq('site_slug', clean)
      .maybeSingle();

    if (!error && data) {
      const acc = mapRowToClientAccount(data);
      return await checkAndResetClientEdits(acc);
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao consultar client_accounts por slug:', err);
  }

  try {
    const db = readDb();
    const local = (db.clientAccounts || []).find(c => c.site_slug?.toLowerCase() === clean);
    if (local) return await checkAndResetClientEdits(local);
  } catch (_) {}

  return null;
}

export async function listClientAccounts(): Promise<ClientAccountRecord[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('client_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map(mapRowToClientAccount);
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao listar client_accounts:', err);
  }

  try {
    const db = readDb();
    return db.clientAccounts || [];
  } catch (_) {
    return [];
  }
}

export async function createOrUpdateClientAccount(record: Partial<ClientAccountRecord>): Promise<ClientAccountRecord> {
  const nowIso = new Date().toISOString();
  const id = record.id || crypto.randomUUID();
  const siteSlug = (record.site_slug || record.siteSlug || '').toLowerCase().trim();
  const domainLogin = (record.domain_login || record.domainLogin || `${siteSlug}.webbilly.com.br`).toLowerCase().trim();

  const fullRecord: ClientAccountRecord = {
    id,
    site_id: record.site_id,
    site_slug: siteSlug,
    siteSlug: siteSlug,
    lead_id: record.lead_id || record.leadId || null,
    leadId: record.lead_id || record.leadId || null,
    operator_id: record.operator_id || record.operatorId || null,
    operatorId: record.operator_id || record.operatorId || null,
    business_name: record.business_name || record.businessName || 'Empresa Oficial',
    businessName: record.business_name || record.businessName || 'Empresa Oficial',
    domain_login: domainLogin,
    domainLogin: domainLogin,
    email: record.email || null,
    phone: record.phone || null,
    password_hash: record.password_hash || record.passwordHash || '',
    passwordHash: record.password_hash || record.passwordHash || '',
    initial_password_plain: record.initial_password_plain || record.initialPasswordPlain || null,
    initialPasswordPlain: record.initial_password_plain || record.initialPasswordPlain || null,
    plan_type: record.plan_type || record.planType || 'monthly_29_90',
    planType: record.plan_type || record.planType || 'monthly_29_90',
    status: record.status || 'active',
    monthly_edits_limit: record.monthly_edits_limit ?? (record.plan_type === 'custom_domain_490' ? 0 : 3),
    monthly_edits_used: record.monthly_edits_used ?? 0,
    extra_edit_credits: record.extra_edit_credits ?? 0,
    edits_reset_at: record.edits_reset_at || record.editsResetAt || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    asaas_customer_id: record.asaas_customer_id || record.asaasCustomerId || null,
    asaasCustomerId: record.asaas_customer_id || record.asaasCustomerId || null,
    asaas_subscription_id: record.asaas_subscription_id || record.asaasSubscriptionId || null,
    asaasSubscriptionId: record.asaas_subscription_id || record.asaasSubscriptionId || null,
    created_at: record.created_at || record.createdAt || nowIso,
    createdAt: record.created_at || record.createdAt || nowIso,
    updated_at: nowIso,
    updatedAt: nowIso
  };

  try {
    const supabase = getSupabaseAdmin();
    const payload = {
      id: fullRecord.id,
      site_id: fullRecord.site_id,
      site_slug: fullRecord.site_slug,
      lead_id: fullRecord.lead_id,
      operator_id: fullRecord.operator_id,
      business_name: fullRecord.business_name,
      domain_login: fullRecord.domain_login,
      email: fullRecord.email,
      phone: fullRecord.phone,
      password_hash: fullRecord.password_hash,
      initial_password_plain: fullRecord.initial_password_plain,
      plan_type: fullRecord.plan_type,
      status: fullRecord.status,
      monthly_edits_limit: fullRecord.monthly_edits_limit,
      monthly_edits_used: fullRecord.monthly_edits_used,
      extra_edit_credits: fullRecord.extra_edit_credits,
      edits_reset_at: fullRecord.edits_reset_at,
      asaas_customer_id: fullRecord.asaas_customer_id,
      asaas_subscription_id: fullRecord.asaas_subscription_id,
      updated_at: fullRecord.updated_at
    };

    await supabase.from('client_accounts').upsert(payload, { onConflict: 'domain_login' });
  } catch (err) {
    console.warn('[Supabase] Falha ao upsert client_accounts:', err);
  }

  try {
    const db = readDb();
    if (!db.clientAccounts) db.clientAccounts = [];
    const idx = db.clientAccounts.findIndex(c => c.id === fullRecord.id || c.domain_login === fullRecord.domain_login);
    if (idx >= 0) {
      db.clientAccounts[idx] = fullRecord;
    } else {
      db.clientAccounts.unshift(fullRecord);
    }
    writeDb(db);
  } catch (_) {}

  return fullRecord;
}

export async function updateClientAccountPassword(id: string, newHash: string): Promise<boolean> {
  const nowIso = new Date().toISOString();
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('client_accounts')
      .update({ password_hash: newHash, updated_at: nowIso })
      .eq('id', id);
    if (!error) {
      const db = readDb();
      if (db.clientAccounts) {
        const item = db.clientAccounts.find(c => c.id === id);
        if (item) {
          item.password_hash = newHash;
          item.updated_at = nowIso;
          writeDb(db);
        }
      }
      return true;
    }
  } catch (_) {}

  try {
    const db = readDb();
    if (db.clientAccounts) {
      const item = db.clientAccounts.find(c => c.id === id);
      if (item) {
        item.password_hash = newHash;
        item.updated_at = nowIso;
        writeDb(db);
        return true;
      }
    }
  } catch (_) {}

  return false;
}

export async function toggleClientAccountStatus(id: string, status: 'active' | 'blocked'): Promise<boolean> {
  const nowIso = new Date().toISOString();
  try {
    const supabase = getSupabaseAdmin();
    await supabase
      .from('client_accounts')
      .update({ status, updated_at: nowIso })
      .eq('id', id);
  } catch (_) {}

  try {
    const db = readDb();
    if (db.clientAccounts) {
      const item = db.clientAccounts.find(c => c.id === id);
      if (item) {
        item.status = status;
        item.updated_at = nowIso;
        writeDb(db);
      }
    }
  } catch (_) {}

  return true;
}

export async function incrementClientAccountExtraCredits(slugOrId: string, amount: number = 1): Promise<boolean> {
  const clean = slugOrId.toLowerCase().trim();
  const acc = await findClientAccountByDomain(clean) || await findClientAccountById(clean) || await findClientAccountBySlug(clean);
  if (!acc) return false;

  const newCredits = (acc.extra_edit_credits || 0) + amount;
  const nowIso = new Date().toISOString();

  try {
    const supabase = getSupabaseAdmin();
    await supabase
      .from('client_accounts')
      .update({ extra_edit_credits: newCredits, updated_at: nowIso })
      .eq('id', acc.id);
  } catch (_) {}

  try {
    const db = readDb();
    if (db.clientAccounts) {
      const item = db.clientAccounts.find(c => c.id === acc.id);
      if (item) {
        item.extra_edit_credits = newCredits;
        item.updated_at = nowIso;
        writeDb(db);
      }
    }
  } catch (_) {}

  return true;
}

export async function consumeClientAccountEdit(clientAccountId: string): Promise<
  | { success: true; type: 'monthly' | 'extra'; remainingMonthly: number; remainingExtra: number }
  | { success: false; message: string }
> {
  let acc = await findClientAccountById(clientAccountId);
  if (!acc) {
    return { success: false, message: 'Conta do cliente não encontrada.' };
  }

  // Verifica se precisa resetar ciclo mensal
  acc = await checkAndResetClientEdits(acc);

  if (acc.status === 'blocked') {
    return { success: false, message: 'Conta suspensa ou bloqueada. Entre em contato com o suporte.' };
  }

  const nowIso = new Date().toISOString();

  // 1. Tenta consumir cota mensal gratuita
  if (acc.plan_type === 'monthly_29_90' && acc.monthly_edits_used < acc.monthly_edits_limit) {
    const newUsed = acc.monthly_edits_used + 1;
    acc.monthly_edits_used = newUsed;
    acc.updated_at = nowIso;

    try {
      const supabase = getSupabaseAdmin();
      await supabase
        .from('client_accounts')
        .update({ monthly_edits_used: newUsed, updated_at: nowIso })
        .eq('id', acc.id);
    } catch (_) {}

    try {
      const db = readDb();
      if (db.clientAccounts) {
        const item = db.clientAccounts.find(c => c.id === acc.id);
        if (item) {
          item.monthly_edits_used = newUsed;
          item.updated_at = nowIso;
          writeDb(db);
        }
      }
    } catch (_) {}

    return {
      success: true,
      type: 'monthly',
      remainingMonthly: acc.monthly_edits_limit - newUsed,
      remainingExtra: acc.extra_edit_credits
    };
  }

  // 2. Tenta consumir créditos extras avulsos
  if (acc.extra_edit_credits > 0) {
    const newExtra = acc.extra_edit_credits - 1;
    acc.extra_edit_credits = newExtra;
    acc.updated_at = nowIso;

    try {
      const supabase = getSupabaseAdmin();
      await supabase
        .from('client_accounts')
        .update({ extra_edit_credits: newExtra, updated_at: nowIso })
        .eq('id', acc.id);
    } catch (_) {}

    try {
      const db = readDb();
      if (db.clientAccounts) {
        const item = db.clientAccounts.find(c => c.id === acc.id);
        if (item) {
          item.extra_edit_credits = newExtra;
          item.updated_at = nowIso;
          writeDb(db);
        }
      }
    } catch (_) {}

    return {
      success: true,
      type: 'extra',
      remainingMonthly: Math.max(0, acc.monthly_edits_limit - acc.monthly_edits_used),
      remainingExtra: newExtra
    };
  }

  return {
    success: false,
    message: 'Limite mensal de alterações atingido (3/3). Compre uma alteração extra avulsa por R$ 19,90 para prosseguir.'
  };
}

/**
 * Hard delete completo do cliente no Supabase e db.json (usado no cancelamento definitivo)
 */
export async function hardDeleteClientAccountComplete(slugOrId: string): Promise<{ success: boolean; error?: string }> {
  const clean = slugOrId.toLowerCase().trim();
  try {
    const supabase = getSupabaseAdmin();
    // 1. Deleta solicitações de alteração
    await supabase.from('site_edit_requests').delete().or(`site_slug.eq.${clean},client_account_id.eq.${clean}`);

    // 2. Deleta a conta do cliente
    await supabase.from('client_accounts').delete().or(`site_slug.eq.${clean},id.eq.${clean},domain_login.eq.${clean}`);

    // 3. Atualiza assinatura para cancelled
    await cancelDefinitiveInSupabase(clean);
  } catch (err: any) {
    console.warn('[Supabase] Falha no hard delete de client_accounts:', err);
  }

  // Local db.json cleanup
  try {
    const db = readDb();
    if (db.clientAccounts) {
      db.clientAccounts = db.clientAccounts.filter(
        c => c.id !== clean && c.site_slug?.toLowerCase() !== clean && c.domain_login?.toLowerCase() !== clean
      );
    }
    if (db.siteEditRequests) {
      db.siteEditRequests = db.siteEditRequests.filter(
        r => r.site_slug?.toLowerCase() !== clean && r.client_account_id !== clean
      );
    }
    writeDb(db);
  } catch (_) {}

  return { success: true };
}

// ==============================================================================
// 2. SITE EDIT REQUESTS (Fila de Alterações Sincronizada)
// ==============================================================================

export function mapRowToSiteEditRequest(row: any): SiteEditRequestRecord {
  return {
    id: row.id,
    client_account_id: row.client_account_id || row.clientAccountId || '',
    clientAccountId: row.client_account_id || row.clientAccountId || '',
    site_slug: row.site_slug || row.siteSlug || '',
    siteSlug: row.site_slug || row.siteSlug || '',
    operator_id: row.operator_id || row.operatorId || null,
    operatorId: row.operator_id || row.operatorId || null,
    title: row.title || 'Solicitação de Alteração',
    description: row.description || '',
    photos: Array.isArray(row.photos) ? row.photos : [],
    status: row.status || 'enviada',
    operator_notes: row.operator_notes || row.operatorNotes || null,
    operatorNotes: row.operator_notes || row.operatorNotes || null,
    is_extra_credit: Boolean(row.is_extra_credit ?? false),
    created_at: row.created_at || row.createdAt || new Date().toISOString(),
    updated_at: row.updated_at || row.updatedAt || new Date().toISOString(),
    completed_at: row.completed_at || row.completedAt || null
  };
}

export async function listSiteEditRequests(filter?: {
  clientAccountId?: string;
  operatorId?: string;
  siteSlug?: string;
  status?: string;
}): Promise<SiteEditRequestRecord[]> {
  try {
    const supabase = getSupabaseAdmin();
    let query = supabase.from('site_edit_requests').select('*');

    if (filter?.clientAccountId) query = query.eq('client_account_id', filter.clientAccountId);
    if (filter?.operatorId) query = query.eq('operator_id', filter.operatorId);
    if (filter?.siteSlug) query = query.eq('site_slug', filter.siteSlug.toLowerCase().trim());
    if (filter?.status) query = query.eq('status', filter.status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map(mapRowToSiteEditRequest);
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao listar site_edit_requests:', err);
  }

  // Fallback db.json
  try {
    const db = readDb();
    let items = db.siteEditRequests || [];
    if (filter?.clientAccountId) items = items.filter(i => i.client_account_id === filter.clientAccountId);
    if (filter?.operatorId) items = items.filter(i => i.operator_id === filter.operatorId);
    if (filter?.siteSlug) items = items.filter(i => i.site_slug?.toLowerCase() === filter.siteSlug?.toLowerCase().trim());
    if (filter?.status) items = items.filter(i => i.status === filter.status);
    return items;
  } catch (_) {
    return [];
  }
}

export async function createSiteEditRequest(data: Partial<SiteEditRequestRecord>): Promise<SiteEditRequestRecord> {
  const nowIso = new Date().toISOString();
  const id = data.id || crypto.randomUUID();

  const record: SiteEditRequestRecord = {
    id,
    client_account_id: data.client_account_id || data.clientAccountId || '',
    clientAccountId: data.client_account_id || data.clientAccountId || '',
    site_slug: (data.site_slug || data.siteSlug || '').toLowerCase().trim(),
    siteSlug: (data.site_slug || data.siteSlug || '').toLowerCase().trim(),
    operator_id: data.operator_id || data.operatorId || null,
    operatorId: data.operator_id || data.operatorId || null,
    title: data.title || 'Solicitação de Alteração',
    description: data.description || '',
    photos: Array.isArray(data.photos) ? data.photos : [],
    status: data.status || 'enviada',
    operator_notes: data.operator_notes || data.operatorNotes || null,
    operatorNotes: data.operator_notes || data.operatorNotes || null,
    is_extra_credit: Boolean(data.is_extra_credit ?? false),
    created_at: nowIso,
    updated_at: nowIso,
    completed_at: null
  };

  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('site_edit_requests').insert({
      id: record.id,
      client_account_id: record.client_account_id,
      site_slug: record.site_slug,
      operator_id: record.operator_id,
      title: record.title,
      description: record.description,
      photos: record.photos,
      status: record.status,
      operator_notes: record.operator_notes,
      is_extra_credit: record.is_extra_credit,
      created_at: record.created_at,
      updated_at: record.updated_at
    });
  } catch (err) {
    console.warn('[Supabase] Falha ao criar site_edit_requests:', err);
  }

  try {
    const db = readDb();
    if (!db.siteEditRequests) db.siteEditRequests = [];
    db.siteEditRequests.unshift(record);
    writeDb(db);
  } catch (_) {}

  return record;
}

export async function updateSiteEditRequestStatus(
  id: string,
  status: 'enviada' | 'em_andamento' | 'publicada',
  operatorNotes?: string
): Promise<boolean> {
  const nowIso = new Date().toISOString();
  const updatePayload: Record<string, any> = {
    status,
    updated_at: nowIso
  };
  if (operatorNotes !== undefined) {
    updatePayload.operator_notes = operatorNotes;
  }
  if (status === 'publicada') {
    updatePayload.completed_at = nowIso;
  }

  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('site_edit_requests').update(updatePayload).eq('id', id);
  } catch (_) {}

  try {
    const db = readDb();
    if (db.siteEditRequests) {
      const item = db.siteEditRequests.find(r => r.id === id);
      if (item) {
        item.status = status;
        item.updated_at = nowIso;
        if (operatorNotes !== undefined) {
          item.operator_notes = operatorNotes;
          item.operatorNotes = operatorNotes;
        }
        if (status === 'publicada') item.completed_at = nowIso;
        writeDb(db);
      }
    }
  } catch (_) {}

  return true;
}

// ==============================================================================
// 3. ADMIN AFFILIATE TOOLS (Vitrine de Ferramentas B2B Billy Afiliados)
// ==============================================================================

export function mapRowToAdminAffiliateTool(row: any): AdminAffiliateToolRecord {
  return {
    id: row.id,
    name: row.name || 'Ferramenta Parceira',
    category: row.category || 'Produtividade',
    description: row.description || '',
    benefit: row.benefit || null,
    logo_url: row.logo_url || row.logoUrl || null,
    logoUrl: row.logo_url || row.logoUrl || null,
    affiliate_link: row.affiliate_link || row.affiliateLink || '#',
    affiliateLink: row.affiliate_link || row.affiliateLink || '#',
    is_active: Boolean(row.is_active ?? true),
    isActive: Boolean(row.is_active ?? true),
    display_order: Number(row.display_order ?? 0),
    displayOrder: Number(row.display_order ?? 0),
    clicks_count: Number(row.clicks_count ?? 0),
    clicksCount: Number(row.clicks_count ?? 0),
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString()
  };
}

export async function listAdminAffiliateTools(onlyActive: boolean = false): Promise<AdminAffiliateToolRecord[]> {
  try {
    const supabase = getSupabaseAdmin();
    let q = supabase.from('admin_affiliate_tools').select('*');
    if (onlyActive) q = q.eq('is_active', true);
    const { data, error } = await q.order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map(mapRowToAdminAffiliateTool);
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao listar admin_affiliate_tools:', err);
  }

  // Fallback db.json
  try {
    const db = readDb();
    let tools = db.adminAffiliateTools || [];
    if (onlyActive) tools = tools.filter(t => t.is_active !== false);
    return tools.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  } catch (_) {
    return [];
  }
}

export async function upsertAdminAffiliateTool(tool: Partial<AdminAffiliateToolRecord>): Promise<AdminAffiliateToolRecord> {
  const nowIso = new Date().toISOString();
  const id = tool.id || crypto.randomUUID();

  const record: AdminAffiliateToolRecord = {
    id,
    name: tool.name || 'Nova Ferramenta',
    category: tool.category || 'Negócios',
    description: tool.description || '',
    benefit: tool.benefit || null,
    logo_url: tool.logo_url || tool.logoUrl || null,
    logoUrl: tool.logo_url || tool.logoUrl || null,
    affiliate_link: tool.affiliate_link || tool.affiliateLink || 'https://webbilly.com.br',
    affiliateLink: tool.affiliate_link || tool.affiliateLink || 'https://webbilly.com.br',
    is_active: tool.is_active ?? true,
    isActive: tool.is_active ?? true,
    display_order: Number(tool.display_order ?? 0),
    displayOrder: Number(tool.display_order ?? 0),
    clicks_count: Number(tool.clicks_count ?? 0),
    clicksCount: Number(tool.clicks_count ?? 0),
    created_at: tool.created_at || nowIso,
    updated_at: nowIso
  };

  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('admin_affiliate_tools').upsert({
      id: record.id,
      name: record.name,
      category: record.category,
      description: record.description,
      benefit: record.benefit,
      logo_url: record.logo_url,
      affiliate_link: record.affiliate_link,
      is_active: record.is_active,
      display_order: record.display_order,
      clicks_count: record.clicks_count,
      updated_at: record.updated_at
    });
  } catch (err) {
    console.warn('[Supabase] Falha no upsert de admin_affiliate_tools:', err);
  }

  try {
    const db = readDb();
    if (!db.adminAffiliateTools) db.adminAffiliateTools = [];
    const idx = db.adminAffiliateTools.findIndex(t => t.id === record.id);
    if (idx >= 0) {
      db.adminAffiliateTools[idx] = record;
    } else {
      db.adminAffiliateTools.push(record);
    }
    writeDb(db);
  } catch (_) {}

  return record;
}

export async function deleteAdminAffiliateTool(id: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('admin_affiliate_tools').delete().eq('id', id);
  } catch (_) {}

  try {
    const db = readDb();
    if (db.adminAffiliateTools) {
      db.adminAffiliateTools = db.adminAffiliateTools.filter(t => t.id !== id);
      writeDb(db);
    }
  } catch (_) {}

  return true;
}

export async function recordAffiliateToolClick(id: string): Promise<number> {
  let newCount = 1;
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from('admin_affiliate_tools').select('clicks_count').eq('id', id).maybeSingle();
    newCount = (data?.clicks_count || 0) + 1;
    await supabase.from('admin_affiliate_tools').update({ clicks_count: newCount }).eq('id', id);
  } catch (_) {}

  try {
    const db = readDb();
    if (db.adminAffiliateTools) {
      const tool = db.adminAffiliateTools.find(t => t.id === id);
      if (tool) {
        tool.clicks_count = (tool.clicks_count || 0) + 1;
        newCount = tool.clicks_count;
        writeDb(db);
      }
    }
  } catch (_) {}

  return newCount;
}

