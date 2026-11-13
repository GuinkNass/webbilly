-- Migration 20261113: Suporte a avatar gamer DiceBear para operadores e admin master
ALTER TABLE public.operators
ADD COLUMN IF NOT EXISTS avatar_config JSONB,
ADD COLUMN IF NOT EXISTS avatar_svg TEXT;
