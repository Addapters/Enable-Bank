"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { AlertTriangle, Check, CheckCheck, ChevronLeft, Loader2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, markConversationRead } from "@/lib/messages/actions";
import { detectPrivacyRisk } from "@/lib/messages/detectPrivacyRisk";
import { timeAgo } from "@/lib/utils/timeAgo";
import PublisherAvatar from "@/components/publications/PublisherAvatar";
import type { MessageRow } from "@/types/database";

interface OtherUser {
  id: string;
  nome: string;
  tipo: string;
  avatar_url: string | null;
}

interface Props {
  conversationId: string;
  viewerId: string;
  otherUser: OtherUser | null;
  publicationTitulo: string | null;
  initialMessages: MessageRow[];
}

const PRIVACY_WARNING: Record<"partilhou" | "pediu", string> = {
  partilhou:
    "Esta mensagem parece conter dados de contacto. Por segurança, evita partilhar informações pessoais com desconhecidos.",
  pediu:
    "Esta mensagem pede dados de contacto. Só partilhes informações pessoais com pessoas em quem confies.",
};

export default function ChatWindow({ conversationId, viewerId, otherUser, publicationTitulo, initialMessages }: Props) {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const upsertMessage = (incoming: MessageRow) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === incoming.id);
      if (idx === -1) return [...prev, incoming];
      const next = [...prev];
      next[idx] = incoming;
      return next;
    });
  };

  useEffect(() => {
    setMessages(initialMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    markConversationRead(conversationId);

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          upsertMessage(payload.new as MessageRow);
          markConversationRead(conversationId);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => upsertMessage(payload.new as MessageRow)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setError(null);
    startTransition(async () => {
      const result = await sendMessage(conversationId, trimmed);
      if (!result.success) { setError("Não foi possível enviar a mensagem."); return; }
      upsertMessage(result.message);
      setText("");
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
        <Link href="/mensagens" className="md:hidden p-1 -ml-1 text-gray-400 hover:text-purple-700">
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </Link>
        {otherUser ? (
          <Link href={`/utilizadores/${otherUser.id}`} className="hover:opacity-80 transition-opacity">
            <PublisherAvatar
              publisher={{ nome: otherUser.nome, tipo: otherUser.tipo, logoUrl: otherUser.avatar_url }}
              size={36}
              showName
              showBadge={false}
            />
          </Link>
        ) : (
          <span className="text-sm text-gray-500">Utilizador</span>
        )}
        {publicationTitulo && (
          <span className="text-xs text-gray-400 truncate ml-auto hidden sm:inline">Sobre: {publicationTitulo}</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-8">
            Ainda não há mensagens. Diz olá!
          </p>
        ) : (
          messages.map((m) => {
            const isMine = m.sender_id === viewerId;
            const warning = !isMine ? detectPrivacyRisk(m.conteudo) : { risk: false, type: null };
            return (
              <div key={m.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words ${
                    isMine ? "bg-purple-700 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  {m.conteudo}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[11px] text-gray-400">{timeAgo(m.criado_em)}</span>
                  {isMine && (
                    m.lida
                      ? <CheckCheck className="w-3.5 h-3.5 text-purple-600" aria-label="Visto" />
                      : <Check className="w-3.5 h-3.5 text-gray-300" aria-label="Enviado" />
                  )}
                </div>
                {warning.risk && warning.type && (
                  <div className="max-w-[85%] mt-1.5 flex items-start gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-[11px] text-amber-800 leading-snug">{PRIVACY_WARNING[warning.type]}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-4 text-xs text-red-600">{error}</p>}

      <div className="flex items-end gap-2 p-3 border-t border-gray-100 shrink-0">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          placeholder="Escreve uma mensagem..."
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 max-h-32"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={pending || !text.trim()}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-50 transition-colors shrink-0"
          aria-label="Enviar mensagem"
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
