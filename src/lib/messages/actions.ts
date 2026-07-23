"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MessageRow } from "@/types/database";

export type ConversationResult =
  | { success: true; conversationId: string }
  | { success: false; error: string };

export type MessageResult =
  | { success: true; message: MessageRow }
  | { success: false; error: string };

/** Encontra a conversa existente entre o utilizador autenticado e `otherUserId` (sobre `publicationId`, se indicado) ou cria uma nova. */
export async function getOrCreateConversation(
  otherUserId: string,
  publicationId?: string | null
): Promise<ConversationResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "not_authenticated" };
  if (user.id === otherUserId) return { success: false, error: "self" };

  const [userA, userB] = [user.id, otherUserId].sort();

  let existingQuery = supabase.from("conversations").select("id").eq("user_a", userA).eq("user_b", userB);
  existingQuery = publicationId
    ? existingQuery.eq("publication_id", publicationId)
    : existingQuery.is("publication_id", null);
  const { data: existing } = await existingQuery.maybeSingle();

  if (existing) return { success: true, conversationId: (existing as { id: string }).id };

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ user_a: userA, user_b: userB, publication_id: publicationId ?? null })
    .select("id")
    .single();

  if (error || !created) return { success: false, error: error?.message ?? "unknown_error" };
  return { success: true, conversationId: (created as { id: string }).id };
}

export async function sendMessage(conversationId: string, conteudo: string): Promise<MessageResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "not_authenticated" };

  const trimmed = conteudo.trim();
  if (!trimmed) return { success: false, error: "empty" };
  if (trimmed.length > 2000) return { success: false, error: "too_long" };

  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: user.id, conteudo: trimmed })
    .select("id, conversation_id, sender_id, conteudo, lida, lida_em, criado_em")
    .single();

  if (error || !data) return { success: false, error: error?.message ?? "unknown_error" };

  revalidatePath(`/mensagens/${conversationId}`);
  revalidatePath("/mensagens");
  return { success: true, message: data as unknown as MessageRow };
}

/** Marca como lidas todas as mensagens recebidas (não enviadas por mim) numa conversa. */
export async function markConversationRead(conversationId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("messages")
    .update({ lida: true, lida_em: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("lida", false)
    .neq("sender_id", user.id);

  revalidatePath(`/mensagens/${conversationId}`);
  revalidatePath("/mensagens");
}
