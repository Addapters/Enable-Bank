"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import FormField from "@/components/ui/FormField";
import LogoUpload from "./LogoUpload";
import { updateParticularProfile } from "@/lib/profile/actions";
import { CONCELHOS } from "@/lib/data/concelhos";
import type { ProfileResult } from "@/lib/profile/actions";

interface Props {
  defaultNome: string;
  defaultEmail: string;
  defaultConcelho: string | null;
  defaultTelefone: string | null;
  defaultAvatarUrl: string | null;
}

export default function ParticularProfileForm({
  defaultNome,
  defaultEmail,
  defaultConcelho,
  defaultTelefone,
  defaultAvatarUrl,
}: Props) {
  const [state, action] = useActionState<ProfileResult | null, FormData>(
    updateParticularProfile, null
  );
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [prevState, setPrevState] = useState(state);
  const [avatarUrl, setAvatarUrl] = useState<string>(defaultAvatarUrl ?? "");
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
    fd.set("avatar_url", avatarUrl);
    startTransition(() => action(fd));
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

      <LogoUpload
        currentUrl={defaultAvatarUrl}
        onUpload={setAvatarUrl}
        label="Foto de perfil"
        placeholderUrl="/heart-icon.png"
      />

      <FormField
        id="nome"
        name="nome"
        label="Nome completo"
        required
        defaultValue={defaultNome}
        autoComplete="name"
        placeholder="Maria Silva"
        error={fields.nome}
      />

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
        <input
          type="email"
          value={defaultEmail}
          readOnly
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed"
          aria-label="Email (só leitura)"
        />
        <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado aqui.</p>
      </div>

      <FormField
        as="select"
        id="concelho"
        name="concelho"
        label="Concelho"
        required
        defaultValue={defaultConcelho ?? ""}
        error={fields.concelho}
      >
        <option value="">Seleciona o teu concelho</option>
        {CONCELHOS.map((c) => <option key={c} value={c}>{c}</option>)}
      </FormField>

      <FormField
        id="telefone"
        name="telefone"
        label="Telefone"
        type="tel"
        defaultValue={defaultTelefone ?? ""}
        autoComplete="tel"
        placeholder="+351 912 345 678"
        error={fields.telefone}
      />

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
