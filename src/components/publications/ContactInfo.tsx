import { Link } from "@/i18n/navigation";
import { Mail, Phone, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PublisherAvatar from "./PublisherAvatar";

type Props = { userId: string };

export default async function ContactInfo({ userId }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 p-5 text-center">
        <Lock className="w-8 h-8 text-gray-300 mx-auto mb-2" aria-hidden="true" />
        <p className="text-sm font-medium text-gray-700 mb-1">Contacto visível apenas para membros</p>
        <p className="text-xs text-gray-400 mb-4">Regista-te gratuitamente para ver os dados de contacto do publisher.</p>
        <div className="flex flex-col gap-2">
          <Link href="/auth/login" className="block w-full bg-purple-700 text-white text-sm font-medium py-2 rounded-lg hover:bg-purple-800 transition-colors text-center">Entrar</Link>
          <Link href="/auth/register" className="block w-full border border-purple-200 text-purple-700 text-sm font-medium py-2 rounded-lg hover:bg-purple-50 transition-colors text-center">Criar conta gratuita</Link>
        </div>
      </div>
    );
  }

  const { data: contact } = await supabase
    .from("contacts")
    .select("email_contacto, telefone")
    .eq("user_id", userId)
    .single();

  const { data: publisher } = await supabase
    .from("users")
    .select("nome, tipo")
    .eq("id", userId)
    .single();

  const typedContact = contact as { email_contacto: string; telefone: string | null } | null;
  const typedPublisher = publisher as { nome: string; tipo: string } | null;

  // Para entidades, busca logo + verificada
  let logoUrl: string | null = null;
  let isVerified = false;
  if (typedPublisher?.tipo === "entidade") {
    const { data: ent } = await supabase
      .from("entities")
      .select("verificada, logo_url")
      .eq("user_id", userId)
      .single();
    const typedEnt = ent as { verificada: boolean; logo_url: string | null } | null;
    isVerified = typedEnt?.verificada ?? false;
    logoUrl    = typedEnt?.logo_url ?? null;
  }

  if (!typedContact) {
    return (
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 text-center">
        <p className="text-sm text-gray-500">O publisher ainda não adicionou dados de contacto.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-purple-50 border border-purple-100 p-5 space-y-4">
      {/* Publisher identity */}
      {typedPublisher && (
        <div>
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">
            Contactar publisher
          </p>
          <Link href={`/utilizadores/${userId}`} className="inline-block hover:opacity-80 transition-opacity">
            <PublisherAvatar
              publisher={{
                nome:       typedPublisher.nome,
                tipo:       typedPublisher.tipo,
                logoUrl,
                verificada: isVerified,
              }}
              size={48}
              showName
              showBadge
            />
          </Link>
        </div>
      )}

      {/* Contactos */}
      <div className="space-y-2">
        <a
          href={`mailto:${typedContact.email_contacto}`}
          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-300 transition-colors group"
          aria-label={`Enviar email para ${typedContact.email_contacto}`}
        >
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-purple-700" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400">Email</p>
            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-700">{typedContact.email_contacto}</p>
          </div>
        </a>

        {typedContact.telefone && (
          <>
            <a
              href={`tel:${typedContact.telefone}`}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-300 transition-colors group"
              aria-label={`Ligar para ${typedContact.telefone}`}
            >
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-purple-700" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Telefone</p>
                <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700">{typedContact.telefone}</p>
              </div>
            </a>
            <a
              href={`https://wa.me/${typedContact.telefone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100 hover:border-green-300 transition-colors group"
              aria-label="Contactar via WhatsApp"
            >
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400">WhatsApp</p>
                <p className="text-sm font-medium text-gray-900 group-hover:text-green-600">Enviar mensagem</p>
              </div>
            </a>
          </>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        O contacto é direto entre ti e o publisher. A plataforma não intermedeia.
      </p>
    </div>
  );
}
