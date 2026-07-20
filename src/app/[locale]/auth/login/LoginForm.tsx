"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { login, loginWithGoogle } from "@/lib/auth/actions";
import FormField from "@/components/ui/FormField";
import SubmitButton from "@/components/ui/SubmitButton";
import type { AuthError } from "@/lib/auth/actions";

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

type Props = { redirectTo?: string };

export default function LoginForm({ redirectTo }: Props) {
  const t = useTranslations("auth.login");
  const [state, formAction] = useActionState<AuthError | void, FormData>(login, undefined);

  return (
    <>
      <form action={async () => { await loginWithGoogle(redirectTo); }} className="mb-6">
        <SubmitButton variant="secondary" loadingText="A redirecionar..."><GoogleIcon />{t("google")}</SubmitButton>
      </form>
      <div className="relative mb-6" aria-hidden="true">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center text-sm"><span className="bg-white px-3 text-gray-400">{t("orContinueWith")}</span></div>
      </div>
      <form action={formAction} className="space-y-4" noValidate>
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
        {state?.message && <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.message}</div>}
        <FormField id="email" name="email" label={t("email")} type="email" autoComplete="email" required placeholder="exemplo@email.com" />
        <div className="flex flex-col gap-1">
          <FormField id="password" name="password" label={t("password")} type="password" autoComplete="current-password" required placeholder="••••••••" />
          <div className="flex justify-end"><a href="/pt/auth/forgot-password" className="text-xs text-purple-700 hover:underline">{t("forgotPassword")}</a></div>
        </div>
        <SubmitButton loadingText="A entrar...">{t("submit")}</SubmitButton>
      </form>
    </>
  );
}
