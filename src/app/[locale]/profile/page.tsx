import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Building2, BadgeCheck } from "lucide-react";
import ParticularProfileForm from "./ParticularProfileForm";
import EntityProfileForm from "./EntityProfileForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "O meu perfil — Enable Bank" };

interface EntityRow {
  id: string;
  nome: string;
  tipo: string;
  nif: string | null;
  morada: string | null;
  concelho: string | null;
  website: string | null;
  telefone: string | null;
  email_contacto: string | null;
  pessoa_contacto_nome: string | null;
  pessoa_contacto_cargo: string | null;
  descricao: string | null;
  logo_url: string | null;
  verificada: boolean;
}

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login?redirectTo=/pt/profile");

  const { data: profile } = await supabase
    .from("users")
    .select("id, nome, tipo, concelho, telefone, role, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/pt/auth/login");

  const p = profile as {
    id: string; nome: string; tipo: string;
    concelho: string | null; telefone: string | null; role: string;
    avatar_url: string | null;
  };

  // Dados de entidade (se aplicável)
  let entity: EntityRow | null = null;
  if (p.tipo === "entidade") {
    const { data: ent } = await supabase
      .from("entities")
      .select("id, nome, tipo, nif, morada, concelho, website, telefone, email_contacto, pessoa_contacto_nome, pessoa_contacto_cargo, descricao, logo_url, verificada")
      .eq("user_id", user.id)
      .single();
    entity = ent as unknown as EntityRow | null;
  }

  const isParticular = p.tipo === "particular";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-700 transition-colors mb-4"
          >
            ← Dashboard
          </Link>

          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shrink-0 overflow-hidden ${
              isParticular ? "bg-purple-100" : "bg-blue-100"
            }`}>
              {isParticular ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.avatar_url ?? "/heart-icon.png"} alt="" className="w-full h-full object-cover" aria-hidden="true" />
              ) : (
                <Building2 className="w-7 h-7 text-blue-700" aria-hidden="true" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">O meu perfil</h1>
                {!isParticular && entity?.verificada && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    Verificada
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {isParticular ? "Perfil de utilizador particular" : "Perfil de entidade / organização"}
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          {isParticular ? (
            <ParticularProfileForm
              defaultNome={p.nome}
              defaultEmail={user.email ?? ""}
              defaultConcelho={p.concelho}
              defaultTelefone={p.telefone}
              defaultAvatarUrl={p.avatar_url}
            />
          ) : (
            <EntityProfileForm
              defaultEmail={user.email ?? ""}
              entity={entity}
            />
          )}
        </div>

        {/* Info de segurança */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Segurança da conta</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Email</span>
              <span className="font-medium text-gray-900">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tipo de conta</span>
              <span className="font-medium capitalize text-gray-900">{p.tipo}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-purple-700 hover:underline"
            >
              Alterar palavra-passe →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
