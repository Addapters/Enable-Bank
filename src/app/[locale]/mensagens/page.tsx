import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getConversations } from "@/lib/messages/queries";
import ConversationList from "@/components/messages/ConversationList";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mensagens — Enable Bank" };

export default async function MensagensPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/pt/auth/login?redirectTo=/pt/mensagens");

  const conversations = await getConversations();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 shrink-0">
            <MessageCircle className="h-5 w-5 text-purple-700" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Mensagens</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ConversationList conversations={conversations} viewerId={user.id} />
          </div>
          <div className="hidden md:flex md:col-span-2 items-center justify-center bg-white rounded-2xl border border-dashed border-gray-300 text-sm text-gray-400">
            Seleciona uma conversa para começar
          </div>
        </div>
      </div>
    </div>
  );
}
