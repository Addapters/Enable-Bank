"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error: string } | { success: true };

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login");
  return { supabase, user };
}

export async function deactivatePublication(id: string): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("publications")
    .update({ disponivel: false })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Erro ao desativar o anúncio." };
  revalidatePath("/pt/dashboard");
  return { success: true };
}

export async function activatePublication(id: string): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("publications")
    .update({ disponivel: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Erro ao ativar o anúncio." };
  revalidatePath("/pt/dashboard");
  return { success: true };
}

export async function markAsDonated(id: string): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("publications")
    .update({ moderacao: "cedido", disponivel: false })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Erro ao marcar como cedido." };
  revalidatePath("/pt/dashboard");
  return { success: true };
}

export async function deletePublication(id: string): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("publications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Erro ao eliminar o anúncio." };
  revalidatePath("/pt/dashboard");
  return { success: true };
}
