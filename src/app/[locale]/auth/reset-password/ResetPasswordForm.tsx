"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import FormField from "@/components/ui/FormField";
import { CheckCircle } from "lucide-react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;
    if (password !== confirm) { setError("As palavras-passe não coincidem."); return; }
    if (password.length < 8) { setError("A palavra-passe deve ter pelo menos 8 caracteres."); return; }
    setPending(true); setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (updateError) { setError("Erro ao atualizar a palavra-passe. O link pode ter expirado."); return; }
    setSuccess(true);
    setTimeout(() => router.push("/"), 2000);
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-500" aria-hidden="true" />
        <p className="font-medium text-gray-900">Palavra-passe atualizada!</p>
        <p className="mt-1 text-sm text-gray-500">A redirecionar...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      <FormField id="password" name="password" label="Nova palavra-passe" type="password" autoComplete="new-password" required minLength={8} placeholder="Mínimo 8 caracteres" hint="Mínimo de 8 caracteres" />
      <FormField id="confirm" name="confirm" label="Confirmar palavra-passe" type="password" autoComplete="new-password" required placeholder="Repete a nova palavra-passe" />
      <button type="submit" disabled={pending} className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed">
        {pending ? "A guardar..." : "Guardar nova palavra-passe"}
      </button>
    </form>
  );
}
