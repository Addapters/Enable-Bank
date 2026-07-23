-- Sistema de avaliações — um utilizador avalia o dono de um anúncio (particular ou entidade),
-- criando um sistema de confiança na plataforma.
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  publication_id uuid REFERENCES publications(id) ON DELETE SET NULL,
  publication_titulo text,                 -- snapshot do título, sobrevive à eliminação do anúncio
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comentario text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reviewer_id, publication_id)
);

CREATE INDEX IF NOT EXISTS reviews_reviewed_user_id_idx ON reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS reviews_publication_id_idx ON reviews(publication_id);

-- ── Trigger: garante reviewed_user_id = dono do anúncio, e bloqueia auto-avaliação ──────────
-- Impede que o cliente forje reviewed_user_id (ex: avaliar-se a favor de outra pessoa) e
-- impede avaliar o próprio anúncio, independentemente do que a app enviar.
CREATE OR REPLACE FUNCTION public.enforce_review_target()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pub_owner uuid;
  pub_titulo text;
BEGIN
  IF NEW.publication_id IS NULL THEN
    RAISE EXCEPTION 'publication_id é obrigatório para criar uma avaliação';
  END IF;

  SELECT user_id, titulo INTO pub_owner, pub_titulo FROM publications WHERE id = NEW.publication_id;
  IF pub_owner IS NULL THEN
    RAISE EXCEPTION 'Anúncio não encontrado';
  END IF;

  IF pub_owner = NEW.reviewer_id THEN
    RAISE EXCEPTION 'Não podes avaliar o teu próprio anúncio';
  END IF;

  NEW.reviewed_user_id := pub_owner;
  NEW.publication_titulo := pub_titulo;
  NEW.atualizado_em := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_review_target ON reviews;
CREATE TRIGGER trg_enforce_review_target
BEFORE INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION public.enforce_review_target();

-- ── RLS ──────────────────────────────────────────────────────────────────────────────────────
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
DROP POLICY IF EXISTS "reviews_owner_insert" ON reviews;
DROP POLICY IF EXISTS "reviews_owner_update" ON reviews;
DROP POLICY IF EXISTS "reviews_owner_delete" ON reviews;

-- Avaliações são públicas — servem para gerar confiança, qualquer visitante deve poder vê-las.
CREATE POLICY "reviews_public_read"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "reviews_owner_insert"
  ON reviews FOR INSERT
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "reviews_owner_update"
  ON reviews FOR UPDATE
  USING (reviewer_id = auth.uid())
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "reviews_owner_delete"
  ON reviews FOR DELETE
  USING (reviewer_id = auth.uid());
