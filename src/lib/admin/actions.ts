"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ModerationResult = { success: true } | { error: string };

async function getAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile as { role: string }).role !== "admin") {
    redirect("/pt");
  }

  return { supabase, adminId: user.id };
}

export async function approvePublication(id: string): Promise<ModerationResult> {
  const { supabase, adminId } = await getAdmin();

  const { error } = await supabase
    .from("publications")
    .update({ moderacao: "ativo" })
    .eq("id", id);

  if (error) return { error: "Erro ao aprovar o anúncio." };

  await supabase.from("moderation_logs").insert({
    publication_id: id,
    admin_id: adminId,
    acao: "aprovado",
  });

  revalidatePath("/pt/admin/moderation");
  return { success: true };
}

export async function rejectPublication(
  id: string,
  nota: string
): Promise<ModerationResult> {
  const { supabase, adminId } = await getAdmin();

  if (!nota?.trim()) return { error: "A nota de rejeição é obrigatória." };

  const { error } = await supabase
    .from("publications")
    .update({ moderacao: "rejeitado" })
    .eq("id", id);

  if (error) return { error: "Erro ao rejeitar o anúncio." };

  await supabase.from("moderation_logs").insert({
    publication_id: id,
    admin_id: adminId,
    acao: "rejeitado",
    nota: nota.trim(),
  });

  revalidatePath("/pt/admin/moderation");
  return { success: true };
}

export async function requestCorrection(
  id: string,
  nota: string
): Promise<ModerationResult> {
  const { supabase, adminId } = await getAdmin();

  if (!nota?.trim()) return { error: "A nota com o que precisa de ser corrigido é obrigatória." };

  const { error } = await supabase
    .from("publications")
    .update({ moderacao: "correcao" })
    .eq("id", id);

  if (error) return { error: "Erro ao pedir correção do anúncio." };

  await supabase.from("moderation_logs").insert({
    publication_id: id,
    admin_id: adminId,
    acao: "correcao",
    nota: nota.trim(),
  });

  revalidatePath("/pt/admin/moderation");
  return { success: true };
}
