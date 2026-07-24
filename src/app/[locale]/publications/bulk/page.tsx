import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { FileSpreadsheet } from "lucide-react";
import BulkUploadForm from "@/components/publications/BulkUploadForm";

export const metadata: Metadata = { title: "Publicar em massa — Enable Bank" };

export default async function BulkPublicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login?redirectTo=/pt/publications/bulk");

  const { data: profile } = await supabase.from("users").select("tipo").eq("id", user.id).single();
  if ((profile as { tipo?: string } | null)?.tipo !== "entidade") redirect("/pt/publications/new");

  const { data: categories } = await supabase
    .from("categories")
    .select("slug, nome, parent_id")
    .eq("ativa", true)
    .order("ordem", { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link
            href="/publications/new"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-700 transition-colors mb-4"
          >
            ← Publicar um único anúncio
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <FileSpreadsheet className="w-5 h-5 text-purple-700" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Publicar em massa</h1>
              <p className="text-sm text-gray-500">Cria vários anúncios de uma vez a partir de um ficheiro CSV.</p>
            </div>
          </div>
        </div>

        <BulkUploadForm categories={(categories as { slug: string; nome: string; parent_id: string | null }[]) ?? []} />
      </div>
    </div>
  );
}
