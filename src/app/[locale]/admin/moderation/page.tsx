import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { ShieldCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import ModerationQueue from "./ModerationQueue";

interface RawPub {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  publico: string;
  concelho: string;
  preco: number | null;
  criado_em: string;
  category: { nome: string } | null;
  photos: { url: string; ordem: number }[];
  user: { nome: string; email: string; tipo: string } | null;
}

async function getAdminStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [{ count: pending }, { count: approvedToday }, { count: rejectedToday }] =
    await Promise.all([
      supabase.from("publications").select("*", { count: "exact", head: true }).eq("moderacao", "pendente"),
      supabase.from("moderation_logs").select("*", { count: "exact", head: true })
        .eq("acao", "aprovado").gte("criado_em", today.toISOString()),
      supabase.from("moderation_logs").select("*", { count: "exact", head: true })
        .eq("acao", "rejeitado").gte("criado_em", today.toISOString()),
    ]);

  return { pending: pending ?? 0, approvedToday: approvedToday ?? 0, rejectedToday: rejectedToday ?? 0 };
}

export default async function ModerationPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login?redirectTo=/pt/admin/moderation");

  const { data: profile } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  if (!profile || (profile as { role: string }).role !== "admin") redirect("/pt");

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = await getAdminStats(supabase);

  // ── Anúncios pendentes ──────────────────────────────────────────────────────
  const { data: publications } = await supabase
    .from("publications")
    .select(`
      id, titulo, descricao, tipo, publico, concelho, preco, criado_em,
      category:categories!categoria_id(nome),
      photos(url, ordem),
      user:users!user_id(nome, email, tipo)
    `)
    .eq("moderacao", "pendente")
    .order("criado_em", { ascending: true }); // FIFO — mais antigos primeiro

  const pubs = (publications as unknown as RawPub[]) ?? [];

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
            <h1 className="text-2xl font-bold text-gray-900">Fila de moderação</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Anúncios por ordem de submissão — os mais antigos aparecem primeiro.
            </p>
          </div>
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-purple-700 transition-colors"
          >
            ← Backoffice
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-xl border border-yellow-200 p-4 text-center">
            <div className="flex justify-center mb-1">
              <Clock className="w-5 h-5 text-yellow-500" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-xs text-gray-500 mt-0.5">Pendentes</p>
          </div>
          <div className="bg-white rounded-xl border border-green-200 p-4 text-center">
            <div className="flex justify-center mb-1">
              <CheckCircle className="w-5 h-5 text-green-500" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.approvedToday}</p>
            <p className="text-xs text-gray-500 mt-0.5">Aprovados hoje</p>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-4 text-center">
            <div className="flex justify-center mb-1">
              <XCircle className="w-5 h-5 text-red-400" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.rejectedToday}</p>
            <p className="text-xs text-gray-500 mt-0.5">Rejeitados hoje</p>
          </div>
        </div>

        {/* Fila */}
        <ModerationQueue initialPubs={pubs} />
      </div>
    </div>
  );
}
