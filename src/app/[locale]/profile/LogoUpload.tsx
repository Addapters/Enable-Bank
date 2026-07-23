"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, AlertCircle, CheckCircle2, ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE_BYTES = 2 * 1024 * 1024;   // 2 MB
const MIN_DIMENSION = 200;                  // px
const OUTPUT_SIZE = 400;                    // px — redimensionamento alvo

interface Props {
  currentUrl?: string | null;
  onUpload: (url: string) => void;
  /** Texto do rótulo acima da área de upload. Default: "Logo da organização" */
  label?: string;
  /** Imagem mostrada como preview quando ainda não há currentUrl (ex: avatar por defeito) */
  placeholderUrl?: string;
}

// ── Valida formato, tamanho e dimensões mínimas; devolve erro ou null ─────────
function validateFile(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      resolve("Formato inválido. Usa JPG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      resolve(`Ficheiro demasiado grande — máx. ${MAX_SIZE_BYTES / 1024 / 1024} MB (o teu tem ${(file.size / 1024 / 1024).toFixed(1)} MB).`);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth < MIN_DIMENSION || img.naturalHeight < MIN_DIMENSION) {
        resolve(`Dimensões mínimas: ${MIN_DIMENSION}×${MIN_DIMENSION} px. A tua imagem tem ${img.naturalWidth}×${img.naturalHeight} px.`);
      } else {
        resolve(null);
      }
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve("Não foi possível ler a imagem. Verifica se o ficheiro não está corrompido.");
    };
    img.src = URL.createObjectURL(file);
  });
}

// ── Redimensiona para OUTPUT_SIZE×OUTPUT_SIZE via canvas (cover + center) ─────
function resizeToSquare(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d")!;

      // Cover: escala a imagem para cobrir 400×400 mantendo a proporção
      const scale = Math.max(OUTPUT_SIZE / img.naturalWidth, OUTPUT_SIZE / img.naturalHeight);
      const scaledW = img.naturalWidth * scale;
      const scaledH = img.naturalHeight * scale;
      const offsetX = (OUTPUT_SIZE - scaledW) / 2;
      const offsetY = (OUTPUT_SIZE - scaledH) / 2;

      ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
      URL.revokeObjectURL(img.src);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("canvas.toBlob falhou")); return; }
          resolve(blob);
        },
        "image/webp",
        0.88
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Falha ao carregar imagem no canvas"));
    };
    img.src = URL.createObjectURL(file);
  });
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function LogoUpload({ currentUrl, onUpload, label = "Logo da organização", placeholderUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? placeholderUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<"idle" | "validating" | "resizing" | "uploading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);

    // 1. Validação
    setProgress("validating");
    const validationError = await validateFile(file);
    if (validationError) {
      setError(validationError);
      setUploading(false);
      setProgress("idle");
      return;
    }

    // 2. Redimensionamento para 400×400
    setProgress("resizing");
    let blob: Blob;
    try {
      blob = await resizeToSquare(file);
    } catch {
      setError("Erro ao processar a imagem. Tenta novamente.");
      setUploading(false);
      setProgress("idle");
      return;
    }

    // Preview local imediato (antes do upload)
    const localPreview = URL.createObjectURL(blob);
    setPreview(localPreview);

    // 3. Upload para Supabase Storage
    setProgress("uploading");
    const path = `logos/${crypto.randomUUID()}.webp`;
    const { data, error: upErr } = await supabase.storage
      .from("publications")
      .upload(path, blob, { contentType: "image/webp", upsert: false });

    if (upErr || !data) {
      setError("Erro ao enviar a imagem para o servidor. Tenta novamente.");
      setPreview(currentUrl ?? placeholderUrl ?? null);   // reverte preview
      URL.revokeObjectURL(localPreview);
      setUploading(false);
      setProgress("idle");
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("publications")
      .getPublicUrl(data.path);

    URL.revokeObjectURL(localPreview);
    setPreview(publicUrl);
    onUpload(publicUrl);
    setProgress("done");
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(placeholderUrl ?? null);
    setError(null);
    setProgress("idle");
    onUpload("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const progressLabel: Record<typeof progress, string> = {
    idle:       "",
    validating: "A validar…",
    resizing:   "A redimensionar para 400×400 px…",
    uploading:  "A enviar…",
    done:       "Carregado com sucesso!",
  };

  const isPlaceholder = !currentUrl && !!placeholderUrl && preview === placeholderUrl;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {label}{" "}
        <span className="text-gray-400 font-normal">(opcional)</span>
      </label>
      <p className="text-xs text-gray-400">
        JPG, PNG ou WebP · máx. 2 MB · mín. 200×200 px · será guardado como 400×400 px
      </p>

      {/* ── Preview ───────────────────────────────────────────── */}
      {preview && (
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="shrink-0 w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-white flex items-center justify-center">
            <Image
              src={preview}
              alt={label}
              width={64}
              height={64}
              className="object-contain w-full h-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            {progress === "done" ? (
              <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                Carregado e redimensionado para 400×400 px
              </p>
            ) : (
              <p className="text-xs text-gray-500">{isPlaceholder ? "Imagem por defeito" : "Imagem atual"}</p>
            )}
            {!isPlaceholder && (
              <button
                type="button"
                onClick={handleRemove}
                className="mt-1.5 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                Remover
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Drop zone (só visível sem imagem guardada ou durante upload) ─ */}
      {(!currentUrl || uploading) && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && !uploading && inputRef.current?.click()}
          aria-label="Área de upload do logo"
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all
            ${uploading ? "cursor-default" : "cursor-pointer"}
            ${dragOver && !uploading ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/30"}
          `}
        >
          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" aria-hidden="true" />
              <p className="text-sm text-purple-600 font-medium">{progressLabel[progress]}</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm text-gray-600 font-medium">
                {dragOver ? "Larga aqui" : "Arrasta ou clica para selecionar"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WebP · máx. 2 MB · mín. 200×200 px
              </p>
            </>
          )}
        </div>
      )}

      {/* ── Erro ─────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5" role="alert">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm text-red-700">
            <p className="font-medium mb-0.5">Imagem não aceite</p>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Caso especial: formato/dimensões incorretas — mostra ícone placeholder */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <ImageOff className="w-3.5 h-3.5" aria-hidden="true" />
          Requisitos: JPG/PNG/WebP · máx. 2 MB · mín. 200×200 px
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = ""; // permite re-selecionar o mesmo ficheiro
        }}
        aria-label="Selecionar logo da organização"
      />
    </div>
  );
}
