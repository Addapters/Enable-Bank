import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Heart } from "lucide-react";

export const metadata: Metadata = { title: "Os meus favoritos — Enable Bank" };

export default async function FavoritosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login?redirectTo=/pt/favoritos");

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
            <Heart className="h-7 w-7 text-purple-700" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Os meus favoritos</h1>
          <p className="text-sm text-gray-500 mb-6">
            Em breve vais poder guardar aqui os anúncios que mais te interessam.
          </p>
          <Link href="/search" className="text-sm font-medium text-purple-700 hover:underline">
            Explorar anúncios →
          </Link>
        </div>
      </div>
    </div>
  );
}
