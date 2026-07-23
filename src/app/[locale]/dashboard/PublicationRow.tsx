"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import {
  Edit2,
  Trash2,
  EyeOff,
  Eye,
  CheckCircle,
  Loader2,
  AlertTriangle,
  MessageSquareWarning,
} from "lucide-react";
import {
  deactivatePublication,
  activatePublication,
  markAsDonated,
  deletePublication,
} from "@/lib/dashboard/actions";
import type { PublicationType, PublicationStatus } from "@/types/database";

interface Publication {
  id: string;
  titulo: string;
  tipo: PublicationType;
  moderacao: PublicationStatus;
  disponivel: boolean;
  criado_em: string;
  category: { nome: string } | null;
}

interface Props {
  pub: Publication;
  /** Nota do admin quando pub.moderacao === "correcao". */
  correctionNote?: string;
}

const TYPE_LABELS: Record<PublicationType, string> = {
  doacao: "Doação",
  troca: "Troca",
  venda: "Venda",
};

const TYPE_COLORS: Record<PublicationType, string> = {
  doacao: "bg-green-100 text-green-800",
  troca: "bg-blue-100 text-blue-800",
  venda: "bg-orange-100 text-orange-800",
};

const STATUS_LABELS: Record<PublicationStatus, string> = {
  pendente: "Pendente",
  ativo: "Ativo",
  rejeitado: "Rejeitado",
  cedido: "Cedido",
  correcao: "Correção pedida",
};

const STATUS_COLORS: Record<PublicationStatus, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  ativo: "bg-green-100 text-green-800",
  rejeitado: "bg-red-100 text-red-800",
  cedido: "bg-gray-100 text-gray-600",
  correcao: "bg-amber-100 text-amber-800",
};

export default function PublicationRow({ pub, correctionNote }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isClosed = pub.moderacao === "cedido" || pub.moderacao === "rejeitado";

  function runAction(action: () => Promise<{ error: string } | { success: true }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if ("error" in result) setError(result.error);
    });
  }

  const formattedDate = new Date(pub.criado_em).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <li className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-purple-200 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[pub.tipo]}`}>
              {TYPE_LABELS[pub.tipo]}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[pub.moderacao]}`}>
              {STATUS_LABELS[pub.moderacao]}
            </span>
            {pub.moderacao === "ativo" && !pub.disponivel && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                Desativado
              </span>
            )}
          </div>

          <h3 className="text-base font-semibold text-gray-900 truncate">
            <Link
              href={`/publications/${pub.id}`}
              className="hover:text-purple-700 transition-colors"
            >
              {pub.titulo}
            </Link>
          </h3>

          <p className="text-sm text-gray-500 mt-0.5">
            {pub.category?.nome ?? "Sem categoria"} · {formattedDate}
          </p>

          {pub.moderacao === "correcao" && correctionNote && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <MessageSquareWarning className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-amber-800">{correctionNote}</p>
            </div>
          )}

          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
        </div>

        {/* Actions */}
        {!isClosed && (
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            {isPending ? (
              <Loader2 className="w-5 h-5 text-purple-600 animate-spin" aria-label="A processar..." />
            ) : (
              <>
                {/* Editar */}
                <Link
                  href={`/publications/${pub.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  aria-label={`Editar "${pub.titulo}"`}
                >
                  <Edit2 className="w-4 h-4" aria-hidden="true" />
                  Editar
                </Link>

                {/* Desativar / Ativar */}
                {pub.moderacao === "ativo" && (
                  pub.disponivel ? (
                    <button
                      onClick={() => runAction(() => deactivatePublication(pub.id))}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      aria-label={`Desativar "${pub.titulo}"`}
                    >
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                      Desativar
                    </button>
                  ) : (
                    <button
                      onClick={() => runAction(() => activatePublication(pub.id))}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      aria-label={`Ativar "${pub.titulo}"`}
                    >
                      <Eye className="w-4 h-4" aria-hidden="true" />
                      Ativar
                    </button>
                  )
                )}

                {/* Marcar como cedido */}
                {pub.moderacao === "ativo" && (
                  <button
                    onClick={() => runAction(() => markAsDonated(pub.id))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 transition-colors"
                    aria-label={`Marcar "${pub.titulo}" como cedido`}
                  >
                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                    Cedido
                  </button>
                )}

                {/* Eliminar */}
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                    aria-label={`Eliminar "${pub.titulo}"`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    Eliminar
                  </button>
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200">
                    <span className="text-sm text-red-700 font-medium">Tens a certeza?</span>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        runAction(() => deletePublication(pub.id));
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      Sim, eliminar
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2.5 py-1 text-xs font-medium rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
