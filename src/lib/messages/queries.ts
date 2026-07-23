import { createClient } from "@/lib/supabase/server";
import type { MessageRow } from "@/types/database";

interface ParticipantInfo {
  id: string;
  nome: string;
  tipo: string;
  avatar_url: string | null;
}

interface RawConversation {
  id: string;
  user_a: string;
  user_b: string;
  publication_id: string | null;
  publication_titulo: string | null;
  last_message_at: string | null;
  criado_em: string;
  a: ParticipantInfo | null;
  b: ParticipantInfo | null;
}

export interface ConversationSummary {
  id: string;
  publication_id: string | null;
  publication_titulo: string | null;
  last_message_at: string | null;
  criado_em: string;
  otherUser: ParticipantInfo | null;
  lastMessage: { conteudo: string; sender_id: string; criado_em: string } | null;
  unreadCount: number;
}

const CONVERSATION_SELECT = `id, user_a, user_b, publication_id, publication_titulo, last_message_at, criado_em,
  a:users!user_a(id, nome, tipo, avatar_url),
  b:users!user_b(id, nome, tipo, avatar_url)`;

/** Todas as conversas do utilizador autenticado, com o outro participante, a última mensagem e não-lidas. */
export async function getConversations(): Promise<ConversationSummary[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: convRows } = await supabase
    .from("conversations")
    .select(CONVERSATION_SELECT)
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const conversations = (convRows ?? []) as unknown as RawConversation[];
  if (conversations.length === 0) return [];

  const ids = conversations.map((c) => c.id);
  const { data: msgRows } = await supabase
    .from("messages")
    .select("conversation_id, conteudo, sender_id, lida, criado_em")
    .in("conversation_id", ids)
    .order("criado_em", { ascending: false });

  const messages = (msgRows ?? []) as unknown as Array<{
    conversation_id: string; conteudo: string; sender_id: string; lida: boolean; criado_em: string;
  }>;

  const lastMessageByConv = new Map<string, { conteudo: string; sender_id: string; criado_em: string }>();
  const unreadByConv = new Map<string, number>();
  for (const m of messages) {
    if (!lastMessageByConv.has(m.conversation_id)) {
      lastMessageByConv.set(m.conversation_id, { conteudo: m.conteudo, sender_id: m.sender_id, criado_em: m.criado_em });
    }
    if (!m.lida && m.sender_id !== user.id) {
      unreadByConv.set(m.conversation_id, (unreadByConv.get(m.conversation_id) ?? 0) + 1);
    }
  }

  return conversations.map((c) => ({
    id: c.id,
    publication_id: c.publication_id,
    publication_titulo: c.publication_titulo,
    last_message_at: c.last_message_at,
    criado_em: c.criado_em,
    otherUser: c.user_a === user.id ? c.b : c.a,
    lastMessage: lastMessageByConv.get(c.id) ?? null,
    unreadCount: unreadByConv.get(c.id) ?? 0,
  }));
}

export interface ConversationDetail {
  id: string;
  publication_id: string | null;
  publication_titulo: string | null;
  otherUser: ParticipantInfo | null;
  viewerId: string;
}

/** Detalhe de uma conversa (para o cabeçalho da thread) — null se não existir ou não pertencer ao utilizador. */
export async function getConversation(conversationId: string): Promise<ConversationDetail | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("conversations")
    .select(CONVERSATION_SELECT)
    .eq("id", conversationId)
    .single();

  if (!data) return null;
  const c = data as unknown as RawConversation;

  return {
    id: c.id,
    publication_id: c.publication_id,
    publication_titulo: c.publication_titulo,
    otherUser: c.user_a === user.id ? c.b : c.a,
    viewerId: user.id,
  };
}

/** Mensagens de uma conversa, por ordem cronológica. */
export async function getMessages(conversationId: string): Promise<MessageRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, conteudo, lida, lida_em, criado_em")
    .eq("conversation_id", conversationId)
    .order("criado_em", { ascending: true });

  return (data as unknown as MessageRow[]) ?? [];
}
