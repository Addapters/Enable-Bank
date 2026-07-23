import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getConversations, getConversation, getMessages } from "@/lib/messages/queries";
import ConversationList from "@/components/messages/ConversationList";
import ChatWindow from "@/components/messages/ChatWindow";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const conversation = await getConversation(id);
  if (!conversation) return { title: "Mensagens — Enable Bank" };
  return { title: `${conversation.otherUser?.nome ?? "Conversa"} — Mensagens — Enable Bank` };
}

export default async function MensagensThreadPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/pt/auth/login?redirectTo=/pt/mensagens/${id}`);

  const conversation = await getConversation(id);
  if (!conversation) notFound();

  const [conversations, messages] = await Promise.all([
    getConversations(),
    getMessages(id),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="hidden md:block md:col-span-1">
            <ConversationList conversations={conversations} viewerId={user.id} activeId={id} />
          </div>
          <div className="md:col-span-2">
            <ChatWindow
              conversationId={id}
              viewerId={user.id}
              otherUser={conversation.otherUser}
              publicationTitulo={conversation.publication_titulo}
              initialMessages={messages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
