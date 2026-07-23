"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import { X, SlidersHorizontal, BadgeCheck } from "lucide-react";
import { clsx } from "clsx";
import type { CategoryRow } from "@/types/database";

type Props = { categories: Pick<CategoryRow, "id" | "nome" | "slug">[] };

const TIPOS = [
  { value: "doacao", label: "Doação",  color: "bg-green-100 text-green-800 border-green-200" },
  { value: "troca",  label: "Troca",   color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "venda",  label: "Venda",   color: "bg-orange-100 text-orange-800 border-orange-200" },
];

const PUBLICOS = [
  { value: "crianca", label: "Criança/Jovem" },
  { value: "adulto",  label: "Adulto" },
  { value: "ambos",   label: "Ambos" },
];

export default function SearchFilters({ categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const entidadeInputRef = useRef<HTMLInputElement>(null);

  const updateParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const toggleParam = useCallback((key: string, value: string) => {
    updateParam(key, searchParams.get(key) === value ? null : value);
  }, [searchParams, updateParam]);

  const activeFiltersCount = ["tipo", "publico", "categoria", "disponivel", "entidade_verificada", "entidade"].filter((k) => searchParams.has(k)).length;
  const clearAll = () => {
    const q = searchParams.get("q");
    router.push(`${pathname}${q ? `?q=${q}` : ""}`);
  };

  const currentTipo             = searchParams.get("tipo");
  const currentPublico          = searchParams.get("publico");
  const currentCategoria        = searchParams.get("categoria");
  const currentDisponivel       = searchParams.get("disponivel");
  const currentVerificada       = searchParams.get("entidade_verificada");
  const currentEntidade         = searchParams.get("entidade") ?? "";

  const handleEntidadeSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const val = (e.target as HTMLInputElement).value.trim();
      updateParam("entidade", val || null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="bg-purple-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button onClick={clearAll} className="text-xs text-purple-700 hover:underline flex items-center gap-1">
            <X className="w-3 h-3" aria-hidden="true" />Limpar tudo
          </button>
        )}
      </div>

      {/* Tipo de transação */}
      <fieldset>
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tipo de transação</legend>
        <div className="flex flex-wrap gap-2">
          {TIPOS.map((t) => (
            <button key={t.value} onClick={() => toggleParam("tipo", t.value)} aria-pressed={currentTipo === t.value}
              className={clsx("text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
                currentTipo === t.value ? t.color + " ring-2 ring-offset-1 ring-current" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100")}>
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Público */}
      <fieldset>
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Público</legend>
        <div className="flex flex-col gap-1.5">
          {PUBLICOS.map((p) => (
            <label key={p.value} className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="publico" value={p.value} checked={currentPublico === p.value}
                onChange={() => toggleParam("publico", p.value)} className="accent-purple-700 w-4 h-4" />
              <span className="text-sm text-gray-700 group-hover:text-purple-700">{p.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Categoria */}
      <fieldset>
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Categoria</legend>
        <select value={currentCategoria ?? ""} onChange={(e) => updateParam("categoria", e.target.value || null)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
          aria-label="Filtrar por categoria">
          <option value="">Todas as categorias</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.nome}</option>)}
        </select>
      </fieldset>

      {/* Disponibilidade */}
      <fieldset>
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Disponibilidade</legend>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" checked={currentDisponivel === "true"}
            onChange={(e) => updateParam("disponivel", e.target.checked ? "true" : null)}
            className="accent-purple-700 w-4 h-4 rounded" />
          <span className="text-sm text-gray-700 group-hover:text-purple-700">Disponível imediatamente</span>
        </label>
      </fieldset>

      {/* Entidades */}
      <fieldset className="border-t border-gray-100 pt-4">
        <legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Entidades</legend>

        {/* Apenas verificadas */}
        <label className="flex items-start gap-2 cursor-pointer group mb-3">
          <input type="checkbox" checked={currentVerificada === "true"}
            onChange={(e) => updateParam("entidade_verificada", e.target.checked ? "true" : null)}
            className="accent-purple-700 w-4 h-4 rounded shrink-0 mt-0.5" />
          <span className="text-sm text-gray-700 group-hover:text-purple-700 flex items-start gap-1 min-w-0">
            <BadgeCheck className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="min-w-0">Apenas entidades verificadas</span>
          </span>
        </label>

        {/* Pesquisa por nome de entidade */}
        <div className="space-y-1">
          <label className="text-xs text-gray-500" htmlFor="filtro-entidade">Nome da entidade</label>
          <div className="flex gap-1">
            <input
              id="filtro-entidade"
              ref={entidadeInputRef}
              type="text"
              defaultValue={currentEntidade}
              onKeyDown={handleEntidadeSearch}
              placeholder="Ex: Addapters Org"
              className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-700"
            />
            <button
              type="button"
              onClick={() => {
                const val = entidadeInputRef.current?.value.trim() ?? "";
                updateParam("entidade", val || null);
              }}
              className="px-2.5 py-1.5 bg-purple-700 text-white text-xs font-medium rounded-lg hover:bg-purple-800 transition-colors shrink-0"
            >
              OK
            </button>
          </div>
          {currentEntidade && (
            <button
              onClick={() => { updateParam("entidade", null); if (entidadeInputRef.current) entidadeInputRef.current.value = ""; }}
              className="text-xs text-purple-700 hover:underline flex items-center gap-0.5"
            >
              <X className="w-3 h-3" />Limpar
            </button>
          )}
        </div>
      </fieldset>
    </div>
  );
}
