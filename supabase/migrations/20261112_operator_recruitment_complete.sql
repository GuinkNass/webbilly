-- Atualização completa da tabela operators para recrutamento, credenciais corporativas e endereçamento
ALTER TABLE public.operators 
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS cep text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS neighborhood text,
  ADD COLUMN IF NOT EXISTS city_state text,
  ADD COLUMN IF NOT EXISTS pix_type text,
  ADD COLUMN IF NOT EXISTS pix_key text,
  ADD COLUMN IF NOT EXISTS experience text,
  ADD COLUMN IF NOT EXISTS corporate_email text UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash text,
  ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS lark_provisioned boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_operators_corporate_email ON public.operators(corporate_email);
CREATE INDEX IF NOT EXISTS idx_operators_status ON public.operators(status);
