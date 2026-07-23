import { createClient } from "@/lib/supabase/server";

/** Utilizador atual + conjunto de IDs de publicações que já marcou como favoritas, de entre `pubIds`. */
export async function getFavoriteState(pubIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || pubIds.length === 0) {
    return { viewerId: user?.id ?? null, favIds: new Set<string>() };
  }

  const { data } = await supabase
    .from("favorites")
    .select("publication_id")
    .eq("user_id", user.id)
    .in("publication_id", pubIds);

  const favIds = new Set((data ?? []).map((f) => (f as { publication_id: string }).publication_id));
  return { viewerId: user.id, favIds };
}
