export type PrivacyRiskType = "partilhou" | "pediu";

/**
 * Nº de telefone português: 9 dígitos agrupados 3-3-3, a começar por 9 (móvel) ou 2 (fixo),
 * com prefixo internacional opcional. Agrupado desta forma para não confundir com datas
 * (ex: "23-07-2026") ou preços, que são comuns numa conversa legítima sobre logística.
 */
const PHONE_PATTERN = /\b(?:\+351[\s.-]?)?(?:9\d{2}|2\d{2})[\s.-]?\d{3}[\s.-]?\d{3}\b/;
/** Endereço de email. */
const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
/** Menções a apps de mensagens/redes sociais tipicamente usadas para sair da plataforma. */
const APP_MENTION_PATTERN = /\b(whatsapp|telegram|instagram|insta|facebook|messenger|snapchat|tiktok)\b/i;

/** Pede explicitamente dados de contacto ou para continuar a conversa fora da plataforma. */
const REQUEST_PATTERN =
  /\b(qual|quais|podes?\s+dar|d[áa]-me|manda-me|envia-me|passa-me|diz-me|partilha)\b[^.!?\n]{0,40}\b(n[uú]mero|telefone|telem[óo]vel|whatsapp|email|e-mail|contacto|morada|endere[çc]o)\b/i;

export interface PrivacyRiskResult {
  risk: boolean;
  type: PrivacyRiskType | null;
}

/**
 * Heurística para avisar o destinatário quando uma mensagem parece partilhar ou pedir dados
 * pessoais de contacto — não bloqueia nada, é só um aviso de segurança, por isso falsos
 * positivos ocasionais (ex: um preço "912") são aceitáveis.
 */
export function detectPrivacyRisk(text: string): PrivacyRiskResult {
  if (EMAIL_PATTERN.test(text) || PHONE_PATTERN.test(text) || APP_MENTION_PATTERN.test(text)) {
    return { risk: true, type: "partilhou" };
  }
  if (REQUEST_PATTERN.test(text)) {
    return { risk: true, type: "pediu" };
  }
  return { risk: false, type: null };
}
