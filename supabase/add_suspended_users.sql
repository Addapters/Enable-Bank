-- Adiciona coluna suspended à tabela users
-- Corre no SQL Editor do Supabase

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS suspended boolean NOT NULL DEFAULT false;

-- Index para filtrar suspensos eficientemente
CREATE INDEX IF NOT EXISTS users_suspended_idx ON users (suspended);

-- Verifica
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'suspended';
