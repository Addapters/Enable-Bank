-- A tabela publications tinha uma constraint CHECK em "moderacao" (criada diretamente no
-- Supabase, fora dos ficheiros de migração deste repositório) que ainda não incluía o valor
-- 'correcao', usado pela nova funcionalidade "Pedir correção". Sem isto, a ação falha com:
-- "new row for relation publications violates check constraint publications_moderacao_check"
ALTER TABLE publications DROP CONSTRAINT IF EXISTS publications_moderacao_check;
ALTER TABLE publications ADD CONSTRAINT publications_moderacao_check
  CHECK (moderacao IN ('pendente', 'ativo', 'rejeitado', 'cedido', 'correcao'));
