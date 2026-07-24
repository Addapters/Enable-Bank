"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { deleteMyAccount } from "@/lib/profile/actions";

export default function DeleteAccountSection() {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteMyAccount();
      if (result && "error" in result) setError(result.error);
      // em sucesso, a própria action faz redirect — não há mais nada a fazer aqui
    });
  };

  return (
    <div className="mt-6 bg-white rounded-2xl border border-red-200 p-5">
      <h2 className="text-sm font-semibold text-red-700 mb-1">Eliminar conta</h2>
      <p className="text-sm text-gray-500 mb-4">
        Elimina permanentemente a tua conta, anúncios, mensagens, avaliações e favoritos. Esta
        ação não pode ser desfeita.
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-2 text-sm font-medium text-red-700 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          Eliminar a minha conta
        </button>
      ) : (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 space-y-3">
          <p className="flex items-start gap-2 text-sm text-red-800">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            Tens a certeza? Todos os teus dados serão apagados de imediato e não é possível
            recuperá-los depois.
          </p>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="inline-flex items-center gap-2 text-sm font-semibold bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 disabled:opacity-50 transition-colors"
            >
              {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              Sim, eliminar definitivamente
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
