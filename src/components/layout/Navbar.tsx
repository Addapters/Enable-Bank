"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Menu, X, UserCircle, Plus, Bell, MessageCircle } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase.from("users").select("role").eq("id", data.user.id).single()
          .then(({ data: profile }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setIsAdmin((profile as any)?.role === "admin");
          });
        supabase.from("notifications").select("id", { count: "exact", head: true })
          .eq("user_id", data.user.id).eq("lida", false)
          .then(({ count }) => setNotifCount(count ?? 0));
        supabase.from("messages").select("id", { count: "exact", head: true })
          .eq("lida", false).neq("sender_id", data.user.id)
          .then(({ count }) => setMsgCount(count ?? 0));
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    window.location.href = "/pt";
  };

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/search", label: t("search") },
    { href: "/map", label: "Mapa" },
    { href: "/entidades", label: "Entidades" },
    ...(isAdmin ? [{ href: "/admin", label: t("admin") }] : []),
  ];

  const profileHref = "/profile";
  const publicProfileHref = user ? `/utilizadores/${user.id}` : profileHref;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Navegação principal">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/enable-bank-logo.png" alt="Enable Bank" className="h-11 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`text-sm font-medium transition-colors hover:text-purple-700 ${pathname === link.href ? "text-purple-700 border-b-2 border-purple-700" : "text-gray-600"}`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/publications/new"
                  className="flex items-center gap-1.5 text-sm font-medium bg-white text-purple-700 border border-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  {t("publish")}
                </Link>

                <Link
                  href="/mensagens"
                  className="relative p-2 rounded-lg text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition-colors"
                  aria-label={`Mensagens${msgCount > 0 ? ` (${msgCount} não lidas)` : ""}`}
                >
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                  {msgCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-purple-700 text-white text-[10px] font-semibold flex items-center justify-center" aria-hidden="true">
                      {msgCount > 9 ? "9+" : msgCount}
                    </span>
                  )}
                </Link>

                <div className="relative group">
                <Link
                  href={publicProfileHref}
                  className={`flex items-center gap-1.5 text-sm font-medium bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition-colors ${pathname === publicProfileHref ? "ring-2 ring-purple-300" : ""}`}
                  aria-label="O meu perfil"
                >
                  <UserCircle className="w-4 h-4" aria-hidden="true" />
                  Perfil
                </Link>

                {/* Submenu — aparece ao passar o rato (padding-top mantém a área "hoverable" contínua) */}
                <div className="absolute right-0 top-full w-52 pt-2 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 z-50">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-lg py-1.5">
                    <Link href="/notificacoes" className="flex items-center justify-between gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-purple-700 transition-colors">
                      <span className="flex items-center gap-2">
                        <Bell className="w-4 h-4" aria-hidden="true" />
                        Notificações{notifCount > 0 ? ` (${notifCount})` : ""}
                      </span>
                      {notifCount > 0 && <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" aria-hidden="true" />}
                    </Link>
                    <div className="my-1 border-t border-gray-100" />
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-purple-700 transition-colors">
                      Os meus anúncios
                    </Link>
                    <Link href="/favoritos" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-purple-700 transition-colors">
                      Os meus favoritos
                    </Link>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-purple-700 transition-colors">
                      Editar perfil
                    </Link>
                    <div className="my-1 border-t border-gray-100" />
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-purple-700 transition-colors">
                      {t("logout")}
                    </button>
                  </div>
                </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors">{t("login")}</Link>
                <Link href="/auth/register" className="text-sm font-medium bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-800 transition-colors">{t("register")}</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-label={isOpen ? "Fechar menu" : "Abrir menu"}>
            {isOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>{link.label}</Link>
            ))}
            <div className="border-t border-gray-200 pt-3 mt-3 space-y-1">
              {user ? (
                <>
                  <Link href="/publications/new" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>
                    <Plus className="w-4 h-4" aria-hidden="true" />{t("publish")}
                  </Link>
                  <Link href={publicProfileHref} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>
                    <UserCircle className="w-4 h-4" aria-hidden="true" />Ver perfil
                  </Link>
                  <Link href="/mensagens" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    Mensagens{msgCount > 0 ? ` (${msgCount})` : ""}
                  </Link>
                  <Link href="/notificacoes" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>
                    <Bell className="w-4 h-4" aria-hidden="true" />
                    Notificações{notifCount > 0 ? ` (${notifCount})` : ""}
                  </Link>
                  <Link href="/dashboard" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>
                    Os meus anúncios
                  </Link>
                  <Link href="/favoritos" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>
                    Os meus favoritos
                  </Link>
                  <Link href={profileHref} className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>
                    Editar perfil
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-gray-50 rounded-md">{t("logout")}</button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>{t("login")}</Link>
                  <Link href="/auth/register" className="block px-3 py-2 text-sm font-medium bg-purple-700 text-white rounded-md hover:bg-purple-800" onClick={() => setIsOpen(false)}>{t("register")}</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
