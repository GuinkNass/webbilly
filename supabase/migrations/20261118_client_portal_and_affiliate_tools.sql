-- ==============================================================================
-- BILLY SUITE — MIGRAÇÃO SQL: PORTAL DO CLIENTE FINAL & FERRAMENTAS AFILIADAS B2B
-- Arquivo: supabase/migrations/20261118_client_portal_and_affiliate_tools.sql
-- ==============================================================================

-- 1. TABELA DE CONTAS DE CLIENTES FINAIS (client_accounts)
CREATE TABLE IF NOT EXISTS public.client_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT,
  site_slug TEXT NOT NULL,
  lead_id TEXT,
  operator_id TEXT,
  business_name TEXT NOT NULL,
  domain_login TEXT NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  password_hash TEXT NOT NULL,
  initial_password_plain TEXT,
  plan_type TEXT NOT NULL DEFAULT 'monthly_29_90', -- 'monthly_29_90' | 'custom_domain_490'
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'blocked'
  monthly_edits_limit INTEGER NOT NULL DEFAULT 3,
  monthly_edits_used INTEGER NOT NULL DEFAULT 0,
  extra_edit_credits INTEGER NOT NULL DEFAULT 0,
  edits_reset_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
  asaas_customer_id TEXT,
  asaas_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para busca rápida de login e vinculação
CREATE INDEX IF NOT EXISTS idx_client_accounts_domain_login ON public.client_accounts (domain_login);
CREATE INDEX IF NOT EXISTS idx_client_accounts_site_slug ON public.client_accounts (site_slug);
CREATE INDEX IF NOT EXISTS idx_client_accounts_operator_id ON public.client_accounts (operator_id);
CREATE INDEX IF NOT EXISTS idx_client_accounts_status ON public.client_accounts (status);

-- 2. TABELA DE FILA DE ALTERAÇÕES DO SITE (site_edit_requests)
CREATE TABLE IF NOT EXISTS public.site_edit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_account_id UUID REFERENCES public.client_accounts(id) ON DELETE CASCADE,
  site_slug TEXT NOT NULL,
  operator_id TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  photos JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'enviada', -- 'enviada' | 'em_andamento' | 'publicada'
  operator_notes TEXT,
  is_extra_credit BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Índices para consulta por cliente e operador
CREATE INDEX IF NOT EXISTS idx_site_edit_requests_client ON public.site_edit_requests (client_account_id);
CREATE INDEX IF NOT EXISTS idx_site_edit_requests_operator ON public.site_edit_requests (operator_id);
CREATE INDEX IF NOT EXISTS idx_site_edit_requests_slug ON public.site_edit_requests (site_slug);
CREATE INDEX IF NOT EXISTS idx_site_edit_requests_status ON public.site_edit_requests (status);

-- 3. TABELA DE VITRINE DE FERRAMENTAS AFILIADAS B2B (admin_affiliate_tools)
CREATE TABLE IF NOT EXISTS public.admin_affiliate_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  benefit TEXT,
  logo_url TEXT,
  affiliate_link TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  clicks_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_affiliate_tools_active ON public.admin_affiliate_tools (is_active, display_order);

-- 4. INSERÇÃO DAS FERRAMENTAS PADRÃO (SE NÃO EXISTIREM)
INSERT INTO public.admin_affiliate_tools (name, category, description, benefit, logo_url, affiliate_link, is_active, display_order, clicks_count)
VALUES
  (
    'Nuvemshop',
    'E-commerce & Vendas',
    'Crie sua loja virtual profissional integrada com meios de pagamento e frete automáticos.',
    '25% de desconto no 1º mês de assinatura',
    'https://assets.nuvemshop.com.br/assets/images/logo-nuvemshop.svg',
    'https://www.nuvemshop.com.br',
    true,
    1,
    0
  ),
  (
    'Ton (Stone)',
    'Maquininhas & Pix',
    'As menores taxas do mercado para receber no débito, crédito e Pix sem aluguel de maquininha.',
    'Até 10% de desconto na compra da sua maquininha',
    'https://ton.stone.com.br/favicon.ico',
    'https://ton.stone.com.br',
    true,
    2,
    0
  ),
  (
    'BotConversa',
    'Automação WhatsApp',
    'Automatize suas vendas e atendimento no WhatsApp 24 horas por dia com inteligência e gatilhos.',
    'Teste grátis de 7 dias com modelos prontos',
    'https://botconversa.com.br/wp-content/uploads/2021/04/cropped-favicon-32x32.png',
    'https://botconversa.com.br',
    true,
    3,
    0
  ),
  (
    'Bling!',
    'Gestão & ERP',
    'Sistema completo de emissão de notas fiscais, controle financeiro e estoque para sua empresa.',
    '3 meses de teste grátis com suporte dedicado',
    'https://www.bling.com.br/favicon.ico',
    'https://www.bling.com.br',
    true,
    4,
    0
  )
ON CONFLICT DO NOTHING;

-- 5. POLÍTICAS RLS (Habilitar RLS permitindo Service Role e Leitura Pública onde necessário)
ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_edit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_affiliate_tools ENABLE ROW LEVEL SECURITY;

-- Políticas de bypass para service_role (usado pela API do Webbilly)
DROP POLICY IF EXISTS "Service role full access client_accounts" ON public.client_accounts;
CREATE POLICY "Service role full access client_accounts" ON public.client_accounts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access site_edit_requests" ON public.site_edit_requests;
CREATE POLICY "Service role full access site_edit_requests" ON public.site_edit_requests
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access admin_affiliate_tools" ON public.admin_affiliate_tools;
CREATE POLICY "Service role full access admin_affiliate_tools" ON public.admin_affiliate_tools
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Leitura pública de ferramentas ativas
DROP POLICY IF EXISTS "Public read active affiliate tools" ON public.admin_affiliate_tools;
CREATE POLICY "Public read active affiliate tools" ON public.admin_affiliate_tools
  FOR SELECT TO anon, authenticated USING (is_active = true);
