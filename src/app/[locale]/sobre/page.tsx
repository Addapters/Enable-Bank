import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Heart, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Sobre — Enable Bank" };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 shrink-0">
            <Heart className="w-5 h-5 text-purple-700" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sobre o Enable Bank</h1>
        </div>

        <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
          <p>
            O Enable Bank é uma plataforma colaborativa que liga diretamente pessoas e organizações
            para a doação, troca e venda de produtos de apoio — cadeiras de rodas, andarilhos,
            ajudas técnicas de comunicação, e muitos outros equipamentos que fazem a diferença na
            vida de quem tem uma deficiência ou necessidade especial.
          </p>
          <p>
            Muitos produtos de apoio ficam parados depois de deixarem de ser precisos, enquanto
            outras pessoas esperam meses para conseguir o equipamento de que necessitam. O Enable
            Bank existe para encurtar essa distância: sem intermediários, sem comissões, ligando
            diretamente quem tem com quem precisa.
          </p>
          <p>
            É uma iniciativa da <strong className="text-gray-900">Addapters Org</strong>, construída para ser
            gratuita e acessível para quem mais precisa.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 bg-purple-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-800 transition-colors"
          >
            Explorar anúncios<ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            href="/publications/new"
            className="inline-flex items-center justify-center gap-2 border border-purple-200 text-purple-700 px-5 py-2.5 rounded-xl font-medium hover:bg-purple-50 transition-colors"
          >
            Publicar um produto
          </Link>
        </div>
      </div>
    </div>
  );
}
