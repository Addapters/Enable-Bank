"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CategoryActionResult = { success: true } | { error: string };

async function getAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile as { role: string }).role !== "admin") redirect("/pt");
  return supabase;
}

export async function createCategory(formData: FormData): Promise<CategoryActionResult> {
  const supabase = await getAdmin();

  const nome = (formData.get("nome") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const iso9999_code = (formData.get("iso9999_code") as string)?.trim() || null;
  const parent_id = (formData.get("parent_id") as string) || null;

  if (!nome) return { error: "O nome é obrigatório." };
  if (!slug) return { error: "O slug é obrigatório." };
  if (!/^[a-z0-9-]+$/.test(slug)) return { error: "Slug inválido — usa apenas letras minúsculas, números e hífens." };

  // Verifica slug único
  const { data: existing } = await supabase.from("categories").select("id").eq("slug", slug).single();
  if (existing) return { error: "Já existe uma categoria com esse slug." };

  // Determina a próxima ordem
  const { data: siblings } = await supabase
    .from("categories")
    .select("ordem")
    .eq("parent_id", parent_id ?? "00000000-0000-0000-0000-000000000000") // trick to handle null
    .order("ordem", { ascending: false })
    .limit(1);

  // Handle null parent separately
  let nextOrder = 1;
  if (parent_id) {
    const { data: subs } = await supabase
      .from("categories").select("ordem").eq("parent_id", parent_id).order("ordem", { ascending: false }).limit(1);
    nextOrder = ((subs?.[0] as { ordem: number } | undefined)?.ordem ?? 0) + 1;
  } else {
    const { data: mains } = await supabase
      .from("categories").select("ordem").is("parent_id", null).order("ordem", { ascending: false }).limit(1);
    nextOrder = ((mains?.[0] as { ordem: number } | undefined)?.ordem ?? 0) + 1;
  }
  void siblings;

  const { error } = await supabase.from("categories").insert({
    nome,
    slug,
    iso9999_code,
    parent_id,
    ordem: nextOrder,
    ativa: true,
  });

  if (error) return { error: "Erro ao criar categoria." };

  revalidatePath("/pt/admin/categories");
  return { success: true };
}

export async function updateCategory(
  id: string,
  data: { nome: string; slug: string; iso9999_code: string | null }
): Promise<CategoryActionResult> {
  const supabase = await getAdmin();

  const nome = data.nome.trim();
  const slug = data.slug.trim();
  const iso9999_code = data.iso9999_code?.trim() || null;

  if (!nome) return { error: "O nome é obrigatório." };
  if (!slug) return { error: "O slug é obrigatório." };
  if (!/^[a-z0-9-]+$/.test(slug)) return { error: "Slug inválido — usa apenas letras minúsculas, números e hífens." };

  // Verifica slug único (excluindo o próprio)
  const { data: existing } = await supabase
    .from("categories").select("id").eq("slug", slug).neq("id", id).single();
  if (existing) return { error: "Já existe outra categoria com esse slug." };

  const { error } = await supabase
    .from("categories")
    .update({ nome, slug, iso9999_code })
    .eq("id", id);

  if (error) return { error: "Erro ao guardar alterações." };

  revalidatePath("/pt/admin/categories");
  return { success: true };
}

export async function toggleCategoryActive(id: string, active: boolean): Promise<CategoryActionResult> {
  const supabase = await getAdmin();

  const { error } = await supabase
    .from("categories")
    .update({ ativa: active })
    .eq("id", id);

  if (error) return { error: "Erro ao alterar estado da categoria." };

  // Se arquivar uma principal, arquiva também as subcategorias
  if (!active) {
    await supabase.from("categories").update({ ativa: false }).eq("parent_id", id);
  }

  revalidatePath("/pt/admin/categories");
  return { success: true };
}

export async function reorderCategories(
  items: { id: string; ordem: number }[]
): Promise<CategoryActionResult> {
  const supabase = await getAdmin();

  const updates = items.map(({ id, ordem }) =>
    supabase.from("categories").update({ ordem }).eq("id", id)
  );

  await Promise.all(updates);

  revalidatePath("/pt/admin/categories");
  return { success: true };
}
