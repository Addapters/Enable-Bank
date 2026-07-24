"use server";

import { createClient } from "@/lib/supabase/server";
import { CONCELHOS } from "@/lib/data/concelhos";
import { geocodeAndUpdate } from "./actions";

const MAX_ROWS = 200;
const CONCELHOS_SET = new Set<string>(CONCELHOS);
const TIPOS = new Set(["doacao", "troca", "venda"]);
const ESTADOS = new Set(["novo", "bom", "usado"]);
const PUBLICOS = new Set(["crianca", "adulto", "ambos"]);

export interface BulkRowResult {
  row: number;
  titulo: string;
  success: boolean;
  error?: string;
}

function parseBool(value: string, defaultValue: boolean): boolean {
  const v = value.trim().toLowerCase();
  if (!v) return defaultValue;
  return v === "sim" || v === "true" || v === "1";
}

/** Cria várias publicações de uma vez a partir de linhas de CSV já convertidas em objetos. Só para entidades. */
export async function createPublicationsBulk(rows: Record<string, string>[]): Promise<BulkRowResult[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [{ row: 0, titulo: "", success: false, error: "Precisas de iniciar sessão." }];

  const { data: profile } = await supabase.from("users").select("tipo").eq("id", user.id).single();
  if ((profile as { tipo?: string } | null)?.tipo !== "entidade") {
    return [{ row: 0, titulo: "", success: false, error: "Só entidades podem publicar em massa." }];
  }

  if (rows.length === 0) return [];
  if (rows.length > MAX_ROWS) {
    return [{ row: 0, titulo: "", success: false, error: `Máximo de ${MAX_ROWS} anúncios por ficheiro.` }];
  }

  const { data: cats } = await supabase.from("categories").select("id, slug").eq("ativa", true);
  const categoriaBySlug = new Map(((cats ?? []) as { id: string; slug: string }[]).map((c) => [c.slug, c.id]));

  const results: BulkRowResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const rowNum = i + 2; // +1 para 1-index, +1 para a linha de cabeçalho
    const titulo = r.titulo?.trim() ?? "";

    const fail = (error: string) => results.push({ row: rowNum, titulo, success: false, error });

    if (!titulo || titulo.length < 5) { fail("Título deve ter pelo menos 5 caracteres."); continue; }
    const descricao = r.descricao?.trim() ?? "";
    if (!descricao || descricao.length < 20) { fail("Descrição deve ter pelo menos 20 caracteres."); continue; }

    const tipo = r.tipo?.trim().toLowerCase() ?? "";
    if (!TIPOS.has(tipo)) { fail(`Tipo inválido: "${r.tipo}". Usa doacao, troca ou venda.`); continue; }

    const categoriaSlug = r.categoria?.trim().toLowerCase() ?? "";
    const categoria_id = categoriaBySlug.get(categoriaSlug);
    if (!categoria_id) { fail(`Categoria desconhecida: "${r.categoria}".`); continue; }

    const estado = r.estado?.trim().toLowerCase() ?? "";
    if (!ESTADOS.has(estado)) { fail(`Estado inválido: "${r.estado}". Usa novo, bom ou usado.`); continue; }

    const publico = r.publico?.trim().toLowerCase() ?? "";
    if (!PUBLICOS.has(publico)) { fail(`Público inválido: "${r.publico}". Usa crianca, adulto ou ambos.`); continue; }

    const concelho = r.concelho?.trim() ?? "";
    if (!CONCELHOS_SET.has(concelho)) { fail(`Concelho desconhecido: "${r.concelho}".`); continue; }

    const codigo_postal = r.codigo_postal?.trim().slice(0, 4) ?? "";
    if (!/^\d{4}$/.test(codigo_postal)) { fail("Código postal deve ter 4 dígitos."); continue; }

    let preco: number | null = null;
    if (tipo === "venda") {
      preco = parseFloat(r.preco);
      if (isNaN(preco) || preco < 0) { fail("Preço inválido (obrigatório para tipo=venda)."); continue; }
    }
    const negociavel = tipo === "venda" ? parseBool(r.negociavel ?? "", false) : false;
    const disponivel = parseBool(r.disponivel ?? "", true);

    const photoUrls = ["foto_url_1", "foto_url_2", "foto_url_3", "foto_url_4", "foto_url_5"]
      .map((k) => r[k]?.trim())
      .filter((url): url is string => !!url);
    if (photoUrls.length === 0) { fail("É preciso pelo menos uma foto_url."); continue; }

    const { data: pub, error: pubError } = await supabase
      .from("publications")
      .insert({
        titulo, descricao, categoria_id, tipo, publico, estado, concelho,
        disponivel, preco, negociavel, codigo_postal,
        user_id: user.id, moderacao: "pendente",
      })
      .select("id")
      .single();

    if (pubError || !pub) { fail(pubError?.message ?? "Erro ao criar o anúncio."); continue; }

    await supabase.from("photos").insert(
      photoUrls.map((url, ordem) => ({ publication_id: pub.id, url, ordem }))
    );

    await geocodeAndUpdate(supabase, pub.id, user.id, codigo_postal);

    results.push({ row: rowNum, titulo, success: true });
  }

  return results;
}
