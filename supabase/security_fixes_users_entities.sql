-- Corrige duas vulnerabilidades críticas encontradas numa auditoria de segurança:
--
-- 1) users_update_own não restringia colunas — qualquer utilizador autenticado podia
--    fazer PATCH direto à API REST e definir o seu próprio role='admin' ou suspended=false,
--    contornando toda a aplicação (todas as verificações de admin usam public.is_admin(),
--    que lê exatamente esta coluna).
--
-- 2) users_select_own expunha TODAS as colunas (email, telefone, role, suspended) a
--    qualquer utilizador autenticado — a política já documentava a intenção de restringir
--    a "só o próprio utilizador ou admin" (ver comentário em add_public_user_profiles_view.sql),
--    mas a policy real ficou `USING (auth.uid() IS NOT NULL)`, sem essa restrição.
--    A view user_public_profiles já existe precisamente para os casos de leitura pública
--    (nome/tipo/avatar_url de outro utilizador) e continua a funcionar sem alterações, pois
--    views correm com os privilégios do dono, não do chamador.

-- ── 1) Bloqueia auto-promoção a admin / auto-remoção de suspensão ───────────────────────────
CREATE OR REPLACE FUNCTION public.protect_privileged_user_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.suspended := OLD.suspended;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_privileged_user_columns ON users;
CREATE TRIGGER trg_protect_privileged_user_columns
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION public.protect_privileged_user_columns();

-- ── 2) Restringe leitura de "users" a próprio utilizador ou admin ──────────────────────────
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (id = auth.uid() OR public.is_admin());
