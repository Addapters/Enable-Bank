import { createClient } from "@/lib/supabase/server";

export type StatsPeriod = "semana" | "mes" | "ano" | "tudo";

export function periodStartDate(periodo: StatsPeriod): string | null {
  const now = new Date();
  if (periodo === "tudo") return null;
  if (periodo === "semana") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d.toISOString();
  }
  if (periodo === "mes") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return d.toISOString();
  }
  // ano
  const d = new Date(now);
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString();
}

export interface RankedItem { label: string; count: number }

function topRanked(values: string[], limit: number): { items: RankedItem[]; totalDistinct: number } {
  const counts = new Map<string, number>();
  for (const raw of values) {
    const key = raw.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const items = Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  return { items, totalDistinct: counts.size };
}

export interface AdminStats {
  periodo: StatsPeriod;
  anunciosPorTipo: { doacao: number; troca: number; venda: number };
  transacoes: number;
  novosAnuncios: number;
  nUtilizadores: number;
  nEntidades: number;
  nVisitas: number;
  coberturaGeografica: { items: RankedItem[]; totalConcelhos: number };
  pesquisasFrequentes: { items: RankedItem[]; totalPesquisas: number };
}

export async function getAdminStats(periodo: StatsPeriod): Promise<AdminStats> {
  const supabase = await createClient();
  const since = periodStartDate(periodo);

  const withSince = <T>(q: T): T => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return since ? (q as any).gte("criado_em", since) : q;
  };

  const [
    { count: doacao },
    { count: troca },
    { count: venda },
    transacoesQuery,
    { count: novosAnuncios },
    { count: nUtilizadores },
    { count: nEntidades },
    visitasQuery,
    concelhosRes,
    pesquisasRes,
  ] = await Promise.all([
    supabase.from("publications").select("*", { count: "exact", head: true }).eq("moderacao", "ativo").eq("tipo", "doacao"),
    supabase.from("publications").select("*", { count: "exact", head: true }).eq("moderacao", "ativo").eq("tipo", "troca"),
    supabase.from("publications").select("*", { count: "exact", head: true }).eq("moderacao", "ativo").eq("tipo", "venda"),
    withSince(supabase.from("publications").select("*", { count: "exact", head: true }).eq("moderacao", "cedido")),
    withSince(supabase.from("publications").select("*", { count: "exact", head: true })),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("entities").select("*", { count: "exact", head: true }),
    withSince(supabase.from("page_views").select("*", { count: "exact", head: true })),
    supabase.from("publications").select("concelho").eq("moderacao", "ativo"),
    withSince(supabase.from("search_logs").select("termo")),
  ]);

  const concelhoValues = ((concelhosRes.data ?? []) as { concelho: string }[]).map((r) => r.concelho);
  const termoValues = ((pesquisasRes.data ?? []) as { termo: string }[]).map((r) => r.termo.toLowerCase());

  const cobertura = topRanked(concelhoValues, 10);
  const pesquisas = topRanked(termoValues, 10);

  return {
    periodo,
    anunciosPorTipo: { doacao: doacao ?? 0, troca: troca ?? 0, venda: venda ?? 0 },
    transacoes: transacoesQuery.count ?? 0,
    novosAnuncios: novosAnuncios ?? 0,
    nUtilizadores: nUtilizadores ?? 0,
    nEntidades: nEntidades ?? 0,
    nVisitas: visitasQuery.count ?? 0,
    coberturaGeografica: { items: cobertura.items, totalConcelhos: cobertura.totalDistinct },
    pesquisasFrequentes: { items: pesquisas.items, totalPesquisas: termoValues.length },
  };
}
