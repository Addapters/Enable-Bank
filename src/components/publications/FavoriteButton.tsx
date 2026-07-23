"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { toggleFavorite } from "@/lib/favorites/actions";

interface Props {
  publicationId: string;
  initialFavorited: boolean;
  isAuthenticated: boolean;
  className?: string;
  /** Tamanho do botão em px. Default: 32 */
  size?: number;
  /** "solid" = círculo branco com sombra (para sobrepor a fotos); "plain" = só o ícone, sem fundo. Default: "solid" */
  variant?: "solid" | "plain";
}

export default function FavoriteButton({
  publicationId, initialFavorited, isAuthenticated, className, size = 32, variant = "solid",
}: Props) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/auth/login?redirectTo=${encodeURIComponent(pathname)}`);
      return;
    }

    const next = !favorited;
    setFavorited(next); // otimista
    startTransition(async () => {
      const result = await toggleFavorite(publicationId, next);
      if (!result.success) setFavorited(!next); // reverte em caso de erro
    });
  };

  const iconSize = Math.round(size * 0.5);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={favorited}
      aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      style={{ width: size, height: size }}
      className={`flex items-center justify-center shrink-0 transition-colors disabled:opacity-60 ${
        variant === "solid" ? "rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white" : "hover:opacity-70"
      } ${className ?? ""}`}
    >
      <Heart
        style={{ width: iconSize, height: iconSize }}
        className={`transition-colors ${favorited ? "fill-purple-700 text-purple-700" : "text-gray-400"}`}
        aria-hidden="true"
      />
    </button>
  );
}
