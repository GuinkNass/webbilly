-- Migration 20261113: Suporte a cancelamento Asaas/Vercel e tabela de solicitações de alteração de site

-- 1. Campos de cancelamento e IDs externos na tabela subscriptions
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS asaas_subscription_id text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS vercel_project_id text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancellation_requested boolean DEFAULT false;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancellation_reason text;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancellation_requested_at timestamptz;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS site_status text DEFAULT 'active';

-- 2. Tabela de solicitações de alteração de site pelo cliente (Formulário -> Desktop Billy)
CREATE TABLE IF NOT EXISTS public.site_change_requests (
  id text PRIMARY KEY,
  site_slug text NOT NULL,
  client_name text,
  client_whatsapp text,
  operator_id text,
  status text DEFAULT 'pending', -- 'pending' | 'completed' | 'rejected'
  changes_payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Desabilita RLS para permitir leituras e inserções de forma confiável
ALTER TABLE public.site_change_requests DISABLE ROW LEVEL SECURITY;
