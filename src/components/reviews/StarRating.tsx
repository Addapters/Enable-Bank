"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface Props {
  /** Valor atual (1-5). Pode ser fracionário no modo leitura (ex: média 4.3). */
  rating: number;
  /** Tamanho de cada estrela em px. Default: 18 */
  size?: number;
  /** Modo interativo (clicável) — usado no formulário de avaliação. Default: false (só leitura) */
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export default function StarRating({ rating, size = 18, interactive = false, onChange, className }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const displayValue = interactive && hovered !== null ? hovered : rating;

  return (
    <div className={`inline-flex items-center gap-0.5 ${className ?? ""}`} role={interactive ? "radiogroup" : "img"} aria-label={interactive ? "Avaliação em estrelas" : `${rating.toFixed(1)} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(displayValue);
        const star = (
          <Star
            style={{ width: size, height: size }}
            className={filled ? "fill-purple-700 text-purple-700" : "text-gray-300"}
            aria-hidden="true"
          />
        );
        if (!interactive) return <span key={n}>{star}</span>;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === rating}
            aria-label={`${n} estrela${n === 1 ? "" : "s"}`}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange?.(n)}
            className="p-0.5"
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}
