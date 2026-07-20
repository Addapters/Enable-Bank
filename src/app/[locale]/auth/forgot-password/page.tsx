import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Heart } from "lucide-react";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = { title: "Recuperar palavra-passe" };

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-700 font-bold text-xl"><Heart className="w-7 h-7" aria-hidden="true" />Enable Bank</Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Recuperar palavra-passe</h1>
          <p className="mt-1 text-sm text-gray-500">Indica o teu email e enviamos um link para criares uma nova palavra-passe.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <ForgotPasswordForm />
          <div className="mt-6 text-center text-sm text-gray-500">
            <Link href="/auth/login" className="font-medium text-purple-700 hover:text-purple-800 hover:underline">← Voltar ao login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
