"use client";

import { useState, useTransition, useRef } from "react";
import {
  ChevronDown, ChevronRight, GripVertical, Plus, Pencil, Check, X,
  Archive, ArchiveRestore, Loader2, AlertCircle,
} from "lucide-react";
import {
  createCategory,
  updateCategory,
  toggleCategoryActive,
  reorderCategories,
} from "@/lib/admin/category-actions";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface CategoryNode {
  id: string;
  nome: string;
  slug: string;
  iso9999_code: string | null;
  ordem: number;
  ativa: boolean;
  parent_id: string | null;
  children: CategoryNode[];
}

// ── Inline edit form ──────────────────────────────────────────────────────────
function EditForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial: { nome: string; slug: string; iso9999_code: string | null };
  onSave: (nome: string, slug: string, iso9999_code: string | null) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [nome, setNome] = useState(initial.nome);
  const [slug, setSlug] = useState(initial.slug);
  const [iso, setIso] = useState(initial.iso9999_code ?? "");

  // Auto-generate slug from name (only when slug hasn't been manually edited)
  const slugEdited = useRef(false);
  const handleNomeChange = (v: string) => {
    setNome(v);
    if (!slugEdited.current) {
      setSlug(v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-end py-1" onClick={(e) => e.stopPropagation()}>
      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Nome</label>
        <input
          autoFocus
          value={nome}
          onChange={(e) => handleNomeChange(e.target.value)}
          className="border border-purple-300 rounded-lg px-2.5 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 w-48"
          placeholder="Nome da categoria"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Slug</label>
        <input
          value={slug}
          onChange={(e) => { slugEdited.current = true; setSlug(e.target.value); }}
          className="border border-purple-300 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 w-40 font-mono"
          placeholder="slug-da-categoria"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">ISO 9999</label>
        <input
          value={iso}
          onChange={(e) => setIso(e.target.value)}
          className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 w-24"
          placeholder="ex. 12.22"
        />
      </div>
      <div className="flex gap-1.5 pb-0.5">
        <button
          onClick={() => onSave(nome, slug, iso || null)}
          disabled={isPending || !nome.trim() || !slug.trim()}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-700 text-white text-sm font-medium hover:bg-purple-800 disabled:opacity-50 transition-colors"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Guardar
        </button>
        <button
          onClick={onCancel}
          disabled={isPending}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── New category form (inline at bottom of section) ───────────────────────────
function NewCategoryForm({
  parentId,
  onDone,
}: {
  parentId: string | null;
  onDone: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [iso, setIso] = useState("");
  const slugEdited = useRef(false);

  const handleNomeChange = (v: string) => {
    setNome(v);
    if (!slugEdited.current) {
      setSlug(v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  const handleSubmit = () => {
    setError("");
    if (!nome.trim() || !slug.trim()) return;
    const fd = new FormData();
    fd.append("nome", nome.trim());
    fd.append("slug", slug.trim());
    fd.append("iso9999_code", iso.trim());
    if (parentId) fd.append("parent_id", parentId);

    startTransition(async () => {
      const result = await createCategory(fd);
      if ("error" in result) { setError(result.error); return; }
      onDone();
    });
  };

  return (
    <div className={`rounded-xl border-2 border-dashed p-3 space-y-2 ${parentId ? "ml-8 border-blue-200 bg-blue-50/40" : "border-purple-200 bg-purple-50/40"}`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {parentId ? "Nova subcategoria" : "Nova categoria principal"}
      </p>
      <div className="flex flex-wrap gap-2 items-end">
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Nome *</label>
          <input
            autoFocus
            value={nome}
            onChange={(e) => handleNomeChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 w-48"
            placeholder="Nome da categoria"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Slug *</label>
          <input
            value={slug}
            onChange={(e) => { slugEdited.current = true; setSlug(e.target.value); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 w-40 font-mono"
            placeholder="slug-da-categoria"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">ISO 9999</label>
          <input
            value={iso}
            onChange={(e) => setIso(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 w-24"
            placeholder="ex. 12.22"
          />
        </div>
        <div className="flex gap-1.5 pb-0.5">
          <button
            onClick={handleSubmit}
            disabled={isPending || !nome.trim() || !slug.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-700 text-white text-sm font-medium hover:bg-purple-800 disabled:opacity-50 transition-colors"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Criar
          </button>
          <button
            onClick={onDone}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-600" role="alert">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

// ── Sub-category row ──────────────────────────────────────────────────────────
function SubRow({
  sub,
  index,
  total,
  parentId,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  sub: CategoryNode;
  index: number;
  total: number;
  parentId: string;
  onDragStart: (i: number) => void;
  onDragOver: (e: React.DragEvent, i: number) => void;
  onDrop: (i: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [optimisticActive, setOptimisticActive] = useState(sub.ativa);
  const [dragOver, setDragOver] = useState(false);

  const handleSave = (nome: string, slug: string, iso: string | null) => {
    setError("");
    startTransition(async () => {
      const result = await updateCategory(sub.id, { nome, slug, iso9999_code: iso });
      if ("error" in result) { setError(result.error); return; }
      setEditing(false);
    });
  };

  const handleToggle = () => {
    const next = !optimisticActive;
    setOptimisticActive(next);
    startTransition(async () => {
      const result = await toggleCategoryActive(sub.id, next);
      if ("error" in result) { setOptimisticActive(!next); setError(result.error); }
    });
  };

  void total; void parentId;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); onDragOver(e, index); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={() => { setDragOver(false); onDrop(index); }}
      className={`ml-8 rounded-lg border transition-all ${
        dragOver ? "border-purple-400 bg-purple-50" :
        !optimisticActive ? "border-gray-100 bg-gray-50/60 opacity-60" :
        "border-gray-100 bg-white hover:border-gray-200"
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Grip */}
        <GripVertical className="w-4 h-4 text-gray-300 shrink-0 cursor-grab active:cursor-grabbing" aria-hidden="true" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <EditForm
              initial={{ nome: sub.nome, slug: sub.slug, iso9999_code: sub.iso9999_code }}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
              isPending={isPending}
            />
          ) : (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className={`text-sm font-medium ${!optimisticActive ? "text-gray-400 line-through" : "text-gray-800"}`}>
                {sub.nome}
              </span>
              <code className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{sub.slug}</code>
              {sub.iso9999_code && (
                <span className="text-[11px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-mono">{sub.iso9999_code}</span>
              )}
              {!optimisticActive && (
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">ARQUIVADA</span>
              )}
            </div>
          )}
          {error && (
            <p className="flex items-center gap-1 text-xs text-red-600 mt-1" role="alert">
              <AlertCircle className="w-3 h-3 shrink-0" />{error}
            </p>
          )}
        </div>

        {/* Actions */}
        {!editing && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setEditing(true)}
              title="Editar"
              className="p-1.5 rounded-lg text-gray-400 hover:text-purple-700 hover:bg-purple-50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              onClick={handleToggle}
              disabled={isPending}
              title={optimisticActive ? "Arquivar" : "Ativar"}
              className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                optimisticActive
                  ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                  : "text-green-600 hover:bg-green-50"
              }`}
            >
              {isPending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : optimisticActive
                  ? <Archive className="w-3.5 h-3.5" aria-hidden="true" />
                  : <ArchiveRestore className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main category row ─────────────────────────────────────────────────────────
function MainRow({
  cat,
  index,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  cat: CategoryNode;
  index: number;
  onDragStart: (i: number) => void;
  onDragOver: (e: React.DragEvent, i: number) => void;
  onDrop: (i: number) => void;
}) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [addingSub, setAddingSub] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [optimisticActive, setOptimisticActive] = useState(cat.ativa);
  const [dragOver, setDragOver] = useState(false);

  // Sub-categories local state for optimistic reorder
  const [subs, setSubs] = useState<CategoryNode[]>(cat.children);
  const dragSubIndex = useRef<number | null>(null);

  const handleSave = (nome: string, slug: string, iso: string | null) => {
    setError("");
    startTransition(async () => {
      const result = await updateCategory(cat.id, { nome, slug, iso9999_code: iso });
      if ("error" in result) { setError(result.error); return; }
      setEditing(false);
    });
  };

  const handleToggle = () => {
    const next = !optimisticActive;
    setOptimisticActive(next);
    startTransition(async () => {
      const result = await toggleCategoryActive(cat.id, next);
      if ("error" in result) { setOptimisticActive(!next); setError(result.error); }
    });
  };

  // Sub drag-and-drop
  const handleSubDragStart = (i: number) => { dragSubIndex.current = i; };
  const handleSubDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); void i; };
  const handleSubDrop = (dropIndex: number) => {
    const from = dragSubIndex.current;
    if (from === null || from === dropIndex) return;
    const next = [...subs];
    const [moved] = next.splice(from, 1);
    next.splice(dropIndex, 0, moved);
    setSubs(next);
    dragSubIndex.current = null;
    startTransition(async () => {
      await reorderCategories(next.map((s, i) => ({ id: s.id, ordem: i + 1 })));
    });
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); onDragOver(e, index); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.stopPropagation(); setDragOver(false); onDrop(index); }}
      className={`rounded-xl border-2 overflow-hidden transition-all ${
        dragOver ? "border-purple-400 shadow-lg" :
        !optimisticActive ? "border-gray-100 opacity-60" :
        "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Header row */}
      <div className={`flex items-center gap-2 px-4 py-3 ${!optimisticActive ? "bg-gray-50" : "bg-white"}`}>
        {/* Grip */}
        <GripVertical className="w-4 h-4 text-gray-300 shrink-0 cursor-grab active:cursor-grabbing" aria-hidden="true" />

        {/* Toggle expand */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-0.5 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
          aria-expanded={open}
          aria-label={open ? "Recolher subcategorias" : "Expandir subcategorias"}
        >
          {open
            ? <ChevronDown className="w-4 h-4" aria-hidden="true" />
            : <ChevronRight className="w-4 h-4" aria-hidden="true" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <EditForm
              initial={{ nome: cat.nome, slug: cat.slug, iso9999_code: cat.iso9999_code }}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
              isPending={isPending}
            />
          ) : (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className={`font-semibold text-sm ${!optimisticActive ? "text-gray-400 line-through" : "text-gray-900"}`}>
                {cat.nome}
              </span>
              <code className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{cat.slug}</code>
              {cat.iso9999_code && (
                <span className="text-[11px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-mono">{cat.iso9999_code}</span>
              )}
              <span className="text-[11px] text-gray-400">
                {subs.length} {subs.length === 1 ? "subcategoria" : "subcategorias"}
              </span>
              {!optimisticActive && (
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">ARQUIVADA</span>
              )}
            </div>
          )}
          {error && (
            <p className="flex items-center gap-1 text-xs text-red-600 mt-1" role="alert">
              <AlertCircle className="w-3 h-3 shrink-0" />{error}
            </p>
          )}
        </div>

        {/* Actions */}
        {!editing && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setEditing(true)}
              title="Editar"
              className="p-1.5 rounded-lg text-gray-400 hover:text-purple-700 hover:bg-purple-50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              onClick={handleToggle}
              disabled={isPending}
              title={optimisticActive ? "Arquivar" : "Ativar"}
              className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                optimisticActive
                  ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                  : "text-green-600 hover:bg-green-50"
              }`}
            >
              {isPending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : optimisticActive
                  ? <Archive className="w-3.5 h-3.5" aria-hidden="true" />
                  : <ArchiveRestore className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>
            <button
              onClick={() => { setAddingSub(true); setOpen(true); }}
              title="Adicionar subcategoria"
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Subcategories + add form */}
      {open && (
        <div className={`px-4 pb-3 pt-1 space-y-2 ${!optimisticActive ? "bg-gray-50" : "bg-gray-50/50"}`}>
          {subs.map((sub, i) => (
            <SubRow
              key={sub.id}
              sub={sub}
              index={i}
              total={subs.length}
              parentId={cat.id}
              onDragStart={handleSubDragStart}
              onDragOver={handleSubDragOver}
              onDrop={handleSubDrop}
            />
          ))}

          {addingSub && (
            <NewCategoryForm parentId={cat.id} onDone={() => setAddingSub(false)} />
          )}

          {!addingSub && (
            <button
              onClick={() => setAddingSub(true)}
              className="ml-8 flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors py-1"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              Adicionar subcategoria
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Root tree ─────────────────────────────────────────────────────────────────
export default function CategoryTree({ initialTree }: { initialTree: CategoryNode[] }) {
  const [cats, setCats] = useState<CategoryNode[]>(initialTree);
  const [addingMain, setAddingMain] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dragMainIndex = useRef<number | null>(null);

  const handleMainDragStart = (i: number) => { dragMainIndex.current = i; };
  const handleMainDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); void i; };
  const handleMainDrop = (dropIndex: number) => {
    const from = dragMainIndex.current;
    if (from === null || from === dropIndex) return;
    const next = [...cats];
    const [moved] = next.splice(from, 1);
    next.splice(dropIndex, 0, moved);
    setCats(next);
    dragMainIndex.current = null;
    startTransition(async () => {
      await reorderCategories(next.map((c, i) => ({ id: c.id, ordem: i + 1 })));
    });
  };

  void isPending;

  return (
    <div className="space-y-3">
      {cats.map((cat, i) => (
        <MainRow
          key={cat.id}
          cat={cat}
          index={i}
          onDragStart={handleMainDragStart}
          onDragOver={handleMainDragOver}
          onDrop={handleMainDrop}
        />
      ))}

      {addingMain ? (
        <NewCategoryForm parentId={null} onDone={() => setAddingMain(false)} />
      ) : (
        <button
          onClick={() => setAddingMain(true)}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-purple-200 py-4 text-sm font-medium text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-all"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Adicionar categoria principal
        </button>
      )}
    </div>
  );
}
