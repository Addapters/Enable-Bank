-- Sistema de mensagens — chat direto entre dois utilizadores, tipicamente a partir de um
-- anúncio específico (à semelhança das avaliações).
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  publication_id uuid REFERENCES publications(id) ON DELETE SET NULL,
  publication_titulo text,                 -- snapshot do título, sobrevive à eliminação do anúncio
  last_message_at timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now(),
  CHECK (user_a <> user_b),
  UNIQUE (user_a, user_b, publication_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conteudo text NOT NULL,
  lida boolean NOT NULL DEFAULT false,
  lida_em timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conversations_user_a_idx ON conversations(user_a, last_message_at DESC);
CREATE INDEX IF NOT EXISTS conversations_user_b_idx ON conversations(user_b, last_message_at DESC);
CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id, criado_em);

-- ── Trigger: normaliza o par (user_a < user_b) para a UNIQUE funcionar independentemente de
-- quem inicia a conversa, bloqueia conversas consigo mesmo, e confirma que o anúncio (se
-- indicado) pertence mesmo a um dos dois participantes — impede o cliente forjar o contexto.
CREATE OR REPLACE FUNCTION public.enforce_conversation_participants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pub_owner uuid;
  pub_titulo text;
  tmp uuid;
BEGIN
  IF NEW.user_a = NEW.user_b THEN
    RAISE EXCEPTION 'Não podes iniciar uma conversa contigo mesmo';
  END IF;

  IF NEW.user_a > NEW.user_b THEN
    tmp := NEW.user_a;
    NEW.user_a := NEW.user_b;
    NEW.user_b := tmp;
  END IF;

  IF NEW.publication_id IS NOT NULL THEN
    SELECT user_id, titulo INTO pub_owner, pub_titulo FROM publications WHERE id = NEW.publication_id;
    IF pub_owner IS NOT NULL AND pub_owner <> NEW.user_a AND pub_owner <> NEW.user_b THEN
      RAISE EXCEPTION 'O anúncio associado não pertence a nenhum dos participantes';
    END IF;
    NEW.publication_titulo := pub_titulo;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_conversation_participants ON conversations;
CREATE TRIGGER trg_enforce_conversation_participants
BEFORE INSERT ON conversations
FOR EACH ROW
EXECUTE FUNCTION public.enforce_conversation_participants();

-- ── RLS: conversations ───────────────────────────────────────────────────────────────────────
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations_participant_read" ON conversations;
DROP POLICY IF EXISTS "conversations_participant_insert" ON conversations;

CREATE POLICY "conversations_participant_read"
  ON conversations FOR SELECT
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "conversations_participant_insert"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

-- Sem UPDATE/DELETE para o cliente — last_message_at só é alterado por uma função
-- SECURITY DEFINER (ver add_message_notification.sql).

-- ── RLS: messages ────────────────────────────────────────────────────────────────────────────
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_participant_read" ON messages;
DROP POLICY IF EXISTS "messages_participant_insert" ON messages;
DROP POLICY IF EXISTS "messages_recipient_mark_read" ON messages;

CREATE POLICY "messages_participant_read"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (auth.uid() = c.user_a OR auth.uid() = c.user_b)
    )
  );

CREATE POLICY "messages_participant_insert"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (auth.uid() = c.user_a OR auth.uid() = c.user_b)
    )
  );

-- Só quem recebeu a mensagem (não o próprio remetente) pode marcá-la como lida.
CREATE POLICY "messages_recipient_mark_read"
  ON messages FOR UPDATE
  USING (
    sender_id <> auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (auth.uid() = c.user_a OR auth.uid() = c.user_b)
    )
  )
  WITH CHECK (sender_id <> auth.uid());

-- ── Realtime: permite subscrever inserções/atualizações em tempo real no chat ────────────────
-- (só corre se o projeto já tiver a publicação "supabase_realtime" — existe por defeito em
-- todos os projetos Supabase, mas fica protegido caso não exista.)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
     )
  THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;
