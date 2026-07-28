import { Link } from "@/i18n/navigation";
import { Heart, Star, ShieldCheck, AlertTriangle, ArrowRight } from "lucide-react";
import ManageCookiesButton from "./ManageCookiesButton";

const CATEGORIES = [
  { slug: "mobilidade", label: "Mobilidade" },
  { slug: "comunicacao", label: "Comunicação" },
  { slug: "banho-higiene", label: "Banho e Higiene" },
  { slug: "reabilitacao", label: "Reabilitação" },
  { slug: "outros", label: "Outros" },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-purple-700 to-purple-900 mt-auto">
      {/* Colunas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Coluna 1 */}
          <div className="col-span-2 lg:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/enable-bank-logo.png" alt="Enable Bank" className="w-[203px] h-auto mb-4 brightness-0 invert" />
            <p className="text-sm text-purple-100 mb-4">
              Circular, gratuito e acessível para quem mais precisa.
            </p>
            <a href="https://www.addapters.org/" target="_blank" rel="noopener noreferrer" className="inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logotipo_addaptersorg.png" alt="Addapters Org" className="w-[203px] h-auto brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" />
            </a>
          </div>

          {/* Coluna 2 — Explorar */}
          <nav aria-label="Explorar">
            <h2 className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-3">Explorar</h2>
            <ul className="space-y-2 text-sm text-purple-100">
              <li><Link href="/search" className="hover:text-white transition-colors">Pesquisar</Link></li>
              <li><Link href="/map" className="hover:text-white transition-colors">Mapa</Link></li>
              <li><Link href="/entidades" className="hover:text-white transition-colors">Entidades</Link></li>
              <li><Link href="/publications/new" className="hover:text-white transition-colors">Publicar anúncio</Link></li>
            </ul>
          </nav>

          {/* Coluna 3 — Categorias */}
          <nav aria-label="Categorias">
            <h2 className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-3">Categorias</h2>
            <ul className="space-y-2 text-sm text-purple-100">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/search?categoria=${cat.slug}`} className="hover:text-white transition-colors">{cat.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Coluna 4 — Enable Bank */}
          <nav aria-label="Enable Bank">
            <h2 className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-3">Enable Bank</h2>
            <ul className="space-y-2 text-sm text-purple-100">
              <li><Link href="/sobre" className="hover:text-white transition-colors">Sobre</Link></li>
              <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
              <li><Link href="/termos" className="hover:text-white transition-colors">Termos de Utilização</Link></li>
              <li><ManageCookiesButton className="hover:text-white transition-colors" /></li>
            </ul>
          </nav>

          {/* Coluna 5 — Aviso e responsabilidade */}
          <div className="col-span-2 lg:col-span-1">
            <div className="h-full bg-white/10 border-t-2 border-brand-yellow rounded-lg p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-white mb-2">
                <AlertTriangle className="w-4 h-4 text-brand-yellow shrink-0" aria-hidden="true" />
                Aviso e responsabilidade
              </p>
              <p className="text-xs text-purple-100 leading-relaxed mb-3">
                O Enable Bank divulga produtos de apoio entre utilizadores, mas não certifica, vende
                nem garante o estado ou a segurança dos equipamentos anunciados.
              </p>
              <Link
                href="/termos#aviso-responsabilidade"
                className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:text-brand-yellow transition-colors"
              >
                Ler aviso completo <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="border-t border-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-purple-100">
            <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-brand-peach" aria-hidden="true" />Doações e trocas sem comissões</span>
            <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-brand-yellow" aria-hidden="true" />Sistema de avaliações de utilizadores</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />Apenas produtos de apoio</span>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-purple-200">
            <p>
              © 2026{" "}
              <a
                href="https://www.addapters.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Addapters Org
              </a>
              {" "}— Addapters Enable Associação
            </p>
            <div className="flex items-center gap-5">
              <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
              <Link href="/termos" className="hover:text-white transition-colors">Termos de Utilização</Link>
              <ManageCookiesButton className="hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
