-- Garante todas as policies necessárias na tabela publications
-- Idempotente — seguro correr mais do que uma vez

DROP POLICY IF EXISTS "publications_public_read"    ON publications;
DROP POLICY IF EXISTS "publications_owner_read_own" ON publications;
DROP POLICY IF EXISTS "publications_owner_insert"   ON publications;
DROP POLICY IF EXISTS "publications_owner_update"   ON publications;
DROP POLICY IF EXISTS "publications_owner_delete"   ON publications;
DROP POLICY IF EXISTS "publications_admin_all"      ON publications;

-- Leitura pública: apenas anúncios ativos
CREATE POLICY "publications_public_read"
  ON publications FOR SELECT
  USING (moderacao = 'ativo');

-- Owner vê TODOS os seus anúncios (pendente, ativo, rejeitado, cedido)
CREATE POLICY "publications_owner_read_own"
  ON publications FOR SELECT
  USING (user_id = auth.uid());

-- Owner pode inserir os seus próprios anúncios
CREATE POLICY "publications_owner_insert"
  ON publications FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Owner pode editar os seus próprios anúncios
CREATE POLICY "publications_owner_update"
  ON publications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Owner pode eliminar os seus próprios anúncios
CREATE POLICY "publications_owner_delete"
  ON publications FOR DELETE
  USING (user_id = auth.uid());

-- Admin tem acesso total
CREATE POLICY "publications_admin_all"
  ON publications FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Verifica policies criadas
SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'publications'
ORDER BY cmd, policyname;
