-- =========================================================================
-- MIGRATION: BILLY AFILIADOS (MÓDULO DE INDICAÇÃO DE OPERADORES)
-- Data: 12/11/2026
-- =========================================================================

-- 1. Campos de afiliados na tabela de operadores / perfis
ALTER TABLE IF EXISTS operators
  ADD COLUMN IF NOT EXISTS affiliate_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS affiliate_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by_operator_id TEXT REFERENCES operators(id);

-- 2. Tabela de comissões de afiliados (5% sobre R$ 490,00 = R$ 24,50)
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id TEXT PRIMARY KEY,
  affiliate_operator_id TEXT NOT NULL,
  invited_operator_id TEXT NOT NULL,
  lead_or_sale_id TEXT NOT NULL UNIQUE,
  sale_amount NUMERIC NOT NULL DEFAULT 490.00,
  commission_rate NUMERIC NOT NULL DEFAULT 0.05,
  commission_amount NUMERIC NOT NULL DEFAULT 24.50,
  month_ref TEXT NOT NULL, -- Formato 'YYYY-MM'
  payout_status TEXT NOT NULL DEFAULT 'available', -- 'available' | 'requested' | 'paid'
  payout_request_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- 3. Índices para consultas de alta performance
CREATE INDEX IF NOT EXISTS idx_aff_comm_sponsor ON affiliate_commissions(affiliate_operator_id);
CREATE INDEX IF NOT EXISTS idx_aff_comm_invited ON affiliate_commissions(invited_operator_id);
CREATE INDEX IF NOT EXISTS idx_aff_comm_month ON affiliate_commissions(month_ref);
CREATE INDEX IF NOT EXISTS idx_aff_comm_status ON affiliate_commissions(payout_status);
CREATE INDEX IF NOT EXISTS idx_aff_comm_lead_sale ON affiliate_commissions(lead_or_sale_id);
