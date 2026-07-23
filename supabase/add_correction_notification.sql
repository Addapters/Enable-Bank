-- Estende a notificação de moderação para cobrir "pedido de correção" (tipo 'correcao').
-- Substitui a função criada em add_notification_triggers.sql — o trigger em si não muda
-- (continua "AFTER UPDATE OF moderacao"), só o corpo da função.
CREATE OR REPLACE FUNCTION public.notify_publication_moderation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.moderacao = 'ativo' AND OLD.moderacao IS DISTINCT FROM 'ativo' THEN
    INSERT INTO notifications (user_id, tipo, titulo, mensagem, link, publication_id)
    VALUES (NEW.user_id, 'aprovado', 'O teu anúncio foi aprovado', NEW.titulo, '/publications/' || NEW.id, NEW.id);
  ELSIF NEW.moderacao = 'rejeitado' AND OLD.moderacao IS DISTINCT FROM 'rejeitado' THEN
    INSERT INTO notifications (user_id, tipo, titulo, mensagem, link, publication_id)
    VALUES (NEW.user_id, 'rejeitado', 'O teu anúncio foi rejeitado', NEW.titulo, '/dashboard', NEW.id);
  ELSIF NEW.moderacao = 'correcao' AND OLD.moderacao IS DISTINCT FROM 'correcao' THEN
    INSERT INTO notifications (user_id, tipo, titulo, mensagem, link, publication_id)
    VALUES (NEW.user_id, 'correcao', 'O teu anúncio precisa de uma correção', NEW.titulo, '/publications/' || NEW.id || '/edit', NEW.id);
  END IF;
  RETURN NEW;
END;
$$;
