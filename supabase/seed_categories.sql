-- ============================================================
--  Enable Bank — Seed: Categorias e Subcategorias
--  ISO 9999:2016 — Classificação de produtos de apoio
--  Corre no SQL Editor do Supabase
-- ============================================================

-- Limpa categorias existentes (mantém a ordem correcta nas re-runs)
DELETE FROM categories;

-- ============================================================
--  CATEGORIAS PRINCIPAIS
-- ============================================================

WITH main AS (
  INSERT INTO categories (id, nome, slug, parent_id, iso9999_code, ordem, ativa)
  VALUES
    -- 1. Mobilidade
    ('11111111-0001-0000-0000-000000000000', 'Mobilidade',        'mobilidade',        NULL, '12',    1, true),
    -- 2. Comunicação
    ('11111111-0002-0000-0000-000000000000', 'Comunicação',       'comunicacao',       NULL, '05',    2, true),
    -- 3. Banho e Higiene
    ('11111111-0003-0000-0000-000000000000', 'Banho e Higiene',   'banho-higiene',     NULL, '09.03', 3, true),
    -- 4. Cama e Descanso
    ('11111111-0004-0000-0000-000000000000', 'Cama e Descanso',   'cama-descanso',     NULL, '18.12', 4, true),
    -- 5. Reabilitação
    ('11111111-0005-0000-0000-000000000000', 'Reabilitação',      'reabilitacao',      NULL, '03',    5, true),
    -- 6. Casa e Ambiente
    ('11111111-0006-0000-0000-000000000000', 'Casa e Ambiente',   'casa-ambiente',     NULL, '09',    6, true),
    -- 7. Lazer e Desporto
    ('11111111-0007-0000-0000-000000000000', 'Lazer e Desporto',  'lazer-desporto',    NULL, '15',    7, true),
    -- 8. Outros
    ('11111111-0008-0000-0000-000000000000', 'Outros',            'outros',            NULL, NULL,    8, true)
  RETURNING id, slug
)
SELECT slug FROM main; -- confirma inserção

-- ============================================================
--  SUBCATEGORIAS
-- ============================================================

INSERT INTO categories (id, nome, slug, parent_id, iso9999_code, ordem, ativa)
VALUES

  -- ── 1. Mobilidade ─────────────────────────────────────────
  ('22222222-0001-0001-0000-000000000000', 'Cadeiras de rodas',   'cadeiras-de-rodas',   '11111111-0001-0000-0000-000000000000', '12.22', 1, true),
  ('22222222-0001-0002-0000-000000000000', 'Scooters',            'scooters',            '11111111-0001-0000-0000-000000000000', '12.16', 2, true),
  ('22222222-0001-0003-0000-000000000000', 'Andarilhos',          'andarilhos',          '11111111-0001-0000-0000-000000000000', '12.07', 3, true),
  ('22222222-0001-0004-0000-000000000000', 'Muletas',             'muletas',             '11111111-0001-0000-0000-000000000000', '12.03', 4, true),
  ('22222222-0001-0005-0000-000000000000', 'Rampas',              'rampas-mobilidade',   '11111111-0001-0000-0000-000000000000', '12.31', 5, true),
  ('22222222-0001-0006-0000-000000000000', 'Verticalizadores',    'verticalizadores',    '11111111-0001-0000-0000-000000000000', '12.36', 6, true),

  -- ── 2. Comunicação ────────────────────────────────────────
  ('22222222-0002-0001-0000-000000000000', 'CAA Alta Tecnologia', 'caa-alta-tecnologia', '11111111-0002-0000-0000-000000000000', '05.09', 1, true),
  ('22222222-0002-0002-0000-000000000000', 'CAA Baixa Tecnologia','caa-baixa-tecnologia','11111111-0002-0000-0000-000000000000', '05.03', 2, true),
  ('22222222-0002-0003-0000-000000000000', 'Software',            'software',            '11111111-0002-0000-0000-000000000000', '05.40', 3, true),
  ('22222222-0002-0004-0000-000000000000', 'Ajudas auditivas',    'ajudas-auditivas',    '11111111-0002-0000-0000-000000000000', '05.25', 4, true),
  ('22222222-0002-0005-0000-000000000000', 'Braille',             'braille',             '11111111-0002-0000-0000-000000000000', '05.33', 5, true),

  -- ── 3. Banho e Higiene ────────────────────────────────────
  ('22222222-0003-0001-0000-000000000000', 'Cadeiras de banho',   'cadeiras-de-banho',   '11111111-0003-0000-0000-000000000000', '09.03.06', 1, true),
  ('22222222-0003-0002-0000-000000000000', 'Bancos antideslizantes','bancos-antideslizantes','11111111-0003-0000-0000-000000000000', '09.03.09', 2, true),
  ('22222222-0003-0003-0000-000000000000', 'Adaptadores',         'adaptadores-higiene', '11111111-0003-0000-0000-000000000000', '09.03.15', 3, true),

  -- ── 4. Cama e Descanso ────────────────────────────────────
  ('22222222-0004-0001-0000-000000000000', 'Camas articuladas',   'camas-articuladas',   '11111111-0004-0000-0000-000000000000', '18.12.03', 1, true),
  ('22222222-0004-0002-0000-000000000000', 'Colchões antiescaras','colchoes-antiescaras','11111111-0004-0000-0000-000000000000', '18.12.06', 2, true),
  ('22222222-0004-0003-0000-000000000000', 'Posicionamento',      'posicionamento',      '11111111-0004-0000-0000-000000000000', '18.12.09', 3, true),

  -- ── 5. Reabilitação ───────────────────────────────────────
  ('22222222-0005-0001-0000-000000000000', 'Fisioterapia',        'fisioterapia',        '11111111-0005-0000-0000-000000000000', '03.06', 1, true),
  ('22222222-0005-0002-0000-000000000000', 'Terapia ocupacional', 'terapia-ocupacional', '11111111-0005-0000-0000-000000000000', '03.09', 2, true),
  ('22222222-0005-0003-0000-000000000000', 'Próteses e Ortóteses','proteses-ortoteses',  '11111111-0005-0000-0000-000000000000', '06',    3, true),

  -- ── 6. Casa e Ambiente ────────────────────────────────────
  ('22222222-0006-0001-0000-000000000000', 'Elevadores',          'elevadores',          '11111111-0006-0000-0000-000000000000', '09.12', 1, true),
  ('22222222-0006-0002-0000-000000000000', 'Rampas fixas',        'rampas-fixas',        '11111111-0006-0000-0000-000000000000', '09.15', 2, true),
  ('22222222-0006-0003-0000-000000000000', 'Automatismos',        'automatismos',        '11111111-0006-0000-0000-000000000000', '09.18', 3, true),
  ('22222222-0006-0004-0000-000000000000', 'Iluminação adaptada', 'iluminacao-adaptada', '11111111-0006-0000-0000-000000000000', '09.21', 4, true),

  -- ── 7. Lazer e Desporto ───────────────────────────────────
  ('22222222-0007-0001-0000-000000000000', 'Bicicletas adaptadas','bicicletas-adaptadas','11111111-0007-0000-0000-000000000000', '15.06', 1, true),
  ('22222222-0007-0002-0000-000000000000', 'Bóccia',              'boccia',              '11111111-0007-0000-0000-000000000000', '15.09', 2, true),
  ('22222222-0007-0003-0000-000000000000', 'Jogos táteis e auditivos','jogos-tateis-auditivos','11111111-0007-0000-0000-000000000000', '15.12', 3, true);

-- ============================================================
--  VERIFICAÇÃO
-- ============================================================

SELECT
  CASE WHEN parent_id IS NULL THEN nome ELSE '  └─ ' || nome END AS categoria,
  slug,
  iso9999_code,
  ordem
FROM categories
ORDER BY
  COALESCE(parent_id, id),   -- agrupa subcategorias com a sua principal
  parent_id NULLS FIRST,
  ordem;
