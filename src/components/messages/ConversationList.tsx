import { Link } from "@/i18n/navigation";
import { MessageCircle } from "lucide-react";
import PublisherAvatar from "@/components/publications/PublisherAvatar";
import { timeAgo } from "@/lib/utils/timeAgo";
import type { ConversationSummary } from "@/lib/messages/queries";

interface Props {
  conversations: ConversationSummary[];
  viewerId: string;
  activeId?: string;
}

export default function ConversationList({ conversations, viewerId, activeId }: Props) {
  if (conversations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-16 text-center">
        <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden="true" />
        <p className="text-sm text-gray-500">Ainda não tens conversas.</p>
      </div>
    );
  }

  return (
    <ul className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
      {conversations.map((c) => {
        const isMineLast = c.lastMessage?.sender_id === viewerId;
        return (
          <li key={c.id}>
            <Link
              href={`/mensagens/${c.id}`}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                activeId === c.id ? "bg-purple-50" : ""
              }`}
            >
              {c.otherUser ? (
                <PublisherAvatar
                  publisher={{ nome: c.otherUser.nome, tipo: c.otherUser.tipo, logoUrl: c.otherUser.avatar_url }}
                  size={44}
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-100 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.otherUser?.nome ?? "Utilizador"}</p>
                  {c.last_message_at && (
                    <span className="text-[11px] text-gray-400 shrink-0">{timeAgo(c.last_message_at)}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {c.lastMessage ? `${isMineLast ? "Tu: " : ""}${c.lastMessage.conteudo}` : c.publication_titulo ? `Sobre: ${c.publication_titulo}` : "Nova conversa"}
                </p>
              </div>
              {c.unreadCount > 0 && (
                <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-purple-700 text-white text-[11px] font-semibold flex items-center justify-center">
                  {c.unreadCount}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
