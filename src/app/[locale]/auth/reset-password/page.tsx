import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Heart } from "lucide-react";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = { title: "Nova palavra-passe" };

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-purple-700 font-bold text-xl"><Heart className="w-7 h-7" aria-hidden="true" />Enable Bank</Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Nova palavra-passe</h1>
          <p className="mt-1 text-sm text-gray-500">Escolhe uma nova palavra-passe para a tua conta.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
