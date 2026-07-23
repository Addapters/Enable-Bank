-- Adiciona coluna avatar_url à tabela users (foto de perfil de utilizadores particulares)
-- Quando NULL, o frontend mostra o coração roxo por defeito (/heart-icon.png)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url text DEFAULT NULL;
