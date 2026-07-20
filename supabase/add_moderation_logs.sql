-- Cria a tabela de logs de moderação e as suas RLS policies
-- Corre no SQL Editor do Supabase antes de usar o backoffice

CREATE TABLE IF NOT EXISTS moderation_logs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id uuid NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  admin_id       uuid NOT NULL REFERENCES users(id),
  acao           text NOT NULL CHECK (acao IN ('aprovado', 'rejeitado', 'correcao')),
  nota           text,
  criado_em      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- Só admins podem ler e escrever logs
CREATE POLICY "modlogs_admin_all"
  ON moderation_logs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Index para pesquisas por publicação
CREATE INDEX IF NOT EXISTS moderation_logs_publication_id_idx
  ON moderation_logs (publication_id);
