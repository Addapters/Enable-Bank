"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReviewResult = { success: true } | { success: false; error: string };

export async function submitReview(
  publicationId: string,
  rating: number,
  comentario: string
): Promise<ReviewResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Precisas de iniciar sessão para avaliar." };

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "A avaliação deve ser entre 1 e 5 estrelas." };
  }

  const { error } = await supabase
    .from("reviews")
    .upsert(
      {
        reviewer_id: user.id,
        publication_id: publicationId,
        rating,
        comentario: comentario.trim() || null,
      },
      { onConflict: "reviewer_id,publication_id" }
    );

  if (error) {
    // A mensagem da trigger (ex: "Não podes avaliar o teu próprio anúncio") chega aqui.
    return { success: false, error: error.message.includes("próprio anúncio")
      ? "Não podes avaliar o teu próprio anúncio."
      : "Erro ao guardar a avaliação. Tenta novamente." };
  }

  revalidatePath("/publications/" + publicationId);
  return { success: true };
}

export async function deleteReview(reviewId: string): Promise<ReviewResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Precisas de iniciar sessão." };

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("reviewer_id", user.id);

  if (error) return { success: false, error: "Erro ao remover a avaliação." };

  revalidatePath("/", "layout");
  return { success: true };
}
