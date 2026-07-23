"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { CheckCircle, Loader2, BadgeCheck } from "lucide-react";
import Image from "next/image";
import FormField from "@/components/ui/FormField";
import LogoUpload from "./LogoUpload";
import { updateEntityProfile } from "@/lib/profile/actions";
import { CONCELHOS } from "@/lib/data/concelhos";
import type { ProfileResult } from "@/lib/profile/actions";

const ENTITY_TYPES = [
  { value: "ONGPD",         label: "ONGPD" },
  { value: "IPSS",          label: "IPSS" },
  { value: "municipio",     label: "Município" },
  { value: "misericordia",  label: "Misericórdia" },
  { value: "clinica",       label: "Clínica / Hospital" },
  { value: "associacao",    label: "Associação" },
  { value: "outro",         label: "Outro" },
];

interface EntityData {
  nome: string;
  tipo: string;
  nif: string | null;
  morada: string | null;
  concelho: string | null;
  website: string | null;
  telefone: string | null;
  email_contacto: string | null;
  pessoa_contacto_nome: string | null;
  pessoa_contacto_cargo: string | null;
  descricao: string | null;
  logo_url: string | null;
  verificada: boolean;
}

interface Props {
  defaultEmail: string;
  entity: EntityData | null;
}

export default function EntityProfileForm({ defaultEmail, entity }: Props) {
  const [state, action] = useActionState<ProfileResult | null, FormData>(
    updateEntityProfile, null
  );
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [prevState, setPrevState] = useState(state);
  const [logoUrl, setLogoUrl] = useState<string>(entity?.logo_url ?? "");
  const formRef = useRef<HTMLFormElement>(null);

  // Deteta uma nova submissão bem-sucedida durante a renderização (em vez de num efeito) para
  // não disparar setState sincronamente no corpo do efeito; o próprio timeout do auto-hide é
  // que fica num efeito, já que aí a atualização acontece de forma assíncrona (permitido).
  if (state !== prevState) {
    setPrevState(state);
    if (state && "success" in state) setSaved(true);
  }

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(t);
  }, [saved]);

  const fields = (state && "fields" in state ? state.fields : {}) ?? {};

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(formRef.current!);
    fd.set("logo_url", logoUrl);
    startTransition(() => action(fd));
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">

      {entity?.verificada && (
        <div className="rounded-xl bg-purple-50 border border-purple-200 px-4 py-3 flex items-center gap-3">
          <BadgeCheck className="w-5 h-5 text-purple-600 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-purple-800">Entidade verificada</p>
            <p className="text-xs text-purple-600">A tua entidade foi validada pelo Enable Bank.</p>
          </div>
        </div>
      )}

      {/* Logo */}
      <div className="flex items-start gap-5">
        {logoUrl && (
          <div className="shrink-0 w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
            <Image src={logoUrl} alt="Logo atual" width={64} height={64} className="object-contain p-1 w-full h-full" />
          </div>
        )}
        <div className="flex-1">
          <LogoUpload currentUrl={entity?.logo_url} onUpload={setLogoUrl} />
        </div>
      </div>

      {/* ── Secção: Organização ─────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-100">Organização</h3>

        <FormField
          id="nome"
          name="nome"
          label="Nome da organização"
          required
          defaultValue={entity?.nome ?? ""}
          placeholder="Ex: Addapters Org"
          error={fields.nome}
        />

        <FormField
          as="select"
          id="tipo"
          name="tipo"
          label="Tipo de entidade"
          required
          defaultValue={entity?.tipo ?? ""}
          error={fields.tipo}
        >
          <option value="">Seleciona o tipo</option>
          {ENTITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="nif"
            name="nif"
            label="NIF / NIPC"
            required
            defaultValue={entity?.nif ?? ""}
            placeholder="500 000 000"
            error={fields.nif}
          />
          <FormField
            as="select"
            id="concelho"
            name="concelho"
            label="Concelho"
            required
            defaultValue={entity?.concelho ?? ""}
            error={fields.concelho}
          >
            <option value="">Seleciona o concelho</option>
            {CONCELHOS.map((c) => <option key={c} value={c}>{c}</option>)}
          </FormField>
        </div>

        <FormField
          id="morada"
          name="morada"
          label="Morada completa"
          required
          defaultValue={entity?.morada ?? ""}
          placeholder="Rua Exemplo, nº 1, 1000-000 Lisboa"
          error={fields.morada}
        />

        <FormField
          id="website"
          name="website"
          label="Website"
          type="url"
          defaultValue={entity?.website ?? ""}
          placeholder="https://www.exemplo.pt"
        />

        <FormField
          as="textarea"
          id="descricao"
          name="descricao"
          label="Descrição breve"
          rows={3}
          defaultValue={entity?.descricao ?? ""}
          placeholder="Breve descrição da missão e serviços da organização..."
        />
      </div>

      {/* ── Secção: Contacto institucional ──────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-100">Contacto institucional</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="email_contacto"
            name="email_contacto"
            label="Email institucional"
            type="email"
            required
            defaultValue={entity?.email_contacto ?? ""}
            placeholder="geral@associacao.pt"
            error={fields.email_contacto}
          />
          <FormField
            id="telefone"
            name="telefone"
            label="Telefone institucional"
            type="tel"
            required
            defaultValue={entity?.telefone ?? ""}
            placeholder="+351 210 000 000"
            error={fields.telefone}
          />
        </div>
      </div>

      {/* ── Secção: Pessoa de contacto ───────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-100">Pessoa de contacto</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="pessoa_contacto_nome"
            name="pessoa_contacto_nome"
            label="Nome"
            required
            defaultValue={entity?.pessoa_contacto_nome ?? ""}
            placeholder="Ana Pereira"
            error={fields.pessoa_contacto_nome}
          />
          <FormField
            id="pessoa_contacto_cargo"
            name="pessoa_contacto_cargo"
            label="Cargo"
            required
            defaultValue={entity?.pessoa_contacto_cargo ?? ""}
            placeholder="Diretora Técnica"
            error={fields.pessoa_contacto_cargo}
          />
        </div>
      </div>

      {/* ── Email de conta (só leitura) ──────────────────── */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Email de acesso à conta</label>
        <input
          type="email"
          value={defaultEmail}
          readOnly
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed"
          aria-label="Email de conta (só leitura)"
        />
        <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado aqui.</p>
      </div>

      <div className="pt-2 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-700 text-white text-sm font-semibold rounded-lg hover:bg-purple-800 disabled:opacity-50 transition-colors"
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          Guardar perfil
        </button>

        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-green-700" role="status">
            <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            Guardado com sucesso!
          </span>
        )}

        {state && "error" in state && !Object.keys(fields).length && (
          <span className="inline-flex items-center gap-1.5 text-sm text-red-600" role="alert">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
