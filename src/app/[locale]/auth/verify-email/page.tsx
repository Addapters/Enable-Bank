import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Heart, Mail } from "lucide-react";

export const metadata: Metadata = { title: "Verifica o teu email" };

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-purple-700 font-bold text-xl mb-8"><Heart className="w-7 h-7" aria-hidden="true" />Enable Bank</Link>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100"><Mail className="h-7 w-7 text-purple-700" aria-hidden="true" /></div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Confirma o teu email</h1>
          <p className="text-sm text-gray-500 mb-6">Enviámos um link de confirmação para o teu email. Clica no link para ativar a tua conta e começares a usar o Enable Bank.</p>
          <p className="text-xs text-gray-400">Não recebeste o email? Verifica a pasta de spam ou <Link href="/auth/login" className="text-purple-700 hover:underline">tenta entrar novamente</Link>.</p>
        </div>
      </div>
    </div>
  );
}
