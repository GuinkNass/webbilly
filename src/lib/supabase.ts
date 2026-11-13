import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { readDb, writeDb, SubscriptionRecord, Operator, AffiliateCommissionRecord, SiteChangeRequestRecord } from './db';

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
  status: 'active' | 'suspended' | 'pending' | 'cancelled';
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
    mustChangePassword: row.must_change_password ?? row.mustChangePassword ?? true,
    must_change_password: row.must_change_password ?? row.mustChangePassword ?? true,
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
 * Insere ou atualiza um operador no Supabase
 */
export async function upsertOperatorInSupabase(op: Partial<Operator>): Promise<boolean> {
  if (!op || (!op.id && !op.email)) return false;

  const id = op.id || `OP-${Date.now().toString(36).toUpperCase()}`;
  const nowIso = new Date().toISOString();

  const payload: any = {
    id,
    name: op.name || 'Operador Webbilly',
    cpf: op.cpf || null,
    email: op.email || '',
    whatsapp: op.whatsapp || null,
    cep: op.cep || null,
    address: op.address || null,
    neighborhood: op.neighborhood || null,
    city_state: op.city_state || (op as any).cityState || null,
    experience: op.experience || null,
    pix_type: op.pix_type || op.pixType || 'cpf',
    pix_key: op.pix_key || op.pixKey || '',
    serial_token: op.serialToken || null,
    status: op.status || 'ATIVO',
    affiliate_enabled: Boolean(op.affiliate_enabled),
    affiliate_code: op.affiliate_code || null,
    referred_by_operator_id: op.referred_by_operator_id || null,
    corporate_email: op.corporate_email || (op as any).corporateEmail || null,
    password_hash: op.passwordHash || (op as any).password_hash || null,
    must_change_password: op.mustChangePassword ?? (op as any).must_change_password ?? true,
    lark_provisioned: Boolean(op.lark_provisioned ?? (op as any).larkProvisioned ?? false),
    updated_at: nowIso
  };

  if (op.accepted_terms_at) {
    payload.accepted_terms_at = op.accepted_terms_at;
    payload.accepted_terms_ip = op.accepted_terms_ip || null;
    payload.accepted_terms_version = op.accepted_terms_version || 'v1.0';
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
    if (cleanId === 'admin' || cleanId === 'OP-0001' || cleanEmail.includes('admin@')) {
      if (Array.isArray(db.adminUsers) && db.adminUsers.length > 0) {
        db.adminUsers[0].avatar_config = avatarConfig;
        db.adminUsers[0].avatarConfig = avatarConfig;
        db.adminUsers[0].avatar_svg = avatarSvg;
        db.adminUsers[0].avatarSvg = avatarSvg;
        persistedInDb = true;
      }
    }
    if (persistedInDb) {
      writeDb(db);
    }
  } catch (dbErr) {
    console.warn('[Avatar Save] Erro ao gravar no db.json:', dbErr);
  }

  return persistedInSupabase || persistedInDb;
}
