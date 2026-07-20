import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { BadgeCheck, MapPin, Package, Building2 } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Entidades — Enable Bank" };

const TIPO_LABEL: Record<string, string> = {
  ONGPD: "ONGPD", IPSS: "IPSS", municipio: "Município",
  misericordia: "Misericórdia", clinica: "Clínica / Hospital",
  associacao: "Associação", outro: "Outro",
};

interface EntityRow {
  id: string; nome: string; tipo: string | null; slug: string;
  concelho: string | null; descricao: string | null;
  logo_url: string | null; verificada: boolean;
  pub_count: number;
}

export default async function EntidadesPage() {
  const supabase = await createClient();

  const { data: raw } = await supabase
    .from("entities")
    .select("id, nome, tipo, slug, concelho, descricao, logo_url, verificada, user_id")
    .order("verificada", { ascending: false })
    .order("nome");

  const entities = (raw ?? []) as (Omit<EntityRow, "pub_count"> & { user_id: string })[];

  // Conta anúncios ativos por entidade
  const userIds = entities.map((e) => e.user_id);
  const pubCounts: Record<string, number> = {};
  if (userIds.length > 0) {
    const { data: pubs } = await supabase
      .from("publications")
      .select("user_id")
      .in("user_id", userIds)
      .eq("moderacao", "ativo");
    for (const p of (pubs ?? []) as { user_id: string }[]) {
      pubCounts[p.user_id] = (pubCounts[p.user_id] ?? 0) + 1;
    }
  }

  const entidadesComCount: EntityRow[] = entities.map((e) => ({
    ...e,
    pub_count: pubCounts[e.user_id] ?? 0,
  }));

  const verificadas = entidadesComCount.filter((e) => e.verificada);
  const outras = entidadesComCount.filter((e) => !e.verificada);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-7 h-7 text-purple-700" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-gray-900">Entidades</h1>
          </div>
          <p className="text-sm text-gray-500">
            Organizações parceiras que disponibilizam produtos de apoio através do Enable Bank.
          </p>
        </div>

        {entidadesComCount.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-20 text-center">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm text-gray-500">Ainda não existem entidades registadas.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Verificadas */}
            {verificadas.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <BadgeCheck className="w-4 h-4 text-purple-600" aria-hidden="true" />
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Entidades verificadas</h2>
                  <span className="text-xs text-gray-400">({verificadas.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {verificadas.map((e) => <EntityCard key={e.id} entity={e} />)}
                </div>
              </section>
            )}

            {/* Outras */}
            {outras.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-4 h-4 text-gray-400" aria-hidden="true" />
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Outras entidades</h2>
                  <span className="text-xs text-gray-400">({outras.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {outras.map((e) => <EntityCard key={e.id} entity={e} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EntityCard({ entity }: { entity: EntityRow }) {
  return (
    <Link
      href={`/entidades/${entity.slug}`}
      className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-4 hover:border-purple-300 hover:shadow-sm transition-all group"
    >
      {/* Logo / avatar */}
      <div className="shrink-0">
        {entity.logo_url ? (
          <div className="w-14 h-14 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
            <Image
              src={entity.logo_url}
              alt={`Logo de ${entity.nome}`}
              width={56}
              height={56}
              className="object-contain p-1 w-full h-full"
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg font-bold select-none">
            {entity.nome.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 truncate">
            {entity.nome}
          </h3>
          {entity.verificada && (
            <BadgeCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" aria-label="Verificada" />
          )}
        </div>

        {entity.tipo && (
          <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 mt-1">
            {TIPO_LABEL[entity.tipo] ?? entity.tipo}
          </span>
        )}

        {entity.descricao && (
          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
            {entity.descricao}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          {entity.concelho && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" aria-hidden="true" />
              {entity.concelho}
            </span>
          )}
          {entity.pub_count > 0 && (
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" aria-hidden="true" />
              {entity.pub_count} {entity.pub_count === 1 ? "anúncio" : "anúncios"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
