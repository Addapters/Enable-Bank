import type { SupabaseClient } from "@supabase/supabase-js";

export interface PublicProfile {
  id: string;
  nome: string;
  tipo: string;
  avatar_url: string | null;
}

/**
 * Batch-fetch perfis públicos (nome, tipo, avatar_url) a partir de `user_public_profiles` —
 * nunca da tabela `users` diretamente, que expõe email/telefone/role/suspended a qualquer
 * utilizador autenticado. Usar sempre que se precisa de mostrar o autor/participante de outra
 * pessoa (publicações, avaliações, mensagens, mapa).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPublicProfiles(supabase: SupabaseClient<any>, ids: (string | null | undefined)[]): Promise<Map<string, PublicProfile>> {
  const uniqueIds = [...new Set(ids.filter((id): id is string => !!id))];
  const map = new Map<string, PublicProfile>();
  if (uniqueIds.length === 0) return map;

  const { data } = await supabase
    .from("user_public_profiles")
    .select("id, nome, tipo, avatar_url")
    .in("id", uniqueIds);

  for (const p of (data ?? []) as PublicProfile[]) {
    map.set(p.id, p);
  }
  return map;
}
