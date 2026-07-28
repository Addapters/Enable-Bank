import { Link } from "@/i18n/navigation";
import { Heart, Star, ShieldCheck } from "lucide-react";
import ManageCookiesButton from "./ManageCookiesButton";

const CATEGORIES = [
  { slug: "mobilidade", label: "Mobilidade" },
  { slug: "comunicacao", label: "Comunicação" },
  { slug: "banho-higiene", label: "Banho e Higiene" },
  { slug: "cama-descanso", label: "Cama e Descanso" },
  { slug: "reabilitacao", label: "Reabilitação" },
  { slug: "outros", label: "Outros" },
];

export default function Footer() {
  return (
    <footer className="bg-purple-950 mt-auto">
      {/* Zona 1 — Navegação */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/enable-bank-logo.png" alt="Enable Bank" className="h-11 w-auto mb-4 brightness-0 invert" />
            <a
              href="https://www.addapters.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mb-4 bg-white/95 rounded-lg px-4 py-2 hover:bg-white transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logotipo_addaptersorg.png" alt="Addapters Org" className="h-11 w-auto" />
            </a>
            <p className="text-sm text-purple-300">
              Circular, gratuito e acessível para quem mais precisa.
            </p>
          </div>

          <nav aria-label="Explorar">
            <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Explorar</h2>
            <ul className="space-y-2 text-sm text-purple-200">
              <li><Link href="/search" className="hover:text-white transition-colors">Pesquisar</Link></li>
              <li><Link href="/map" className="hover:text-white transition-colors">Mapa</Link></li>
              <li><Link href="/entidades" className="hover:text-white transition-colors">Entidades</Link></li>
              <li><Link href="/publications/new" className="hover:text-white transition-colors">Publicar anúncio</Link></li>
            </ul>
          </nav>

          <nav aria-label="Categorias">
            <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Categorias</h2>
            <ul className="space-y-2 text-sm text-purple-200">
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/search?categoria=${cat.slug}`} className="hover:text-white transition-colors">{cat.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Enable Bank">
            <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Enable Bank</h2>
            <ul className="space-y-2 text-sm text-purple-200">
              <li><Link href="/sobre" className="hover:text-white transition-colors">Sobre</Link></li>
              <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
              <li><Link href="/termos" className="hover:text-white transition-colors">Termos</Link></li>
              <li><ManageCookiesButton className="hover:text-white transition-colors" /></li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Zona 2 — Badges */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-purple-300">
            <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-brand-peach" aria-hidden="true" />Doações e trocas sem comissões</span>
            <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-brand-yellow" aria-hidden="true" />Sistema de avaliações de utilizadores</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-brand-blue" aria-hidden="true" />Apenas produtos de apoio</span>
          </div>
        </div>
      </div>

      {/* Zona 3 — Disclaimer */}
      <div className="bg-purple-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="border-l-[3px] border-purple-400 bg-white/5 rounded-r-xl p-5 text-xs text-purple-200 space-y-3">
            <p className="font-semibold text-white">
              ⚠️ Aviso e responsabilidade
            </p>
            <p>O Enable Bank é uma plataforma de intermediação destinada exclusivamente à divulgação de produtos de apoio e ajudas técnicas para pessoas com deficiência ou incapacidade, como cadeiras de rodas, andarilhos, equipamentos de comunicação aumentativa e alternativa, camas articuladas, entre outros dispositivos destinados a promover a autonomia e a qualidade de vida.</p>
            <p>A plataforma promove a economia circular no setor da reabilitação e da vida independente, incentivando a reutilização responsável de equipamentos que ainda se encontram em condições de utilização.</p>
            <p>O Enable Bank não vende, compra, certifica, inspeciona, repara, valida nem garante o estado, a segurança, a conformidade legal ou a adequação dos equipamentos anunciados. A responsabilidade pela descrição, estado de conservação, funcionamento, manutenção, higienização e entrega dos equipamentos pertence exclusivamente ao anunciante.</p>
            <p>Os utilizadores são responsáveis por verificar cuidadosamente o estado do equipamento antes da sua utilização e por assegurar que este é adequado às necessidades da pessoa que o irá utilizar.</p>
            <p>A escolha e utilização de qualquer produto de apoio deve ser sempre efetuada com o acompanhamento de um médico fisiatra, terapeuta ocupacional, fisioterapeuta ou outro profissional habilitado. A utilização de equipamentos inadequados, danificados ou incorretamente ajustados poderá causar lesões ou outros danos.</p>
            <p>O Enable Bank não é parte nas transações realizadas entre utilizadores nem assume qualquer responsabilidade por acidentes, lesões, prejuízos, incumprimentos, litígios, perdas financeiras ou quaisquer danos resultantes da utilização da plataforma ou dos equipamentos nela divulgados.</p>
            <p>Não são permitidos anúncios de bens que não constituam produtos de apoio ou ajudas técnicas, incluindo roupa, eletrodomésticos, mobiliário comum, veículos, imóveis ou outros artigos sem finalidade de apoio à deficiência ou incapacidade. O Enable Bank reserva-se o direito de remover qualquer anúncio que considere inadequado ou que viole as regras da plataforma.</p>
          </div>
        </div>
      </div>

      {/* Zona 4 — Barra inferior */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-purple-400">
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
              <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
              <ManageCookiesButton className="hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
