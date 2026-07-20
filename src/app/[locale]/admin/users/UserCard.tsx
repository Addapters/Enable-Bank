"use client";

import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import {
  UserCircle, ShieldOff, ShieldCheck, Trash2,
  Loader2, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { suspendUser, unsuspendUser, deleteUser } from "@/lib/admin/user-actions";

interface UserData {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  role: string;
  concelho: string | null;
  criado_em: string;
  suspended: boolean;
  pubCount: number;
  pubAtivo: number;
}

export default function UserCard({ user }: { user: UserData }) {
  const [isPending, startTransition] = useTransition();
  const [showDelete, setShowDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [actionError, setActionError] = useState("");
  const [optimisticSuspended, setOptimisticSuspended] = useState(user.suspended);

  const date = new Date(user.criado_em).toLocaleDateString("pt-PT", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const handleSuspend = () => {
    setActionError("");
    startTransition(async () => {
      const result = optimisticSuspended
        ? await unsuspendUser(user.id)
        : await suspendUser(user.id);
      if ("error" in result) { setActionError(result.error); return; }
      setOptimisticSuspended((v) => !v);
    });
  };

  const handleDelete = () => {
    setActionError("");
    startTransition(async () => {
      const result = await deleteUser(user.id);
      if ("error" in result) { setActionError(result.error); setShowDelete(false); }
      // em caso de sucesso, o router.refresh() via revalidatePath remove o card
    });
  };

  return (
    <article className={`bg-white rounded-2xl border overflow-hidden transition-colors ${optimisticSuspended ? "border-red-200 bg-red-50/30" : "border-gray-200"}`}>

      {/* ── Linha principal ─────────────────────────────────────── */}
      <div className="px-4 sm:px-5 py-4 flex flex-wrap items-start gap-3">

        {/* Avatar + nome + email */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base font-bold
            ${optimisticSuspended ? "bg-red-100 text-red-600" : user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"}`}>
            {user.nome.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-gray-900 text-sm truncate">{user.nome}</span>
              {user.role === "admin" && (
                <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">ADMIN</span>
              )}
              <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                user.tipo === "entidade" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
              }`}>
                {user.tipo === "entidade" ? "Entidade" : "Particular"}
              </span>
              {optimisticSuspended && (
                <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">SUSPENSO</span>
              )}
            </div>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>

        {/* Stats + data + toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Anúncios</p>
            <p className="text-sm font-semibold text-gray-900">
              {user.pubCount}
              {user.pubAtivo > 0 && (
                <span className="ml-1 text-xs font-normal text-green-600">({user.pubAtivo} ativos)</span>
              )}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Registado</p>
            <p className="text-xs text-gray-600">{date}</p>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? "Fechar detalhes" : "Ver detalhes e ações"}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Painel expandido ────────────────────────────────────── */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 sm:px-5 py-4 space-y-4">

          {/* Detalhes extra (mobile) */}
          <div className="sm:hidden flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-xs text-gray-400 block">Anúncios</span>
              <span className="font-semibold">{user.pubCount}</span>
              {user.pubAtivo > 0 && <span className="ml-1 text-xs text-green-600">({user.pubAtivo} ativos)</span>}
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Registado</span>
              <span>{date}</span>
            </div>
            {user.concelho && (
              <div>
                <span className="text-xs text-gray-400 block">Localização</span>
                <span>{user.concelho}</span>
              </div>
            )}
          </div>

          {/* Localização (desktop) */}
          {user.concelho && (
            <p className="hidden sm:block text-sm text-gray-500">
              <span className="text-gray-400">Localização: </span>{user.concelho}
            </p>
          )}

          {/* Ações */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/users/${user.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <UserCircle className="w-4 h-4" aria-hidden="true" />
              Ver perfil
            </Link>

            {/* Suspender / Reativar — não aparece para admins */}
            {user.role !== "admin" && (
              <button
                onClick={handleSuspend}
                disabled={isPending}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                  optimisticSuspended
                    ? "border-green-300 text-green-700 hover:bg-green-50"
                    : "border-amber-300 text-amber-700 hover:bg-amber-50"
                }`}
              >
                {isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  : optimisticSuspended
                    ? <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    : <ShieldOff className="w-4 h-4" aria-hidden="true" />}
                {optimisticSuspended ? "Reativar" : "Suspender"}
              </button>
            )}

            {/* Eliminar — não aparece para admins */}
            {user.role !== "admin" && !showDelete && (
              <button
                onClick={() => setShowDelete(true)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                Eliminar
              </button>
            )}
          </div>

          {/* Confirmação de eliminação */}
          {showDelete && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 space-y-3">
              <p className="text-sm font-medium text-red-800">
                Tens a certeza? Esta ação é irreversível — elimina a conta, todos os anúncios e dados do utilizador.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    : <Trash2 className="w-4 h-4" aria-hidden="true" />}
                  Sim, eliminar permanentemente
                </button>
                <button
                  onClick={() => setShowDelete(false)}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Erro */}
          {actionError && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              {actionError}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
