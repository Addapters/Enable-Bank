import { Link } from "@/i18n/navigation";

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
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/enable-bank-logo.png" alt="Enable Bank" className="h-8 w-auto mb-3" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logotipo_addaptersorg.png" alt="Addapters Org" className="h-6 w-auto mb-3" />
            <p className="text-sm text-gray-500">
              Uma iniciativa da <span className="font-medium text-gray-700">Addapters Org</span> — gratuita e acessível para quem mais precisa.
            </p>
          </div>

          <nav aria-label="Explorar">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Explorar</h2>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/search" className="hover:text-purple-700 transition-colors">Pesquisar</Link></li>
              <li><Link href="/map" className="hover:text-purple-700 transition-colors">Mapa</Link></li>
              <li><Link href="/entidades" className="hover:text-purple-700 transition-colors">Entidades</Link></li>
              <li><Link href="/publications/new" className="hover:text-purple-700 transition-colors">Publicar anúncio</Link></li>
            </ul>
          </nav>

          <nav aria-label="Categorias">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Categorias</h2>
            <ul className="space-y-2 text-sm text-gray-500">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/search?categoria=${cat.slug}`} className="hover:text-purple-700 transition-colors">{cat.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Enable Bank">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Enable Bank</h2>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/sobre" className="hover:text-purple-700 transition-colors">Sobre</Link></li>
              <li><Link href="/privacidade" className="hover:text-purple-700 transition-colors">Privacidade</Link></li>
              <li><Link href="/termos" className="hover:text-purple-700 transition-colors">Termos</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
