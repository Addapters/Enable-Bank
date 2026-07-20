"use client";

import { useEffect, useRef } from "react";
import type { MapPublication } from "./MapClient";
import type * as Leaflet from "leaflet";

const TIPO_COLOR: Record<string, string> = {
  doacao: "#16a34a",
  troca:  "#2563eb",
  venda:  "#ea580c",
};

const TIPO_LABEL: Record<string, string> = {
  doacao: "Doação",
  troca:  "Troca",
  venda:  "Venda",
};

const PUBLICO_LABEL: Record<string, string> = {
  crianca: "Criança/Jovem",
  adulto:  "Adulto",
  ambos:   "Ambos",
};

function createMarkerHtml(tipo: string, isVerifiedEntity: boolean): string {
  const color = isVerifiedEntity ? "#7c3aed" : (TIPO_COLOR[tipo] ?? "#6b7280");
  const inner = isVerifiedEntity ? "🏛" : "";
  return `<div style="
    width:28px;height:28px;
    background:${color};
    border:2.5px solid white;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    box-shadow:0 2px 6px rgba(0,0,0,.3);
    display:flex;align-items:center;justify-content:center;
  "><span style="transform:rotate(45deg);font-size:11px;line-height:1;">${inner}</span></div>`;
}

function createPopupHtml(pub: MapPublication, locale: string): string {
  const color = pub.publisher_verificada ? "#7c3aed" : (TIPO_COLOR[pub.tipo] ?? "#6b7280");
  const label = TIPO_LABEL[pub.tipo] ?? pub.tipo;
  const photo = pub.photo_url
    ? `<img src="${pub.photo_url}" alt="" style="width:100%;height:110px;object-fit:cover;border-radius:8px 8px 0 0;display:block;" />`
    : `<div style="width:100%;height:40px;background:#f3f4f6;border-radius:8px 8px 0 0;"></div>`;
  return `
    <div style="width:220px;font-family:system-ui,sans-serif;overflow:hidden;">
      ${photo}
      <div style="padding:10px 12px 12px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <span style="background:${color};color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;">${label}</span>
          ${pub.categoria ? `<span style="color:#9ca3af;font-size:10px;">${pub.categoria}</span>` : ""}
        </div>
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#111827;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${pub.titulo}</p>
        <p style="margin:0 0 4px;font-size:11px;color:#6b7280;">${pub.publisher_nome}${pub.publisher_verificada ? " ✓" : ""}</p>
        <p style="margin:0 0 10px;font-size:11px;color:#9ca3af;">${pub.concelho} · ${PUBLICO_LABEL[pub.publico] ?? pub.publico}</p>
        <a href="/${locale}/publications/${pub.id}"
          style="display:block;text-align:center;background:#7c3aed;color:white;font-size:12px;font-weight:600;padding:7px 12px;border-radius:8px;text-decoration:none;">
          Ver anúncio →
        </a>
      </div>
    </div>`;
}

interface Props {
  publications: MapPublication[];
  locale: string;
}

export default function LeafletMap({ publications, locale }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<Leaflet.Map | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef         = useRef<any>(null);
  const layerRef     = useRef<Leaflet.LayerGroup | null>(null);
  const readyRef     = useRef(false);

  // ── Inicialização do mapa (uma só vez) ──────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    async function init() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current || mapRef.current) return;

      // Fix ícones default no Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: [39.5, -8.0],
        zoom: 7,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      LRef.current   = L;
      mapRef.current = map;
      readyRef.current = true;

      addMarkers(L, map, publications);
    }

    init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current   = null;
        LRef.current     = null;
        layerRef.current = null;
        readyRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Actualiza markers quando os dados filtrados mudam ───────────────────────
  useEffect(() => {
    if (!readyRef.current || !LRef.current || !mapRef.current) return;
    addMarkers(LRef.current, mapRef.current, publications);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publications]);

  // ── Helper: reconstrói o layer de markers ────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function addMarkers(L: any, map: Leaflet.Map, pubs: MapPublication[]) {
    // Remove layer anterior
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (pubs.length === 0) return;

    const layer = L.layerGroup();

    pubs.forEach((pub) => {
      const icon = L.divIcon({
        className:   "",
        html:        createMarkerHtml(pub.tipo, pub.publisher_verificada && pub.publisher_tipo === "entidade"),
        iconSize:    [28, 28],
        iconAnchor:  [14, 28],
        popupAnchor: [0, -30],
      });

      const marker = L.marker([pub.lat, pub.lng], { icon });
      marker.bindPopup(createPopupHtml(pub, locale), {
        maxWidth:  240,
        className: "enable-bank-popup",
      });
      layer.addLayer(marker);
    });

    layer.addTo(map);
    layerRef.current = layer;
  }

  return (
    <>
      <style>{`
        .enable-bank-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,.15);
        }
        .enable-bank-popup .leaflet-popup-content {
          margin: 0;
          width: 220px !important;
        }
        .enable-bank-popup .leaflet-popup-tip-container { margin-top: -1px; }
      `}</style>

      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Legenda */}
      <div className="absolute bottom-6 right-4 z-[1000] bg-white rounded-xl border border-gray-200 shadow-md p-3 text-xs space-y-1.5">
        <p className="font-semibold text-gray-700 mb-2">Legenda</p>
        {[
          { color: "#16a34a", label: "Doação" },
          { color: "#2563eb", label: "Troca" },
          { color: "#ea580c", label: "Venda" },
          { color: "#7c3aed", label: "Entidade verificada" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span style={{ background: color }} className="w-3 h-3 rounded-full shrink-0" />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
