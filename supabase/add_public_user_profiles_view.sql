-- View pública com apenas os campos seguros de "users" (nome, tipo, concelho, avatar_url,
-- data de registo) — para a página pública de perfil de utilizadores particulares.
-- Não expõe email, telefone, role nem suspended. A tabela "users" mantém a sua RLS restritiva
-- (só o próprio utilizador ou admin); esta view corre com os privilégios do dono (comportamento
-- por defeito do Postgres para views), por isso consegue ler "users" mesmo sendo chamada por
-- um visitante anónimo — mas só devolve as colunas aqui listadas.
CREATE OR REPLACE VIEW public.user_public_profiles AS
SELECT id, nome, tipo, concelho, avatar_url, criado_em
FROM public.users;

GRANT SELECT ON public.user_public_profiles TO anon, authenticated;
