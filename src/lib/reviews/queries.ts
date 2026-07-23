import { createClient } from "@/lib/supabase/server";
import type { ReviewRow } from "@/types/database";

export interface ReviewWithReviewer extends ReviewRow {
  reviewer: { nome: string; tipo: string; avatar_url: string | null } | null;
}

export interface ReviewSummary {
  reviews: ReviewWithReviewer[];
  average: number | null;
  count: number;
}

/** Todas as avaliações recebidas por um utilizador, mais recentes primeiro, com média e total. */
export async function getReviewsForUser(userId: string): Promise<ReviewSummary> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select(`id, reviewer_id, reviewed_user_id, publication_id, publication_titulo, rating, comentario, criado_em, atualizado_em,
      reviewer:users!reviewer_id(nome, tipo, avatar_url)`)
    .eq("reviewed_user_id", userId)
    .order("criado_em", { ascending: false });

  const reviews = (data ?? []) as unknown as ReviewWithReviewer[];
  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : null;

  return { reviews, average, count };
}

/** A avaliação que o utilizador autenticado já deixou para este anúncio, se existir. */
export async function getMyReviewForPublication(publicationId: string): Promise<ReviewRow | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("reviews")
    .select("id, reviewer_id, reviewed_user_id, publication_id, publication_titulo, rating, comentario, criado_em, atualizado_em")
    .eq("reviewer_id", user.id)
    .eq("publication_id", publicationId)
    .maybeSingle();

  return (data as unknown as ReviewRow | null) ?? null;
}
