import { Link } from "@/i18n/navigation";
import { Heart, MessageCircle, Star } from "lucide-react";

const CATEGORIES = [
  { slug: "mobilidade", label: "Mobilidade" },
  { slug: "comunicacao", label: "Comunicação" },
  { slug: "banho-higiene", label: "Banho e Higiene" },
  { slug: "cama-descanso", label: "Cama e Descanso" },
  { slug: "reabilitacao", label: "Reabilitação" },
  { slug: "casa-ambiente", label: "Casa e Ambiente" },
  { slug: "lazer-desporto", label: "Lazer e Desporto" },
  { slug: "outros", label: "Outros" },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-purple-800 to-purple-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/enable-bank-logo.png" alt="Enable Bank" className="h-11 w-auto mb-3 brightness-0 invert" />
            <a href="https://www.addapters.org/" target="_blank" rel="noopener noreferrer" className="inline-block mb-3 bg-white/95 rounded-lg px-3 py-1.5 hover:bg-white transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logotipo_addaptersorg.png" alt="Addapters Org" className="h-9 w-auto" />
            </a>
            <p className="text-sm text-purple-200">
              Uma iniciativa da <span className="font-medium text-white">Addapters Org</span> — gratuita e acessível para quem mais precisa.
            </p>
          </div>

          <nav aria-label="Explorar">
            <h2 className="text-sm font-semibold text-white mb-3">Explorar</h2>
            <ul className="space-y-2 text-sm text-purple-200">
              <li><Link href="/search" className="hover:text-white transition-colors">Pesquisar</Link></li>
              <li><Link href="/map" className="hover:text-white transition-colors">Mapa</Link></li>
              <li><Link href="/entidades" className="hover:text-white transition-colors">Entidades</Link></li>
              <li><Link href="/publications/new" className="hover:text-white transition-colors">Publicar anúncio</Link></li>
              <li><Link href="/favoritos" className="hover:text-white transition-colors">Os meus favoritos</Link></li>
            </ul>
          </nav>

          <nav aria-label="Categorias">
            <h2 className="text-sm font-semibold text-white mb-3">Categorias</h2>
            <ul className="space-y-2 text-sm text-purple-200">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/search?categoria=${cat.slug}`} className="hover:text-white transition-colors">{cat.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Enable Bank">
            <h2 className="text-sm font-semibold text-white mb-3">Enable Bank</h2>
            <ul className="space-y-2 text-sm text-purple-200">
              <li><Link href="/sobre" className="hover:text-white transition-colors">Sobre</Link></li>
              <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
              <li><Link href="/termos" className="hover:text-white transition-colors">Termos</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-purple-200">
          <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-brand-peach" aria-hidden="true" />Doações e trocas sem comissões</span>
          <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5 text-brand-blue" aria-hidden="true" />Chat direto entre utilizadores</span>
          <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-brand-yellow" aria-hidden="true" />Sistema de avaliações e confiança</span>
        </div>
      </div>
    </footer>
  );
}
