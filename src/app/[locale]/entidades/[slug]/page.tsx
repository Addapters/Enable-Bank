import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  BadgeCheck, MapPin, Globe, Mail, Phone,
  User, Package, ChevronLeft, ExternalLink, Tag, Pencil,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PublicationCard from "@/components/publications/PublicationCard";
import type { PublisherInfo } from "@/components/publications/PublisherAvatar";
import { getFavoriteState } from "@/lib/favorites/queries";

type Props = { params: Promise<{ slug: string; locale: string }> };

const TIPO_LABEL: Record<string, string> = {
  ONGPD: "ONGPD", IPSS: "IPSS", municipio: "Município",
  misericordia: "Misericórdia", clinica: "Clínica / Hospital",
  associacao: "Associação", outro: "Outro",
};

interface EntityFull {
  id: string; nome: string; tipo: string | null; slug: string;
  morada: string | null; concelho: string | null; website: string | null;
  telefone: string | null; email_contacto: string | null;
  pessoa_contacto_nome: string | null; pessoa_contacto_cargo: string | null;
  descricao: string | null; logo_url: string | null;
  verificada: boolean; criado_em: string;
  user_id: string;
}

interface RawPub {
  id: string; titulo: string; descricao: string;
  tipo: string; estado: string; publico: string;
  disponivel: boolean; concelho: string;
  moderacao: string; criado_em: string;
  atualizado_em: string; categoria_id: string;
  user_id: string; latitude: number | null; longitude: number | null;
  embedding: string | null; preco: number | null;
  category: { nome: string } | null;
  photos: { url: string; ordem: number }[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("entities").select("nome, descricao").eq("slug", slug).single();
  if (!data) return { title: "Entidade não encontrada" };
  const e = data as { nome: string; descricao: string | null };
  return {
    title: `${e.nome} — Enable Bank`,
    description: e.descricao?.slice(0, 160) ?? `Perfil da entidade ${e.nome} no Enable Bank`,
  };
}

export default async function EntityPublicPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: rawEntity } = await supabase
    .from("entities")
    .select(`id, nome, tipo, slug, morada, concelho, website, telefone,
      email_contacto, pessoa_contacto_nome, pessoa_contacto_cargo,
      descricao, logo_url, verificada, criado_em, user_id`)
    .eq("slug", slug)
    .single();

  if (!rawEntity) notFound();
  const entity = rawEntity as unknown as EntityFull;

  const { data: { user: viewer } } = await supabase.auth.getUser();
  const isOwnProfile = viewer?.id === entity.user_id;

  const { data: rawPubs } = await supabase
    .from("publications")
    .select(`id, titulo, descricao, tipo, estado, publico, disponivel,
      concelho, moderacao, criado_em, atualizado_em, categoria_id, user_id,
      latitude, longitude, embedding,
      category:categories!categoria_id(nome),
      photos(url, ordem)`)
    .eq("user_id", entity.user_id)
    .eq("moderacao", "ativo")
    .order("criado_em", { ascending: false });

  const pubs = (rawPubs as unknown as RawPub[]) ?? [];
  const { favIds } = await getFavoriteState(pubs.map((p) => p.id));

  // Agrupa por categoria
  const grouped = new Map<string, { nome: string; pubs: RawPub[] }>();
  const sem_categoria: RawPub[] = [];
  for (const p of pubs) {
    const catNome = p.category?.nome ?? null;
    if (!catNome) { sem_categoria.push(p); continue; }
    if (!grouped.has(catNome)) grouped.set(catNome, { nome: catNome, pubs: [] });
    grouped.get(catNome)!.pubs.push(p);
  }
  if (sem_categoria.length) grouped.set("__sem__", { nome: "Sem categoria", pubs: sem_categoria });

  const publisherInfo: PublisherInfo = {
    nome: entity.nome,
    tipo: "entidade",
    logoUrl: entity.logo_url,
    verificada: entity.verificada,
  };

  const registadoEm = new Date(entity.criado_em).toLocaleDateString("pt-PT", {
    month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link href="/search" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-purple-700 transition-colors">
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />Voltar à pesquisa
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Coluna esquerda: perfil */}
          <aside className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              {/* Logo / avatar */}
              <div className="flex flex-col items-center text-center gap-3">
                {entity.logo_url ? (
                  <div className="w-24 h-24 rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                    <Image
                      src={entity.logo_url}
                      alt={`Logo de ${entity.nome}`}
                      width={96}
                      height={96}
                      className="object-contain p-1 w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold select-none">
                    {entity.nome.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-gray-900">{entity.nome}</h1>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
                    {entity.tipo && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {TIPO_LABEL[entity.tipo] ?? entity.tipo}
                      </span>
                    )}
                    {entity.verificada && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />Verificada
                      </span>
                    )}
                  </div>
                  {isOwnProfile && (
                    <Link
                      href="/profile"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium bg-purple-700 text-white px-3 py-1.5 rounded-lg hover:bg-purple-800 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                      Editar perfil
                    </Link>
                  )}
                </div>
              </div>

              {/* Descrição */}
              {entity.descricao && (
                <p className="text-sm text-gray-600 leading-relaxed text-center">
                  {entity.descricao}
                </p>
              )}

              {/* Detalhes */}
              <dl className="space-y-2.5 text-sm border-t border-gray-100 pt-4">
                {entity.concelho && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{entity.morada ? `${entity.morada}, ${entity.concelho}` : entity.concelho}</span>
                  </div>
                )}
                {entity.website && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Globe className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                    <a
                      href={entity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-700 hover:underline truncate flex items-center gap-1"
                    >
                      {entity.website.replace(/^https?:\/\//, "")}
                      <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                    </a>
                  </div>
                )}
                {entity.email_contacto && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                    <a href={`mailto:${entity.email_contacto}`} className="text-purple-700 hover:underline truncate">
                      {entity.email_contacto}
                    </a>
                  </div>
                )}
                {entity.telefone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                    <a href={`tel:${entity.telefone}`} className="hover:text-purple-700">
                      {entity.telefone}
                    </a>
                  </div>
                )}
                {entity.pessoa_contacto_nome && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      {entity.pessoa_contacto_nome}
                      {entity.pessoa_contacto_cargo && (
                        <span className="text-gray-400"> · {entity.pessoa_contacto_cargo}</span>
                      )}
                    </span>
                  </div>
                )}
              </dl>

              <p className="text-xs text-gray-400 text-center border-t border-gray-100 pt-3">
                Membro desde {registadoEm}
              </p>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
              <Package className="w-5 h-5 text-purple-400 shrink-0" aria-hidden="true" />
              <span className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">{pubs.length}</span>{" "}
                {pubs.length === 1 ? "anúncio ativo" : "anúncios ativos"}
              </span>
            </div>
          </aside>

          {/* Coluna direita: anúncios agrupados */}
          <main className="lg:col-span-2 space-y-8">
            <h2 className="text-lg font-bold text-gray-900">
              Anúncios de <span className="text-purple-700">{entity.nome}</span>
            </h2>

            {pubs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-16 text-center">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm text-gray-500">Esta entidade ainda não tem anúncios ativos.</p>
              </div>
            ) : (
              Array.from(grouped.entries()).map(([key, group]) => (
                <section key={key} aria-label={`Categoria ${group.nome}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-purple-400" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      {group.nome}
                    </h3>
                    <span className="text-xs text-gray-400">({group.pubs.length})</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {group.pubs.map((pub) => (
                      <li key={pub.id}>
                        <PublicationCard
                          publication={pub as never}
                          publisher={publisherInfo}
                          showFavorite={!isOwnProfile}
                          isFavorited={favIds.has(pub.id)}
                          isAuthenticated={!!viewer}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
