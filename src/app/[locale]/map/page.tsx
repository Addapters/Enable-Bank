import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import MapClient from "./MapClient";
import type { MapPublication } from "./MapClient";

export const metadata: Metadata = { title: "Mapa de anúncios — Enable Bank" };

type SearchParams = {
  tipo?: string;
  publico?: string;
  categoria?: string;
  disponivel?: string;
};

type Props = { searchParams: Promise<SearchParams>; params: Promise<{ locale: string }> };

interface RawPub {
  id: string;
  titulo: string;
  tipo: string;
  publico: string;
  disponivel: boolean;
  concelho: string;
  latitude: number;
  longitude: number;
  user_id: string;
  category: { nome: string } | null;
  photos: { url: string; ordem: number }[];
  publisher: { id: string; nome: string; tipo: string } | null;
}

export default async function MapPage({ searchParams, params }: Props) {
  const [sp, { locale }] = await Promise.all([searchParams, params]);
  const supabase = await createClient();

  // Anúncios ativos com coordenadas
  const { data: raw } = await supabase
    .from("publications")
    .select(`
      id, titulo, tipo, publico, disponivel, concelho,
      latitude, longitude, user_id,
      category:categories!categoria_id(nome),
      photos(url, ordem),
      publisher:users!user_id(id, nome, tipo)
    `)
    .eq("moderacao", "ativo")
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  const rawPubs = (raw ?? []) as unknown as RawPub[];

  // Batch-fetch entity data
  const entityUserIds = [...new Set(
    rawPubs
      .filter((p) => p.publisher?.tipo === "entidade")
      .map((p) => p.publisher!.id)
  )];

  const entityMap: Record<string, { logo_url: string | null; verificada: boolean }> = {};
  if (entityUserIds.length > 0) {
    const { data: entities } = await supabase
      .from("entities")
      .select("user_id, logo_url, verificada")
      .in("user_id", entityUserIds);
    for (const e of (entities ?? []) as { user_id: string; logo_url: string | null; verificada: boolean }[]) {
      entityMap[e.user_id] = e;
    }
  }

  // Transforma para MapPublication
  const publications: MapPublication[] = rawPubs.map((p) => {
    const firstPhoto = p.photos
      .slice()
      .sort((a, b) => a.ordem - b.ordem)[0]?.url ?? null;
    const entityData = p.publisher?.tipo === "entidade"
      ? entityMap[p.publisher.id] ?? null
      : null;

    return {
      id:                  p.id,
      titulo:              p.titulo,
      tipo:                p.tipo as MapPublication["tipo"],
      categoria:           p.category?.nome ?? null,
      publico:             p.publico,
      disponivel:          p.disponivel,
      lat:                 p.latitude,
      lng:                 p.longitude,
      photo_url:           firstPhoto,
      publisher_nome:      p.publisher?.nome ?? "Anónimo",
      publisher_tipo:      p.publisher?.tipo ?? "particular",
      publisher_verificada: entityData?.verificada ?? false,
      concelho:            p.concelho,
    };
  });

  // Categorias para os filtros
  const { data: cats } = await supabase
    .from("categories")
    .select("id, nome")
    .eq("ativa", true)
    .is("parent_id", null)
    .order("ordem");

  const categories = (cats ?? []) as { id: string; nome: string }[];

  const searchParamsObj: Record<string, string> = {};
  if (sp.tipo) searchParamsObj.tipo = sp.tipo;
  if (sp.publico) searchParamsObj.publico = sp.publico;
  if (sp.categoria) searchParamsObj.categoria = sp.categoria;
  if (sp.disponivel) searchParamsObj.disponivel = sp.disponivel;

  return (
    <MapClient
      publications={publications}
      categories={categories}
      locale={locale}
      searchParams={searchParamsObj}
    />
  );
}
