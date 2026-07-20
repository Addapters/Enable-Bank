-- ============================================================
--  Enable Bank — Fix: Recursão infinita nas políticas RLS
--
--  Problema: a policy na tabela "users" fazia SELECT à própria
--  tabela "users" para verificar o role → loop infinito.
--
--  Solução:
--    1. Categorias, publicações e fotos → leitura pública
--    2. Users → cada um lê/edita só os seus dados; admins usam
--       uma função security definer (sem recursão)
--    3. Publications, contacts → baseados em auth.uid()
-- ============================================================

-- ── Limpa TODAS as políticas RLS existentes (evita conflitos com schema antigo)
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;


-- ── Função auxiliar: é admin? (security definer evita recursão) ──────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER          -- corre como o dono da função, não como o caller
STABLE                    -- resultado estável dentro da transação
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;


-- ════════════════════════════════════════════════════════════
--  CATEGORIES — leitura pública, escrita só para admins
-- ════════════════════════════════════════════════════════════
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_public_read"    ON categories;
DROP POLICY IF EXISTS "categories_admin_all"      ON categories;

CREATE POLICY "categories_public_read"
  ON categories FOR SELECT
  USING (true);                          -- qualquer pessoa pode ler

CREATE POLICY "categories_admin_all"
  ON categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ════════════════════════════════════════════════════════════
--  USERS — cada um gere o seu perfil; admins vêem todos
-- ════════════════════════════════════════════════════════════
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own"    ON users;
DROP POLICY IF EXISTS "users_update_own"    ON users;
DROP POLICY IF EXISTS "users_admin_all"     ON users;
DROP POLICY IF EXISTS "users_insert_self"   ON users;

-- Qualquer utilizador autenticado pode ver perfis públicos (nome, concelho, tipo)
-- Necessário para mostrar o perfil do publisher nos anúncios
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "users_insert_self"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_admin_all"
  ON users FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ════════════════════════════════════════════════════════════
--  PUBLICATIONS — leitura pública dos ativos; escrita pelo dono
-- ════════════════════════════════════════════════════════════
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "publications_public_read"  ON publications;
DROP POLICY IF EXISTS "publications_owner_all"    ON publications;
DROP POLICY IF EXISTS "publications_admin_all"    ON publications;

CREATE POLICY "publications_public_read"
  ON publications FOR SELECT
  USING (moderacao = 'ativo');

-- O dono vê TODOS os seus anúncios (incluindo pendentes/rejeitados)
CREATE POLICY "publications_owner_read_own"
  ON publications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "publications_owner_insert"
  ON publications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "publications_owner_update"
  ON publications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "publications_owner_delete"
  ON publications FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "publications_admin_all"
  ON publications FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ════════════════════════════════════════════════════════════
--  PHOTOS — leitura pública; escrita pelo dono da publicação
-- ════════════════════════════════════════════════════════════
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "photos_public_read"    ON photos;
DROP POLICY IF EXISTS "photos_owner_write"    ON photos;

CREATE POLICY "photos_public_read"
  ON photos FOR SELECT
  USING (true);

CREATE POLICY "photos_owner_insert"
  ON photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM publications
      WHERE id = publication_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "photos_owner_delete"
  ON photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM publications
      WHERE id = publication_id AND user_id = auth.uid()
    )
  );


-- ════════════════════════════════════════════════════════════
--  CONTACTS — só utilizadores autenticados podem ver;
--             cada um gere os seus
-- ════════════════════════════════════════════════════════════
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contacts_auth_read"    ON contacts;
DROP POLICY IF EXISTS "contacts_owner_write"  ON contacts;

CREATE POLICY "contacts_auth_read"
  ON contacts FOR SELECT
  USING (auth.uid() IS NOT NULL);        -- autenticados vêem todos os contactos

CREATE POLICY "contacts_owner_insert"
  ON contacts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "contacts_owner_update"
  ON contacts FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ════════════════════════════════════════════════════════════
--  VERIFICAÇÃO — deve retornar as categorias sem erro
-- ════════════════════════════════════════════════════════════
SELECT id, nome, parent_id, ativa
FROM categories
WHERE parent_id IS NULL
ORDER BY ordem;
