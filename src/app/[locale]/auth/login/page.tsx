import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Heart } from "lucide-react";
import LoginForm from "./LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return { title: t("title") };
}

type Props = { searchParams: Promise<{ redirectTo?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const t = await getTranslations("auth.login");
  const { redirectTo, error } = await searchParams;
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-700 font-bold text-xl"><Heart className="w-7 h-7" aria-hidden="true" />Enable Bank</Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {error === "auth_callback_failed" && <div role="alert" className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">Ocorreu um erro ao iniciar sessão. Tenta novamente.</div>}
          <LoginForm redirectTo={redirectTo} />
          <div className="mt-6 text-center text-sm text-gray-500">
            {t("noAccount")}{" "}
            <Link href={`/auth/register${redirectTo ? `?redirectTo=${redirectTo}` : ""}`} className="font-medium text-purple-700 hover:text-purple-800 hover:underline">{t("register")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
