"use client";

import { useRef, useCallback } from "react";
import { Upload, X, ImagePlus, AlertCircle } from "lucide-react";
import Image from "next/image";

const MAX_PHOTOS = 5;
const MAX_SIZE_MB = 10;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic"];

interface Props {
  files: File[];
  previews: string[];
  error?: string;
  onChange: (files: File[], previews: string[]) => void;
}

export default function PhotoUpload({ files, previews, error, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const newFiles: File[] = [];
      const newPreviews: string[] = [];

      Array.from(incoming).forEach((file) => {
        if (files.length + newFiles.length >= MAX_PHOTOS) return;
        if (!ACCEPTED.includes(file.type)) return;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) return;
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      });

      onChange([...files, ...newFiles], [...previews, ...newPreviews]);
    },
    [files, previews, onChange]
  );

  const remove = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    onChange(
      files.filter((_, i) => i !== index),
      previews.filter((_, i) => i !== index)
    );
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const canAdd = files.length < MAX_PHOTOS;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {canAdd && (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Adicionar fotografias"
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors
            ${error ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50"}`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <ImagePlus className="w-6 h-6 text-purple-600" aria-hidden="true" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              Arrasta fotografias para aqui ou{" "}
              <span className="text-purple-700 underline underline-offset-2">
                clica para selecionar
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPEG, PNG, WebP · Máx. {MAX_SIZE_MB} MB por foto ·{" "}
              {MAX_PHOTOS - files.length} restante
              {MAX_PHOTOS - files.length !== 1 ? "s" : ""}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            multiple
            className="sr-only"
            onChange={(e) => addFiles(e.target.files)}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Preview grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {previews.map((src, i) => (
            <div
              key={src}
              className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
            >
              <Image
                src={src}
                alt={`Fotografia ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, 20vw"
              />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded text-[10px] font-bold bg-purple-700 text-white px-1.5 py-0.5">
                  Capa
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remover fotografia ${i + 1}`}
                className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}

          {/* Add more button inline (when < 5) */}
          {canAdd && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-label="Adicionar mais fotografias"
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-600 transition-colors"
            >
              <Upload className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
