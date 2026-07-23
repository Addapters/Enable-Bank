import type { SupabaseClient } from "@supabase/supabase-js";

export type RawPublisher = { id: string; nome: string; tipo: string; avatar_url: string | null } | null;
export type EntityMap = Record<string, { logo_url: string | null; verificada: boolean }>;

/** Batch-fetch logo/verificada das entidades presentes numa lista de publishers. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getEntityMap(supabase: SupabaseClient<any>, publishers: RawPublisher[]): Promise<EntityMap> {
  const entityUserIds = [...new Set(
    publishers
      .filter((p): p is NonNullable<RawPublisher> => !!p && p.tipo === "entidade")
      .map((p) => p.id)
  )];

  const entityMap: EntityMap = {};
  if (entityUserIds.length > 0) {
    const { data } = await supabase
      .from("entities")
      .select("user_id, logo_url, verificada")
      .in("user_id", entityUserIds);
    for (const e of (data ?? []) as { user_id: string; logo_url: string | null; verificada: boolean }[]) {
      entityMap[e.user_id] = { logo_url: e.logo_url, verificada: e.verificada };
    }
  }
  return entityMap;
}

/** Constrói o PublisherInfo do PublicationCard — logo da entidade, ou avatar do particular. */
export function toPublisherInfo(publisher: RawPublisher, entityMap: EntityMap) {
  if (!publisher) return undefined;
  const entityData = publisher.tipo === "entidade" ? entityMap[publisher.id] ?? null : null;
  return {
    nome: publisher.nome,
    tipo: publisher.tipo,
    logoUrl: publisher.tipo === "entidade" ? (entityData?.logo_url ?? null) : publisher.avatar_url,
    verificada: entityData?.verificada ?? false,
  };
}
