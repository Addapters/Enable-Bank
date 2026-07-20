-- Adiciona campo código postal à tabela publications
-- latitude e longitude já existem

ALTER TABLE publications
  ADD COLUMN IF NOT EXISTS codigo_postal varchar(4);

-- Índice para pesquisa geográfica
CREATE INDEX IF NOT EXISTS publications_lat_lng_idx
  ON publications (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Verifica
SELECT id, titulo, codigo_postal, latitude, longitude
FROM publications
ORDER BY criado_em DESC
LIMIT 10;
