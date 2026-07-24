import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Search, MapPin, ArrowRight, MessageCircle, PackageCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PublicationCard from "@/components/publications/PublicationCard";
import { getFavoriteState } from "@/lib/favorites/queries";
import { getEntityMap, toPublisherInfo, type RawPublisher } from "@/lib/publications/publisherInfo";
import { getPublicProfiles } from "@/lib/users/publicProfiles";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Enable Bank — Plataforma de produtos de apoio" };
}

function StepCircle({
  n,
  icon: Icon,
  circleBg,
  iconColor,
  title,
  description,
}: {
  n: number;
  icon: typeof Search;
  circleBg: string;
  iconColor: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3 mx-auto sm:max-w-[220px]">
      <div className={`relative flex h-28 w-28 items-center justify-center rounded-full ${circleBg}`}>
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white shadow-sm">
          <Icon className={`w-8 h-8 ${iconColor}`} aria-hidden="true" />
        </div>
        <span className="absolute -top-1 -left-1 flex h-9 w-9 items-center justify-center rounded-full bg-purple-700 text-white text-sm font-bold shadow-md">
          {n}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-purple-700">{n}º passo:</p>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}

function Arrow({ color }: { color: string }) {
  return (
    <div className="hidden sm:flex items-center justify-center h-28">
      <svg className={color} width="56" height="24" viewBox="0 0 56 24" aria-hidden="true">
        <line x1="0" y1="12" x2="44" y2="12" stroke="currentColor" strokeWidth="2" strokeDasharray="6 5" strokeLinecap="round" />
        <path d="M40 5 L52 12 L40 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

async function getFeaturedPublications() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("publications")
      .select("id, titulo, descricao, tipo, estado, publico, disponivel, concelho, moderacao, criado_em, atualizado_em, categoria_id, user_id, latitude, longitude, preco, negociavel, category:categories!categoria_id(nome), photos(url, ordem)")
      .eq("moderacao", "ativo")
      .order("criado_em", { ascending: false })
      .limit(8);
    const rows = (data ?? []) as unknown as { user_id: string }[];
    const profiles = await getPublicProfiles(supabase, rows.map((p) => p.user_id));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rows.map((p) => ({ ...p, publisher: profiles.get(p.user_id) ?? null })) as any[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const t = await getTranslations("home");
  const featured = await getFeaturedPublications();
  const { viewerId, favIds } = await getFavoriteState(featured.map((p) => p.id));
  const entityMap = await getEntityMap(
    await createClient(),
    featured.map((p) => p.publisher as RawPublisher)
  );

  // Ícones isolados de /category-icons.png via CSS sprite. As colunas da grelha de origem
  // não são igualmente espaçadas (confirmado por análise pixel a pixel dos limites reais de
  // cada ícone), por isso as posições usam os limites de coluna detetados em vez de um grid
  // 4x2 uniforme — caso contrário aparecem pedaços de ícones vizinhos ou cortam-se ícones.
  const categories = [
    { slug: "mobilidade", iconPos: "0px -18.67px", label: "Mobilidade" },
    { slug: "comunicacao", iconPos: "-64.375px -18.67px", label: "Comunicação" },
    { slug: "banho-higiene", iconPos: "-125.625px -18.83px", label: "Banho e Higiene" },
    { slug: "cama-descanso", iconPos: "-187.375px -19px", label: "Cama e Descanso" },
    { slug: "reabilitacao", iconPos: "0px -85.33px", label: "Reabilitação" },
    { slug: "casa-ambiente", iconPos: "-64.375px -85.33px", label: "Casa e Ambiente" },
    { slug: "lazer-desporto", iconPos: "-125.625px -85.33px", label: "Lazer e Desporto" },
    { slug: "outros", iconPos: "-187.375px -85.33px", label: "Outros" },
  ];

  // Cores secundárias a rodar pelos cartões de categoria, para o quadro não ficar só roxo.
  const CATEGORY_STYLES = [
    { bg: "bg-brand-blue/20", border: "hover:border-brand-blue" },
    { bg: "bg-brand-green/20", border: "hover:border-brand-green" },
    { bg: "bg-brand-peach/20", border: "hover:border-brand-peach" },
    { bg: "bg-brand-yellow/20", border: "hover:border-brand-yellow" },
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

      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Explorar por categorias</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat, i) => {
              const style = CATEGORY_STYLES[i % CATEGORY_STYLES.length];
              return (
                <Link key={cat.slug} href={`/search?categoria=${cat.slug}`} className={`flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 ${style.border} hover:shadow-md transition-all text-center group`}>
                  <span className={`flex items-center justify-center rounded-full ${style.bg}`}>
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
                  </span>
                  <span className="text-base font-medium text-gray-700 group-hover:text-purple-700">{cat.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-16 text-center">{t("howItWorks.title")}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr] gap-y-12 sm:items-start">
            <StepCircle n={1} icon={Search} circleBg="bg-brand-blue/25" iconColor="text-purple-700" title={t("howItWorks.step1.title")} description={t("howItWorks.step1.description")} />
            <Arrow color="text-purple-500" />
            <StepCircle n={2} icon={MessageCircle} circleBg="bg-brand-green/25" iconColor="text-green-600" title={t("howItWorks.step2.title")} description={t("howItWorks.step2.description")} />
            <Arrow color="text-green-500" />
            <StepCircle n={3} icon={PackageCheck} circleBg="bg-brand-peach/25" iconColor="text-orange-600" title={t("howItWorks.step3.title")} description={t("howItWorks.step3.description")} />
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

      {featured.length > 0 && (
        <section className="py-12 px-4 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Novos produtos</h2>
              <Link href="/search" className="text-sm font-medium text-purple-700 hover:underline shrink-0">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map((pub) => (
                <PublicationCard
                  key={pub.id}
                  publication={pub}
                  publisher={toPublisherInfo(pub.publisher as RawPublisher, entityMap)}
                  showFavorite={viewerId !== pub.user_id}
                  isFavorited={favIds.has(pub.id)}
                  isAuthenticated={!!viewerId}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
