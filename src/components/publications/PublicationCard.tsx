import { Link } from "@/i18n/navigation";
import { MapPin, Clock, Tag } from "lucide-react";
import { clsx } from "clsx";
import type { PublicationRow, CategoryRow, PhotoRow } from "@/types/database";
import PublisherAvatar, { type PublisherInfo } from "./PublisherAvatar";
import FavoriteButton from "./FavoriteButton";

type Props = {
  publication: PublicationRow & {
    category?: Pick<CategoryRow, "nome"> | null;
    photos?: Pick<PhotoRow, "url" | "ordem">[];
  };
  /** Info do publisher (nome, tipo, logo, verificada). Opcional — se ausente não mostra avatar. */
  publisher?: PublisherInfo;
  /** Mostra o botão de favorito. Omite para anúncios próprios (não faz sentido favoritar). */
  showFavorite?: boolean;
  isFavorited?: boolean;
  isAuthenticated?: boolean;
};

const TYPE_STYLES = {
  doacao: { label: "Doação", className: "bg-green-100 text-green-800 border-green-200" },
  troca:  { label: "Troca",  className: "bg-blue-100 text-blue-800 border-blue-200" },
  venda:  { label: "Venda",  className: "bg-orange-100 text-orange-800 border-orange-200" },
};

const CONDITION_LABELS = { novo: "Novo", bom: "Bom estado", usado: "Usado" };
const AUDIENCE_LABELS  = { crianca: "Criança/Jovem", adulto: "Adulto", ambos: "Ambos" };

export default function PublicationCard({ publication, publisher, showFavorite, isFavorited, isAuthenticated }: Props) {
  const typeStyle = TYPE_STYLES[publication.tipo];
  // Ordena fotos por ordem antes de pegar a capa
  const sortedPhotos = publication.photos
    ? [...publication.photos].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
    : [];
  const coverPhoto = sortedPhotos[0]?.url;

  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all overflow-hidden">
      {/* Botão de favorito — fora do <Link> (irmão, não aninhado) para não ter <button> dentro de <a> */}
      {showFavorite && (
        <FavoriteButton
          publicationId={publication.id}
          initialFavorited={!!isFavorited}
          isAuthenticated={!!isAuthenticated}
          className="absolute top-2 right-2 z-10"
        />
      )}

      <Link
        href={`/publications/${publication.id}`}
        className="contents"
        aria-label={`${publication.titulo} — ${typeStyle.label} em ${publication.concelho}`}
      >
      {/* Foto de capa */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {coverPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverPhoto}
            alt={publication.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <span className={clsx("absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full border", typeStyle.className)}>
          {typeStyle.label}
        </span>
        {publication.disponivel && (
          <span className={clsx(
            "absolute right-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200",
            showFavorite ? "top-12" : "top-2"
          )}>
            Disponível já
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-purple-700 transition-colors">
          {publication.titulo}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 flex-1">{publication.descricao}</p>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" aria-hidden="true" />{publication.concelho}
          </span>
          {publication.category && (
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" aria-hidden="true" />{publication.category.nome}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" aria-hidden="true" />{AUDIENCE_LABELS[publication.publico]}
          </span>
        </div>

        {/* Publisher avatar + rodapé */}
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-100 gap-2">
          {publisher ? (
            <PublisherAvatar publisher={publisher} size={24} showName showBadge />
          ) : (
            <span className="text-xs text-gray-400">{CONDITION_LABELS[publication.estado]}</span>
          )}
          <span className="text-xs font-medium text-purple-700 group-hover:underline shrink-0">
            Ver →
          </span>
        </div>
      </div>
      </Link>
    </div>
  );
}
