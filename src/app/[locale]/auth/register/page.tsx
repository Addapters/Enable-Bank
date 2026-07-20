import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Heart } from "lucide-react";
import RegisterForm from "./RegisterForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.register");
  return { title: t("title") };
}

type Props = { searchParams: Promise<{ redirectTo?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const t = await getTranslations("auth.register");
  const { redirectTo } = await searchParams;
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-700 font-bold text-xl"><Heart className="w-7 h-7" aria-hidden="true" />Enable Bank</Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <RegisterForm redirectTo={redirectTo} />
          <p className="mt-6 text-center text-xs text-gray-400">{t("terms")}</p>
          <div className="mt-4 text-center text-sm text-gray-500">
            {t("hasAccount")}{" "}
            <Link href={`/auth/login${redirectTo ? `?redirectTo=${redirectTo}` : ""}`} className="font-medium text-purple-700 hover:text-purple-800 hover:underline">{t("login")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
