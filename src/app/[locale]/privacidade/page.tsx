import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Política de Privacidade — Enable Bank" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <div className="space-y-3 text-sm text-gray-600 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 shrink-0">
              <ShieldCheck className="w-5 h-5 text-purple-700" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Política de Privacidade</h1>
          </div>
          <p className="text-sm text-gray-500">Última atualização: 24 de julho de 2026</p>
        </div>

        <Section title="1. Quem somos">
          <p>
            O Enable Bank é uma plataforma colaborativa de doação, troca e venda de produtos de
            apoio, desenvolvida e gerida pela <strong className="text-gray-900">Addapters Org</strong> (&ldquo;nós&rdquo;,
            &ldquo;o Enable Bank&rdquo;), que atua como responsável pelo tratamento dos teus dados
            pessoais nos termos do Regulamento Geral sobre a Proteção de Dados (RGPD) e da Lei
            n.º 58/2019, que o executa na ordem jurídica portuguesa.
          </p>
          <p>
            Para qualquer questão sobre esta política ou sobre os teus dados pessoais, contacta-nos
            através de{" "}
            <a href="mailto:enable@addapters.org" className="text-purple-700 hover:underline">enable@addapters.org</a>.
          </p>
        </Section>

        <Section title="2. Que dados recolhemos">
          <p>Consoante a forma como usas a plataforma, podemos tratar as seguintes categorias de dados:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-gray-900">Conta:</strong> nome, email, palavra-passe (nunca em texto simples — é encriptada pelo nosso fornecedor de autenticação), tipo de conta (particular ou entidade), concelho e foto de perfil.</li>
            <li><strong className="text-gray-900">Utilizadores particulares:</strong> telefone (opcional).</li>
            <li><strong className="text-gray-900">Entidades/organizações:</strong> NIF, morada, website, telefone e email institucionais, nome e cargo da pessoa de contacto, descrição da organização.</li>
            <li><strong className="text-gray-900">Anúncios:</strong> título, descrição, fotografias, categoria e localização aproximada (concelho, ou coordenadas obtidas a partir do código postal indicado).</li>
            <li><strong className="text-gray-900">Comunicações e reputação:</strong> mensagens trocadas com outros utilizadores e avaliações que deixas ou recebes.</li>
            <li><strong className="text-gray-900">Dados técnicos anónimos:</strong> termos de pesquisa e páginas visitadas, guardados sem qualquer associação à tua conta ou identidade — usados apenas para estatísticas agregadas de utilização da plataforma.</li>
            <li><strong className="text-gray-900">Início de sessão com Google:</strong> se optares por &ldquo;Continuar com Google&rdquo;, recebemos o nome e email associados à tua conta Google.</li>
          </ul>
        </Section>

        <Section title="3. Para que usamos os teus dados e com que base legal">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Criar e gerir a tua conta, e permitir a publicação e pesquisa de anúncios — <strong className="text-gray-900">execução de um contrato</strong> contigo (o próprio uso da plataforma).</li>
            <li>Permitir contacto e troca de mensagens entre utilizadores para combinarem doações, trocas ou vendas — <strong className="text-gray-900">execução de contrato</strong>.</li>
            <li>Enviar-te notificações sobre a tua atividade (novas mensagens, avaliações, estado dos teus anúncios) — <strong className="text-gray-900">execução de contrato</strong>.</li>
            <li>Moderar conteúdo, prevenir abusos e manter a segurança da plataforma — <strong className="text-gray-900">interesse legítimo</strong>.</li>
            <li>Produzir estatísticas agregadas e anónimas sobre a utilização da plataforma — <strong className="text-gray-900">interesse legítimo</strong>.</li>
            <li>Autenticação através da tua conta Google, caso a escolhas — <strong className="text-gray-900">consentimento</strong>, dado no momento em que autorizas esse acesso.</li>
          </ul>
        </Section>

        <Section title="4. Visibilidade dos teus dados">
          <p>Nem todos os dados que fornecemos são visíveis da mesma forma:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-gray-900">Públicos (qualquer visitante):</strong> nome, foto de perfil, concelho, anúncios ativos, avaliações recebidas e, para entidades, os dados institucionais completos (é um diretório público de organizações).</li>
            <li><strong className="text-gray-900">Visíveis apenas para utilizadores autenticados:</strong> dados de contacto direto (email/telefone) associados a um anúncio.</li>
            <li><strong className="text-gray-900">Privados:</strong> email de login, palavra-passe, mensagens (só visíveis para quem participa na conversa), notificações, favoritos.</li>
          </ul>
        </Section>

        <Section title="5. Com quem partilhamos os teus dados">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-gray-900">Supabase</strong> — o nosso fornecedor de alojamento de base de dados, autenticação e armazenamento de imagens. Os dados são guardados em servidores localizados na União Europeia.</li>
            <li><strong className="text-gray-900">Google LLC</strong> — apenas se optares por autenticação &ldquo;Continuar com Google&rdquo;. Os dados enviados (nome, email) são processados pela Google, com sede nos EUA, ao abrigo de cláusulas contratuais-tipo aprovadas pela Comissão Europeia como mecanismo de transferência internacional adequado.</li>
            <li>Não vendemos nem partilhamos os teus dados com terceiros para fins de publicidade ou marketing.</li>
          </ul>
        </Section>

        <Section title="6. Cookies">
          <p>Usamos apenas cookies estritamente necessários ao funcionamento do site, que por isso não requerem consentimento prévio nos termos da lei aplicável às comunicações eletrónicas:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-gray-900">NEXT_LOCALE</strong> — guarda a tua preferência de idioma.</li>
            <li><strong className="text-gray-900">Cookies de sessão de autenticação</strong> — mantêm-te ligado à tua conta entre visitas.</li>
          </ul>
          <p>Não usamos cookies de publicidade, redes sociais ou análise de terceiros.</p>
        </Section>

        <Section title="7. Durante quanto tempo guardamos os teus dados">
          <p>
            Guardamos os teus dados enquanto a tua conta estiver ativa. Se pedires a eliminação da
            conta, os teus dados pessoais são removidos de imediato, com exceção de registos que
            sejamos legalmente obrigados a conservar (ex: registos internos de moderação, mantidos
            sem dados adicionais que te identifiquem). Os dados anónimos de pesquisas e visitas não
            estão associados à tua conta e não são afetados pela eliminação.
          </p>
        </Section>

        <Section title="8. Os teus direitos">
          <p>Nos termos do RGPD, tens direito a:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Aceder aos dados pessoais que temos sobre ti;</li>
            <li>Retificar dados incorretos — podes editar a maior parte diretamente no teu perfil;</li>
            <li>Apagar a tua conta e os dados associados, a qualquer momento, na página do teu <Link href="/profile" className="text-purple-700 hover:underline">perfil</Link>;</li>
            <li>Limitar ou opor-te a determinados tratamentos;</li>
            <li>Portabilidade dos teus dados, num formato estruturado;</li>
            <li>Apresentar reclamação junto da autoridade de controlo — a <strong className="text-gray-900">Comissão Nacional de Proteção de Dados (CNPD)</strong>, em <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:underline">www.cnpd.pt</a>.</li>
          </ul>
          <p>Para exercer qualquer destes direitos, contacta-nos em <a href="mailto:enable@addapters.org" className="text-purple-700 hover:underline">enable@addapters.org</a>.</p>
        </Section>

        <Section title="9. Segurança">
          <p>
            Aplicamos medidas técnicas e organizativas adequadas para proteger os teus dados,
            incluindo controlo de acesso ao nível da base de dados (cada utilizador só acede aos
            dados a que tem direito), ligação encriptada (HTTPS) em toda a plataforma, e revisões
            periódicas de segurança.
          </p>
        </Section>

        <Section title="10. Idade mínima">
          <p>
            O Enable Bank destina-se a utilizadores com 18 ou mais anos. Os produtos anunciados
            podem destinar-se a crianças ou jovens, mas a conta e a interação na plataforma devem
            ser geridas por um adulto responsável.
          </p>
        </Section>

        <Section title="11. Alterações a esta política">
          <p>
            Podemos atualizar esta política ocasionalmente para refletir alterações à plataforma ou
            à legislação aplicável. Publicaremos sempre a versão atualizada nesta página, com a data
            de última atualização no topo.
          </p>
        </Section>
      </div>
    </div>
  );
}
