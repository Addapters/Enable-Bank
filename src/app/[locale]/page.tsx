import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Search, MapPin, ArrowRight, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Enable Bank — Plataforma de produtos de apoio" };
}

async function getStats() {
  try {
    const supabase = await createClient();
    const [{ count: publications }, { count: municipalities }] = await Promise.all([
      supabase.from("publications").select("*", { count: "exact", head: true }).eq("moderacao", "ativo"),
      supabase.from("publications").select("concelho", { count: "exact", head: true }).eq("moderacao", "ativo"),
    ]);
    return { publications: publications ?? 0, municipalities: municipalities ?? 0 };
  } catch {
    return { publications: 0, municipalities: 0 };
  }
}

export default async function HomePage() {
  const t = await getTranslations("home");
  const stats = await getStats();

  const categories = [
    { slug: "mobilidade", icon: "🦽", label: "Mobilidade" },
    { slug: "comunicacao", icon: "🗣️", label: "Comunicação" },
    { slug: "banho-higiene", icon: "🚿", label: "Banho e Higiene" },
    { slug: "cama-descanso", icon: "🛏️", label: "Cama e Descanso" },
    { slug: "reabilitacao", icon: "💪", label: "Reabilitação" },
    { slug: "casa-ambiente", icon: "🏠", label: "Casa e Ambiente" },
    { slug: "lazer-desporto", icon: "⚽", label: "Lazer e Desporto" },
    { slug: "outros", icon: "📦", label: "Outros" },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-purple-700 to-purple-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8" aria-hidden="true" />
            <span className="text-purple-200 font-medium text-lg">Enable Bank</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">{t("hero.title")}</h1>
          <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">{t("hero.subtitle")}</p>
          <div className="max-w-2xl mx-auto">
            <form action="/pt/search" method="GET">
              <div className="flex gap-2 bg-white rounded-xl p-2 shadow-lg">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search className="w-5 h-5 text-gray-400 shrink-0" aria-hidden="true" />
                  <input type="text" name="q" placeholder={t("hero.searchPlaceholder")} className="w-full text-gray-900 placeholder-gray-400 outline-none text-sm sm:text-base" aria-label="Campo de pesquisa" />
                </div>
                <button type="submit" className="bg-purple-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-purple-800 transition-colors shrink-0 text-sm sm:text-base">{t("hero.searchButton")}</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div><p className="text-2xl font-bold text-purple-700">{stats.publications}</p><p className="text-sm text-gray-500">{t("stats.products")}</p></div>
            <div><p className="text-2xl font-bold text-purple-700">{stats.municipalities}</p><p className="text-sm text-gray-500">{t("stats.municipalities")}</p></div>
            <div><p className="text-2xl font-bold text-purple-700">~80</p><p className="text-sm text-gray-500">{t("stats.banks")}</p></div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">{t("hero.orBrowse")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/search?categoria=${cat.slug}`} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-center group">
                <span className="text-3xl" role="img" aria-hidden="true">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t("howItWorks.title")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {(["step1", "step2", "step3"] as const).map((step, i) => (
              <div key={step} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 font-bold text-xl flex items-center justify-center">{i + 1}</div>
                <h3 className="font-semibold text-gray-900">{t(`howItWorks.${step}.title`)}</h3>
                <p className="text-sm text-gray-500">{t(`howItWorks.${step}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-purple-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Tens um produto de apoio que já não usas?</h2>
          <p className="text-gray-600 mb-6">Publica gratuitamente e ajuda quem precisa. Sem intermediários, sem comissões.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/publications/new" className="flex items-center justify-center gap-2 bg-purple-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-800 transition-colors">
              Publicar anúncio<ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link href="/map" className="flex items-center justify-center gap-2 border border-purple-300 text-purple-700 px-6 py-3 rounded-xl font-medium hover:bg-purple-50 transition-colors">
              <MapPin className="w-4 h-4" aria-hidden="true" />Ver no mapa
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 px-4 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="text-lg italic text-gray-600">&ldquo;O tempo é essencial, e juntos podemos garantir que está sempre do lado das nossas crianças.&rdquo;</blockquote>
          <p className="mt-3 text-sm font-medium text-purple-700">Isabel Cavaca — Addapters Org, Presidente</p>
        </div>
      </section>
    </div>
  );
}
