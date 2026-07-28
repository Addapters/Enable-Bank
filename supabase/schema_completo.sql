-- ============================================================
--  Enable Bank — Schema Completo
--  Corre este ficheiro no SQL Editor do novo projecto Supabase
--  (Addapters org) para criar toda a estrutura da base de dados.
--  ATENÇÃO: corre por partes se o SQL Editor tiver limite de tamanho.
-- ============================================================


-- ════════════════════════════════════════════════════════════
--  EXTENSÕES
-- ════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "vector";   -- para embeddings (pode ignorar se não usar)


-- ════════════════════════════════════════════════════════════
--  1. USERS
--  Perfil público de cada utilizador (ligado a auth.users)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text NOT NULL,
  nome          text NOT NULL,
  tipo          text NOT NULL CHECK (tipo IN ('particular', 'entidade')),
  role          text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  concelho      text,
  telefone      text,
  suspended     boolean NOT NULL DEFAULT false,
  criado_em     timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_suspended_idx ON users (suspended);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;


-- ════════════════════════════════════════════════════════════
--  2. FUNÇÃO is_admin() — evita recursão nas RLS policies
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;


-- ════════════════════════════════════════════════════════════
--  3. ENTITIES
--  Perfil de entidades (ONGs, IPSS, municípios, etc.)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS entities (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome                  text NOT NULL,
  tipo                  text NOT NULL CHECK (tipo IN ('ONGPD','IPSS','municipio','misericordia','clinica','associacao','outro')),
  morada                text,
  concelho              text,
  website               text,
  nif                   text,
  email_contacto        text,
  telefone              text,
  pessoa_contacto_nome  text,
  pessoa_contacto_cargo text,
  descricao             text,
  logo_url              text,
  verificada            boolean NOT NULL DEFAULT false,
  verificada_em         timestamptz,
  verificada_por        uuid REFERENCES users(id),
  rejeitada             boolean NOT NULL DEFAULT false,
  nota_rejeicao         text,
  slug                  text UNIQUE,
  criado_em             timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE entities ENABLE ROW LEVEL SECURITY;


-- ════════════════════════════════════════════════════════════
--  4. CATEGORIES
--  Categorias e subcategorias de produtos de apoio (ISO 9999)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS categories (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         text NOT NULL,
  slug         text NOT NULL UNIQUE,
  parent_id    uuid REFERENCES categories(id),
  iso9999_code text,
  ordem        integer NOT NULL DEFAULT 0,
  ativa        boolean NOT NULL DEFAULT true,
  criado_em    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;


-- ════════════════════════════════════════════════════════════
--  5. PUBLICATIONS
--  Anúncios de doação, troca e venda
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS publications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       text NOT NULL,
  descricao    text NOT NULL,
  tipo         text NOT NULL CHECK (tipo IN ('doacao','troca','venda')),
  estado       text NOT NULL CHECK (estado IN ('novo','bom','usado')),
  categoria_id uuid REFERENCES categories(id),
  publico      text NOT NULL CHECK (publico IN ('crianca','adulto','ambos')),
  disponivel   boolean NOT NULL DEFAULT true,
  preco        numeric(10,2),
  concelho     text NOT NULL,
  codigo_postal varchar(4),
  latitude     double precision,
  longitude    double precision,
  user_id      uuid NOT NULL REFERENCES users(id),
  moderacao    text NOT NULL DEFAULT 'pendente' CHECK (moderacao IN ('pendente','ativo','rejeitado','cedido')),
  embedding    vector(1536),
  criado_em    timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS publications_lat_lng_idx
  ON publications (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

ALTER TABLE publications ENABLE ROW LEVEL SECURITY;


-- ════════════════════════════════════════════════════════════
--  6. PHOTOS
--  Fotos de publicações
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS photos (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id uuid NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  url            text NOT NULL,
  ordem          integer NOT NULL DEFAULT 0,
  criado_em      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;


-- ════════════════════════════════════════════════════════════
--  7. CONTACTS
--  Dados de contacto de cada utilizador (um por utilizador)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS contacts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_contacto text NOT NULL,
  telefone       text,
  criado_em      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;


-- ════════════════════════════════════════════════════════════
--  8. MODERATION_LOGS
--  Histórico de ações de moderação
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS moderation_logs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id uuid NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  admin_id       uuid NOT NULL REFERENCES users(id),
  acao           text NOT NULL CHECK (acao IN ('aprovado','rejeitado','correcao')),
  nota           text,
  criado_em      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS moderation_logs_publication_id_idx
  ON moderation_logs (publication_id);

ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;


-- ════════════════════════════════════════════════════════════
--  RLS POLICIES
-- ════════════════════════════════════════════════════════════

-- USERS
CREATE POLICY "users_select_all_auth"  ON users FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "users_insert_self"      ON users FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "users_update_own"       ON users FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "users_admin_all"        ON users FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ENTITIES
CREATE POLICY "entities_public_read"   ON entities FOR SELECT USING (true);
CREATE POLICY "entities_owner_all"     ON entities FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "entities_admin_all"     ON entities FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- CATEGORIES
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_all"   ON categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PUBLICATIONS
CREATE POLICY "publications_public_read"   ON publications FOR SELECT USING (moderacao = 'ativo');
CREATE POLICY "publications_owner_read"    ON publications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "publications_owner_insert"  ON publications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "publications_owner_update"  ON publications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "publications_owner_delete"  ON publications FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "publications_admin_all"     ON publications FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PHOTOS
CREATE POLICY "photos_public_read"     ON photos FOR SELECT USING (true);
CREATE POLICY "photos_owner_insert"    ON photos FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM publications WHERE id = publication_id AND user_id = auth.uid()));
CREATE POLICY "photos_owner_delete"    ON photos FOR DELETE USING (EXISTS (SELECT 1 FROM publications WHERE id = publication_id AND user_id = auth.uid()));

-- CONTACTS
CREATE POLICY "contacts_auth_read"     ON contacts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "contacts_owner_insert"  ON contacts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "contacts_owner_update"  ON contacts FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- MODERATION_LOGS
CREATE POLICY "modlogs_admin_all"      ON moderation_logs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- ════════════════════════════════════════════════════════════
--  STORAGE — bucket "publications" (fotos e logos)
-- ════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('publications', 'publications', true)
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "publications_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "publications_auth_upload"  ON storage.objects;
DROP POLICY IF EXISTS "publications_auth_update"  ON storage.objects;
DROP POLICY IF EXISTS "publications_owner_delete" ON storage.objects;

CREATE POLICY "publications_public_read"  ON storage.objects FOR SELECT USING (bucket_id = 'publications');
CREATE POLICY "publications_auth_upload"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'publications' AND auth.role() = 'authenticated');
CREATE POLICY "publications_auth_update"  ON storage.objects FOR UPDATE USING (bucket_id = 'publications' AND auth.uid() = owner);
CREATE POLICY "publications_owner_delete" ON storage.objects FOR DELETE USING (bucket_id = 'publications' AND auth.uid() = owner);


-- ════════════════════════════════════════════════════════════
--  TRIGGER — cria perfil de utilizador após registo
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, nome, tipo, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'particular'),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ════════════════════════════════════════════════════════════
--  SEED — Categorias (ISO 9999:2016)
-- ════════════════════════════════════════════════════════════
DELETE FROM categories;

INSERT INTO categories (id, nome, slug, parent_id, iso9999_code, ordem, ativa) VALUES
  ('11111111-0001-0000-0000-000000000000', 'Mobilidade',       'mobilidade',      NULL, '12',    1, true),
  ('11111111-0002-0000-0000-000000000000', 'Comunicação',      'comunicacao',     NULL, '05',    2, true),
  ('11111111-0003-0000-0000-000000000000', 'Banho e Higiene',  'banho-higiene',   NULL, '09.03', 3, true),
  ('11111111-0004-0000-0000-000000000000', 'Cama e Descanso',  'cama-descanso',   NULL, '18.12', 4, true),
  ('11111111-0005-0000-0000-000000000000', 'Reabilitação',     'reabilitacao',    NULL, '03',    5, true),
  ('11111111-0006-0000-0000-000000000000', 'Casa e Ambiente',  'casa-ambiente',   NULL, '09',    6, true),
  ('11111111-0007-0000-0000-000000000000', 'Lazer e Desporto', 'lazer-desporto',  NULL, '15',    7, true),
  ('11111111-0008-0000-0000-000000000000', 'Outros',           'outros',          NULL, NULL,    8, true),
  -- Mobilidade
  ('22222222-0001-0001-0000-000000000000', 'Cadeiras de rodas',    'cadeiras-de-rodas',     '11111111-0001-0000-0000-000000000000', '12.22',    1, true),
  ('22222222-0001-0002-0000-000000000000', 'Scooters',             'scooters',               '11111111-0001-0000-0000-000000000000', '12.16',    2, true),
  ('22222222-0001-0003-0000-000000000000', 'Andarilhos',           'andarilhos',             '11111111-0001-0000-0000-000000000000', '12.07',    3, true),
  ('22222222-0001-0004-0000-000000000000', 'Muletas',              'muletas',                '11111111-0001-0000-0000-000000000000', '12.03',    4, true),
  ('22222222-0001-0005-0000-000000000000', 'Rampas',               'rampas-mobilidade',      '11111111-0001-0000-0000-000000000000', '12.31',    5, true),
  ('22222222-0001-0006-0000-000000000000', 'Verticalizadores',     'verticalizadores',       '11111111-0001-0000-0000-000000000000', '12.36',    6, true),
  -- Comunicação
  ('22222222-0002-0001-0000-000000000000', 'CAA Alta Tecnologia',  'caa-alta-tecnologia',    '11111111-0002-0000-0000-000000000000', '05.09',    1, true),
  ('22222222-0002-0002-0000-000000000000', 'CAA Baixa Tecnologia', 'caa-baixa-tecnologia',   '11111111-0002-0000-0000-000000000000', '05.03',    2, true),
  ('22222222-0002-0003-0000-000000000000', 'Software',             'software',               '11111111-0002-0000-0000-000000000000', '05.40',    3, true),
  ('22222222-0002-0004-0000-000000000000', 'Ajudas auditivas',     'ajudas-auditivas',       '11111111-0002-0000-0000-000000000000', '05.25',    4, true),
  ('22222222-0002-0005-0000-000000000000', 'Braille',              'braille',                '11111111-0002-0000-0000-000000000000', '05.33',    5, true),
  -- Banho e Higiene
  ('22222222-0003-0001-0000-000000000000', 'Cadeiras de banho',    'cadeiras-de-banho',      '11111111-0003-0000-0000-000000000000', '09.03.06', 1, true),
  ('22222222-0003-0002-0000-000000000000', 'Bancos antideslizantes','bancos-antideslizantes', '11111111-0003-0000-0000-000000000000', '09.03.09', 2, true),
  ('22222222-0003-0003-0000-000000000000', 'Adaptadores',          'adaptadores-higiene',    '11111111-0003-0000-0000-000000000000', '09.03.15', 3, true),
  -- Cama e Descanso
  ('22222222-0004-0001-0000-000000000000', 'Camas articuladas',    'camas-articuladas',      '11111111-0004-0000-0000-000000000000', '18.12.03', 1, true),
  ('22222222-0004-0002-0000-000000000000', 'Colchões antiescaras', 'colchoes-antiescaras',   '11111111-0004-0000-0000-000000000000', '18.12.06', 2, true),
  ('22222222-0004-0003-0000-000000000000', 'Posicionamento',       'posicionamento',         '11111111-0004-0000-0000-000000000000', '18.12.09', 3, true),
  -- Reabilitação
  ('22222222-0005-0001-0000-000000000000', 'Fisioterapia',         'fisioterapia',           '11111111-0005-0000-0000-000000000000', '03.06',    1, true),
  ('22222222-0005-0002-0000-000000000000', 'Terapia ocupacional',  'terapia-ocupacional',    '11111111-0005-0000-0000-000000000000', '03.09',    2, true),
  ('22222222-0005-0003-0000-000000000000', 'Próteses e Ortóteses', 'proteses-ortoteses',     '11111111-0005-0000-0000-000000000000', '06',       3, true),
  -- Casa e Ambiente
  ('22222222-0006-0001-0000-000000000000', 'Elevadores',           'elevadores',             '11111111-0006-0000-0000-000000000000', '09.12',    1, true),
  ('22222222-0006-0002-0000-000000000000', 'Rampas fixas',         'rampas-fixas',           '11111111-0006-0000-0000-000000000000', '09.15',    2, true),
  ('22222222-0006-0003-0000-000000000000', 'Automatismos',         'automatismos',           '11111111-0006-0000-0000-000000000000', '09.18',    3, true),
  ('22222222-0006-0004-0000-000000000000', 'Iluminação adaptada',  'iluminacao-adaptada',    '11111111-0006-0000-0000-000000000000', '09.21',    4, true),
  -- Lazer e Desporto
  ('22222222-0007-0001-0000-000000000000', 'Bicicletas adaptadas', 'bicicletas-adaptadas',   '11111111-0007-0000-0000-000000000000', '15.06',    1, true),
  ('22222222-0007-0002-0000-000000000000', 'Bóccia',               'boccia',                 '11111111-0007-0000-0000-000000000000', '15.09',    2, true),
  ('22222222-0007-0003-0000-000000000000', 'Jogos táteis e auditivos','jogos-tateis-auditivos','11111111-0007-0000-0000-000000000000','15.12',   3, true);


-- ════════════════════════════════════════════════════════════
--  VERIFICAÇÃO FINAL
-- ════════════════════════════════════════════════════════════
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
