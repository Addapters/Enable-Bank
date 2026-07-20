"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  CheckCircle, XCircle, ExternalLink, Edit2,
  Loader2, AlertCircle, Package, MapPin, Calendar, Tag,
} from "lucide-react";
import { approvePublication, rejectPublication } from "@/lib/admin/actions";

interface Photo { url: string; ordem: number }
interface Category { nome: string }
interface Publisher { nome: string; email: string; tipo: string }

interface Publication {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  publico: string;
  concelho: string;
  preco: number | null;
  criado_em: string;
  category: Category | null;
  photos: Photo[];
  user: Publisher | null;
}

const TYPE_LABEL: Record<string, string> = { doacao: "Doação", troca: "Troca", venda: "Venda" };
const TYPE_COLOR: Record<string, string> = {
  doacao: "bg-green-100 text-green-800",
  troca:  "bg-blue-100 text-blue-800",
  venda:  "bg-orange-100 text-orange-800",
};
const PUBLICO_LABEL: Record<string, string> = {
  crianca: "Criança/Jovem",
  adulto:  "Adulto",
  ambos:   "Ambos",
};

// ─── Card ─────────────────────────────────────────────────────────────────────
function PublicationCard({ pub, onDone }: { pub: Publication; onDone: (id: string) => void }) {
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [nota, setNota] = useState("");
  const [notaError, setNotaError] = useState("");
  const [actionError, setActionError] = useState("");
  const router = useRouter();

  const sortedPhotos = Array.isArray(pub.photos)
    ? [...pub.photos].sort((a, b) => a.ordem - b.ordem)
    : [];
  const date = new Date(pub.criado_em).toLocaleDateString("pt-PT", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const handleApprove = () => {
    setActionError("");
    startTransition(async () => {
      const result = await approvePublication(pub.id);
      if ("error" in result) { setActionError(result.error); return; }
      onDone(pub.id);
    });
  };

  const handleReject = () => {
    if (!nota.trim()) {
      setNotaError("A nota é obrigatória para informar o publisher.");
      return;
    }
    setNotaError("");
    setActionError("");
    startTransition(async () => {
      const result = await rejectPublication(pub.id, nota);
      if ("error" in result) { setActionError(result.error); return; }
      onDone(pub.id);
    });
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

      {/* ── Zona principal: detalhes ─────────────────────────────────── */}
      <div className="p-4 sm:p-5 space-y-4">

        {/* Badges + título + meta */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLOR[pub.tipo] ?? "bg-gray-100 text-gray-600"}`}>
              {TYPE_LABEL[pub.tipo] ?? pub.tipo}
            </span>
            {pub.tipo === "venda" && pub.preco !== null && (
              <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                {pub.preco.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}
              </span>
            )}
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              {PUBLICO_LABEL[pub.publico] ?? pub.publico}
            </span>
            {pub.category && (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                <Tag className="w-3 h-3" aria-hidden="true" />
                {pub.category.nome}
              </span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 text-base leading-snug">
            <Link
              href={`/publications/${pub.id}`}
              className="hover:text-purple-700 transition-colors inline-flex items-center gap-1.5 flex-wrap"
            >
              <span className="break-words">{pub.titulo}</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0 text-gray-400" aria-hidden="true" />
            </Link>
          </h3>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />{pub.concelho}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3 shrink-0" aria-hidden="true" />{date}
            </span>
          </div>
        </div>

        {/* Descrição */}
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {pub.descricao}
        </p>

        {/* Galeria de fotos */}
        {sortedPhotos.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {sortedPhotos.map((photo, i) => (
              <div key={photo.url} className="relative">
                <Image
                  src={photo.url}
                  alt={`Fotografia ${i + 1} de ${pub.titulo}`}
                  width={i === 0 ? 160 : 96}
                  height={i === 0 ? 160 : 96}
                  className="rounded-lg object-cover bg-gray-100"
                  style={{ width: i === 0 ? 160 : 96, height: i === 0 ? 160 : 96 }}
                />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-[10px] font-bold bg-purple-700 text-white px-1.5 py-0.5 rounded">
                    Capa
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {sortedPhotos.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <Package className="w-4 h-4 shrink-0" aria-hidden="true" />
            Sem fotografias — considera rejeitar e pedir ao publisher que adicione imagens.
          </div>
        )}
      </div>

      {/* ── Publisher ────────────────────────────────────────────────── */}
      {pub.user && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <div className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-2.5 text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
            <span className="font-semibold text-gray-800">{pub.user.nome}</span>
            <span className="capitalize text-gray-500">{pub.user.tipo}</span>
            <span className="text-gray-500 break-all">{pub.user.email}</span>
          </div>
        </div>
      )}

      {/* ── Ações ────────────────────────────────────────────────────── */}
      <div className="border-t border-gray-100 px-4 sm:px-5 py-3 flex flex-wrap gap-2">
        {/* Aprovar */}
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {isPending
            ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            : <CheckCircle className="w-4 h-4" aria-hidden="true" />}
          Aprovar
        </button>

        {/* Rejeitar */}
        <button
          onClick={() => { setShowReject((v) => !v); setNota(""); setNotaError(""); }}
          disabled={isPending}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border transition-colors disabled:opacity-50 ${
            showReject
              ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
              : "border-red-300 text-red-600 hover:bg-red-50"
          }`}
        >
          <XCircle className="w-4 h-4" aria-hidden="true" />
          Rejeitar
        </button>

        {/* Editar */}
        <Link
          href={`/publications/${pub.id}/edit`}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Edit2 className="w-4 h-4" aria-hidden="true" />
          Editar
        </Link>
      </div>

      {/* ── Painel de rejeição (inline expansível) ───────────────────── */}
      {showReject && (
        <div className="border-t border-red-100 bg-red-50 px-4 sm:px-5 py-4 space-y-3">
          <p className="text-sm font-medium text-red-800">
            Nota para o publisher{" "}
            <span className="text-red-500 font-bold" aria-hidden="true">*</span>
          </p>
          <textarea
            value={nota}
            onChange={(e) => { setNota(e.target.value); setNotaError(""); }}
            placeholder="Explica o motivo da rejeição e o que deve ser corrigido para o anúncio ser aprovado..."
            rows={3}
            aria-label="Nota de rejeição"
            aria-invalid={notaError ? "true" : undefined}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white ${
              notaError ? "border-red-400" : "border-red-200"
            }`}
          />
          {notaError && (
            <p className="text-xs text-red-600 flex items-center gap-1" role="alert">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {notaError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isPending
                ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                : <XCircle className="w-4 h-4" aria-hidden="true" />}
              Confirmar rejeição
            </button>
            <button
              onClick={() => { setShowReject(false); setNota(""); setNotaError(""); }}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── Erro de acção ─────────────────────────────────────────────── */}
      {actionError && (
        <div className="border-t border-red-100 bg-red-50 px-4 sm:px-5 py-3 flex items-center gap-2 text-sm text-red-700" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {actionError}
        </div>
      )}
    </article>
  );
}

// ─── Fila ─────────────────────────────────────────────────────────────────────
export default function ModerationQueue({ initialPubs }: { initialPubs: Publication[] }) {
  const [pubs, setPubs] = useState(initialPubs);
  const router = useRouter();

  const handleDone = (id: string) => {
    setPubs((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  };

  if (pubs.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-gray-700 mb-1">Fila limpa!</h2>
        <p className="text-sm text-gray-500">Não há anúncios pendentes de aprovação.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" aria-label="Fila de moderação">
      {pubs.map((pub) => (
        <PublicationCard key={pub.id} pub={pub} onDone={handleDone} />
      ))}
    </div>
  );
}
