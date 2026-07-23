"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type ProfileResult =
  | { success: true }
  | { error: string; fields?: Record<string, string> };

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login?redirectTo=/pt/profile");
  return { supabase, user };
}

// ── Particular ────────────────────────────────────────────────────────────────
export async function updateParticularProfile(
  _prev: ProfileResult | null,
  formData: FormData
): Promise<ProfileResult> {
  const { supabase, user } = await getAuthUser();

  const nome = (formData.get("nome") as string)?.trim();
  const concelho = (formData.get("concelho") as string)?.trim();
  const telefone = (formData.get("telefone") as string)?.trim() || null;
  const avatar_url = (formData.get("avatar_url") as string)?.trim() || null;

  const fields: Record<string, string> = {};
  if (!nome) fields.nome = "O nome é obrigatório.";
  if (!concelho) fields.concelho = "O concelho é obrigatório.";
  if (Object.keys(fields).length) return { error: "Corrige os erros abaixo.", fields };

  const { error: userErr } = await supabase
    .from("users")
    .update({ nome, concelho, telefone, avatar_url })
    .eq("id", user.id);

  if (userErr) return { error: "Erro ao guardar o perfil." };

  // Upsert contacto (para que apareça nos anúncios)
  if (telefone) {
    await supabase.from("contacts").upsert(
      { user_id: user.id, email_contacto: user.email!, telefone },
      { onConflict: "user_id" }
    );
  }

  revalidatePath("/pt/profile");
  revalidatePath("/pt/dashboard");
  return { success: true };
}

// ── Entidade ──────────────────────────────────────────────────────────────────
export async function updateEntityProfile(
  _prev: ProfileResult | null,
  formData: FormData
): Promise<ProfileResult> {
  const { supabase, user } = await getAuthUser();

  const nome                  = (formData.get("nome") as string)?.trim();
  const tipo                  = (formData.get("tipo") as string)?.trim();
  const nif                   = (formData.get("nif") as string)?.trim();
  const morada                = (formData.get("morada") as string)?.trim();
  const concelho              = (formData.get("concelho") as string)?.trim();
  const website               = (formData.get("website") as string)?.trim() || null;
  const telefone              = (formData.get("telefone") as string)?.trim();
  const email_contacto        = (formData.get("email_contacto") as string)?.trim();
  const pessoa_contacto_nome  = (formData.get("pessoa_contacto_nome") as string)?.trim();
  const pessoa_contacto_cargo = (formData.get("pessoa_contacto_cargo") as string)?.trim();
  const descricao             = (formData.get("descricao") as string)?.trim() || null;
  const logo_url              = (formData.get("logo_url") as string)?.trim() || null;

  const fields: Record<string, string> = {};
  if (!nome)                  fields.nome = "O nome da organização é obrigatório.";
  if (!tipo)                  fields.tipo = "O tipo de entidade é obrigatório.";
  if (!nif)                   fields.nif = "O NIF/NIPC é obrigatório.";
  if (!morada)                fields.morada = "A morada é obrigatória.";
  if (!concelho)              fields.concelho = "O concelho é obrigatório.";
  if (!telefone)              fields.telefone = "O telefone é obrigatório.";
  if (!email_contacto)        fields.email_contacto = "O email institucional é obrigatório.";
  if (!pessoa_contacto_nome)  fields.pessoa_contacto_nome = "O nome da pessoa de contacto é obrigatório.";
  if (!pessoa_contacto_cargo) fields.pessoa_contacto_cargo = "O cargo é obrigatório.";
  if (Object.keys(fields).length) return { error: "Corrige os erros abaixo.", fields };

  // Atualiza nome na tabela users (é o nome da org para entidades)
  await supabase.from("users").update({ nome, concelho }).eq("id", user.id);

  // Gera slug único para a entidade
  const baseSlug = toSlug(nome);
  let slug = baseSlug;
  let counter = 2;
  // verifica unicidade (excluindo o próprio registo se já existir)
  const { data: existingEntity } = await supabase
    .from("entities").select("id, slug").eq("user_id", user.id).single();
  const ownId = (existingEntity as { id: string; slug: string | null } | null)?.id ?? null;
  while (true) {
    const { data: conflict } = await supabase
      .from("entities").select("id").eq("slug", slug).single();
    const conflictId = (conflict as { id: string } | null)?.id;
    if (!conflictId || conflictId === ownId) break;
    slug = `${baseSlug}-${counter++}`;
  }

  // Upsert na tabela entities
  const { error: entErr } = await supabase.from("entities").upsert(
    {
      user_id: user.id,
      nome,
      tipo,
      nif,
      morada,
      concelho,
      website,
      telefone,
      email_contacto,
      pessoa_contacto_nome,
      pessoa_contacto_cargo,
      descricao,
      slug,
      ...(logo_url ? { logo_url } : {}),
    },
    { onConflict: "user_id" }
  );

  if (entErr) {
    console.error("updateEntityProfile upsert error:", entErr);
    return { error: `Erro ao guardar o perfil da entidade: ${entErr.message}` };
  }

  // Upsert contacto público da entidade
  await supabase.from("contacts").upsert(
    { user_id: user.id, email_contacto, telefone },
    { onConflict: "user_id" }
  );

  revalidatePath("/pt/profile");
  revalidatePath("/pt/dashboard");
  return { success: true };
}
