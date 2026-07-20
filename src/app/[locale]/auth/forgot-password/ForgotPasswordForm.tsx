"use client";

import { useActionState } from "react";
import { forgotPassword } from "@/lib/auth/actions";
import FormField from "@/components/ui/FormField";
import SubmitButton from "@/components/ui/SubmitButton";
import { CheckCircle } from "lucide-react";
import type { AuthError } from "@/lib/auth/actions";

type State = AuthError | { success: true } | undefined;

export default function ForgotPasswordForm() {
  const [state, formAction] = useActionState<State, FormData>(forgotPassword, undefined);

  if (state && "success" in state) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-500" aria-hidden="true" />
        <p className="font-medium text-gray-900">Email enviado!</p>
        <p className="mt-1 text-sm text-gray-500">Verifica a tua caixa de entrada (e a pasta de spam) para o link de recuperação.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state && "message" in state && <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.message}</div>}
      <FormField id="email" name="email" label="Email" type="email" autoComplete="email" required placeholder="o-teu@email.com" />
      <SubmitButton loadingText="A enviar...">Enviar link de recuperação</SubmitButton>
    </form>
  );
}
