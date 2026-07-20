"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Filter, List, X } from "lucide-react";
import { Link } from "@/i18n/navigation";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-3 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-500">A carregar o mapa...</p>
      </div>
    </div>
  ),
});

export interface MapPublication {
  id: string;
  titulo: string;
  tipo: "doacao" | "troca" | "venda";
  categoria: string | null;
  publico: string;
  disponivel: boolean;
  lat: number;
  lng: number;
  photo_url: string | null;
  publisher_nome: string;
  publisher_tipo: string;
  publisher_verificada: boolean;
  concelho: string;
}

const TIPOS = [
  { value: "doacao", label: "Doação", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "troca",  label: "Troca",  color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "venda",  label: "Venda",  color: "bg-orange-100 text-orange-800 border-orange-200" },
];

const PUBLICOS = [
  { value: "crianca", label: "Criança/Jovem" },
  { value: "adulto",  label: "Adulto" },
  { value: "ambos",   label: "Ambos" },
];

interface Props {
  publications: MapPublication[];
  categories: { id: string; nome: string }[];
  locale: string;
  searchParams: Record<string, string>;
}

export default function MapClient({ publications, categories, locale, searchParams }: Props) {
  const [tipo, setTipo]           = useState(searchParams.tipo ?? "");
  const [publico, setPublico]     = useState(searchParams.publico ?? "");
  const [categoria, setCategoria] = useState(searchParams.categoria ?? "");
  const [disponivel, setDisponivel] = useState(searchParams.disponivel === "true");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = publications.filter((p) => {
    if (tipo && p.tipo !== tipo) return false;
    if (publico && p.publico !== publico) return false;
    if (categoria && p.categoria !== categoria) return false;
    if (disponivel && !p.disponivel) return false;
    return true;
  });

  const activeCount = [tipo, publico, categoria, disponivel ? "d" : ""].filter(Boolean).length;

  const searchHref = (() => {
    const sp = new URLSearchParams();
    if (tipo) sp.set("tipo", tipo);
    if (publico) sp.set("publico", publico);
    if (categoria) sp.set("categoria", categoria);
    if (disponivel) sp.set("disponivel", "true");
    const qs = sp.toString();
    return `/search${qs ? `?${qs}` : ""}`;
  })();

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 shrink-0">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors"
        >
          <Filter className="w-4 h-4" aria-hidden="true" />
          Filtros
          {activeCount > 0 && (
            <span className="bg-purple-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        <span className="text-gray-300">|</span>

        <span className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "anúncio" : "anúncios"} no mapa
        </span>

        <div className="ml-auto">
          <Link
            href={searchHref}
            className="flex items-center gap-1.5 text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors"
          >
            <List className="w-4 h-4" aria-hidden="true" />
            Ver lista
          </Link>
        </div>
      </div>

      {/* Filtros expandíveis */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 shrink-0">
          <div className="max-w-4xl flex flex-wrap gap-4 items-end">
            {/* Tipo */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</label>
              <div className="flex gap-1.5">
                {TIPOS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTipo(tipo === t.value ? "" : t.value)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      tipo === t.value ? t.color + " ring-2 ring-offset-1 ring-current" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Público */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Público</label>
              <div className="flex gap-1.5">
                {PUBLICOS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPublico(publico === p.value ? "" : p.value)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                      publico === p.value
                        ? "bg-purple-100 text-purple-800 border-purple-200 ring-2 ring-offset-1 ring-purple-400"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categoria */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="">Todas</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.nome}>{c.nome}</option>
                ))}
              </select>
            </div>

            {/* Disponível */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={disponivel}
                onChange={(e) => setDisponivel(e.target.checked)}
                className="accent-purple-700 w-4 h-4"
              />
              <span className="text-sm text-gray-700">Disponível imediatamente</span>
            </label>

            {/* Limpar */}
            {activeCount > 0 && (
              <button
                onClick={() => { setTipo(""); setPublico(""); setCategoria(""); setDisponivel(false); }}
                className="text-xs text-purple-700 hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" />Limpar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mapa */}
      <div className="flex-1 relative">
        <LeafletMap publications={filtered} locale={locale} />
      </div>
    </div>
  );
}
