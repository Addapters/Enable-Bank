import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-purple-700 font-bold">
            <Heart className="w-5 h-5" aria-hidden="true" />
            <span>Enable Bank</span>
          </div>
          <p className="text-sm text-gray-500 text-center">
            Uma iniciativa da <span className="font-medium text-gray-700">Addapters Org</span> — gratuita e acessível para quem mais precisa.
          </p>
          <nav aria-label="Rodapé" className="flex gap-4 text-sm text-gray-500">
            <Link href="/sobre" className="hover:text-purple-700 transition-colors">Sobre</Link>
            <Link href="/privacidade" className="hover:text-purple-700 transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-purple-700 transition-colors">Termos</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
