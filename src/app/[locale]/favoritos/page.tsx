import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Heart } from "lucide-react";
import PublicationCard from "@/components/publications/PublicationCard";

export const metadata: Metadata = { title: "Os meus favoritos — Enable Bank" };

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

export default async function FavoritosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login?redirectTo=/pt/favoritos");

  const { data: favRows } = await supabase
    .from("favorites")
    .select(`criado_em, publication:publications!publication_id(
      id, titulo, descricao, tipo, estado, publico, disponivel, concelho, moderacao,
      criado_em, atualizado_em, categoria_id, user_id, latitude, longitude, preco,
      category:categories!categoria_id(nome), photos(url, ordem)
    )`)
    .eq("user_id", user.id)
    .order("criado_em", { ascending: false });

  type RawFav = { publication: RawPub | null };
  const pubs = ((favRows ?? []) as unknown as RawFav[])
    .map((f) => f.publication)
    .filter((p): p is RawPub => !!p && p.moderacao === "ativo");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 shrink-0">
            <Heart className="h-5 w-5 text-purple-700" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Os meus favoritos</h1>
        </div>

        {pubs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-700 mb-1">Ainda não tens favoritos</p>
            <p className="text-sm text-gray-500 mb-4">Marca anúncios com o coração para os guardares aqui.</p>
            <Link href="/search" className="text-sm font-medium text-purple-700 hover:underline">
              Explorar anúncios →
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pubs.map((pub) => (
              <li key={pub.id}>
                <PublicationCard
                  publication={pub as never}
                  showFavorite
                  isFavorited
                  isAuthenticated
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
