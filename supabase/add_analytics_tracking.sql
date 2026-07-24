-- Analítica interna: pesquisas efetuadas e visitas às páginas — alimenta o backoffice de
-- estatísticas (/admin/stats). Escrita pública (qualquer visitante gera estes eventos),
-- leitura só para admins.
CREATE TABLE IF NOT EXISTS search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  termo text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pathname text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS search_logs_criado_em_idx ON search_logs(criado_em DESC);
CREATE INDEX IF NOT EXISTS page_views_criado_em_idx ON page_views(criado_em DESC);

ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "search_logs_public_insert" ON search_logs;
DROP POLICY IF EXISTS "search_logs_admin_read" ON search_logs;
DROP POLICY IF EXISTS "page_views_public_insert" ON page_views;
DROP POLICY IF EXISTS "page_views_admin_read" ON page_views;

-- Qualquer visitante (autenticado ou não) pode registar um evento — não expõe dados sensíveis.
CREATE POLICY "search_logs_public_insert" ON search_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "page_views_public_insert" ON page_views FOR INSERT WITH CHECK (true);

-- Só admins podem ler os dados agregados (usa a função is_admin() já existente).
CREATE POLICY "search_logs_admin_read" ON search_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "page_views_admin_read" ON page_views FOR SELECT USING (public.is_admin());
