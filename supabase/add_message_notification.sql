-- Ao enviar uma mensagem: atualiza o "last_message_at" da conversa e notifica quem a recebeu.
CREATE OR REPLACE FUNCTION public.after_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient uuid;
  sender_nome text;
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.criado_em
  WHERE id = NEW.conversation_id
  RETURNING (CASE WHEN user_a = NEW.sender_id THEN user_b ELSE user_a END) INTO recipient;

  SELECT nome INTO sender_nome FROM users WHERE id = NEW.sender_id;

  INSERT INTO notifications (user_id, tipo, titulo, mensagem, link)
  VALUES (
    recipient,
    'nova_mensagem',
    'Nova mensagem de ' || COALESCE(sender_nome, 'um utilizador'),
    left(NEW.conteudo, 140),
    '/mensagens/' || NEW.conversation_id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_after_new_message ON messages;
CREATE TRIGGER trg_after_new_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION public.after_new_message();
