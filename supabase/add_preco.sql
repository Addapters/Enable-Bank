-- Adiciona coluna preço à tabela publications
-- Apenas preenchido quando tipo = 'venda'
ALTER TABLE publications
  ADD COLUMN IF NOT EXISTS preco numeric(10, 2) DEFAULT NULL;
