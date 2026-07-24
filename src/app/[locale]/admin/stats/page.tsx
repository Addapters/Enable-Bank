import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { BarChart2, Users, Building2, Eye, PackageCheck, MapPin, Search } from "lucide-react";
import { getAdminStats, type StatsPeriod } from "@/lib/admin/stats";
import StatBarList from "@/components/admin/StatBarList";

export const metadata: Metadata = { title: "Estatísticas — Backoffice — Enable Bank" };

const PERIODOS: { value: StatsPeriod; label: string }[] = [
  { value: "semana", label: "Última semana" },
  { value: "mes", label: "Último mês" },
  { value: "ano", label: "Último ano" },
  { value: "tudo", label: "Sempre" },
];

const TIPO_LABEL: Record<"doacao" | "troca" | "venda", { label: string; bar: string; badge: string }> = {
  doacao: { label: "Doação", bar: "bg-green-500", badge: "bg-green-100 text-green-800" },
  troca:  { label: "Troca",  bar: "bg-blue-500",  badge: "bg-blue-100 text-blue-800" },
  venda:  { label: "Venda",  bar: "bg-orange-500", badge: "bg-orange-100 text-orange-800" },
};

type Props = { searchParams: Promise<{ periodo?: string }> };

function StatTile({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 shrink-0">
        <Icon className="w-5 h-5 text-purple-700" aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 tabular-nums">{value.toLocaleString("pt-PT")}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default async function AdminStatsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login?redirectTo=/pt/admin/stats");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || (profile as { role: string }).role !== "admin") redirect("/pt");

  const periodo: StatsPeriod = (["semana", "mes", "ano", "tudo"] as const).includes(sp.periodo as StatsPeriod)
    ? (sp.periodo as StatsPeriod)
    : "mes";

  const stats = await getAdminStats(periodo);
  const totalAtivos = stats.anunciosPorTipo.doacao + stats.anunciosPorTipo.troca + stats.anunciosPorTipo.venda;
  const maxTipo = Math.max(1, stats.anunciosPorTipo.doacao, stats.anunciosPorTipo.troca, stats.anunciosPorTipo.venda);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-700 transition-colors mb-4">
            ← Backoffice
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <BarChart2 className="w-5 h-5 text-purple-700" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Estatísticas</h1>
              <p className="text-sm text-gray-500">Visão geral da atividade na plataforma.</p>
            </div>
          </div>
        </div>

        {/* Filtro de período */}
        <div className="flex flex-wrap gap-2 mb-6">
          {PERIODOS.map((p) => (
            <Link
              key={p.value}
              href={`/admin/stats?periodo=${p.value}`}
              className={`text-sm font-medium px-3 py-1.5 rounded-full border transition-colors ${
                periodo === p.value
                  ? "bg-purple-700 text-white border-purple-700"
                  : "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-700"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-gray-400 -mt-4 mb-6">
          O período aplica-se a transações, novos anúncios, pesquisas e visitas. Utilizadores, entidades e anúncios ativos são sempre totais atuais.
        </p>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatTile icon={Users} label="Utilizadores registados" value={stats.nUtilizadores} />
          <StatTile icon={Building2} label="Entidades" value={stats.nEntidades} />
          <StatTile icon={PackageCheck} label="Transações concluídas" value={stats.transacoes} />
          <StatTile icon={Eye} label="Visitas" value={stats.nVisitas} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Anúncios ativos por tipo */}
          <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">
              Anúncios ativos <span className="text-gray-400 font-normal">— {totalAtivos} no total</span>
            </h2>
            <ul className="space-y-3">
              {(["doacao", "troca", "venda"] as const).map((tipo) => {
                const meta = TIPO_LABEL[tipo];
                const count = stats.anunciosPorTipo[tipo];
                return (
                  <li key={tipo} className="flex items-center gap-3 text-sm">
                    <span className={`w-16 shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full text-center ${meta.badge}`}>
                      {meta.label}
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${Math.max(4, (count / maxTipo) * 100)}%` }} />
                    </div>
                    <span className="w-8 shrink-0 text-right font-semibold text-gray-900 tabular-nums">{count}</span>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-gray-400 pt-1 border-t border-gray-100">
              {stats.novosAnuncios} anúncio(s) criado(s) no período selecionado.
            </p>
          </section>

          {/* Cobertura geográfica */}
          <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" aria-hidden="true" />
              Cobertura geográfica
              <span className="text-gray-400 font-normal text-sm">— {stats.coberturaGeografica.totalConcelhos} concelhos</span>
            </h2>
            <StatBarList items={stats.coberturaGeografica.items} emptyLabel="Ainda não há anúncios ativos com localização." />
          </section>

          {/* Pesquisas mais frequentes */}
          <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 lg:col-span-2">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-600" aria-hidden="true" />
              Pesquisas mais frequentes
              <span className="text-gray-400 font-normal text-sm">— {stats.pesquisasFrequentes.totalPesquisas} pesquisas no período</span>
            </h2>
            <StatBarList items={stats.pesquisasFrequentes.items} emptyLabel="Ainda não há pesquisas registadas neste período." />
          </section>
        </div>
      </div>
    </div>
  );
}
