-- Triggers que criam notificações automaticamente. Usam SECURITY DEFINER porque a tabela
-- "notifications" não tem policy de INSERT para utilizadores (só triggers/service role podem
-- escrever) — impede que alguém crie notificações falsas via API.
--
-- Nota: "pedir correção" (tipo 'correcao') ainda não existe como ação real no admin (só está
-- previsto no enum de moderation_logs.acao) — por isso não há trigger para esse caso ainda.

-- ════════════════════════════════════════════════════════════
--  1. Aprovação / rejeição de anúncio
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.notify_publication_moderation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.moderacao = 'ativo' AND OLD.moderacao IS DISTINCT FROM 'ativo' THEN
    INSERT INTO notifications (user_id, tipo, titulo, mensagem, link, publication_id)
    VALUES (NEW.user_id, 'aprovado', 'O teu anúncio foi aprovado', NEW.titulo, '/publications/' || NEW.id, NEW.id);
  ELSIF NEW.moderacao = 'rejeitado' AND OLD.moderacao IS DISTINCT FROM 'rejeitado' THEN
    INSERT INTO notifications (user_id, tipo, titulo, mensagem, link, publication_id)
    VALUES (NEW.user_id, 'rejeitado', 'O teu anúncio foi rejeitado', NEW.titulo, '/dashboard', NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_publication_moderation ON publications;
CREATE TRIGGER trg_notify_publication_moderation
AFTER UPDATE OF moderacao ON publications
FOR EACH ROW
EXECUTE FUNCTION public.notify_publication_moderation();


-- ════════════════════════════════════════════════════════════
--  2. Alguém favoritou o teu anúncio
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.notify_new_favorite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pub_owner uuid;
  pub_titulo text;
BEGIN
  SELECT user_id, titulo INTO pub_owner, pub_titulo FROM publications WHERE id = NEW.publication_id;
  IF pub_owner IS NOT NULL AND pub_owner <> NEW.user_id THEN
    INSERT INTO notifications (user_id, tipo, titulo, mensagem, link, publication_id)
    VALUES (pub_owner, 'favorito_novo', 'Alguém adicionou o teu anúncio aos favoritos', pub_titulo, '/publications/' || NEW.publication_id, NEW.publication_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_favorite ON favorites;
CREATE TRIGGER trg_notify_new_favorite
AFTER INSERT ON favorites
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_favorite();


-- ════════════════════════════════════════════════════════════
--  3. Um produto favoritado deixou de estar disponível
--     (cedido, marcado como indisponível, ou eliminado)
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.notify_favorites_on_unavailable()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (NEW.moderacao = 'cedido' AND OLD.moderacao IS DISTINCT FROM 'cedido')
     OR (NEW.disponivel = false AND OLD.disponivel = true) THEN
    INSERT INTO notifications (user_id, tipo, titulo, mensagem, link, publication_id)
    SELECT
      f.user_id,
      'favorito_indisponivel',
      'Um produto que guardaste já não está disponível',
      NEW.titulo,
      CASE WHEN NEW.moderacao = 'ativo' THEN '/publications/' || NEW.id ELSE '/favoritos' END,
      CASE WHEN NEW.moderacao = 'ativo' THEN NEW.id ELSE NULL END
    FROM favorites f
    WHERE f.publication_id = NEW.id AND f.user_id <> NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_favorites_on_unavailable ON publications;
CREATE TRIGGER trg_notify_favorites_on_unavailable
AFTER UPDATE ON publications
FOR EACH ROW
EXECUTE FUNCTION public.notify_favorites_on_unavailable();

-- Caso o anúncio seja eliminado (hard delete) em vez de só marcado como cedido/indisponível.
-- publication_id fica NULL porque a linha deixa de existir (a FK teria de a apagar em cascata).
CREATE OR REPLACE FUNCTION public.notify_favorites_on_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (user_id, tipo, titulo, mensagem, link, publication_id)
  SELECT f.user_id, 'favorito_indisponivel', 'Um produto que guardaste foi removido', OLD.titulo, '/favoritos', NULL
  FROM favorites f
  WHERE f.publication_id = OLD.id AND f.user_id <> OLD.user_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_favorites_on_delete ON publications;
CREATE TRIGGER trg_notify_favorites_on_delete
AFTER DELETE ON publications
FOR EACH ROW
EXECUTE FUNCTION public.notify_favorites_on_delete();


-- ════════════════════════════════════════════════════════════
--  4. Entidade verificada (sugestão extra)
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.notify_entity_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.verificada = true AND OLD.verificada IS DISTINCT FROM true THEN
    INSERT INTO notifications (user_id, tipo, titulo, mensagem, link)
    VALUES (NEW.user_id, 'entidade_verificada', 'A tua entidade foi verificada', NEW.nome, '/profile');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_entity_verified ON entities;
CREATE TRIGGER trg_notify_entity_verified
AFTER UPDATE OF verificada ON entities
FOR EACH ROW
EXECUTE FUNCTION public.notify_entity_verified();
