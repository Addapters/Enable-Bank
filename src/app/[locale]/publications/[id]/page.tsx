import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic"; // garante render por request — nunca serve HTML cacheado com dados de sessão
import { Link } from "@/i18n/navigation";
import { MapPin, Tag, Clock, ChevronLeft, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ContactInfo from "@/components/publications/ContactInfo";
import PhotoGallery from "./PhotoGallery";
import type { PublicationRow, CategoryRow, PhotoRow, UserRow } from "@/types/database";

type Props = { params: Promise<{ id: string; locale: string }> };
type PublicationFull = PublicationRow & {
  category: Pick<CategoryRow, "nome" | "slug"> | null;
  photos: Pick<PhotoRow, "id" | "url" | "ordem">[];
  user: Pick<UserRow, "id" | "nome" | "tipo"> | null;
};

const TYPE_STYLES = {
  doacao: { label: "Doação", className: "bg-green-100 text-green-800" },
  troca:  { label: "Troca",  className: "bg-blue-100 text-blue-800" },
  venda:  { label: "Venda",  className: "bg-orange-100 text-orange-800" },
};
const CONDITION_LABELS = { novo: "Novo", bom: "Bom estado", usado: "Usado" };
const AUDIENCE_LABELS  = { crianca: "Criança/Jovem", adulto: "Adulto", ambos: "Ambos" };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("publications").select("titulo, descricao").eq("id", id).single();
  if (!data) return { title: "Anúncio não encontrado" };
  const typed = data as { titulo: string; descricao: string };
  return { title: typed.titulo, description: typed.descricao.slice(0, 160) };
}

export default async function PublicationDetailPage({ params }: Props) {
  const { id } = await params;
  await getTranslations("publication");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("publications")
    .select(`id, titulo, descricao, tipo, estado, publico, disponivel, concelho, moderacao, criado_em, atualizado_em, categoria_id, user_id, latitude, longitude, embedding, category:categories!categoria_id(nome, slug), photos(id, url, ordem), user:users!user_id(id, nome, tipo)`)
    .eq("id", id)
    .eq("moderacao", "ativo")
    .single();

  if (error || !data) notFound();

  const pub = data as unknown as PublicationFull;
  const typeStyle = TYPE_STYLES[pub.tipo];
  const sortedPhotos = [...pub.photos].sort((a, b) => a.ordem - b.ordem);
  const createdAt = new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long", year: "numeric" }).format(new Date(pub.criado_em));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link href="/search" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-purple-700 transition-colors">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />Voltar à pesquisa
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {sortedPhotos.length > 0 ? (
            <PhotoGallery photos={sortedPhotos} title={pub.titulo} />
          ) : (
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
          )}

          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeStyle.className}`}>{typeStyle.label}</span>
              {pub.disponivel ? (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" aria-hidden="true" />Disponível imediatamente</span>
              ) : (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1"><XCircle className="w-3 h-3" aria-hidden="true" />Disponibilidade a confirmar</span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{pub.titulo}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" aria-hidden="true" />{pub.concelho}</span>
              {pub.category && <Link href={`/search?categoria=${pub.category.slug}`} className="flex items-center gap-1 hover:text-purple-700"><Tag className="w-4 h-4" aria-hidden="true" />{pub.category.nome}</Link>}
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" aria-hidden="true" />Publicado em {createdAt}</span>
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Descrição</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{pub.descricao}</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Detalhes</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <DetailItem label="Estado" value={CONDITION_LABELS[pub.estado]} />
              <DetailItem label="Público" value={AUDIENCE_LABELS[pub.publico]} />
              <DetailItem label="Tipo" value={typeStyle.label} />
              {pub.category && <DetailItem label="Categoria" value={pub.category.nome} />}
              <DetailItem label="Localização" value={pub.concelho} />
            </dl>
          </div>
        </div>

        <aside className="space-y-4" aria-label="Informação de contacto">
          <h2 className="text-base font-semibold text-gray-900">Contacto</h2>
          <ContactInfo userId={pub.user_id} />
          <div className="text-xs text-center text-gray-400 space-y-1">
            <p>Publicado a {createdAt}</p>
            {pub.user && (
              <p>
                por{" "}
                <Link href={`/utilizadores/${pub.user.id}`} className="font-medium text-gray-600 hover:text-purple-700 hover:underline">
                  {pub.user.nome}
                </Link>
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}
