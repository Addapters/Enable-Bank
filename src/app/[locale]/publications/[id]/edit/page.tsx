import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { PencilLine } from "lucide-react";
import EditPublicationForm from "./EditPublicationForm";

interface CategoryRow {
  id: string;
  nome: string;
  parent_id: string | null;
  ordem: number;
}

interface PhotoRow {
  id: string;
  url: string;
  ordem: number;
}

export default async function EditPublicationPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/pt/auth/login?redirectTo=/pt/publications/${id}/edit`);

  // Verifica role do utilizador
  const { data: profile } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  const isAdmin = (profile as { role: string } | null)?.role === "admin";

  // Fetch publication — admin pode editar qualquer; owner só os seus
  let pubQuery = supabase
    .from("publications")
    .select("id, titulo, descricao, tipo, publico, estado, concelho, disponivel, preco, categoria_id, moderacao, user_id")
    .eq("id", id);
  if (!isAdmin) pubQuery = pubQuery.eq("user_id", user.id);

  const { data: pub } = await pubQuery.single();

  if (!pub) notFound();

  // Anúncios cedidos não podem ser editados
  const publication = pub as {
    id: string; titulo: string; descricao: string;
    tipo: string; publico: string; estado: string;
    concelho: string; disponivel: boolean; preco: number | null;
    categoria_id: string; moderacao: string; user_id: string;
    codigo_postal: string | null; // populated after running supabase/add_map_fields.sql
  };

  if (publication.moderacao === "cedido") {
    redirect(isAdmin ? "/pt/admin/moderation" : "/pt/dashboard");
  }

  // Fotos existentes
  const { data: photos } = await supabase
    .from("photos")
    .select("id, url, ordem")
    .eq("publication_id", id)
    .order("ordem", { ascending: true });

  // Categorias
  const { data: categories } = await supabase
    .from("categories")
    .select("id, nome, parent_id, ordem")
    .eq("ativa", true)
    .order("ordem", { ascending: true });

  // Contacto
  const { data: contact } = await supabase
    .from("contacts")
    .select("email_contacto, telefone")
    .eq("user_id", user.id)
    .single();

  const cats = (categories as unknown as CategoryRow[]) ?? [];
  const existingPhotos = (photos as unknown as PhotoRow[]) ?? [];
  const contactData = contact as { email_contacto?: string; telefone?: string | null } | null;

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
              <PencilLine className="w-5 h-5 text-purple-700" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar anúncio</h1>
              <p className="text-sm text-gray-500 truncate max-w-xs">{publication.titulo}</p>
            </div>
          </div>
        </div>

        <EditPublicationForm
          publication={publication}
          existingPhotos={existingPhotos}
          categories={cats}
          defaultEmail={contactData?.email_contacto ?? user.email ?? ""}
          defaultTelefone={contactData?.telefone ?? ""}
        />
      </div>
    </div>
  );
}
