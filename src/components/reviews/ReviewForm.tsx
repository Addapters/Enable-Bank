"use client";

import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, Trash2, Loader2 } from "lucide-react";
import StarRating from "./StarRating";
import { submitReview, deleteReview } from "@/lib/reviews/actions";
import type { ReviewRow } from "@/types/database";

interface Props {
  publicationId: string;
  isAuthenticated: boolean;
  existingReview: ReviewRow | null;
}

export default function ReviewForm({ publicationId, isAuthenticated, existingReview }: Props) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comentario, setComentario] = useState(existingReview?.comentario ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [removed, setRemoved] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 p-4 text-center">
        <p className="text-sm text-gray-500 mb-3">Inicia sessão para deixares uma avaliação.</p>
        <Link href="/auth/login" className="text-sm font-medium text-purple-700 hover:underline">
          Entrar →
        </Link>
      </div>
    );
  }

  if (removed) return null;

  const handleSubmit = () => {
    if (rating < 1) { setError("Escolhe uma classificação de 1 a 5 estrelas."); return; }
    setError(null);
    startTransition(async () => {
      const result = await submitReview(publicationId, rating, comentario);
      if (!result.success) { setError(result.error); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  const handleDelete = () => {
    if (!existingReview) return;
    startTransition(async () => {
      const result = await deleteReview(existingReview.id);
      if (!result.success) { setError(result.error); return; }
      setRemoved(true);
    });
  };

  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-3">
      <p className="text-sm font-medium text-gray-900">
        {existingReview ? "A tua avaliação" : "Deixa uma avaliação"}
      </p>
      <StarRating rating={rating} interactive size={22} onChange={setRating} />
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Como correu? (opcional)"
        rows={2}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-50 transition-colors"
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          {existingReview ? "Guardar alterações" : "Publicar avaliação"}
        </button>
        {existingReview && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            Remover
          </button>
        )}
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            Guardado
          </span>
        )}
      </div>
    </div>
  );
}
