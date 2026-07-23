-- Garante uma constraint UNIQUE em entities.user_id
-- Necessária para o upsert com onConflict:"user_id" em updateEntityProfile funcionar
-- (sem isto, o Postgres rejeita o ON CONFLICT com "no unique or exclusion constraint matching")
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'entities_user_id_key'
  ) THEN
    ALTER TABLE entities ADD CONSTRAINT entities_user_id_key UNIQUE (user_id);
  END IF;
END $$;
