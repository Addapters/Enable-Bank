-- ============================================================
--  Enable Bank — Migração: campos entidade e perfil
--  Corre no SQL Editor do Supabase
-- ============================================================

-- ── 1. Adiciona telefone ao perfil de utilizador (particular) ──────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS telefone text;

-- ── 2. Adiciona campos ao perfil de entidade ───────────────────────────────
ALTER TABLE entities
  ADD COLUMN IF NOT EXISTS nif               text,
  ADD COLUMN IF NOT EXISTS concelho          text,
  ADD COLUMN IF NOT EXISTS email_contacto    text,
  ADD COLUMN IF NOT EXISTS telefone          text,
  ADD COLUMN IF NOT EXISTS pessoa_contacto_nome  text,
  ADD COLUMN IF NOT EXISTS pessoa_contacto_cargo text,
  ADD COLUMN IF NOT EXISTS descricao         text,
  ADD COLUMN IF NOT EXISTS logo_url          text,
  ADD COLUMN IF NOT EXISTS verificada_em     timestamptz,
  ADD COLUMN IF NOT EXISTS verificada_por    uuid REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS rejeitada         boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS nota_rejeicao     text;

-- ── 3. RLS na tabela entities ─────────────────────────────────────────────
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "entities_public_read"  ON entities;
DROP POLICY IF EXISTS "entities_owner_all"    ON entities;
DROP POLICY IF EXISTS "entities_admin_all"    ON entities;

-- Qualquer utilizador autenticado pode ver entidades (para ContactInfo)
CREATE POLICY "entities_public_read"
  ON entities FOR SELECT
  USING (true);

-- Owner gere a sua própria entidade
CREATE POLICY "entities_owner_all"
  ON entities FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin tem acesso total
CREATE POLICY "entities_admin_all"
  ON entities FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── 4. Storage: permite upload de logos ao bucket publications ────────────
-- (já existe política de upload — usa o mesmo bucket com prefixo logos/)
-- Se ainda não criaste o bucket 'publications' como público, cria agora:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('publications', 'publications', true) ON CONFLICT DO NOTHING;

-- ── 5. Verificação ────────────────────────────────────────────────────────
SELECT
  column_name, data_type
FROM information_schema.columns
WHERE table_name = 'entities'
ORDER BY ordinal_position;
