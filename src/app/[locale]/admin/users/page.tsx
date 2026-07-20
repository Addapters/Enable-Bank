import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { ShieldCheck, Users, UserCheck, Building2, ShieldOff, Search } from "lucide-react";
import UserCard from "./UserCard";

type SearchParams = { q?: string; tipo?: string; estado?: string };
type Props = { searchParams: Promise<SearchParams> };

interface RawUser {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  role: string;
  concelho: string | null;
  criado_em: string;
  suspended: boolean;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  /* ── Auth + role check ─────────────────────────────────────────── */
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login?redirectTo=/pt/admin/users");

  const { data: selfProfile } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  if (!selfProfile || (selfProfile as { role: string }).role !== "admin") redirect("/pt");

  /* ── Utilizadores ──────────────────────────────────────────────── */
  let usersQuery = supabase
    .from("users")
    .select("id, nome, email, tipo, role, concelho, criado_em, suspended")
    .order("criado_em", { ascending: false });

  if (params.tipo && ["particular", "entidade"].includes(params.tipo)) {
    usersQuery = usersQuery.eq("tipo", params.tipo);
  }
  if (params.estado === "suspenso") usersQuery = usersQuery.eq("suspended", true);
  if (params.estado === "ativo") usersQuery = usersQuery.eq("suspended", false);
  if (params.q) {
    usersQuery = usersQuery.or(`nome.ilike.%${params.q}%,email.ilike.%${params.q}%`);
  }

  const { data: usersRaw } = await usersQuery;
  const users = (usersRaw as unknown as RawUser[]) ?? [];

  /* ── Contagem de publicações por utilizador ────────────────────── */
  const { data: allPubs } = await supabase
    .from("publications")
    .select("user_id, moderacao");

  const pubMap = new Map<string, { total: number; ativo: number }>();
  for (const p of (allPubs ?? []) as { user_id: string; moderacao: string }[]) {
    const curr = pubMap.get(p.user_id) ?? { total: 0, ativo: 0 };
    curr.total++;
    if (p.moderacao === "ativo") curr.ativo++;
    pubMap.set(p.user_id, curr);
  }

  /* ── Stats globais (sem filtros) ───────────────────────────────── */
  const { data: allUsers } = await supabase
    .from("users")
    .select("tipo, suspended, role");

  const statsAll = (allUsers as unknown as { tipo: string; suspended: boolean; role: string }[]) ?? [];
  const stats = {
    total:      statsAll.length,
    particular: statsAll.filter((u) => u.tipo === "particular").length,
    entidade:   statsAll.filter((u) => u.tipo === "entidade").length,
    suspenso:   statsAll.filter((u) => u.suspended).length,
  };

  /* ── Enrich users with pub counts ──────────────────────────────── */
  const enriched = users.map((u) => ({
    ...u,
    pubCount: pubMap.get(u.id)?.total ?? 0,
    pubAtivo: pubMap.get(u.id)?.ativo ?? 0,
  }));

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
            <h1 className="text-2xl font-bold text-gray-900">Utilizadores</h1>
            <p className="text-sm text-gray-500 mt-0.5">Gestão de contas e acessos da plataforma.</p>
          </div>
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-purple-700 transition-colors"
          >
            ← Backoffice
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard icon={<Users className="w-5 h-5 text-purple-500" />} value={stats.total} label="Total" color="purple" />
          <StatCard icon={<UserCheck className="w-5 h-5 text-blue-500" />} value={stats.particular} label="Particulares" color="blue" />
          <StatCard icon={<Building2 className="w-5 h-5 text-indigo-500" />} value={stats.entidade} label="Entidades" color="indigo" />
          <StatCard icon={<ShieldOff className="w-5 h-5 text-red-400" />} value={stats.suspenso} label="Suspensos" color="red" />
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-3">
          <form method="GET" className="flex flex-col sm:flex-row gap-3">
            {/* Pesquisa */}
            <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
              <input
                type="text"
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Pesquisar por nome ou email…"
                className="w-full text-sm text-gray-900 placeholder-gray-400 outline-none"
                aria-label="Pesquisar utilizadores"
              />
            </div>

            {/* Tipo */}
            <select
              name="tipo"
              defaultValue={params.tipo ?? ""}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Filtrar por tipo"
            >
              <option value="">Todos os tipos</option>
              <option value="particular">Particular</option>
              <option value="entidade">Entidade</option>
            </select>

            {/* Estado */}
            <select
              name="estado"
              defaultValue={params.estado ?? ""}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Filtrar por estado"
            >
              <option value="">Todos os estados</option>
              <option value="ativo">Ativo</option>
              <option value="suspenso">Suspenso</option>
            </select>

            <button
              type="submit"
              className="bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-800 transition-colors shrink-0"
            >
              Filtrar
            </button>

            {(params.q || params.tipo || params.estado) && (
              <a
                href="/admin/users"
                className="text-sm text-gray-500 hover:text-purple-700 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center shrink-0"
              >
                Limpar
              </a>
            )}
          </form>
        </div>

        {/* Contador de resultados */}
        <p className="text-sm text-gray-500 mb-4">
          <span className="font-semibold text-gray-900">{enriched.length}</span>{" "}
          {enriched.length === 1 ? "utilizador encontrado" : "utilizadores encontrados"}
          {(params.q || params.tipo || params.estado) && (
            <span className="text-gray-400"> (com filtros ativos)</span>
          )}
        </p>

        {/* Lista */}
        {enriched.length > 0 ? (
          <div className="space-y-3" aria-label="Lista de utilizadores">
            {enriched.map((u) => (
              <UserCard key={u.id} user={u} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Sem resultados</h2>
            <p className="text-sm text-gray-500">Nenhum utilizador corresponde aos filtros aplicados.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon, value, label, color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: "purple" | "blue" | "indigo" | "red";
}) {
  const borders: Record<string, string> = {
    purple: "border-purple-200",
    blue:   "border-blue-200",
    indigo: "border-indigo-200",
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
