"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { MessageCircle, Loader2 } from "lucide-react";
import { getOrCreateConversation } from "@/lib/messages/actions";

interface Props {
  otherUserId: string;
  publicationId?: string | null;
  className?: string;
}

export default function SendMessageButton({ otherUserId, publicationId, className }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const result = await getOrCreateConversation(otherUserId, publicationId);
      if (!result.success) { setError("Não foi possível iniciar a conversa."); return; }
      router.push(`/mensagens/${result.conversationId}`);
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={
          className ??
          "w-full inline-flex items-center justify-center gap-2 bg-purple-700 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-purple-800 disabled:opacity-50 transition-colors"
        }
      >
        {pending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <MessageCircle className="w-4 h-4" aria-hidden="true" />}
        Enviar mensagem
      </button>
      {error && <p className="text-xs text-red-600 mt-1.5 text-center">{error}</p>}
    </div>
  );
}
