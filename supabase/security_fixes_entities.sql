-- Corrige duas vulnerabilidades na tabela entities encontradas numa auditoria de segurança:
--
-- 1) entities_public_read era `USING (true)`, sem sequer exigir sessão — expunha nif,
--    email_contacto, telefone e pessoa_contacto a qualquer visitante anónimo via API direta.
--    O site já mostra publicamente nome/morada/website/telefone/email/pessoa de contacto na
--    página /entidades/[slug] (é um diretório de organizações, comportamento intencional) —
--    mas NUNCA mostra o NIF. A vista `entities_public` replica exatamente os campos já
--    públicos, sem NIF; a tabela base passa a exigir ser o próprio dono ou admin.
--
-- 2) entities_owner_all não restringia colunas — o dono podia atualizar verificada,
--    verificada_por, verificada_em e rejeitada diretamente via API, auto-atribuindo-se o
--    selo de "Entidade Verificada".

-- ── 1) Vista pública sem NIF ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.entities_public AS
SELECT id, nome, tipo, slug, morada, concelho, website, telefone,
       email_contacto, pessoa_contacto_nome, pessoa_contacto_cargo,
       descricao, logo_url, verificada, criado_em, user_id
FROM public.entities;

GRANT SELECT ON public.entities_public TO anon, authenticated;

DROP POLICY IF EXISTS "entities_public_read" ON entities;
CREATE POLICY "entities_public_read"
  ON entities FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- ── 2) Bloqueia auto-verificação ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.protect_entity_verification_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.verificada := OLD.verificada;
    NEW.verificada_em := OLD.verificada_em;
    NEW.verificada_por := OLD.verificada_por;
    NEW.rejeitada := OLD.rejeitada;
    NEW.nota_rejeicao := OLD.nota_rejeicao;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_entity_verification_columns ON entities;
CREATE TRIGGER trg_protect_entity_verification_columns
BEFORE UPDATE ON entities
FOR EACH ROW
EXECUTE FUNCTION public.protect_entity_verification_columns();
