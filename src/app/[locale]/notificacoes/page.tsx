import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Bell, CheckCircle2, XCircle, Heart, PackageX, BadgeCheck, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { NotificationRow, NotificationType } from "@/types/database";
import { timeAgo } from "@/lib/utils/timeAgo";

export const metadata: Metadata = { title: "Notificações — Enable Bank" };

const ICONS: Record<NotificationType, { icon: typeof Bell; className: string }> = {
  aprovado:               { icon: CheckCircle2, className: "bg-green-100 text-green-700" },
  rejeitado:              { icon: XCircle,      className: "bg-red-100 text-red-700" },
  correcao:               { icon: XCircle,      className: "bg-orange-100 text-orange-700" },
  favorito_novo:          { icon: Heart,         className: "bg-purple-100 text-purple-700" },
  favorito_indisponivel:  { icon: PackageX,      className: "bg-gray-100 text-gray-600" },
  entidade_verificada:    { icon: BadgeCheck,    className: "bg-purple-100 text-purple-700" },
  nova_avaliacao:         { icon: Star,          className: "bg-purple-100 text-purple-700" },
};

export default async function NotificacoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login?redirectTo=/pt/notificacoes");

  const { data } = await supabase
    .from("notifications")
    .select("id, user_id, tipo, titulo, mensagem, link, publication_id, lida, criado_em")
    .eq("user_id", user.id)
    .order("criado_em", { ascending: false })
    .limit(50);

  const notifications = (data ?? []) as unknown as NotificationRow[];

  // Marca tudo como lido ao visitar a página — já estamos a mostrar tudo, não faz sentido
  // manter o badge com o número antigo.
  if (notifications.some((n) => !n.lida)) {
    await supabase.from("notifications").update({ lida: true }).eq("user_id", user.id).eq("lida", false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 shrink-0">
            <Bell className="h-5 w-5 text-purple-700" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Notificações</h1>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-700 mb-1">Ainda não tens notificações</p>
            <p className="text-sm text-gray-500">Quando houver novidades sobre os teus anúncios ou favoritos, aparecem aqui.</p>
          </div>
        ) : (
          <ul className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {notifications.map((n) => {
              const { icon: Icon, className } = ICONS[n.tipo] ?? { icon: Bell, className: "bg-gray-100 text-gray-600" };
              const content = (
                <div className={`flex items-start gap-3 px-5 py-4 ${!n.lida ? "bg-purple-50/50" : ""}`}>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${className}`}>
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{n.titulo}</p>
                    {n.mensagem && <p className="text-sm text-gray-500 truncate">{n.mensagem}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.criado_em)}</p>
                  </div>
                  {!n.lida && <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0 mt-2" aria-hidden="true" />}
                </div>
              );
              return (
                <li key={n.id}>
                  {n.link ? (
                    <Link href={n.link} className="block hover:bg-gray-50 transition-colors">
                      {content}
                    </Link>
                  ) : content}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
