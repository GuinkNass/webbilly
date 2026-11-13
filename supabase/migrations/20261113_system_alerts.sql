-- ========================================================
-- WEBBILLY: MIGRATION PARA SISTEMA DE ALERTAS GLOBAIS
-- Execute este script no SQL Editor do painel do Supabase
-- ========================================================

CREATE TABLE IF NOT EXISTS public.system_alerts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'info', -- 'info', 'promo', 'urgent'
  action_label TEXT,
  action_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT DEFAULT 'admin@billysuite.com.br',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Desativa RLS para permitir leitura e escrita via cliente anon/service
ALTER TABLE public.system_alerts DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.operator_alert_reads (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  operator_id TEXT NOT NULL,
  alert_id TEXT NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Desativa RLS para leituras
ALTER TABLE public.operator_alert_reads DISABLE ROW LEVEL SECURITY;

-- Índice para busca rápida de leituras por operador
CREATE INDEX IF NOT EXISTS idx_operator_alert_reads_operator_id ON public.operator_alert_reads(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_alert_reads_alert_id ON public.operator_alert_reads(alert_id);
