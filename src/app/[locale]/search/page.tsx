import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Search, Map } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PublicationCard from "@/components/publications/PublicationCard";
import SearchFilters from "./SearchFilters";
import type { PublicationRow, CategoryRow } from "@/types/database";
import { getFavoriteState } from "@/lib/favorites/queries";

export const metadata: Metadata = { title: "Pesquisa de produtos de apoio" };

type SearchParams = { q?: string; tipo?: string; publico?: string; categoria?: string; disponivel?: string; page?: string; entidade_verificada?: string; entidade?: string };
const PAGE_SIZE = 12;

async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("id, nome, slug").eq("ativa", true).is("parent_id", null).order("ordem");
  return (data ?? []) as Pick<CategoryRow, "id" | "nome" | "slug">[];
}

async function getResults(params: SearchParams) {
  const supabase = await createClient();
  const page = Math.max(1, Number(params.page ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("publications")
    .select(`id, titulo, descricao, tipo, estado, publico, disponivel, concelho, moderacao, criado_em, atualizado_em, categoria_id, user_id, latitude, longitude, embedding, category:categories!categoria_id(nome), photos(url, ordem), publisher:users!user_id(id, nome, tipo, avatar_url)`, { count: "exact" })
    .eq("moderacao", "ativo")
    .order("criado_em", { ascending: false })
    .range(from, to);

  if (params.tipo && ["doacao", "troca", "venda"].includes(params.tipo)) query = query.eq("tipo", params.tipo as "doacao" | "troca" | "venda");
  if (params.publico && ["crianca", "adulto", "ambos"].includes(params.publico)) query = query.eq("publico", params.publico as "crianca" | "adulto" | "ambos");
  if (params.disponivel === "true") query = query.eq("disponivel", true);
  if (params.categoria) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.categoria)
      .single();
    if (cat) {
      const parentId = (cat as { id: string }).id;
      // inclui publicações em qualquer subcategoria desta categoria principal
      const { data: subs } = await supabase
        .from("categories")
        .select("id")
        .eq("parent_id", parentId);
      const subIds = ((subs ?? []) as { id: string }[]).map((s) => s.id);
      const allIds = [parentId, ...subIds];
      query = query.in("categoria_id", allIds);
    }
  }
  if (params.q) query = query.or(`titulo.ilike.%${params.q}%,descricao.ilike.%${params.q}%`);

  // Filtro: apenas entidades verificadas
  if (params.entidade_verificada === "true") {
    const { data: verifiedEntities } = await supabase
      .from("entities")
      .select("user_id")
      .eq("verificada", true);
    const verifiedIds = ((verifiedEntities ?? []) as { user_id: string }[]).map((e) => e.user_id);
    if (verifiedIds.length > 0) {
      query = query.in("user_id", verifiedIds);
    } else {
      return { items: [], count: 0, entityMap: {} };
    }
  }

  // Filtro: pesquisa por nome de entidade
  if (params.entidade) {
    const { data: matchedUsers } = await supabase
      .from("users")
      .select("id")
      .eq("tipo", "entidade")
      .ilike("nome", `%${params.entidade}%`);
    const matchedIds = ((matchedUsers ?? []) as { id: string }[]).map((u) => u.id);
    if (matchedIds.length > 0) {
      query = query.in("user_id", matchedIds);
    } else {
      return { items: [], count: 0, entityMap: {} };
    }
  }

  const { data, count, error } = await query;
  if (error) return { items: [], count: 0, entityMap: {} };

  type RawItem = PublicationRow & {
    category: { nome: string } | null;
    photos: { url: string; ordem: number }[];
    publisher: { id: string; nome: string; tipo: string; avatar_url: string | null } | null;
  };
  const items = (data ?? []) as unknown as RawItem[];

  // Batch-fetch entity data (logo + verificada) para os publishers de tipo entidade
  const entityUserIds = [...new Set(
    items
      .filter((p) => p.publisher?.tipo === "entidade")
      .map((p) => p.publisher!.id)
  )];

  const entityMap: Record<string, { logo_url: string | null; verificada: boolean }> = {};
  if (entityUserIds.length > 0) {
    const { data: entities } = await supabase
      .from("entities")
      .select("user_id, logo_url, verificada")
      .in("user_id", entityUserIds);
    for (const e of (entities ?? []) as { user_id: string; logo_url: string | null; verificada: boolean }[]) {
      entityMap[e.user_id] = { logo_url: e.logo_url, verificada: e.verificada };
    }
  }

  return { items, count: count ?? 0, entityMap };
}

type Props = { searchParams: Promise<SearchParams> };

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations("search");
  const [categories, { items, count, entityMap }] = await Promise.all([getCategories(), getResults(params)]);
  const { viewerId, favIds } = await getFavoriteState(items.map((p) => p.id));
  const page = Math.max(1, Number(params.page ?? 1));
  const totalPages = Math.ceil(count / PAGE_SIZE);
  const hasQuery = !!(params.q || params.tipo || params.publico || params.categoria || params.disponivel || params.entidade_verificada || params.entidade);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <form method="GET" action="">
          <div className="flex gap-2 bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="w-5 h-5 text-gray-400 shrink-0" aria-hidden="true" />
              <input type="text" name="q" defaultValue={params.q ?? ""} placeholder={t("placeholder")} className="w-full text-gray-900 placeholder-gray-400 outline-none text-sm" aria-label={t("placeholder")} />
            </div>
            {params.tipo && <input type="hidden" name="tipo" value={params.tipo} />}
            {params.publico && <input type="hidden" name="publico" value={params.publico} />}
            {params.categoria && <input type="hidden" name="categoria" value={params.categoria} />}
            {params.disponivel && <input type="hidden" name="disponivel" value={params.disponivel} />}
            {params.entidade_verificada && <input type="hidden" name="entidade_verificada" value={params.entidade_verificada} />}
            {params.entidade && <input type="hidden" name="entidade" value={params.entidade} />}
            <button type="submit" className="bg-purple-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-800 transition-colors text-sm shrink-0">Pesquisar</button>
          </div>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0" aria-label="Filtros de pesquisa">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            <Suspense fallback={null}><SearchFilters categories={categories} /></Suspense>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-sm text-gray-500">
              {hasQuery || count > 0 ? (
                <><span className="font-semibold text-gray-900">{count}</span> {count === 1 ? "resultado encontrado" : "resultados encontrados"}{params.q && <> para <span className="font-medium">&ldquo;{params.q}&rdquo;</span></>}</>
              ) : "Todos os anúncios disponíveis"}
            </p>
            {/* Toggle mapa */}
            {(() => {
              const mapSp = new URLSearchParams();
              if (params.tipo) mapSp.set("tipo", params.tipo);
              if (params.publico) mapSp.set("publico", params.publico);
              if (params.categoria) mapSp.set("categoria", params.categoria);
              if (params.disponivel) mapSp.set("disponivel", params.disponivel);
              return (
                <a
                  href={`/map${mapSp.toString() ? `?${mapSp.toString()}` : ""}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-purple-700 hover:text-purple-900 border border-purple-200 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Map className="w-4 h-4" aria-hidden="true" />
                  Ver no mapa
                </a>
              );
            })()}
          </div>

          {items.length > 0 ? (
            <>
              <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" aria-label="Resultados da pesquisa">
                {items.map((pub) => {
                  const pubWithPublisher = pub as typeof pub & { publisher: { id: string; nome: string; tipo: string; avatar_url: string | null } | null };
                  const entityData = pubWithPublisher.publisher?.tipo === "entidade"
                    ? entityMap[pubWithPublisher.publisher.id] ?? null
                    : null;
                  return (
                    <li key={pub.id}>
                      <PublicationCard
                        publication={pub}
                        publisher={pubWithPublisher.publisher ? {
                          nome:       pubWithPublisher.publisher.nome,
                          tipo:       pubWithPublisher.publisher.tipo,
                          logoUrl:    pubWithPublisher.publisher.tipo === "entidade"
                            ? (entityData?.logo_url ?? null)
                            : pubWithPublisher.publisher.avatar_url,
                          verificada: entityData?.verificada ?? false,
                        } : undefined}
                        showFavorite={viewerId !== pub.user_id}
                        isFavorited={favIds.has(pub.id)}
                        isAuthenticated={!!viewerId}
                      />
                    </li>
                  );
                })}
              </ul>
              {totalPages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Paginação">
                  {page > 1 && <PaginationLink params={params} targetPage={page - 1} label="← Anterior" />}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => Math.abs(p - page) <= 2).map((p) => (
                    <PaginationLink key={p} params={params} targetPage={p} label={String(p)} isCurrent={p === page} />
                  ))}
                  {page < totalPages && <PaginationLink params={params} targetPage={page + 1} label="Seguinte →" />}
                </nav>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4" aria-hidden="true">🔍</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Sem resultados</h2>
              <p className="text-sm text-gray-500 max-w-sm">{hasQuery ? "Tenta ajustar os filtros ou usar termos diferentes na pesquisa." : "Ainda não há anúncios publicados. Sê o primeiro a publicar!"}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function PaginationLink({ params, targetPage, label, isCurrent }: { params: SearchParams; targetPage: number; label: string; isCurrent?: boolean }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.tipo) sp.set("tipo", params.tipo);
  if (params.publico) sp.set("publico", params.publico);
  if (params.categoria) sp.set("categoria", params.categoria);
  if (params.disponivel) sp.set("disponivel", params.disponivel);
  if (params.entidade_verificada) sp.set("entidade_verificada", params.entidade_verificada);
  if (params.entidade) sp.set("entidade", params.entidade);
  if (targetPage > 1) sp.set("page", String(targetPage));
  return (
    <a href={`/search?${sp.toString()}`} aria-current={isCurrent ? "page" : undefined}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isCurrent ? "bg-purple-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700"}`}>
      {label}
    </a>
  );
}
