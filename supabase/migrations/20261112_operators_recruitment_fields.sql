-- Adiciona colunas de recrutamento (cidade/estado e experiência) na tabela public.operators
ALTER TABLE public.operators 
  ADD COLUMN IF NOT EXISTS city_state text,
  ADD COLUMN IF NOT EXISTS experience text;
