import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { ShieldCheck, ClipboardList, Users, BarChart2, Tag, Building2 } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login?redirectTo=/pt/admin");

  const { data: profile } = await supabase
    .from("users").select("role").eq("id", user.id).single();
  if (!profile || (profile as { role: string }).role !== "admin") redirect("/pt");

  const [{ count: pending }, { count: totalUsers }, { count: pendingEntities }] = await Promise.all([
    supabase.from("publications").select("*", { count: "exact", head: true }).eq("moderacao", "pendente"),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("entities").select("*", { count: "exact", head: true }).eq("verificada", false).eq("rejeitada", false),
  ]);

  const sections = [
    {
      href: "/admin/moderation",
      icon: ClipboardList,
      title: "Moderação",
      description: "Aprova ou rejeita anúncios submetidos pelos publishers.",
      badge: pending && pending > 0 ? pending : null,
      badgeColor: "bg-yellow-100 text-yellow-800",
    },
    {
      href: "/admin/users",
      icon: Users,
      title: "Utilizadores",
      description: "Gere contas, verifica entidades e suspende utilizadores.",
      badge: totalUsers && totalUsers > 0 ? totalUsers : null,
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      href: "/admin/entities",
      icon: Building2,
      title: "Entidades",
      description: "Verifica organizações registadas e atribui o badge de entidade verificada.",
      badge: pendingEntities && pendingEntities > 0 ? pendingEntities : null,
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      href: "/admin/categories",
      icon: Tag,
      title: "Categorias",
      description: "Gere categorias e subcategorias ISO 9999. Reordena por drag-and-drop.",
      badge: null,
      badgeColor: "",
    },
    {
      href: "/admin/stats",
      icon: BarChart2,
      title: "Estatísticas",
      description: "Anúncios ativos, pesquisas frequentes e cobertura geográfica.",
      badge: null,
      badgeColor: "",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
            <ShieldCheck className="w-5 h-5 text-purple-700" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Backoffice</h1>
            <p className="text-sm text-gray-500">Painel de administração do Enable Bank</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map(({ href, icon: Icon, title, description, badge, badgeColor }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 group-hover:bg-purple-100 transition-colors">
                  <Icon className="w-5 h-5 text-purple-700" aria-hidden="true" />
                </div>
                {badge !== null && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeColor}`}>
                    {badge}
                  </span>
                )}
              </div>
              <h2 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">
                {title}
              </h2>
              <p className="text-sm text-gray-500">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
