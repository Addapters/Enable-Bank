import StarRating from "./StarRating";
import PublisherAvatar from "@/components/publications/PublisherAvatar";
import { timeAgo } from "@/lib/utils/timeAgo";
import type { ReviewWithReviewer } from "@/lib/reviews/queries";

interface Props {
  reviews: ReviewWithReviewer[];
  average: number | null;
  count: number;
}

export default function ReviewsList({ reviews, average, count }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <StarRating rating={average ?? 0} size={20} />
        <span className="text-sm text-gray-600">
          {average !== null ? average.toFixed(1) : "—"}{" "}
          <span className="text-gray-400">
            ({count} {count === 1 ? "avaliação" : "avaliações"})
          </span>
        </span>
      </div>

      {count === 0 ? (
        <p className="text-sm text-gray-500">Ainda sem avaliações.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                {r.reviewer ? (
                  <PublisherAvatar
                    publisher={{ nome: r.reviewer.nome, tipo: r.reviewer.tipo, logoUrl: r.reviewer.avatar_url }}
                    size={28}
                    showName
                    showBadge={false}
                  />
                ) : <span className="text-sm text-gray-500">Utilizador</span>}
                <span className="text-xs text-gray-400 shrink-0">{timeAgo(r.criado_em)}</span>
              </div>
              <StarRating rating={r.rating} size={14} className="mb-1" />
              {r.comentario && <p className="text-sm text-gray-600">{r.comentario}</p>}
              {r.publication_titulo && (
                <p className="text-xs text-gray-400 mt-1">Sobre: {r.publication_titulo}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
