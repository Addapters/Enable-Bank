"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Photo = { id: string; url: string; ordem: number };
type Props = { photos: Photo[]; title: string };

export default function PhotoGallery({ photos, title }: Props) {
  const [current, setCurrent] = useState(0);
  if (photos.length === 0) return null;
  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length);
  const next = () => setCurrent((c) => (c + 1) % photos.length);

  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[current].url} alt={`${title} — foto ${current + 1} de ${photos.length}`} className="w-full h-full object-contain" />
        {photos.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors" aria-label="Fotografia anterior"><ChevronLeft className="w-5 h-5 text-gray-700" aria-hidden="true" /></button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors" aria-label="Próxima fotografia"><ChevronRight className="w-5 h-5 text-gray-700" aria-hidden="true" /></button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5" role="tablist" aria-label="Fotos">
              {photos.map((_, i) => <button key={i} role="tab" aria-selected={i === current} aria-label={`Foto ${i + 1}`} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/50 hover:bg-white/80"}`} />)}
            </div>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Miniaturas">
          {photos.map((photo, i) => (
            <button key={photo.id} role="listitem" onClick={() => setCurrent(i)} aria-label={`Ver foto ${i + 1}`} aria-current={i === current}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === current ? "border-purple-600" : "border-transparent hover:border-gray-300"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={`Miniatura ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
