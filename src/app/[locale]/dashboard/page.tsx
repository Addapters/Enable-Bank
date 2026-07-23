import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import PublicationRow from "./PublicationRow";
import { Plus, LayoutDashboard } from "lucide-react";
import type { PublicationType, PublicationStatus } from "@/types/database";

interface RawPublication {
  id: string;
  titulo: string;
  tipo: PublicationType;
  moderacao: PublicationStatus;
  disponivel: boolean;
  criado_em: string;
  category: { nome: string } | null;
}

const STATUS_ORDER: Record<PublicationStatus, number> = {
  correcao: 0,
  pendente: 1,
  ativo: 2,
  rejeitado: 3,
  cedido: 4,
};

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login?redirectTo=/pt/dashboard");

  const { data: profile } = await supabase
    .from("users")
    .select("nome")
    .eq("id", user.id)
    .single();

  const { data: publications } = await supabase
    .from("publications")
    .select("id, titulo, tipo, moderacao, disponivel, criado_em, category:categories!categoria_id(nome)")
    .eq("user_id", user.id)
    .order("criado_em", { ascending: false });

  const pubs = (publications as unknown as RawPublication[]) ?? [];

  // Notas de correção — última nota de moderação (acao='correcao') por anúncio que esteja
  // atualmente com esse estado.
  const correctionIds = pubs.filter((p) => p.moderacao === "correcao").map((p) => p.id);
  const correctionNotes: Record<string, string> = {};
  if (correctionIds.length > 0) {
    const { data: logs } = await supabase
      .from("moderation_logs")
      .select("publication_id, nota, criado_em")
      .in("publication_id", correctionIds)
      .eq("acao", "correcao")
      .order("criado_em", { ascending: false });
    for (const log of (logs ?? []) as { publication_id: string; nota: string | null }[]) {
      if (!correctionNotes[log.publication_id] && log.nota) correctionNotes[log.publication_id] = log.nota;
    }
  }

  // Group by status
  const grouped = pubs.reduce<Record<string, RawPublication[]>>((acc, pub) => {
    const key = pub.moderacao;
    if (!acc[key]) acc[key] = [];
    acc[key].push(pub);
    return acc;
  }, {});

  const statusGroups = (Object.keys(grouped) as PublicationStatus[]).sort(
    (a, b) => STATUS_ORDER[a] - STATUS_ORDER[b]
  );

  const GROUP_LABELS: Record<PublicationStatus, string> = {
    correcao: "Precisam de correção",
    pendente: "Pendentes de aprovação",
    ativo: "Ativos",
    rejeitado: "Rejeitados",
    cedido: "Cedidos / Encerrados",
  };

  const GROUP_ACCENT: Record<PublicationStatus, string> = {
    correcao: "border-amber-400",
    pendente: "border-yellow-400",
    ativo: "border-green-500",
    rejeitado: "border-red-400",
    cedido: "border-gray-300",
  };

  const nome = (profile as { nome?: string } | null)?.nome ?? user.email;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-purple-700 mb-1">
              <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
              <span className="text-sm font-medium">Dashboard</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Bem-vindo/a, <span className="font-medium text-gray-700">{nome}</span>
            </p>
          </div>

          <Link
            href="/publications/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-700 text-white text-sm font-semibold rounded-xl hover:bg-purple-800 active:bg-purple-900 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Novo anúncio
          </Link>
        </div>

        {/* Stats bar */}
        {pubs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {(["ativo", "pendente", "cedido", "rejeitado"] as PublicationStatus[]).map((status) => (
              <div key={status} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {grouped[status]?.length ?? 0}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{GROUP_LABELS[status]}</p>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {pubs.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <LayoutDashboard className="w-12 h-12 text-gray-300 mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-700 mb-2">{t("empty")}</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
              Partilha um produto de apoio com a comunidade — é gratuito e faz a diferença.
            </p>
            <Link
              href="/publications/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-700 text-white text-sm font-semibold rounded-xl hover:bg-purple-800 transition-colors"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              {t("publish")}
            </Link>
          </div>
        )}

        {/* Grouped lists */}
        {statusGroups.map((status) => (
          <section key={status} className="mb-8" aria-labelledby={`group-${status}`}>
            <div className={`flex items-center gap-3 mb-3 pl-3 border-l-4 ${GROUP_ACCENT[status]}`}>
              <h2 id={`group-${status}`} className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {GROUP_LABELS[status]}
              </h2>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                {grouped[status].length}
              </span>
            </div>

            <ul className="space-y-3" aria-label={GROUP_LABELS[status]}>
              {grouped[status].map((pub) => (
                <PublicationRow key={pub.id} pub={pub} correctionNote={correctionNotes[pub.id]} />
              ))}
            </ul>
          </section>
        ))}

      </div>
    </div>
  );
}
