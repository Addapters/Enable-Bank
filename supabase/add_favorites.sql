-- Sistema de favoritos: um utilizador pode marcar publicações como favoritas.
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  publication_id uuid NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, publication_id)
);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_publication_id_idx ON favorites(publication_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_owner_all" ON favorites;
CREATE POLICY "favorites_owner_all"
  ON favorites FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
