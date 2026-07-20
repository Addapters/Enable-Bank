import Image from "next/image";
import { BadgeCheck } from "lucide-react";

export interface PublisherInfo {
  nome: string;
  tipo: string;           // "particular" | "entidade"
  logoUrl?: string | null;
  verificada?: boolean;
}

interface Props {
  publisher: PublisherInfo;
  /** Tamanho do avatar em px (quadrado). Default: 40 */
  size?: number;
  /** Mostrar nome ao lado do avatar. Default: false */
  showName?: boolean;
  /** Mostrar badge "Verificada" ao lado do nome. Default: true */
  showBadge?: boolean;
  className?: string;
}

/** Duas iniciais do nome, ex: "Addapters Org" → "AO" */
function initials(nome: string): string {
  const words = nome.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function PublisherAvatar({
  publisher,
  size = 40,
  showName = false,
  showBadge = true,
  className = "",
}: Props) {
  const isEntity = publisher.tipo === "entidade";
  const hasLogo  = isEntity && !!publisher.logoUrl;

  const avatar = (
    <div
      className="shrink-0 rounded-full overflow-hidden flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {hasLogo ? (
        <Image
          src={publisher.logoUrl!}
          alt={publisher.nome}
          width={size}
          height={size}
          className="object-cover w-full h-full"
          sizes={`${size}px`}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center font-bold text-white select-none
            ${isEntity ? "bg-blue-600" : "bg-purple-600"}`}
          style={{ fontSize: Math.max(10, Math.round(size * 0.36)) }}
        >
          {initials(publisher.nome)}
        </div>
      )}
    </div>
  );

  if (!showName) return <div className={className}>{avatar}</div>;

  // Nome menor para avatares pequenos (≤ 28 px)
  const nameClass = size <= 28
    ? "text-xs font-medium text-gray-700 truncate"
    : "text-sm font-medium text-gray-900 truncate";

  return (
    <div className={`flex items-center gap-2 min-w-0 ${className}`}>
      {avatar}
      <div className="min-w-0">
        <div className="flex items-center gap-1 flex-wrap min-w-0">
          <span className={nameClass}>{publisher.nome}</span>
          {isEntity && showBadge && publisher.verificada && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 shrink-0">
              <BadgeCheck className="w-3 h-3" aria-hidden="true" />
              Verificada
            </span>
          )}
          {isEntity && !publisher.verificada && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 shrink-0">
              Entidade
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
