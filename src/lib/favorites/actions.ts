"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FavoriteResult = { success: true } | { success: false; error: string };

export async function toggleFavorite(publicationId: string, shouldFavorite: boolean): Promise<FavoriteResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "not_authenticated" };

  if (shouldFavorite) {
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: user.id, publication_id: publicationId });
    // 23505 = unique_violation — já era favorito, ignora
    if (error && error.code !== "23505") return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("publication_id", publicationId);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/favoritos");
  return { success: true };
}
