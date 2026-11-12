-- Migration: Contratos Legais e Aceite Eletrônico Rastreável (IP + Timestamp)

ALTER TABLE IF EXISTS operators
  ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_terms_ip TEXT,
  ADD COLUMN IF NOT EXISTS accepted_terms_version TEXT DEFAULT 'v1.0';

ALTER TABLE IF EXISTS candidates
  ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_terms_ip TEXT,
  ADD COLUMN IF NOT EXISTS accepted_terms_version TEXT DEFAULT 'v1.0';

ALTER TABLE IF EXISTS subscriptions
  ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_terms_ip TEXT,
  ADD COLUMN IF NOT EXISTS accepted_terms_version TEXT DEFAULT 'v1.0';

ALTER TABLE IF EXISTS leads
  ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_terms_ip TEXT,
  ADD COLUMN IF NOT EXISTS accepted_terms_version TEXT DEFAULT 'v1.0';

ALTER TABLE IF EXISTS sites
  ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_terms_ip TEXT,
  ADD COLUMN IF NOT EXISTS accepted_terms_version TEXT DEFAULT 'v1.0';
