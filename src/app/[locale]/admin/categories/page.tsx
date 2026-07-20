import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { ShieldCheck, Tag } from "lucide-react";
import CategoryTree, { type CategoryNode } from "./CategoryTree";

interface RawCategory {
  id: string;
  nome: string;
  slug: string;
  iso9999_code: string | null;
  ordem: number;
  ativa: boolean;
  parent_id: string | null;
}

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  /* ── Auth + role ─────────────────────────────────────────────────────── */
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login?redirectTo=/pt/admin/categories");

  const { data: profile } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  if (!profile || (profile as { role: string }).role !== "admin") redirect("/pt");

  /* ── Categorias (todas, incluindo arquivadas) ────────────────────────── */
  const { data: raw } = await supabase
    .from("categories")
    .select("id, nome, slug, iso9999_code, ordem, ativa, parent_id")
    .order("ordem", { ascending: true });

  const rows = (raw as unknown as RawCategory[]) ?? [];

  /* ── Constrói árvore ─────────────────────────────────────────────────── */
  const mainMap = new Map<string, CategoryNode>();
  const tree: CategoryNode[] = [];

  // Primeiro passo: categorias principais
  for (const r of rows) {
    if (r.parent_id === null) {
      const node: CategoryNode = { ...r, children: [] };
      mainMap.set(r.id, node);
      tree.push(node);
    }
  }

  // Segundo passo: subcategorias
  for (const r of rows) {
    if (r.parent_id !== null) {
      const parent = mainMap.get(r.parent_id);
      if (parent) {
        parent.children.push({ ...r, children: [] });
      }
    }
  }

  /* ── Stats ───────────────────────────────────────────────────────────── */
  const totalMain = tree.length;
  const totalSub = rows.filter((r) => r.parent_id !== null).length;
  const archived = rows.filter((r) => !r.ativa).length;

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
            <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Classificação ISO 9999:2016 — arrasta para reordenar, clica no lápis para editar.
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
          <div className="bg-white rounded-xl border border-purple-200 p-4 text-center">
            <div className="flex justify-center mb-1">
              <Tag className="w-5 h-5 text-purple-500" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalMain}</p>
            <p className="text-xs text-gray-500 mt-0.5">Categorias principais</p>
          </div>
          <div className="bg-white rounded-xl border border-blue-200 p-4 text-center">
            <div className="flex justify-center mb-1">
              <Tag className="w-5 h-5 text-blue-400" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalSub}</p>
            <p className="text-xs text-gray-500 mt-0.5">Subcategorias</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-200 p-4 text-center">
            <div className="flex justify-center mb-1">
              <Tag className="w-5 h-5 text-amber-400" aria-hidden="true" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{archived}</p>
            <p className="text-xs text-gray-500 mt-0.5">Arquivadas</p>
          </div>
        </div>

        {/* Legenda */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-gray-100 border border-gray-200" />
            Slug
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded bg-purple-50 border border-purple-200" />
            Código ISO 9999
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-300" viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="4" r="1.5"/><circle cx="5" cy="8" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="11" cy="4" r="1.5"/><circle cx="11" cy="8" r="1.5"/><circle cx="11" cy="12" r="1.5"/></svg>
            Arrastar para reordenar
          </span>
        </div>

        {/* Árvore interativa */}
        <CategoryTree initialTree={tree} />
      </div>
    </div>
  );
}
