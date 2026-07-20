import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import {
  ShieldCheck, Mail, MapPin, Calendar, Package,
  CheckCircle, Clock, XCircle, Heart, ShieldOff,
} from "lucide-react";

type Props = { params: Promise<{ id: string; locale: string }> };

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

interface RawPub {
  id: string;
  titulo: string;
  tipo: string;
  moderacao: string;
  criado_em: string;
  concelho: string;
}

interface RawContact {
  email_contacto: string;
  telefone: string | null;
}

const MODERACAO_LABEL: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ativo:    { label: "Ativo",    color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3 h-3" /> },
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-3 h-3" /> },
  rejeitado:{ label: "Rejeitado",color: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> },
  cedido:   { label: "Cedido",   color: "bg-purple-100 text-purple-800", icon: <Heart className="w-3 h-3" /> },
};

const TIPO_LABEL: Record<string, string> = { doacao: "Doação", troca: "Troca", venda: "Venda" };

export default async function AdminUserProfilePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  /* ── Auth + role check ─────────────────────────────────────────── */
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) redirect("/pt/auth/login");

  const { data: selfProfile } = await supabase
    .from("users").select("role").eq("id", adminUser.id).single();
  if (!selfProfile || (selfProfile as { role: string }).role !== "admin") redirect("/pt");

  /* ── Perfil do utilizador ──────────────────────────────────────── */
  const { data: profile } = await supabase
    .from("users")
    .select("id, nome, email, tipo, role, concelho, criado_em, suspended")
    .eq("id", id)
    .single();

  if (!profile) notFound();
  const u = profile as unknown as RawUser;

  /* ── Publicações ───────────────────────────────────────────────── */
  const { data: publications } = await supabase
    .from("publications")
    .select("id, titulo, tipo, moderacao, criado_em, concelho")
    .eq("user_id", id)
    .order("criado_em", { ascending: false });

  const pubs = (publications as unknown as RawPub[]) ?? [];

  /* ── Contacto ──────────────────────────────────────────────────── */
  const { data: contact } = await supabase
    .from("contacts")
    .select("email_contacto, telefone")
    .eq("user_id", id)
    .single();

  const c = contact as unknown as RawContact | null;

  const registadoEm = new Date(u.criado_em).toLocaleDateString("pt-PT", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const pubStats = {
    total:     pubs.length,
    ativo:     pubs.filter((p) => p.moderacao === "ativo").length,
    pendente:  pubs.filter((p) => p.moderacao === "pendente").length,
    rejeitado: pubs.filter((p) => p.moderacao === "rejeitado").length,
    cedido:    pubs.filter((p) => p.moderacao === "cedido").length,
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Perfil do utilizador</h1>
          </div>
          <Link
            href="/admin/users"
            className="text-sm text-gray-500 hover:text-purple-700 transition-colors"
          >
            ← Utilizadores
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Coluna esquerda: info do utilizador ──────────────── */}
          <div className="space-y-5">

            {/* Card principal */}
            <div className={`bg-white rounded-2xl border p-6 space-y-4 ${u.suspended ? "border-red-200" : "border-gray-200"}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0
                  ${u.suspended ? "bg-red-100 text-red-600" : u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"}`}>
                  {u.nome.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-900 text-lg leading-tight">{u.nome}</h2>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {u.role === "admin" && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">ADMIN</span>
                    )}
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      u.tipo === "entidade" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {u.tipo === "entidade" ? "Entidade" : "Particular"}
                    </span>
                    {u.suspended && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                        <ShieldOff className="w-2.5 h-2.5" />SUSPENSO
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <dl className="space-y-2 text-sm">
                <div className="flex items-start gap-2 text-gray-600">
                  <Mail className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" aria-hidden="true" />
                  <span className="break-all">{u.email}</span>
                </div>
                {u.concelho && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 shrink-0 text-gray-400" aria-hidden="true" />
                    <span>{u.concelho}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 shrink-0 text-gray-400" aria-hidden="true" />
                  <span>Registado em {registadoEm}</span>
                </div>
              </dl>
            </div>

            {/* Contacto */}
            {c && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Contacto</h3>
                <p className="text-sm text-gray-600"><span className="text-gray-400 text-xs">Email: </span>{c.email_contacto}</p>
                {c.telefone && (
                  <p className="text-sm text-gray-600"><span className="text-gray-400 text-xs">Telefone: </span>{c.telefone}</p>
                )}
              </div>
            )}

            {/* Stats de publicações */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" aria-hidden="true" />
                Anúncios
              </h3>
              <dl className="space-y-1.5 text-sm">
                <StatRow label="Total" value={pubStats.total} />
                <StatRow label="Ativos" value={pubStats.ativo} valueColor="text-green-700" />
                <StatRow label="Pendentes" value={pubStats.pendente} valueColor="text-yellow-700" />
                <StatRow label="Rejeitados" value={pubStats.rejeitado} valueColor="text-red-700" />
                <StatRow label="Cedidos" value={pubStats.cedido} valueColor="text-purple-700" />
              </dl>
            </div>

            {/* Ações rápidas */}
            {u.role !== "admin" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Ações</h3>
                <Link
                  href="/admin/users"
                  className="flex items-center justify-center gap-2 w-full text-sm font-medium py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ← Voltar e gerir na lista
                </Link>
              </div>
            )}
          </div>

          {/* ── Coluna direita: lista de anúncios ────────────────── */}
          <div className="lg:col-span-2">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Histórico de anúncios
              {pubs.length > 0 && <span className="ml-2 text-sm font-normal text-gray-400">({pubs.length})</span>}
            </h3>

            {pubs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-16 text-center">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm text-gray-500">Este utilizador ainda não publicou nenhum anúncio.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {pubs.map((pub) => {
                  const mod = MODERACAO_LABEL[pub.moderacao] ?? { label: pub.moderacao, color: "bg-gray-100 text-gray-600", icon: null };
                  const pubDate = new Date(pub.criado_em).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
                  return (
                    <li key={pub.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/publications/${pub.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-purple-700 transition-colors truncate block"
                        >
                          {pub.titulo}
                        </Link>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-400">
                          <span>{TIPO_LABEL[pub.tipo] ?? pub.tipo}</span>
                          <span>{pub.concelho}</span>
                          <span>{pubDate}</span>
                        </div>
                      </div>
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${mod.color}`}>
                        {mod.icon}
                        {mod.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, valueColor = "text-gray-900" }: { label: string; value: number; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className={`font-semibold tabular-nums ${valueColor}`}>{value}</dd>
    </div>
  );
}
