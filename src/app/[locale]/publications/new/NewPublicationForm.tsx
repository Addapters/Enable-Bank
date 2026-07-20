"use client";

import { useActionState, useState, useTransition, useRef } from "react";
import { createPublication } from "@/lib/publications/actions";
import type { PublicationFormState } from "@/lib/publications/actions";
import PhotoUpload from "./PhotoUpload";
import FormField from "@/components/ui/FormField";
import SubmitButton from "@/components/ui/SubmitButton";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, CheckCircle2, X, ChevronDown, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CONCELHOS } from "@/lib/data/concelhos";

interface Category {
  id: string;
  nome: string;
  parent_id: string | null;
}

interface Props {
  categories: Category[];
  defaultEmail: string;
  defaultConcelho: string | null;
}

interface BankySuggestion {
  titulo: string;
  descricao: string;
  confidence: string;
  note: string;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  step,
  children,
}: {
  title: string;
  step: number;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-sm font-bold shrink-0">
          {step}
        </span>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ─── Banky suggestion card ────────────────────────────────────────────────────
function BankySuggestionCard({
  suggestion,
  onAccept,
  onDismiss,
}: {
  suggestion: BankySuggestion;
  onAccept: (titulo: string, descricao: string) => void;
  onDismiss: () => void;
}) {
  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold text-purple-800">
            Sugestão do Banky
            <span className="ml-2 text-xs font-normal text-purple-600">
              confiança {suggestion.confidence}
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar sugestão"
          className="text-purple-400 hover:text-purple-700 transition-colors"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Título sugerido</p>
        <p className="text-sm text-gray-800 font-medium">{suggestion.titulo}</p>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Descrição sugerida</p>
        <p className="text-sm text-gray-700 line-clamp-3">{suggestion.descricao}</p>
      </div>
      <p className="text-xs text-purple-600">{suggestion.note}</p>

      <button
        type="button"
        onClick={() => onAccept(suggestion.titulo, suggestion.descricao)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-purple-700 text-white hover:bg-purple-800 transition-colors"
      >
        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
        Aceitar sugestão
      </button>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────
export default function NewPublicationForm({
  categories,
  defaultEmail,
  defaultConcelho,
}: Props) {
  const [state, dispatch, isActionPending] = useActionState<
    PublicationFormState,
    FormData
  >(createPublication, undefined);

  // Separate transition to wrap dispatch (fixes "called outside transition" error)
  const [, startActionTransition] = useTransition();

  const errors =
    state && "errors" in state ? (state.errors as Record<string, string>) : {};
  const serverMessage =
    state && "message" in state ? state.message : undefined;

  // Upload state (client-side upload to Supabase Storage)
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Combined pending: uploading OR server action running
  const isPending = isUploading || isActionPending;

  // Photos
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Banky
  const [bankyState, setBankyState] = useState<"idle" | "loading" | "done">("idle");
  const [bankySuggestion, setBankySuggestion] = useState<BankySuggestion | null>(null);
  const [, startBankyTransition] = useTransition();

  // Controlled inputs (allow Banky autofill)
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  // Tipo de transação (controla visibilidade do campo preço)
  const [selectedTipo, setSelectedTipo] = useState<"doacao" | "troca" | "venda" | "">("");

  // Category cascading
  const mainCategories = categories.filter((c) => c.parent_id === null);
  const [selectedMain, setSelectedMain] = useState("");
  const subCategories = categories.filter((c) => c.parent_id === selectedMain);
  const [selectedSub, setSelectedSub] = useState("");
  const categoriaId = selectedSub || selectedMain;

  const formRef = useRef<HTMLFormElement>(null);

  const handlePhotosChange = (newFiles: File[], newPreviews: string[]) => {
    setPhotos(newFiles);
    setPreviews(newPreviews);
    setBankySuggestion(null);
    setBankyState("idle");
    setUploadError(null);
  };

  const handleBankyAnalyze = () => {
    if (photos.length === 0) return;
    setBankyState("loading");
    startBankyTransition(async () => {
      try {
        const res = await fetch("/api/banky/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoCount: photos.length }),
        });
        const data = await res.json();
        setBankySuggestion(data);
        setBankyState("done");
      } catch {
        setBankyState("idle");
      }
    });
  };

  const handleBankyAccept = (t: string, d: string) => {
    setTitulo(t);
    setDescricao(d);
    setBankySuggestion(null);
  };

  // ── Submit: upload fotos no cliente → passar URLs → Server Action ────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploadError(null);

    // Captura o form ANTES de qualquer await — e.currentTarget fica null depois
    const formEl = formRef.current!;

    if (photos.length === 0) {
      const fd = new FormData(formEl);
      fd.set("categoria_id", categoriaId);
      startActionTransition(() => dispatch(fd));
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUploadError("A tua sessão expirou. Faz login novamente.");
        setIsUploading(false);
        return;
      }

      // Upload cada foto para Supabase Storage
      const photoUrls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${user.id}/pending/${Date.now()}_${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("publications")
          .upload(path, file, { contentType: file.type, upsert: true });

        if (uploadError) {
          throw new Error(`Erro ao carregar a fotografia ${i + 1}: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from("publications")
          .getPublicUrl(path);

        photoUrls.push(urlData.publicUrl);
      }

      // Constrói FormData a partir do formRef (não do evento, que já é null)
      const fd = new FormData(formEl);
      photoUrls.forEach((url) => fd.append("photo_urls", url));
      fd.set("categoria_id", categoriaId);

      setIsUploading(false);

      startActionTransition(() => dispatch(fd));
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Erro ao carregar as fotografias."
      );
      setIsUploading(false);
    }
  };

  // ── Ecrã de sucesso ──────────────────────────────────────────────────────────
  if (state && "success" in state) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="w-8 h-8 text-green-600" aria-hidden="true" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">
            Anúncio submetido com sucesso!
          </h2>
          <p className="text-sm text-gray-600 max-w-sm mx-auto">
            O teu anúncio foi submetido com sucesso e ficará visível após revisão
            pela equipa Enable Bank. Receberás uma notificação quando for aprovado.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-700 text-white text-sm font-semibold rounded-xl hover:bg-purple-800 transition-colors"
          >
            Ver o meu dashboard
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Publicar outro anúncio
          </button>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {serverMessage}
        </div>
      )}

      {/* ── 1. Fotografias ──────────────────────────────────────────── */}
      <Section step={1} title="Fotografias">
        <PhotoUpload
          files={photos}
          previews={previews}
          error={errors.photos}
          onChange={handlePhotosChange}
        />

        {photos.length > 0 && bankyState !== "done" && (
          <button
            type="button"
            onClick={handleBankyAnalyze}
            disabled={bankyState === "loading"}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            {bankyState === "loading" ? "O Banky está a analisar..." : "Analisar com Banky"}
          </button>
        )}

        {bankySuggestion && (
          <BankySuggestionCard
            suggestion={bankySuggestion}
            onAccept={handleBankyAccept}
            onDismiss={() => setBankySuggestion(null)}
          />
        )}
      </Section>

      {/* ── 2. Detalhes do produto ──────────────────────────────────── */}
      <Section step={2} title="Detalhes do produto">
        <FormField
          id="titulo"
          label="Título"
          required
          value={titulo}
          onChange={(e) => setTitulo((e.target as HTMLInputElement).value)}
          name="titulo"
          placeholder="Ex: Cadeira de rodas manual em bom estado"
          maxLength={120}
          error={errors.titulo}
          hint="Descreve o produto de forma clara e concisa (máx. 120 caracteres)."
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="descricao" className="text-sm font-medium text-gray-700">
            Descrição <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          </label>
          <p id="descricao-hint" className="text-xs text-gray-500">
            Inclui dimensões, estado de conservação, marcas ou características relevantes.
          </p>
          <textarea
            id="descricao"
            name="descricao"
            rows={5}
            required
            aria-describedby={errors.descricao ? "descricao-error descricao-hint" : "descricao-hint"}
            aria-invalid={errors.descricao ? "true" : undefined}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descreve o produto, o seu estado e qualquer informação útil para quem procura..."
            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none ${
              errors.descricao ? "border-red-400 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400"
            }`}
          />
          <div className="flex justify-between items-center">
            {errors.descricao ? (
              <p id="descricao-error" className="text-xs text-red-600" role="alert">
                {errors.descricao}
              </p>
            ) : (
              <span />
            )}
            <span className={`text-xs tabular-nums ${descricao.length < 20 ? "text-gray-400" : "text-gray-500"}`}>
              {descricao.length} car.
            </span>
          </div>
        </div>
      </Section>

      {/* ── 3. Classificação ───────────────────────────────────────── */}
      <Section step={3} title="Classificação">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="cat-main" className="text-sm font-medium text-gray-700">
              Categoria <span className="text-red-500 ml-1" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <select
                id="cat-main"
                value={selectedMain}
                onChange={(e) => { setSelectedMain(e.target.value); setSelectedSub(""); }}
                aria-invalid={errors.categoria_id ? "true" : undefined}
                className={`w-full appearance-none rounded-lg border px-3 py-2.5 pr-8 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                  errors.categoria_id ? "border-red-400 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400"
                }`}
              >
                <option value="">Seleciona uma categoria</option>
                {mainCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            </div>
            {errors.categoria_id && (
              <p className="text-xs text-red-600" role="alert">{errors.categoria_id}</p>
            )}
          </div>

          {selectedMain && subCategories.length > 0 && (
            <div className="flex flex-col gap-1">
              <label htmlFor="cat-sub" className="text-sm font-medium text-gray-700">
                Subcategoria
              </label>
              <div className="relative">
                <select
                  id="cat-sub"
                  value={selectedSub}
                  onChange={(e) => setSelectedSub(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-8 text-sm text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="">Todas as subcategorias</option>
                  {subCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              </div>
            </div>
          )}
        </div>

        <input type="hidden" name="categoria_id" value={categoriaId} />

        <div className="grid sm:grid-cols-3 gap-4">
          {/* Tipo */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">
              Tipo de transação <span className="text-red-500" aria-hidden="true">*</span>
            </legend>
            <div className="space-y-2">
              {[
                { value: "doacao", label: "Doação", color: "peer-checked:border-green-500 peer-checked:bg-green-50" },
                { value: "troca", label: "Troca", color: "peer-checked:border-blue-500 peer-checked:bg-blue-50" },
                { value: "venda", label: "Venda", color: "peer-checked:border-orange-500 peer-checked:bg-orange-50" },
              ].map(({ value, label, color }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo"
                    value={value}
                    className="peer sr-only"
                    required
                    onChange={() => setSelectedTipo(value as "doacao" | "troca" | "venda")}
                  />
                  <span className={`flex-1 rounded-lg border-2 border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-all ${color}`}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
            {errors.tipo && <p className="mt-1 text-xs text-red-600" role="alert">{errors.tipo}</p>}
          </fieldset>

          {/* Público */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">
              Público-alvo <span className="text-red-500" aria-hidden="true">*</span>
            </legend>
            <div className="space-y-2">
              {[
                { value: "crianca", label: "Criança / Jovem" },
                { value: "adulto", label: "Adulto" },
                { value: "ambos", label: "Ambos" },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="publico" value={value} className="peer sr-only" required />
                  <span className="flex-1 rounded-lg border-2 border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-all peer-checked:border-purple-500 peer-checked:bg-purple-50">
                    {label}
                  </span>
                </label>
              ))}
            </div>
            {errors.publico && <p className="mt-1 text-xs text-red-600" role="alert">{errors.publico}</p>}
          </fieldset>

          {/* Estado */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">
              Estado do produto <span className="text-red-500" aria-hidden="true">*</span>
            </legend>
            <div className="space-y-2">
              {[
                { value: "novo", label: "Novo" },
                { value: "bom", label: "Bom estado" },
                { value: "usado", label: "Usado" },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="estado" value={value} className="peer sr-only" required />
                  <span className="flex-1 rounded-lg border-2 border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-all peer-checked:border-purple-500 peer-checked:bg-purple-50">
                    {label}
                  </span>
                </label>
              ))}
            </div>
            {errors.estado && <p className="mt-1 text-xs text-red-600" role="alert">{errors.estado}</p>}
          </fieldset>
        </div>

        {/* Campo preço — só aparece para Venda */}
        {selectedTipo === "venda" && (
          <div className="flex flex-col gap-1">
            <label htmlFor="preco" className="text-sm font-medium text-gray-700">
              Preço <span className="text-red-500 ml-1" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                €
              </span>
              <input
                id="preco"
                name="preco"
                type="number"
                min="0"
                step="0.01"
                required={selectedTipo === "venda"}
                placeholder="0,00"
                aria-describedby={errors.preco ? "preco-error" : undefined}
                aria-invalid={errors.preco ? "true" : undefined}
                className={`w-full rounded-lg border pl-7 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent ${
                  errors.preco ? "border-red-400 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400"
                }`}
              />
            </div>
            {errors.preco && (
              <p id="preco-error" className="text-xs text-red-600" role="alert">{errors.preco}</p>
            )}
          </div>
        )}
      </Section>

      {/* ── 4. Localização & Disponibilidade ───────────────────────── */}
      <Section step={4} title="Localização e disponibilidade">
        <FormField
          as="select"
          id="concelho"
          name="concelho"
          label="Concelho"
          required
          defaultValue={defaultConcelho ?? ""}
          error={errors.concelho}
        >
          <option value="">Seleciona o concelho</option>
          {CONCELHOS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </FormField>

        <FormField
          id="codigo_postal"
          name="codigo_postal"
          label="Código postal (4 dígitos)"
          required
          placeholder="Ex: 4000"
          maxLength={4}
          inputMode="numeric"
          pattern="[0-9]{4}"
          error={errors.codigo_postal}
          hint="Usado para localização no mapa."
        />

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="disponivel"
            defaultChecked
            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
          />
          <div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
              Disponível imediatamente
            </span>
            <p className="text-xs text-gray-500">
              Desmarca se ainda não está disponível para entrega.
            </p>
          </div>
        </label>
      </Section>

      {/* ── 5. Contacto ────────────────────────────────────────────── */}
      <Section step={5} title="Contacto">
        <p className="text-sm text-gray-500 -mt-2">
          Os contactos só são visíveis para utilizadores autenticados.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            id="email_contacto"
            name="email_contacto"
            label="Email de contacto"
            type="email"
            required
            defaultValue={defaultEmail}
            placeholder="email@exemplo.pt"
            error={errors.email_contacto}
          />
          <FormField
            id="telefone"
            name="telefone"
            label="Telefone (opcional)"
            type="tel"
            placeholder="+351 9XX XXX XXX"
            error={errors.telefone}
          />
        </div>
      </Section>

      {/* ── Submit ─────────────────────────────────────────────────── */}
      <div className="pt-2 space-y-3">
        {uploadError && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            {uploadError}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          aria-disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              A carregar fotografias...
            </>
          ) : isActionPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              A publicar...
            </>
          ) : (
            "Publicar anúncio"
          )}
        </button>

        <p className="text-center text-xs text-gray-500">
          O anúncio ficará em revisão até ser aprovado pela equipa Enable Bank.
        </p>
      </div>
    </form>
  );
}
