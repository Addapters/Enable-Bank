export type UserRole = "user" | "admin";
export type UserType = "particular" | "entidade";
export type EntityType = "ONGPD" | "IPSS" | "municipio" | "misericordia" | "clinica" | "associacao" | "outro";
export type PublicationType = "doacao" | "troca" | "venda";
export type ProductCondition = "novo" | "bom" | "usado";
export type PublicationStatus = "pendente" | "ativo" | "rejeitado" | "cedido";
export type Audience = "crianca" | "adulto" | "ambos";

export interface UserRow {
  id: string;
  email: string;
  nome: string;
  tipo: UserType;
  role: UserRole;
  concelho: string | null;
  telefone: string | null;
  avatar_url: string | null;
  suspended: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface EntityRow {
  id: string;
  nome: string;
  tipo: EntityType | string;
  morada: string | null;
  concelho: string | null;
  website: string | null;
  verificada: boolean;
  verificada_em: string | null;
  verificada_por: string | null;
  rejeitada: boolean;
  nota_rejeicao: string | null;
  nif: string | null;
  email_contacto: string | null;
  telefone: string | null;
  pessoa_contacto_nome: string | null;
  pessoa_contacto_cargo: string | null;
  descricao: string | null;
  logo_url: string | null;
  user_id: string;
  criado_em: string;
}

export interface CategoryRow {
  id: string;
  nome: string;
  slug: string;
  parent_id: string | null;
  iso9999_code: string | null;
  ordem: number;
  ativa: boolean;
  criado_em: string;
}

export interface PublicationRow {
  id: string;
  titulo: string;
  descricao: string;
  tipo: PublicationType;
  estado: ProductCondition;
  categoria_id: string;
  publico: Audience;
  disponivel: boolean;
  preco: number | null;
  concelho: string;
  latitude: number | null;
  longitude: number | null;
  user_id: string;
  moderacao: PublicationStatus;
  embedding: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface PhotoRow {
  id: string;
  publication_id: string;
  url: string;
  ordem: number;
  criado_em: string;
}

export interface ContactRow {
  id: string;
  user_id: string;
  email_contacto: string;
  telefone: string | null;
  criado_em: string;
}

export interface ModerationLogRow {
  id: string;
  publication_id: string;
  admin_id: string;
  acao: "aprovado" | "rejeitado" | "correcao";
  nota: string | null;
  criado_em: string;
}

export type User = UserRow;
export type Entity = EntityRow;
export type Category = CategoryRow;
export type Publication = PublicationRow;
export type Photo = PhotoRow;
export type Contact = ContactRow;
export type ModerationLog = ModerationLogRow;

export type PublicationWithDetails = PublicationRow & {
  photos: PhotoRow[];
  category: CategoryRow;
  user: Pick<UserRow, "id" | "nome" | "tipo">;
};
