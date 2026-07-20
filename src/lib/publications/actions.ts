"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { geocodePostalCode, geocodeEntityAddress } from "./geocode";

export type PublicationFormState =
  | { errors: Record<string, string>; message?: string }
  | { success: true; id: string }
  | undefined;

// ── Geocodificação assíncrona após guardar ─────────────────────────────────────
async function geocodeAndUpdate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  publicationId: string,
  userId: string,
  codigoPostal: string | null
) {
  try {
    // Verifica se o utilizador é entidade
    const { data: userRow } = await supabase
      .from("users")
      .select("tipo")
      .eq("id", userId)
      .single();

    const tipo = (userRow as { tipo?: string } | null)?.tipo;

    let geo = null;

    if (tipo === "entidade") {
      // Usa morada da entidade para geocodificar
      const { data: entity } = await supabase
        .from("entities")
        .select("morada, concelho")
        .eq("user_id", userId)
        .single();
      const e = entity as { morada?: string | null; concelho?: string | null } | null;
      if (e?.morada && e?.concelho) {
        geo = await geocodeEntityAddress(e.morada, e.concelho);
      } else if (e?.concelho) {
        geo = await geocodePostalCode(e.concelho.split(" ")[0] ?? e.concelho);
      }
    } else if (codigoPostal && /^\d{4}$/.test(codigoPostal)) {
      geo = await geocodePostalCode(codigoPostal);
    }

    if (geo) {
      await supabase
        .from("publications")
        .update({ latitude: geo.lat, longitude: geo.lng })
        .eq("id", publicationId);
    }
  } catch {
    // Geocodificação não bloqueia — falha silenciosa
  }
}

// ── Criar publicação ──────────────────────────────────────────────────────────
export async function createPublication(
  _prevState: PublicationFormState,
  formData: FormData
): Promise<PublicationFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login");
  const userId = user.id;

  const titulo        = (formData.get("titulo") as string)?.trim();
  const descricao     = (formData.get("descricao") as string)?.trim();
  const categoria_id  = formData.get("categoria_id") as string;
  const tipo          = formData.get("tipo") as string;
  const publico       = formData.get("publico") as string;
  const estado        = formData.get("estado") as string;
  const concelho      = formData.get("concelho") as string;
  const disponivel    = formData.get("disponivel") === "on";
  const precoRaw      = formData.get("preco") as string | null;
  const preco         = precoRaw && precoRaw.trim() !== "" ? parseFloat(precoRaw) : null;
  const email_contacto = (formData.get("email_contacto") as string)?.trim();
  const telefone      = (formData.get("telefone") as string)?.trim() || null;
  const codigo_postal = (formData.get("codigo_postal") as string)?.trim().slice(0, 4) || null;
  const photoUrls     = formData.getAll("photo_urls") as string[];

  // ── Validação ──────────────────────────────────────────────────────────────
  const errors: Record<string, string> = {};

  if (!titulo || titulo.length < 5)
    errors.titulo = "O título deve ter pelo menos 5 caracteres.";
  if (!descricao || descricao.length < 20)
    errors.descricao = "A descrição deve ter pelo menos 20 caracteres.";
  if (!categoria_id)
    errors.categoria_id = "Seleciona uma categoria.";
  if (!tipo)
    errors.tipo = "Seleciona o tipo de transação.";
  if (!publico)
    errors.publico = "Seleciona o público-alvo.";
  if (!estado)
    errors.estado = "Seleciona o estado do produto.";
  if (!concelho)
    errors.concelho = "Seleciona o concelho.";
  if (tipo === "venda" && (preco === null || isNaN(preco) || preco < 0))
    errors.preco = "Indica um preço válido para o produto.";
  if (!email_contacto || !email_contacto.includes("@"))
    errors.email_contacto = "Introduz um email de contacto válido.";
  if (photoUrls.length === 0)
    errors.photos = "Adiciona pelo menos uma fotografia.";

  if (!codigo_postal || !/^\d{4}$/.test(codigo_postal))
    errors.codigo_postal = "Introduz um código postal válido (4 dígitos).";

  if (Object.keys(errors).length > 0) return { errors };

  // ── Inserir publicação ─────────────────────────────────────────────────────
  const { data: pub, error: pubError } = await supabase
    .from("publications")
    .insert({
      titulo,
      descricao,
      categoria_id,
      tipo,
      publico,
      estado,
      concelho,
      disponivel,
      preco: tipo === "venda" ? preco : null,
      codigo_postal,
      user_id: userId,
      moderacao: "pendente",
    })
    .select("id")
    .single();

  if (pubError || !pub) {
    return { errors: {}, message: `Erro ao criar o anúncio. ${pubError?.message ?? "Tenta novamente."}` };
  }

  // ── Inserir fotos ──────────────────────────────────────────────────────────
  if (photoUrls.length > 0) {
    await supabase.from("photos").insert(
      photoUrls.map((url, i) => ({ publication_id: pub.id, url, ordem: i }))
    );
  }

  // ── Upsert contacto ────────────────────────────────────────────────────────
  await supabase
    .from("contacts")
    .upsert(
      { user_id: userId, email_contacto, telefone },
      { onConflict: "user_id" }
    );

  // ── Geocodificação (não bloqueia resposta) ─────────────────────────────────
  await geocodeAndUpdate(supabase, pub.id, userId, codigo_postal);

  revalidatePath("/pt/dashboard");
  return { success: true, id: pub.id };
}

// ── Atualizar publicação ──────────────────────────────────────────────────────
export async function updatePublication(
  _prevState: PublicationFormState,
  formData: FormData
): Promise<PublicationFormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login");
  const userId = user.id;

  const publicationId  = formData.get("publication_id") as string;
  const titulo         = (formData.get("titulo") as string)?.trim();
  const descricao      = (formData.get("descricao") as string)?.trim();
  const categoria_id   = formData.get("categoria_id") as string;
  const tipo           = formData.get("tipo") as string;
  const publico        = formData.get("publico") as string;
  const estado         = formData.get("estado") as string;
  const concelho       = formData.get("concelho") as string;
  const disponivel     = formData.get("disponivel") === "on";
  const precoRaw       = formData.get("preco") as string | null;
  const preco          = precoRaw && precoRaw.trim() !== "" ? parseFloat(precoRaw) : null;
  const email_contacto = (formData.get("email_contacto") as string)?.trim();
  const telefone       = (formData.get("telefone") as string)?.trim() || null;
  const codigo_postal  = (formData.get("codigo_postal") as string)?.trim().slice(0, 4) || null;
  const keepPhotoIds   = formData.getAll("keep_photo_id") as string[];
  const newPhotoUrls   = formData.getAll("photo_urls") as string[];
  // ── Validação ──────────────────────────────────────────────────────────────
  const errors: Record<string, string> = {};
  if (!titulo || titulo.length < 5)
    errors.titulo = "O título deve ter pelo menos 5 caracteres.";
  if (!descricao || descricao.length < 20)
    errors.descricao = "A descrição deve ter pelo menos 20 caracteres.";
  if (!categoria_id) errors.categoria_id = "Seleciona uma categoria.";
  if (!tipo) errors.tipo = "Seleciona o tipo de transação.";
  if (!publico) errors.publico = "Seleciona o público-alvo.";
  if (!estado) errors.estado = "Seleciona o estado do produto.";
  if (!concelho) errors.concelho = "Seleciona o concelho.";
  if (tipo === "venda" && (preco === null || isNaN(preco) || preco < 0))
    errors.preco = "Indica um preço válido para o produto.";
  if (!email_contacto || !email_contacto.includes("@"))
    errors.email_contacto = "Introduz um email de contacto válido.";
  if (keepPhotoIds.length === 0 && newPhotoUrls.length === 0)
    errors.photos = "O anúncio precisa de pelo menos uma fotografia.";
  if (!codigo_postal || !/^\d{4}$/.test(codigo_postal))
    errors.codigo_postal = "Introduz um código postal válido (4 dígitos).";

  if (Object.keys(errors).length > 0) return { errors };

  // ── Verificar dono ─────────────────────────────────────────────────────────
  const { data: existing } = await supabase
    .from("publications")
    .select("id")
    .eq("id", publicationId)
    .eq("user_id", userId)
    .single();
  if (!existing) return { errors: {}, message: "Anúncio não encontrado ou sem permissão." };

  // ── Atualizar ──────────────────────────────────────────────────────────────
  const { error: updateError } = await supabase
    .from("publications")
    .update({
      titulo, descricao, categoria_id, tipo, publico, estado,
      concelho, disponivel,
      preco: tipo === "venda" ? preco : null,
      codigo_postal,
      moderacao: "pendente",
      // reset coords para re-geocodificar
      latitude: null,
      longitude: null,
    })
    .eq("id", publicationId)
    .eq("user_id", userId);

  if (updateError) return { errors: {}, message: "Erro ao atualizar o anúncio." };

  // ── Fotos ──────────────────────────────────────────────────────────────────
  if (keepPhotoIds.length > 0) {
    await supabase
      .from("photos")
      .delete()
      .eq("publication_id", publicationId)
      .not("id", "in", `(${keepPhotoIds.map((id) => `'${id}'`).join(",")})`);
  } else {
    await supabase.from("photos").delete().eq("publication_id", publicationId);
  }

  if (newPhotoUrls.length > 0) {
    const { data: maxOrdem } = await supabase
      .from("photos")
      .select("ordem")
      .eq("publication_id", publicationId)
      .order("ordem", { ascending: false })
      .limit(1)
      .single();
    const startOrdem = maxOrdem ? (maxOrdem as { ordem: number }).ordem + 1 : 0;
    await supabase.from("photos").insert(
      newPhotoUrls.map((url, i) => ({ publication_id: publicationId, url, ordem: startOrdem + i }))
    );
  }

  // ── Contacto ───────────────────────────────────────────────────────────────
  await supabase
    .from("contacts")
    .upsert({ user_id: userId, email_contacto, telefone }, { onConflict: "user_id" });

  // ── Geocodificação ─────────────────────────────────────────────────────────
  await geocodeAndUpdate(supabase, publicationId, userId, codigo_postal);

  revalidatePath("/pt/dashboard");
  revalidatePath(`/pt/publications/${publicationId}`);
  return { success: true, id: publicationId };
}
