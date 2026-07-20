"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  BadgeCheck, XCircle, RotateCcw, ChevronDown, ChevronUp,
  Building2, Mail, Phone, MapPin, Globe, User, Loader2, AlertCircle,
} from "lucide-react";
import { verifyEntity, rejectEntity, revokeVerification } from "@/lib/admin/entity-actions";

interface EntityData {
  id: string;
  nome: string;
  tipo: string | null;
  nif: string | null;
  morada: string | null;
  concelho: string | null;
  website: string | null;
  telefone: string | null;
  email_contacto: string | null;
  pessoa_contacto_nome: string | null;
  pessoa_contacto_cargo: string | null;
  descricao: string | null;
  logo_url: string | null;
  verificada: boolean;
  verificada_em: string | null;
  rejeitada: boolean;
  nota_rejeicao: string | null;
  criado_em: string;
  user: { nome: string; email: string } | null;
}

const TIPO_LABEL: Record<string, string> = {
  IPSS: "IPSS", municipio: "Município", misericordia: "Misericórdia",
  clinica: "Clínica / Hospital", associacao: "Associação", outro: "Outro",
};

export default function EntityRowCard({ entity }: { entity: EntityData }) {
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [nota, setNota] = useState("");
  const [notaError, setNotaError] = useState("");
  const [actionError, setActionError] = useState("");

  const date = new Date(entity.criado_em).toLocaleDateString("pt-PT", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const handleVerify = () => {
    setActionError("");
    startTransition(async () => {
      const result = await verifyEntity(entity.id);
      if ("error" in result) setActionError(result.error);
    });
  };

  const handleReject = () => {
    if (!nota.trim()) { setNotaError("A nota é obrigatória."); return; }
    setNotaError("");
    setActionError("");
    startTransition(async () => {
      const result = await rejectEntity(entity.id, nota);
      if ("error" in result) setActionError(result.error);
      else setShowReject(false);
    });
  };

  const handleRevoke = () => {
    setActionError("");
    startTransition(async () => {
      const result = await revokeVerification(entity.id);
      if ("error" in result) setActionError(result.error);
    });
  };

  const statusBadge = entity.verificada
    ? <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700"><BadgeCheck className="w-3 h-3" />Verificada</span>
    : entity.rejeitada
      ? <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700"><XCircle className="w-3 h-3" />Rejeitada</span>
      : <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Pendente</span>;

  return (
    <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="px-4 sm:px-5 py-4 flex items-start gap-3">
        {/* Logo */}
        <div className="shrink-0 w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
          {entity.logo_url ? (
            <Image src={entity.logo_url} alt={entity.nome} width={48} height={48} className="object-contain p-1" />
          ) : (
            <Building2 className="w-6 h-6 text-gray-300" aria-hidden="true" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="font-semibold text-gray-900 text-sm">{entity.nome}</span>
            {entity.tipo && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{TIPO_LABEL[entity.tipo] ?? entity.tipo}</span>
            )}
            {statusBadge}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400">
            {entity.user && <span>{entity.user.email}</span>}
            {entity.concelho && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{entity.concelho}</span>}
            <span>{date}</span>
          </div>
        </div>

        {/* Expand */}
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Detalhes expandidos ───────────────────────────── */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 sm:px-5 py-4 space-y-4 bg-gray-50/50">

          {/* Campos detalhados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {entity.nif && <DetailItem icon={<Building2 className="w-3.5 h-3.5" />} label="NIF/NIPC" value={entity.nif} />}
            {entity.morada && <DetailItem icon={<MapPin className="w-3.5 h-3.5" />} label="Morada" value={entity.morada} />}
            {entity.email_contacto && <DetailItem icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={entity.email_contacto} />}
            {entity.telefone && <DetailItem icon={<Phone className="w-3.5 h-3.5" />} label="Telefone" value={entity.telefone} />}
            {entity.website && <DetailItem icon={<Globe className="w-3.5 h-3.5" />} label="Website" value={entity.website} />}
            {entity.pessoa_contacto_nome && (
              <DetailItem icon={<User className="w-3.5 h-3.5" />} label="Pessoa de contacto"
                value={`${entity.pessoa_contacto_nome}${entity.pessoa_contacto_cargo ? ` — ${entity.pessoa_contacto_cargo}` : ""}`} />
            )}
          </div>

          {entity.descricao && (
            <p className="text-sm text-gray-600 bg-white rounded-lg border border-gray-100 px-3 py-2 leading-relaxed">
              {entity.descricao}
            </p>
          )}

          {entity.rejeitada && entity.nota_rejeicao && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
              <span className="font-semibold">Motivo de rejeição: </span>{entity.nota_rejeicao}
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-wrap gap-2 pt-1">
            {!entity.verificada && (
              <button
                onClick={handleVerify}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-50 transition-colors"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
                Verificar
              </button>
            )}

            {entity.verificada && (
              <button
                onClick={handleRevoke}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                Revogar verificação
              </button>
            )}

            {!entity.verificada && !showReject && (
              <button
                onClick={() => setShowReject(true)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Rejeitar
              </button>
            )}
          </div>

          {/* Painel de rejeição */}
          {showReject && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 space-y-3">
              <p className="text-sm font-medium text-red-800">Motivo de rejeição <span className="text-red-500">*</span></p>
              <textarea
                value={nota}
                onChange={(e) => { setNota(e.target.value); setNotaError(""); }}
                rows={2}
                placeholder="Explica o motivo e o que deve ser corrigido…"
                className={`w-full rounded-lg border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 bg-white ${notaError ? "border-red-400" : "border-red-200"}`}
              />
              {notaError && <p className="text-xs text-red-600 flex items-center gap-1" role="alert"><AlertCircle className="w-3.5 h-3.5" />{notaError}</p>}
              <div className="flex gap-2">
                <button onClick={handleReject} disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}Confirmar
                </button>
                <button onClick={() => { setShowReject(false); setNota(""); setNotaError(""); }}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {actionError && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0" />{actionError}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <span className="text-xs text-gray-400 block">{label}</span>
        <span className="text-gray-700 break-words">{value}</span>
      </div>
    </div>
  );
}
