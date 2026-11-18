import { getSupabaseAdmin } from './supabase';
import { readDb, writeDb } from './db';

export interface PlatformPricingSettings {
  id: string; // 'default'
  monthly_plan_price: number;
  custom_domain_price: number;
  extra_edit_price: number;
  operator_commission_percent: number;
  affiliate_bonus_percent: number;
  updated_at?: string;
}

export const DEFAULT_PLATFORM_PRICING: PlatformPricingSettings = {
  id: 'default',
  monthly_plan_price: 29.90,
  custom_domain_price: 490.00,
  extra_edit_price: 39.90,
  operator_commission_percent: 50.00,
  affiliate_bonus_percent: 5.00
};

export const TEST_PLATFORM_PRICING: PlatformPricingSettings = {
  id: 'default',
  monthly_plan_price: 5.00,
  custom_domain_price: 5.00,
  extra_edit_price: 5.00,
  operator_commission_percent: 50.00,
  affiliate_bonus_percent: 5.00
};

export function formatBRL(value: number): string {
  const num = Number(value) || 0;
  return `R$ ${num.toFixed(2).replace('.', ',')}`;
}

/**
 * Obtém os preços atuais da plataforma com resiliência:
 * 1. Tenta carregar da tabela `platform_pricing_settings` no Supabase (id = 'default')
 * 2. Fallback seguro para db.json (`platformPricing` ou `adminSettings`)
 * 3. Fallback para os valores padrão oficiais (R$ 29,90 / R$ 490,00 / R$ 39,90)
 */
export async function getPlatformPricing(): Promise<PlatformPricingSettings> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('platform_pricing_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (!error && data) {
      return {
        id: 'default',
        monthly_plan_price: Number(data.monthly_plan_price) || DEFAULT_PLATFORM_PRICING.monthly_plan_price,
        custom_domain_price: Number(data.custom_domain_price) || DEFAULT_PLATFORM_PRICING.custom_domain_price,
        extra_edit_price: Number(data.extra_edit_price) || DEFAULT_PLATFORM_PRICING.extra_edit_price,
        operator_commission_percent: Number(data.operator_commission_percent) || DEFAULT_PLATFORM_PRICING.operator_commission_percent,
        affiliate_bonus_percent: Number(data.affiliate_bonus_percent) || DEFAULT_PLATFORM_PRICING.affiliate_bonus_percent,
        updated_at: data.updated_at || undefined
      };
    }
  } catch (err) {
    console.warn('[Pricing] Aviso ao consultar Supabase platform_pricing_settings:', err);
  }

  // Fallback local db.json
  try {
    const db = readDb();
    if (db.platformPricing) {
      return {
        id: 'default',
        monthly_plan_price: Number(db.platformPricing.monthly_plan_price) || DEFAULT_PLATFORM_PRICING.monthly_plan_price,
        custom_domain_price: Number(db.platformPricing.custom_domain_price) || DEFAULT_PLATFORM_PRICING.custom_domain_price,
        extra_edit_price: Number(db.platformPricing.extra_edit_price) || DEFAULT_PLATFORM_PRICING.extra_edit_price,
        operator_commission_percent: Number(db.platformPricing.operator_commission_percent) || DEFAULT_PLATFORM_PRICING.operator_commission_percent,
        affiliate_bonus_percent: Number(db.platformPricing.affiliate_bonus_percent) || DEFAULT_PLATFORM_PRICING.affiliate_bonus_percent,
        updated_at: db.platformPricing.updated_at
      };
    }

    if (db.adminSettings?.monthlySubscriptionPrice) {
      return {
        ...DEFAULT_PLATFORM_PRICING,
        monthly_plan_price: Number(db.adminSettings.monthlySubscriptionPrice) || 29.90
      };
    }
  } catch (_) {}

  return { ...DEFAULT_PLATFORM_PRICING };
}

/**
 * Atualiza os preços no Supabase e sincroniza no db.json
 */
export async function updatePlatformPricing(
  settings: Partial<PlatformPricingSettings>
): Promise<PlatformPricingSettings> {
  const current = await getPlatformPricing();

  const merged: PlatformPricingSettings = {
    id: 'default',
    monthly_plan_price:
      settings.monthly_plan_price !== undefined
        ? Math.max(0, Number(settings.monthly_plan_price))
        : current.monthly_plan_price,
    custom_domain_price:
      settings.custom_domain_price !== undefined
        ? Math.max(0, Number(settings.custom_domain_price))
        : current.custom_domain_price,
    extra_edit_price:
      settings.extra_edit_price !== undefined
        ? Math.max(0, Number(settings.extra_edit_price))
        : current.extra_edit_price,
    operator_commission_percent:
      settings.operator_commission_percent !== undefined
        ? Math.max(0, Math.min(100, Number(settings.operator_commission_percent)))
        : current.operator_commission_percent,
    affiliate_bonus_percent:
      settings.affiliate_bonus_percent !== undefined
        ? Math.max(0, Math.min(100, Number(settings.affiliate_bonus_percent)))
        : current.affiliate_bonus_percent,
    updated_at: new Date().toISOString()
  };

  // 1. Tenta persistir no Supabase (upsert)
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('platform_pricing_settings').upsert({
      id: 'default',
      monthly_plan_price: merged.monthly_plan_price,
      custom_domain_price: merged.custom_domain_price,
      extra_edit_price: merged.extra_edit_price,
      operator_commission_percent: merged.operator_commission_percent,
      affiliate_bonus_percent: merged.affiliate_bonus_percent,
      updated_at: merged.updated_at
    });

    if (error) {
      console.warn('[Pricing] Aviso ao upsert no Supabase platform_pricing_settings:', error.message);
    }
  } catch (err) {
    console.warn('[Pricing] Falha de conexão ao salvar no Supabase:', err);
  }

  // 2. Sempre persiste localmente no db.json
  try {
    const db = readDb();
    db.platformPricing = merged;
    if (db.adminSettings) {
      db.adminSettings.monthlySubscriptionPrice = merged.monthly_plan_price;
    }
    writeDb(db);
  } catch (fsErr) {
    console.warn('[Pricing] Aviso ao salvar no db.json:', fsErr);
  }

  return merged;
}
