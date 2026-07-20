"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EntityActionResult = { success: true } | { error: string };

async function getAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login");

  const { data: profile } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  if (!profile || (profile as { role: string }).role !== "admin") redirect("/pt");

  return { supabase, adminId: user.id };
}

export async function verifyEntity(id: string): Promise<EntityActionResult> {
  const { supabase, adminId } = await getAdmin();

  const { error } = await supabase
    .from("entities")
    .update({
      verificada: true,
      verificada_em: new Date().toISOString(),
      verificada_por: adminId,
      rejeitada: false,
      nota_rejeicao: null,
    })
    .eq("id", id);

  if (error) return { error: "Erro ao verificar a entidade." };

  revalidatePath("/pt/admin/entities");
  return { success: true };
}

export async function rejectEntity(
  id: string,
  nota: string
): Promise<EntityActionResult> {
  const { supabase } = await getAdmin();

  if (!nota?.trim()) return { error: "A nota de rejeição é obrigatória." };

  const { error } = await supabase
    .from("entities")
    .update({
      verificada: false,
      rejeitada: true,
      nota_rejeicao: nota.trim(),
    })
    .eq("id", id);

  if (error) return { error: "Erro ao rejeitar a entidade." };

  revalidatePath("/pt/admin/entities");
  return { success: true };
}

export async function revokeVerification(id: string): Promise<EntityActionResult> {
  const { supabase } = await getAdmin();

  const { error } = await supabase
    .from("entities")
    .update({
      verificada: false,
      verificada_em: null,
      verificada_por: null,
      rejeitada: false,
      nota_rejeicao: null,
    })
    .eq("id", id);

  if (error) return { error: "Erro ao revogar a verificação." };

  revalidatePath("/pt/admin/entities");
  return { success: true };
}
