import { createClient } from "@/lib/supabase/server";
import type { NotificationRow } from "@/types/database";

/** Número de notificações por ler do utilizador autenticado. 0 se não houver sessão. */
export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("lida", false);

  return count ?? 0;
}

/** Todas as notificações do utilizador autenticado, mais recentes primeiro. */
export async function getNotifications(): Promise<NotificationRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("notifications")
    .select("id, user_id, tipo, titulo, mensagem, link, publication_id, lida, criado_em")
    .eq("user_id", user.id)
    .order("criado_em", { ascending: false })
    .limit(50);

  return (data ?? []) as unknown as NotificationRow[];
}
