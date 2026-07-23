import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { MapPin, Package, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ContactInfo from "@/components/publications/ContactInfo";
import PublicationCard from "@/components/publications/PublicationCard";

type Props = { params: Promise<{ id: string; locale: string }> };

interface PublicUser {
  id: string;
  nome: string;
  tipo: string;
  concelho: string | null;
  avatar_url: string | null;
  criado_em: string;
}

interface RawPub {
  id: string; titulo: string; descricao: string;
  tipo: string; estado: string; publico: string;
  disponivel: boolean; concelho: string;
  moderacao: string; criado_em: string;
  atualizado_em: string; categoria_id: string;
  user_id: string; latitude: number | null; longitude: number | null;
  preco: number | null;
  category: { nome: string } | null;
  photos: { url: string; ordem: number }[];
}

async function getPublicUser(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_public_profiles")
    .select("id, nome, tipo, concelho, avatar_url, criado_em")
    .eq("id", id)
    .single();
  return data as unknown as PublicUser | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const user = await getPublicUser(id);
  if (!user) return { title: "Utilizador não encontrado" };
  return {
    title: `${user.nome} — Enable Bank`,
    description: `Perfil de ${user.nome} no Enable Bank`,
  };
}

export default async function PublicUserPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const user = await getPublicUser(id);
  if (!user) notFound();

  // Entidades têm a sua própria página pública (com NIF, morada, verificação, etc.) — redireciona.
  if (user.tipo === "entidade") {
    const { data: entity } = await supabase
      .from("entities")
      .select("slug")
      .eq("user_id", id)
      .single();
    const slug = (entity as { slug: string | null } | null)?.slug;
    if (slug) redirect(`/entidades/${slug}`);
    notFound();
  }

  const { data: rawPubs } = await supabase
    .from("publications")
    .select(`id, titulo, descricao, tipo, estado, publico, disponivel,
      concelho, moderacao, criado_em, atualizado_em, categoria_id, user_id,
      latitude, longitude, preco,
      category:categories!categoria_id(nome),
      photos(url, ordem)`)
    .eq("user_id", id)
    .eq("moderacao", "ativo")
    .order("criado_em", { ascending: false });

  const pubs = (rawPubs as unknown as RawPub[]) ?? [];

  const registadoEm = new Date(user.criado_em).toLocaleDateString("pt-PT", {
    month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <nav className="mb-6">
          <Link href="/search" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-purple-700 transition-colors">
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />Voltar à pesquisa
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Coluna esquerda: perfil */}
          <aside className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-24 h-24 rounded-2xl border border-gray-200 overflow-hidden bg-purple-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatar_url ?? "/heart-icon.png"}
                    alt=""
                    aria-hidden="true"
                    className={user.avatar_url ? "w-full h-full object-cover" : "w-full h-full object-contain p-5"}
                  />
                </div>
                <h1 className="text-xl font-bold text-gray-900">{user.nome}</h1>
              </div>

              <dl className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
                {user.concelho && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                    <span>{user.concelho}</span>
                  </div>
                )}
              </dl>

              <p className="text-xs text-gray-400 text-center border-t border-gray-100 pt-3">
                Membro desde {registadoEm}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
              <Package className="w-5 h-5 text-purple-400 shrink-0" aria-hidden="true" />
              <span className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">{pubs.length}</span>{" "}
                {pubs.length === 1 ? "anúncio ativo" : "anúncios ativos"}
              </span>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Contacto</h2>
              <ContactInfo userId={user.id} />
            </div>
          </aside>

          {/* Coluna direita: anúncios */}
          <main className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              Anúncios de <span className="text-purple-700">{user.nome}</span>
            </h2>

            {pubs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-16 text-center">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm text-gray-500">Este utilizador ainda não tem anúncios ativos.</p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pubs.map((pub) => (
                  <li key={pub.id}>
                    <PublicationCard publication={pub as never} />
                  </li>
                ))}
              </ul>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
