-- Garante que eliminar um utilizador (self-service ou admin) limpa mesmo todos os seus dados,
-- em vez de falhar com uma violação de chave estrangeira ou deixar registos órfãos.
--
-- 1) entities.user_id — a tabela "entities" nunca foi criada por uma migração rastreada neste
--    repositório (foi criada diretamente no painel do Supabase), por isso não sabemos ao certo
--    que comportamento ON DELETE tem a foreign key hoje. Reafirma-se explicitamente CASCADE.
--
-- 2) moderation_logs.admin_id — não tinha ON DELETE definido (por omissão, bloqueia a
--    eliminação). Se um utilizador que alguma vez atuou como admin eliminar a própria conta,
--    o registo de auditoria deve manter-se (ação, nota, anúncio), só perdendo a referência a
--    quem o fez.

DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'entities'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id'
  LIMIT 1;

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE entities DROP CONSTRAINT %I', fk_name);
  END IF;

  ALTER TABLE entities ADD CONSTRAINT entities_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
END $$;

ALTER TABLE moderation_logs ALTER COLUMN admin_id DROP NOT NULL;

DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'moderation_logs'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'admin_id'
  LIMIT 1;

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE moderation_logs DROP CONSTRAINT %I', fk_name);
  END IF;

  ALTER TABLE moderation_logs ADD CONSTRAINT moderation_logs_admin_id_fkey
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;
END $$;
