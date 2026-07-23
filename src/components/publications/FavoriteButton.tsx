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
}

export default function FavoriteButton({ publicationId, initialFavorited, isAuthenticated, className }: Props) {
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

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={favorited}
      aria-label={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={`flex items-center justify-center w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors disabled:opacity-60 ${className ?? ""}`}
    >
      <Heart
        className={`w-4 h-4 transition-colors ${favorited ? "fill-red-500 text-red-500" : "text-gray-400"}`}
        aria-hidden="true"
      />
    </button>
  );
}
