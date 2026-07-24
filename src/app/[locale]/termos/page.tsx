import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { FileText } from "lucide-react";

export const metadata: Metadata = { title: "Termos de Utilização — Enable Bank" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <div className="space-y-3 text-sm text-gray-600 leading-relaxed">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 shrink-0">
              <FileText className="w-5 h-5 text-purple-700" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Termos de Utilização</h1>
          </div>
          <p className="text-sm text-gray-500">Última atualização: 24 de julho de 2026</p>
        </div>

        <Section title="1. Sobre o Enable Bank">
          <p>
            O Enable Bank é uma plataforma colaborativa, desenvolvida pela Addapters Org, que liga
            diretamente pessoas e organizações para a doação, troca e venda de produtos de apoio.
            Ao criar uma conta ou usar a plataforma, aceitas estes Termos de Utilização e a nossa{" "}
            <Link href="/privacidade" className="text-purple-700 hover:underline">Política de Privacidade</Link>.
          </p>
        </Section>

        <Section title="2. Elegibilidade">
          <p>
            Para criar uma conta, tens de ter pelo menos 18 anos. As entidades/organizações devem
            ser representadas por uma pessoa com poderes para as vincular. As informações que
            fornecemos no registo (nome, NIF, morada, contactos) devem ser verdadeiras e mantidas
            atualizadas.
          </p>
        </Section>

        <Section title="3. Como funciona a plataforma">
          <p>
            O Enable Bank é um espaço de encontro entre quem tem e quem precisa de produtos de
            apoio. <strong className="text-gray-900">Não somos parte em nenhuma doação, troca ou venda</strong> combinada
            entre utilizadores — o contacto, a entrega e qualquer pagamento são sempre diretos entre
            as partes envolvidas, sem intermediação, comissão ou garantia da nossa parte quanto ao
            estado, qualidade ou entrega efetiva dos produtos.
          </p>
          <p>
            Todos os anúncios são revistos pela nossa equipa antes de ficarem visíveis publicamente,
            mas essa revisão não constitui uma certificação da veracidade ou qualidade do produto.
          </p>
        </Section>

        <Section title="4. As tuas responsabilidades">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Publicar apenas anúncios de produtos de apoio reais, que possuis ou representas legitimamente;</li>
            <li>Não publicar conteúdo ilegal, enganoso, ofensivo ou que viole direitos de terceiros;</li>
            <li>Comunicar com outros utilizadores de forma respeitosa;</li>
            <li>Não partilhar dados pessoais de terceiros sem o seu consentimento;</li>
            <li>Não usar a plataforma para fins de spam, fraude ou angariação de dados de outros utilizadores.</li>
          </ul>
        </Section>

        <Section title="5. Moderação e suspensão de contas">
          <p>
            Podemos rejeitar, pedir correção ou remover qualquer anúncio que viole estes termos, e
            suspender ou eliminar contas em caso de incumprimento grave ou reiterado, sem prejuízo
            de outros direitos que nos assistam.
          </p>
        </Section>

        <Section title="6. Avaliações">
          <p>
            O sistema de avaliações existe para gerar confiança entre utilizadores. As avaliações
            devem refletir experiências reais e não podem ser usadas para difamar, assediar ou
            manipular a reputação de outro utilizador.
          </p>
        </Section>

        <Section title="7. Limitação de responsabilidade">
          <p>
            O Enable Bank é disponibilizado &ldquo;tal como está&rdquo;. Na medida máxima permitida por lei,
            não somos responsáveis por danos resultantes de transações entre utilizadores, da
            indisponibilidade temporária da plataforma, ou de conteúdo publicado por terceiros.
          </p>
        </Section>

        <Section title="8. Alterações a estes termos">
          <p>
            Podemos atualizar estes termos ocasionalmente. Publicaremos sempre a versão atualizada
            nesta página, com a data de última atualização no topo.
          </p>
        </Section>

        <Section title="9. Lei aplicável">
          <p>
            Estes termos regem-se pela lei portuguesa. Para qualquer litígio, é competente o
            tribunal da comarca do domicílio do consumidor, quando aplicável, ou o foro legalmente
            competente nos restantes casos.
          </p>
        </Section>

        <Section title="10. Contacto">
          <p>
            Para questões sobre estes termos, contacta-nos em{" "}
            <a href="mailto:enable@addapters.org" className="text-purple-700 hover:underline">enable@addapters.org</a>.
          </p>
        </Section>
      </div>
    </div>
  );
}
