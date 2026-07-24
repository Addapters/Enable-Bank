-- Muda as avaliações para serem exclusivamente sobre o UTILIZADOR, não sobre um anúncio
-- específico — um utilizador só pode ter uma avaliação por cada outro utilizador (editável),
-- em vez de uma por combinação (avaliador, anúncio).
-- Seguro de correr: a tabela reviews ainda não tem dados reais.

DROP TRIGGER IF EXISTS trg_enforce_review_target ON reviews;
DROP FUNCTION IF EXISTS public.enforce_review_target();

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_reviewer_id_publication_id_key;
ALTER TABLE reviews DROP COLUMN IF EXISTS publication_id;
ALTER TABLE reviews DROP COLUMN IF EXISTS publication_titulo;

ALTER TABLE reviews ADD CONSTRAINT reviews_reviewer_id_reviewed_user_id_key UNIQUE (reviewer_id, reviewed_user_id);

-- ── Trigger: bloqueia auto-avaliação e mantém atualizado_em em dia ───────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_review_target()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.reviewed_user_id = NEW.reviewer_id THEN
    RAISE EXCEPTION 'Não podes avaliar-te a ti mesmo';
  END IF;
  NEW.atualizado_em := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_review_target ON reviews;
CREATE TRIGGER trg_enforce_review_target
BEFORE INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION public.enforce_review_target();

-- ── Notificação: já não referencia publication_id/publication_titulo ────────────────────────
CREATE OR REPLACE FUNCTION public.notify_new_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, tipo, titulo, mensagem, link)
  VALUES (
    NEW.reviewed_user_id,
    'nova_avaliacao',
    'Recebeste uma nova avaliação',
    left(NEW.comentario, 140),
    '/utilizadores/' || NEW.reviewed_user_id
  );
  RETURN NEW;
END;
$$;
