-- =========================================================================
-- MIGRATION: AUTOMAÇÃO DE E-MAIL CORPORATIVO (@webbilly.com.br) E PRIMEIRO ACESSO
-- Data: 12/11/2026
-- =========================================================================

ALTER TABLE IF EXISTS operators
  ADD COLUMN IF NOT EXISTS corporate_email TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS lark_provisioned BOOLEAN DEFAULT FALSE;

-- Índices para busca rápida no login e no site suspenso
CREATE INDEX IF NOT EXISTS idx_operators_corporate_email ON operators(corporate_email);
