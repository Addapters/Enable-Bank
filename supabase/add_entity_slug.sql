-- Adiciona coluna slug à tabela entities
-- Corre no SQL Editor do Supabase

ALTER TABLE entities
  ADD COLUMN IF NOT EXISTS slug text;

-- Gera slugs para entidades existentes a partir do nome
UPDATE entities
SET slug = lower(
  regexp_replace(
    translate(nome,
      'àáâãäåèéêëìíîïòóôõöùúûüýÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝçÇñÑ',
      'aaaaaaeeeeiiiioooooouuuuyAAAAAEEEEIIIIOOOOOUUUUYcCnN'
    ),
    '[^a-z0-9]+', '-', 'g'
  )
)
WHERE slug IS NULL;

-- Remove hífens duplos e de início/fim
UPDATE entities
SET slug = trim(both '-' from regexp_replace(slug, '-+', '-', 'g'))
WHERE slug IS NOT NULL;

-- Garante unicidade (acrescenta -2, -3... se necessário)
DO $$
DECLARE
  r record;
  base_slug text;
  new_slug text;
  counter int;
BEGIN
  FOR r IN SELECT id, slug FROM entities ORDER BY criado_em LOOP
    base_slug := r.slug;
    new_slug := base_slug;
    counter := 2;
    WHILE EXISTS (SELECT 1 FROM entities WHERE slug = new_slug AND id != r.id) LOOP
      new_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    IF new_slug != r.slug THEN
      UPDATE entities SET slug = new_slug WHERE id = r.id;
    END IF;
  END LOOP;
END $$;

-- Adiciona constraint unique
ALTER TABLE entities
  ADD CONSTRAINT IF NOT EXISTS entities_slug_key UNIQUE (slug);

-- Verifica
SELECT id, nome, slug FROM entities ORDER BY criado_em;
