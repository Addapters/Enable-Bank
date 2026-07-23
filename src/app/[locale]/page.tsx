import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PublicationCard from "@/components/publications/PublicationCard";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Enable Bank — Plataforma de produtos de apoio" };
}

async function getFeaturedPublications() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("publications")
      .select("id, titulo, descricao, tipo, estado, publico, disponivel, concelho, moderacao, criado_em, atualizado_em, categoria_id, user_id, latitude, longitude, category:categories!categoria_id(nome), photos(url, ordem)")
      .eq("moderacao", "ativo")
      .order("criado_em", { ascending: false })
      .limit(5);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data ?? []) as any[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const t = await getTranslations("home");
  const featured = await getFeaturedPublications();

  // Ícones isolados de /category-icons.png via CSS sprite. O recorte de cada ícone é sempre
  // uma célula inteira da grelha 4x2 (nunca mais largo/alto que a célula), para garantir que
  // nunca aparecem pedaços de ícones vizinhos; o deslocamento vertical dentro da célula foi
  // ajustado a partir do centro real de cada ícone (analisado pixel a pixel).
  const categories = [
    { slug: "mobilidade", iconPos: "0px -18.67px", label: "Mobilidade" },
    { slug: "comunicacao", iconPos: "-64px -18.67px", label: "Comunicação" },
    { slug: "banho-higiene", iconPos: "-128px -18.83px", label: "Banho e Higiene" },
    { slug: "cama-descanso", iconPos: "-192px -19px", label: "Cama e Descanso" },
    { slug: "reabilitacao", iconPos: "0px -85.33px", label: "Reabilitação" },
    { slug: "casa-ambiente", iconPos: "-64px -85.33px", label: "Casa e Ambiente" },
    { slug: "lazer-desporto", iconPos: "-128px -85.33px", label: "Lazer e Desporto" },
    { slug: "outros", iconPos: "-192px -85.33px", label: "Outros" },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-purple-700 to-purple-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">{t("hero.title")}</h1>
          <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">{t("hero.tagline")}</p>
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

      {featured.length > 0 && (
        <section className="py-12 px-4 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Novos produtos</h2>
              <Link href="/search" className="text-sm font-medium text-purple-700 hover:underline shrink-0">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {featured.map((pub) => (
                <PublicationCard key={pub.id} publication={pub} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">{t("hero.orBrowse")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/search?categoria=${cat.slug}`} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-center group">
                <span
                  aria-hidden="true"
                  style={{
                    backgroundImage: "url(/category-icons.png)",
                    backgroundSize: "256px 170.67px",
                    backgroundPosition: cat.iconPos,
                    width: 64,
                    height: 64,
                  }}
                />
                <span className="text-base font-medium text-gray-700 group-hover:text-purple-700">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-16 text-center">{t("howItWorks.title")}</h2>
          <div className="relative">
            {/* Linha ondulada decorativa a ligar os passos (só desktop). Envolvida numa div
                simples (não um elemento substituído como o svg) para que top/bottom negativos
                calculem a altura corretamente, sem a proporção intrínseca do viewBox interferir. */}
            <div className="hidden sm:block absolute left-0 right-0 -top-8 -bottom-8">
              <svg
                className="w-full h-full opacity-30"
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="howItWorksWave" x1="0" y1="0" x2="100%" y2="0">
                    <stop offset="0%" stopColor="var(--color-purple-400)" />
                    <stop offset="50%" stopColor="var(--color-purple-700)" />
                    <stop offset="100%" stopColor="var(--color-purple-400)" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,39 C 15,39 15,1 50,1 C 85,1 85,39 100,39"
                  fill="none"
                  stroke="url(#howItWorksWave)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
              {(["step1", "step2", "step3"] as const).map((step, i) => {
                const shades = ["bg-purple-500", "bg-purple-700", "bg-purple-500"];
                const lift = i === 1 ? "sm:-translate-y-8" : "sm:translate-y-8";
                return (
                  <div key={step} className={`flex flex-col items-center text-center gap-2 ${lift}`}>
                    <div className={`w-16 h-16 rounded-full ${shades[i]} text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-purple-200`}>
                      {i + 1}
                    </div>
                    <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Passo {i + 1}</span>
                    <h3 className="font-semibold text-gray-900">{t(`howItWorks.${step}.title`)}</h3>
                    <p className="text-sm text-gray-500 max-w-[220px]">{t(`howItWorks.${step}.description`)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-br from-purple-700 to-purple-900">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/heart-icon-white.png" alt="" className="w-8 h-8" aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Tens um produto de apoio que já não usas?</h2>
          <p className="text-purple-100 text-lg mb-8">Publica gratuitamente e ajuda quem precisa. Sem intermediários, sem comissões.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/publications/new" className="flex items-center justify-center gap-2 bg-white text-purple-700 px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-purple-50 transition-colors">
              Publicar anúncio<ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link href="/map" className="flex items-center justify-center gap-2 border border-white/40 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors">
              <MapPin className="w-4 h-4" aria-hidden="true" />Ver no mapa
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
