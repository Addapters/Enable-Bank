"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Menu, X, UserCircle } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
    ...(user ? [{ href: "/publications/new", label: t("publish") }] : []),
    ...(user ? [{ href: "/dashboard", label: t("dashboard") }] : []),
    ...(isAdmin ? [{ href: "/admin", label: t("admin") }] : []),
  ];

  const profileHref = "/profile";

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Navegação principal">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/enable-bank-logo.png" alt="Enable Bank" className="h-9 w-auto" />
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
                  href={profileHref}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-purple-700 ${pathname === profileHref ? "text-purple-700" : "text-gray-600"}`}
                  aria-label="O meu perfil"
                >
                  <UserCircle className="w-4 h-4" aria-hidden="true" />
                  Perfil
                </Link>
                <button onClick={handleLogout} className="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors">{t("logout")}</button>
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
                  <Link href={profileHref} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-700 hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>
                    <UserCircle className="w-4 h-4" aria-hidden="true" />Perfil
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
