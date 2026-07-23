-- Sistema de notificações.
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo text NOT NULL, -- 'aprovado' | 'rejeitado' | 'correcao' | 'favorito_novo' | 'favorito_indisponivel' | 'entidade_verificada'
  titulo text NOT NULL,
  mensagem text,
  link text,                                       -- rota relativa para onde a notificação aponta (ex: /publications/uuid)
  publication_id uuid REFERENCES publications(id) ON DELETE CASCADE,
  lida boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id, criado_em DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_owner_read" ON notifications;
DROP POLICY IF EXISTS "notifications_owner_update" ON notifications;

-- Cada um só vê e marca como lidas as suas próprias notificações.
-- Não há policy de INSERT/DELETE para utilizadores — só triggers (SECURITY DEFINER) ou o
-- service role podem criar notificações, para impedir que alguém crie notificações falsas.
CREATE POLICY "notifications_owner_read"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notifications_owner_update"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
