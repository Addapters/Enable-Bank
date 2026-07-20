-- ============================================================
--  Enable Bank — Storage RLS para o bucket "publications"
--  As policies de Storage aplicam-se à tabela storage.objects
-- ============================================================

-- Remove políticas antigas se existirem
DROP POLICY IF EXISTS "publications_auth_upload"  ON storage.objects;
DROP POLICY IF EXISTS "publications_auth_update"  ON storage.objects;
DROP POLICY IF EXISTS "publications_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "publications_owner_delete" ON storage.objects;

-- Leitura pública (qualquer pessoa vê as fotos)
CREATE POLICY "publications_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'publications');

-- Upload: qualquer utilizador autenticado
CREATE POLICY "publications_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'publications'
    AND auth.role() = 'authenticated'
  );

-- Update: só o dono do ficheiro
CREATE POLICY "publications_auth_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'publications'
    AND auth.uid() = owner
  );

-- Delete: só o dono do ficheiro
CREATE POLICY "publications_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'publications'
    AND auth.uid() = owner
  );
