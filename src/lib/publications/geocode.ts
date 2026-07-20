/**
 * Geocodificação via Nominatim (OpenStreetMap) — gratuito, sem chave de API.
 * Respeita o rate limit de 1 req/s e o User-Agent obrigatório.
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

export async function geocodeAddress(query: string): Promise<GeoPoint | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=pt&format=json&limit=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "EnableBank/1.0 (contact@enablebank.pt)",
        "Accept-Language": "pt-PT,pt;q=0.9",
      },
      // cache 24 horas — mesmo código postal dá sempre o mesmo resultado
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch {
    return null;
  }
}

/** Geocodifica um código postal português de 4 dígitos */
export async function geocodePostalCode(cp4: string): Promise<GeoPoint | null> {
  return geocodeAddress(`${cp4} Portugal`);
}

/** Geocodifica uma morada completa (para entidades) */
export async function geocodeEntityAddress(morada: string, concelho: string): Promise<GeoPoint | null> {
  return geocodeAddress(`${morada}, ${concelho}, Portugal`);
}
