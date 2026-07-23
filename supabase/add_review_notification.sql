-- Notifica o utilizador avaliado quando recebe uma nova avaliação.
CREATE OR REPLACE FUNCTION public.notify_new_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, tipo, titulo, mensagem, link, publication_id)
  VALUES (
    NEW.reviewed_user_id,
    'nova_avaliacao',
    'Recebeste uma nova avaliação',
    NEW.publication_titulo,
    '/utilizadores/' || NEW.reviewed_user_id,
    NEW.publication_id
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_review ON reviews;
CREATE TRIGGER trg_notify_new_review
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_review();
