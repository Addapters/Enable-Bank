"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { register, loginWithGoogle } from "@/lib/auth/actions";
import FormField from "@/components/ui/FormField";
import SubmitButton from "@/components/ui/SubmitButton";
import { CONCELHOS } from "@/lib/data/concelhos";
import { UserCircle, Building2, ChevronLeft } from "lucide-react";
import type { AuthError } from "@/lib/auth/actions";

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

type Step = "tipo" | "form";
type Props = { redirectTo?: string };

export default function RegisterForm({ redirectTo }: Props) {
  const t = useTranslations("auth.register");
  const [state, formAction] = useActionState<AuthError | void, FormData>(register, undefined);
  const [step, setStep] = useState<Step>("tipo");
  const [tipo, setTipo] = useState<"particular" | "entidade" | null>(null);

  return (
    <>
      {/* ── Passo 1: Escolha do tipo ──────────────────────────── */}
      {step === "tipo" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 text-center font-medium">Que tipo de conta queres criar?</p>

          <button
            type="button"
            onClick={() => { setTipo("particular"); setStep("form"); }}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50/30 transition-all text-left group"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 group-hover:bg-purple-200 transition-colors">
              <UserCircle className="w-6 h-6 text-purple-700" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Particular</p>
              <p className="text-xs text-gray-500 mt-0.5">Pessoa singular que quer ajudar ou receber ajuda</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setTipo("entidade"); setStep("form"); }}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-left group"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
              <Building2 className="w-6 h-6 text-blue-700" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Entidade / Organização</p>
              <p className="text-xs text-gray-500 mt-0.5">IPSS, município, associação, clínica ou outra organização</p>
            </div>
          </button>

          <div className="relative mt-2" aria-hidden="true">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-3 text-gray-400">ou</span></div>
          </div>

          <form action={async () => { await loginWithGoogle(redirectTo); }}>
            <SubmitButton variant="secondary" loadingText="A redirecionar...">
              <GoogleIcon />Registar com Google
            </SubmitButton>
          </form>
        </div>
      )}

      {/* ── Passo 2: Formulário ────────────────────────────────── */}
      {step === "form" && tipo && (
        <>
          {/* Badge de tipo + voltar */}
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={() => setStep("tipo")}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-700 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Alterar tipo
            </button>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
              tipo === "particular"
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}>
              {tipo === "particular"
                ? <><UserCircle className="w-3.5 h-3.5" aria-hidden="true" />Particular</>
                : <><Building2 className="w-3.5 h-3.5" aria-hidden="true" />Entidade</>}
            </span>
          </div>

          <form action={formAction} className="space-y-4" noValidate>
            {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
            <input type="hidden" name="tipo" value={tipo} />

            {state?.message && (
              <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {state.message}
              </div>
            )}

            <FormField
              id="nome"
              name="nome"
              label={tipo === "entidade" ? "Nome da organização" : t("name")}
              type="text"
              autoComplete="name"
              required
              placeholder={tipo === "entidade" ? "Associação de Apoio à Deficiência" : "Maria Silva"}
            />

            <FormField
              id="email"
              name="email"
              label={t("email")}
              type="email"
              autoComplete="email"
              required
              placeholder="exemplo@email.com"
            />

            <FormField
              id="password"
              name="password"
              label={t("password")}
              type="password"
              autoComplete="new-password"
              required
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              hint="Mínimo de 8 caracteres"
            />

            {tipo === "particular" && (
              <FormField as="select" id="concelho" name="concelho" label={t("location")}>
                <option value="">Seleciona o teu concelho (opcional)</option>
                {CONCELHOS.map((c) => <option key={c} value={c}>{c}</option>)}
              </FormField>
            )}

            {tipo === "entidade" && (
              <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
                <p className="font-medium mb-0.5">Completa o perfil depois do registo</p>
                <p className="text-xs text-blue-600">Após confirmares o email, preenche os dados completos da organização no teu perfil para poderes ser verificada.</p>
              </div>
            )}

            <SubmitButton loadingText="A criar conta...">{t("submit")}</SubmitButton>
          </form>
        </>
      )}
    </>
  );
}
