-- Três correções da auditoria de segurança:
--
-- 1) publications_owner_insert/update não restringiam a coluna moderacao — um dono podia
--    criar um anúncio já com moderacao='ativo' (bypass total da moderação) ou fazer PATCH
--    direto para 'ativo'/'rejeitado'/'correcao', contornando a revisão do admin. A única
--    transição legítima feita pelo próprio dono é ativo→cedido (marcar como entregue).
--
-- 2) messages_recipient_mark_read só verificava "não sou o remetente" — o destinatário podia
--    reescrever o conteúdo de uma mensagem que não enviou, não só o estado de leitura.
--
-- 3) Depois de reviews passarem a ser sobre o utilizador (não o anúncio), reviewed_user_id é
--    fornecido pelo cliente sem exigir qualquer interação prévia real — permite "bombardear"
--    qualquer utilizador com avaliações negativas sem nunca ter havido contacto.

-- ── 1) Publicações: só admin pode aprovar/rejeitar/pedir correção ──────────────────────────
CREATE OR REPLACE FUNCTION public.protect_publication_moderation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.moderacao := 'pendente';
    RETURN NEW;
  END IF;

  -- UPDATE: o dono só pode reenviar para revisão (pendente) ou marcar um anúncio ativo
  -- como cedido. Qualquer outra transição (nomeadamente para ativo/rejeitado/correcao) é
  -- revertida para o valor anterior.
  IF NEW.moderacao IS DISTINCT FROM OLD.moderacao THEN
    IF NOT (NEW.moderacao = 'pendente' OR (OLD.moderacao = 'ativo' AND NEW.moderacao = 'cedido')) THEN
      NEW.moderacao := OLD.moderacao;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_publication_moderation ON publications;
CREATE TRIGGER trg_protect_publication_moderation
BEFORE INSERT OR UPDATE ON publications
FOR EACH ROW
EXECUTE FUNCTION public.protect_publication_moderation();

-- ── 2) Mensagens: o destinatário só pode alterar lida/lida_em, nunca o conteúdo ────────────
CREATE OR REPLACE FUNCTION public.protect_message_content()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.conteudo := OLD.conteudo;
  NEW.sender_id := OLD.sender_id;
  NEW.conversation_id := OLD.conversation_id;
  NEW.criado_em := OLD.criado_em;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_message_content ON messages;
CREATE TRIGGER trg_protect_message_content
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION public.protect_message_content();

-- ── 3) Avaliações: exige algum vínculo real com o avaliado antes de poder ser avaliado ─────
-- (mantém reviews como sendo sobre o utilizador, não o anúncio — aceita QUALQUER prova de
-- que o avaliado é um participante real da plataforma: ter um anúncio ativo/cedido (vendedor/
-- doador) OU já existir uma conversa entre avaliador e avaliado (ex: quem recebeu uma doação
-- e nunca publicou nada). Não reintroduz a coluna publication_id.)
CREATE OR REPLACE FUNCTION public.enforce_review_target()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.reviewed_user_id = NEW.reviewer_id THEN
    RAISE EXCEPTION 'Não podes avaliar-te a ti mesmo';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM publications
    WHERE user_id = NEW.reviewed_user_id
      AND moderacao IN ('ativo', 'cedido')
  ) AND NOT EXISTS (
    SELECT 1 FROM conversations
    WHERE (user_a = NEW.reviewer_id AND user_b = NEW.reviewed_user_id)
       OR (user_a = NEW.reviewed_user_id AND user_b = NEW.reviewer_id)
  ) THEN
    RAISE EXCEPTION 'Só podes avaliar utilizadores com quem já tiveste algum contacto na plataforma';
  END IF;

  NEW.atualizado_em := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_review_target ON reviews;
CREATE TRIGGER trg_enforce_review_target
BEFORE INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION public.enforce_review_target();
