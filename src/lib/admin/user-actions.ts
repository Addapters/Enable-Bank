"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export type UserActionResult = { success: true } | { error: string };

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

export async function suspendUser(id: string): Promise<UserActionResult> {
  const { supabase } = await getAdmin();

  const { error } = await supabase
    .from("users")
    .update({ suspended: true })
    .eq("id", id);

  if (error) return { error: "Erro ao suspender o utilizador." };

  revalidatePath("/pt/admin/users");
  return { success: true };
}

export async function unsuspendUser(id: string): Promise<UserActionResult> {
  const { supabase } = await getAdmin();

  const { error } = await supabase
    .from("users")
    .update({ suspended: false })
    .eq("id", id);

  if (error) return { error: "Erro ao reativar o utilizador." };

  revalidatePath("/pt/admin/users");
  return { success: true };
}

export async function deleteUser(id: string): Promise<UserActionResult> {
  // Usa service role para bypassing RLS e aceder ao Auth Admin API
  const { supabase: regularSupabase } = await getAdmin();
  void regularSupabase; // já valida que o caller é admin

  const adminClient = await createAdminClient();

  // 1. Remove publicações (fotos fazem cascade via FK)
  const { error: pubError } = await adminClient
    .from("publications")
    .delete()
    .eq("user_id", id);
  if (pubError) return { error: "Erro ao eliminar publicações do utilizador." };

  // 2. Remove contactos
  await adminClient.from("contacts").delete().eq("user_id", id);

  // 3. Remove registo público
  const { error: userError } = await adminClient
    .from("users")
    .delete()
    .eq("id", id);
  if (userError) return { error: "Erro ao eliminar registo do utilizador." };

  // 4. Remove da autenticação (Auth Admin API)
  const { error: authError } = await adminClient.auth.admin.deleteUser(id);
  if (authError) return { error: "Erro ao eliminar conta de autenticação." };

  revalidatePath("/pt/admin/users");
  return { success: true };
}
