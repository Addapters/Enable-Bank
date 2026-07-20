import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { ShieldCheck, BadgeCheck, Clock, XCircle, Building2 } from "lucide-react";
import EntityRowCard from "./EntityRow";

type FilterState = "todas" | "pendente" | "verificada" | "rejeitada";
type Props = { searchParams: Promise<{ estado?: string }> };

interface RawEntity {
  id: string;
  nome: string;
  tipo: string | null;
  nif: string | null;
  morada: string | null;
  concelho: string | null;
  website: string | null;
  telefone: string | null;
  email_contacto: string | null;
  pessoa_contacto_nome: string | null;
  pessoa_contacto_cargo: string | null;
  descricao: string | null;
  logo_url: string | null;
  verificada: boolean;
  verificada_em: string | null;
  rejeitada: boolean;
  nota_rejeicao: string | null;
  criado_em: string;
  user: { nome: string; email: string } | null;
}

export default async function AdminEntitiesPage({ searchParams }: Props) {
  const params = await searchParams;
  const filter = (params.estado ?? "todas") as FilterState;

  const supabase = await createClient();

  /* ── Auth + role ─────────────────────────────────────────── */
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login?redirectTo=/pt/admin/entities");

  const { data: profile } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  if (!profile || (profile as { role: string }).role !== "admin") redirect("/pt");

  /* ── Entidades ───────────────────────────────────────────── */
  let query = supabase
    .from("entities")
    .select(`
      id, nome, tipo, nif, morada, concelho, website, telefone,
      email_contacto, pessoa_contacto_nome, pessoa_contacto_cargo,
      descricao, logo_url, verificada, verificada_em, rejeitada,
      nota_rejeicao, criado_em,
      user:users!user_id(nome, email)
    `)
    .order("criado_em", { ascending: false });

  if (filter === "pendente") query = query.eq("verificada", false).eq("rejeitada", false);
  if (filter === "verificada") query = query.eq("verificada", true);
  if (filter === "rejeitada") query = query.eq("rejeitada", true);

  const { data: raw } = await query;
  const entities = (raw as unknown as RawEntity[]) ?? [];

  /* ── Stats ────────────────────────────────────────────────── */
  const { data: allRaw } = await supabase
    .from("entities")
    .select("verificada, rejeitada");

  const all = (allRaw as { verificada: boolean; rejeitada: boolean }[]) ?? [];
  const stats = {
    total:      all.length,
    pendente:   all.filter((e) => !e.verificada && !e.rejeitada).length,
    verificada: all.filter((e) => e.verificada).length,
    rejeitada:  all.filter((e) => e.rejeitada).length,
  };

  const filters: { value: FilterState; label: string; count: number }[] = [
    { value: "todas",      label: "Todas",      count: stats.total },
    { value: "pendente",   label: "Pendentes",  count: stats.pendente },
    { value: "verificada", label: "Verificadas", count: stats.verificada },
    { value: "rejeitada",  label: "Rejeitadas", count: stats.rejeitada },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-purple-700 mb-1">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              <span className="text-sm font-medium">Backoffice</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verificação de entidades</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Valida as organizações que se registaram na plataforma.
            </p>
          </div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-purple-700 transition-colors">
            ← Backoffice
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard icon={<Building2 className="w-5 h-5 text-gray-400" />}    value={stats.total}      label="Total"       color="gray" />
          <StatCard icon={<Clock className="w-5 h-5 text-yellow-500" />}       value={stats.pendente}   label="Pendentes"   color="yellow" />
          <StatCard icon={<BadgeCheck className="w-5 h-5 text-purple-500" />}  value={stats.verificada} label="Verificadas" color="purple" />
          <StatCard icon={<XCircle className="w-5 h-5 text-red-400" />}        value={stats.rejeitada}  label="Rejeitadas"  color="red" />
        </div>

        {/* Tabs de filtro */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6" role="tablist">
          {filters.map((f) => (
            <Link
              key={f.value}
              href={`/admin/entities${f.value !== "todas" ? `?estado=${f.value}` : ""}`}
              role="tab"
              aria-selected={filter === f.value}
              className={`flex-1 text-center text-xs sm:text-sm font-medium px-2 sm:px-4 py-2 rounded-lg transition-colors ${
                filter === f.value
                  ? "bg-purple-700 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f.label}
              {f.count > 0 && (
                <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  filter === f.value ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {f.count}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Lista */}
        {entities.length > 0 ? (
          <div className="space-y-3" aria-label="Lista de entidades">
            {entities.map((entity) => (
              <EntityRowCard key={entity.id} entity={entity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-700 mb-1">
              {filter === "pendente" ? "Nenhuma entidade pendente" : "Sem resultados"}
            </h2>
            <p className="text-sm text-gray-500">
              {filter === "pendente"
                ? "Todas as entidades foram verificadas ou rejeitadas."
                : "Não existem entidades nesta categoria."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon, value, label, color,
}: {
  icon: React.ReactNode; value: number; label: string;
  color: "gray" | "yellow" | "purple" | "red";
}) {
  const borders = {
    gray:   "border-gray-200",
    yellow: "border-yellow-200",
    purple: "border-purple-200",
    red:    "border-red-200",
  };
  return (
    <div className={`bg-white rounded-xl border ${borders[color]} p-4 text-center`}>
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
