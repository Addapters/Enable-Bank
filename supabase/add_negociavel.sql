-- Indica se o preço de um anúncio de venda é negociável.
ALTER TABLE publications ADD COLUMN IF NOT EXISTS negociavel boolean NOT NULL DEFAULT false;
