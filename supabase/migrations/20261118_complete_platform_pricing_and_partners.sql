-- ==============================================================================
-- BILLY SUITE — MIGRAÇÃO SQL CONSOLIDADA (100% IDEMPOTENTE & SEGURA)
-- Arquivo: supabase/migrations/20261118_complete_platform_pricing_and_partners.sql
-- ==============================================================================

-- 1. TABELA DE PREÇOS DINÂMICOS DA PLATAFORMA (platform_pricing_settings)
CREATE TABLE IF NOT EXISTS public.platform_pricing_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  monthly_plan_price NUMERIC(10, 2) NOT NULL DEFAULT 29.90,
  custom_domain_price NUMERIC(10, 2) NOT NULL DEFAULT 490.00,
  extra_edit_price NUMERIC(10, 2) NOT NULL DEFAULT 39.90,
  operator_commission_percent NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
  affiliate_bonus_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Inserir registro padrão se ainda não existir
INSERT INTO public.platform_pricing_settings (
  id,
  monthly_plan_price,
  custom_domain_price,
  extra_edit_price,
  operator_commission_percent,
  affiliate_bonus_percent
) VALUES (
  'default',
  29.90,
  490.00,
  39.90,
  50.00,
  5.00
) ON CONFLICT (id) DO NOTHING;

-- RLS para platform_pricing_settings (DROP IF EXISTS evita erro 42710)
ALTER TABLE public.platform_pricing_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura para todos" ON public.platform_pricing_settings;
CREATE POLICY "Permitir leitura para todos"
  ON public.platform_pricing_settings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir escrita para service role" ON public.platform_pricing_settings;
CREATE POLICY "Permitir escrita para service role"
  ON public.platform_pricing_settings
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- 2. TABELA DE VITRINE DE FERRAMENTAS AFILIADAS B2B (admin_affiliate_tools)
CREATE TABLE IF NOT EXISTS public.admin_affiliate_tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  benefit TEXT,
  cta_text TEXT,
  logo_url TEXT,
  affiliate_link TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  clicks_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Garante que a coluna cta_text exista
ALTER TABLE public.admin_affiliate_tools ADD COLUMN IF NOT EXISTS cta_text TEXT;

CREATE INDEX IF NOT EXISTS idx_admin_affiliate_tools_active ON public.admin_affiliate_tools (is_active, display_order);

ALTER TABLE public.admin_affiliate_tools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access admin_affiliate_tools" ON public.admin_affiliate_tools;
CREATE POLICY "Service role full access admin_affiliate_tools" ON public.admin_affiliate_tools
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read active affiliate tools" ON public.admin_affiliate_tools;
CREATE POLICY "Public read active affiliate tools" ON public.admin_affiliate_tools
  FOR SELECT TO anon, authenticated USING (is_active = true);

-- Inserir / atualizar os 4 parceiros oficiais
INSERT INTO public.admin_affiliate_tools (
  id,
  name,
  category,
  description,
  benefit,
  cta_text,
  logo_url,
  affiliate_link,
  is_active,
  display_order,
  clicks_count,
  created_at,
  updated_at
) VALUES 
(
  'a0000001-0000-4000-a000-000000000001',
  'Maquininha Ton com Taxa Reduzida',
  'Pagamentos & Maquininha',
  'Aceite cartão de crédito, débito e Pix no balcão ou delivery com as menores taxas do mercado e recebimento rápido.',
  'Desconto Exclusivo Parceiro',
  'Ver Catálogo com Desconto',
  'https://ton.stone.com.br/favicon.ico',
  'https://ton.com.br/catalogo/?referrer=9AFABF91-00C4-4EE9-8AAE-86C99E4D084B&userAnticipation=0&utm_medium=invite_share&utm_source=revendedor',
  true,
  1,
  0,
  NOW(),
  NOW()
),
(
  'a0000002-0000-4000-a000-000000000002',
  'Conta PJ & Cobranças Pix/Boleto Asaas',
  'Pagamentos & Maquininha',
  'Envie links de pagamento, boletos e Pix automático pelo WhatsApp com régua de cobrança integrada para seus clientes.',
  'Sem Mensalidade',
  'Abrir Conta Gratuita',
  'https://www.asaas.com/favicon.ico',
  'https://www.asaas.com/r/240aa974-f024-4664-8694-f41ddff777d8',
  true,
  2,
  0,
  NOW(),
  NOW()
),
(
  'a0000003-0000-4000-a000-000000000003',
  'Sua Loja Virtual & Catálogo Online (Nuvemshop)',
  'Loja Virtual',
  'Transforme visitantes do seu site em compradores online com carrinho, cálculo de frete e checkout completo integrado.',
  'Benefício WebBILLY',
  'Criar Minha Loja Online',
  'https://assets.nuvemshop.com.br/assets/images/logo-nuvemshop.svg',
  'https://www.nuvemshop.com.br/partners/webbilly',
  true,
  3,
  0,
  NOW(),
  NOW()
),
(
  'a0000004-0000-4000-a000-000000000004',
  'Sistema de Gestão & Emissor de Nota Fiscal (Bling ERP)',
  'Gestão & Nota Fiscal',
  'Controle seu estoque, caixa (PDV), vendas e emita notas fiscais (NF-e / NFC-e) em segundos com condição especial de parceiro.',
  'Cupom: GUINKNASS',
  'Ativar Benefício Bling',
  'https://www.bling.com.br/favicon.ico',
  'https://www.bling.com.br/planos-e-precos/GUINKNASS',
  true,
  4,
  0,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  benefit = EXCLUDED.benefit,
  cta_text = EXCLUDED.cta_text,
  logo_url = EXCLUDED.logo_url,
  affiliate_link = EXCLUDED.affiliate_link,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();


-- 3. TABELA DE ANALYTICS DIÁRIOS (site_daily_stats)
CREATE TABLE IF NOT EXISTS public.site_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  site_id TEXT,
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
  page_views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  whatsapp_clicks INTEGER NOT NULL DEFAULT 0,
  mobile_views INTEGER NOT NULL DEFAULT 0,
  desktop_views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_site_daily_stats_domain_date UNIQUE (domain, stat_date)
);

CREATE INDEX IF NOT EXISTS idx_site_daily_stats_domain ON public.site_daily_stats (domain);
CREATE INDEX IF NOT EXISTS idx_site_daily_stats_date ON public.site_daily_stats (stat_date);

ALTER TABLE public.site_daily_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access site_daily_stats" ON public.site_daily_stats;
CREATE POLICY "Service role full access site_daily_stats" ON public.site_daily_stats
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read site_daily_stats" ON public.site_daily_stats;
CREATE POLICY "Public read site_daily_stats" ON public.site_daily_stats
  FOR SELECT TO anon, authenticated USING (true);

-- Função atômica RPC para incremento de estatísticas
CREATE OR REPLACE FUNCTION increment_site_stat(
  p_domain TEXT,
  p_event TEXT,
  p_is_mobile BOOLEAN,
  p_is_unique BOOLEAN
)
RETURNS VOID AS $$
DECLARE
  v_date DATE := CURRENT_DATE;
BEGIN
  INSERT INTO public.site_daily_stats (
    domain,
    stat_date,
    page_views,
    unique_visitors,
    whatsapp_clicks,
    mobile_views,
    desktop_views,
    updated_at
  ) VALUES (
    LOWER(TRIM(p_domain)),
    v_date,
    CASE WHEN p_event = 'pageview' THEN 1 ELSE 0 END,
    CASE WHEN p_event = 'pageview' AND p_is_unique THEN 1 ELSE 0 END,
    CASE WHEN p_event = 'whatsapp_click' THEN 1 ELSE 0 END,
    CASE WHEN p_event = 'pageview' AND p_is_mobile THEN 1 ELSE 0 END,
    CASE WHEN p_event = 'pageview' AND NOT p_is_mobile THEN 1 ELSE 0 END,
    NOW()
  )
  ON CONFLICT (domain, stat_date) DO UPDATE SET
    page_views = site_daily_stats.page_views + (CASE WHEN p_event = 'pageview' THEN 1 ELSE 0 END),
    unique_visitors = site_daily_stats.unique_visitors + (CASE WHEN p_event = 'pageview' AND p_is_unique THEN 1 ELSE 0 END),
    whatsapp_clicks = site_daily_stats.whatsapp_clicks + (CASE WHEN p_event = 'whatsapp_click' THEN 1 ELSE 0 END),
    mobile_views = site_daily_stats.mobile_views + (CASE WHEN p_event = 'pageview' AND p_is_mobile THEN 1 ELSE 0 END),
    desktop_views = site_daily_stats.desktop_views + (CASE WHEN p_event = 'pageview' AND NOT p_is_mobile THEN 1 ELSE 0 END),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
