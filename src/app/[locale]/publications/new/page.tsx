import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewPublicationForm from "./NewPublicationForm";
import { PlusCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface CategoryRow {
  id: string;
  nome: string;
  parent_id: string | null;
  ordem: number;
}

export const metadata = {
  title: "Novo anúncio — Enable Bank",
  description: "Publica um produto de apoio para doação, troca ou venda.",
};

export default async function NewPublicationPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login?redirectTo=/pt/publications/new");

  const { data: categories } = await supabase
    .from("categories")
    .select("id, nome, parent_id, ordem")
    .eq("ativa", true)
    .order("ordem", { ascending: true });

  const { data: profile } = await supabase
    .from("users")
    .select("email, nome, concelho")
    .eq("id", user.id)
    .single();

  const { data: contact } = await supabase
    .from("contacts")
    .select("email_contacto")
    .eq("user_id", user.id)
    .single();

  const userProfile = profile as { email?: string; nome?: string; concelho?: string | null } | null;
  const cats = (categories as unknown as CategoryRow[]) ?? [];
  const defaultEmail =
    (contact as { email_contacto?: string } | null)?.email_contacto ??
    user.email ?? "";
  const defaultConcelho = userProfile?.concelho ?? null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-700 transition-colors mb-4"
          >
            ← Os meus anúncios
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <PlusCircle className="w-5 h-5 text-purple-700" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Novo anúncio</h1>
              <p className="text-sm text-gray-500">
                Partilha um produto de apoio com a comunidade.
              </p>
            </div>
          </div>
        </div>

        <NewPublicationForm
          categories={cats}
          defaultEmail={defaultEmail}
          defaultConcelho={defaultConcelho}
        />
      </div>
    </div>
  );
}
